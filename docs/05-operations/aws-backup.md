# AWS off-box backups: Trace

**Status:** Implemented (infra + workflow) · **Last updated:** 2026-07-16

Second copy of the Trace corpus lives in **your** AWS account (S3), separate from
MongoDB Atlas provider backups. A warm **EC2 Mongo standby** is refreshed from S3
via SSM (Path C). Compute stays on Vercel; this overlay does not change capture
invariants.

---

## Topology

| Piece | Value |
|---|---|
| Primary bucket | `ahmdmshazly-trace-backups` (`eu-central-1`) |
| CRR replica | `ahmdmshazly-trace-backups-ew1` (`eu-west-1`): prefix `trace/` |
| CRR IAM role | `arn:aws:iam::352602573649:role/trace-s3-crr` |
| Prefix | `trace/YYYY/MM/DD/dump.archive.gz` |
| Encryption | SSE-S3 (AES256), bucket key on |
| Public access | Blocked (all four Block Public Access flags) |
| Versioning | Enabled (required for CRR) |
| Lifecycle | After 30d → STANDARD_IA; expire at 180d (prefix `trace/`) |
| Dump IAM role | `arn:aws:iam::352602573649:role/trace-backup-gha` |
| Trust | GitHub OIDC `token.actions.githubusercontent.com` → `repo:ahmedmshazly/trace:*` |
| Secret for dump job | SSM SecureString `/trace/prod/MONGODB_URI` (`eu-central-1`) |
| Standby URI | SSM SecureString `/trace/dr/MONGODB_URI_STANDBY` |
| Dump workflow | [`.github/workflows/backup-mongo.yml`](../../.github/workflows/backup-mongo.yml): every **6 hours** (`17 */6 * * *`) + `workflow_dispatch` |
| Standby restore | [`.github/workflows/restore-standby.yml`](../../.github/workflows/restore-standby.yml): `47 */6 * * *` + `workflow_dispatch` (SSM Run Command) |
| Standby host | EC2 `trace-mongo-standby` (`t3.small`, Docker `mongo:7`, 27017 closed until cutover) |

Scripts:

- [`scripts/backup/mongodump-to-s3.sh`](../../scripts/backup/mongodump-to-s3.sh)
- [`scripts/backup/restore-from-s3.sh`](../../scripts/backup/restore-from-s3.sh) (scratch URI only; refuses prod URI). Path B
- [`scripts/backup/restore-standby-on-host.sh`](../../scripts/backup/restore-standby-on-host.sh), runs **on** the standby instance. Path C sync

---

## Owner one-time checklist

1. **Atlas cluster** on AWS `eu-central-1`; enable Cloud Backup / PITR on the tier.
2. Put the same production URI into:
   - Vercel env `MONGODB_URI` (Production + Preview)
   - SSM: `aws ssm put-parameter --name /trace/prod/MONGODB_URI --type SecureString --value '...' --region eu-central-1 --overwrite`
3. GitHub repo **Variables** (not secrets):
   - `AWS_ROLE_ARN` = `arn:aws:iam::352602573649:role/trace-backup-gha`
   - `TRACE_BACKUP_BUCKET` = `ahmdmshazly-trace-backups` (optional)
4. Atlas **Network Access**: allow `0.0.0.0/0` (Vercel + GitHub-hosted runners) or tighten later with static egress.
5. Confirm CRR: object under `s3://ahmdmshazly-trace-backups-ew1/trace/...` after a dump.
6. Confirm standby restore workflow green; Path C drill in [restore-drill.md](./restore-drill.md).
7. Optional: GitHub notification / email on failed workflow runs.

Local Compose Mongo is **dev only**. Never treat a laptop volume as prod; never recover prod with `docker compose down -v`.

---

## Permissions (role policy summary)

**`trace-backup-gha` (GitHub OIDC):**

- `s3:ListBucket` / `PutObject` / `GetObject` / `DeleteObject` on primary backup prefix
- `ssm:GetParameter` on `/trace/prod/MONGODB_URI`
- `ssm:SendCommand` / `GetCommandInvocation` + `ec2:DescribeInstances` (tag `Name=trace-mongo-standby`) for standby restore

**`trace-mongo-standby` (instance profile):**

- `s3:GetObject` / `ListBucket` on backup prefix
- SSM managed instance core (Run Command)

No long-lived AWS access keys in the Trace repo.
