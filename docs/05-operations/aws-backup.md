# AWS off-box backups — Trace

**Status:** Implemented (infra + workflow) · **Last updated:** 2026-07-15

Second copy of the Trace corpus lives in **your** AWS account (S3), separate from
MongoDB Atlas provider backups. Compute stays on Vercel; this overlay does not
change capture invariants.

---

## Topology

| Piece | Value |
|---|---|
| Bucket | `ahmdmshazly-trace-backups` (`eu-central-1`) |
| Prefix | `trace/YYYY/MM/DD/dump.archive.gz` |
| Encryption | SSE-S3 (AES256), bucket key on |
| Public access | Blocked (all four Block Public Access flags) |
| Versioning | Enabled |
| Lifecycle | After 30d → STANDARD_IA; expire at 180d (prefix `trace/`) |
| IAM role | `arn:aws:iam::352602573649:role/trace-backup-gha` |
| Trust | GitHub OIDC `token.actions.githubusercontent.com` → `repo:ahmedmshazly/trace:*` |
| Secret for dump job | SSM SecureString `/trace/prod/MONGODB_URI` (`eu-central-1`) |
| Workflow | [`.github/workflows/backup-mongo.yml`](../../.github/workflows/backup-mongo.yml) — nightly 02:17 UTC + `workflow_dispatch` |

Scripts:

- [`scripts/backup/mongodump-to-s3.sh`](../../scripts/backup/mongodump-to-s3.sh)
- [`scripts/backup/restore-from-s3.sh`](../../scripts/backup/restore-from-s3.sh) (scratch URI only; refuses prod URI)

---

## Owner one-time checklist

1. **Atlas cluster** on AWS `eu-central-1`; enable Cloud Backup / PITR on the tier.
2. Put the same production URI into:
   - Vercel env `MONGODB_URI` (Production + Preview)
   - SSM: `aws ssm put-parameter --name /trace/prod/MONGODB_URI --type SecureString --value '…' --region eu-central-1 --overwrite`
3. GitHub repo **Variables** (not secrets):
   - `AWS_ROLE_ARN` = `arn:aws:iam::352602573649:role/trace-backup-gha`
   - `TRACE_BACKUP_BUCKET` = `ahmdmshazly-trace-backups` (optional)
4. Atlas **Network Access**: allow `0.0.0.0/0` (Vercel + GitHub-hosted runners) or tighten later with static egress.
5. Run **Actions → Backup Mongo → S3 → Run workflow** once; confirm object under `s3://ahmdmshazly-trace-backups/trace/…`.
6. Optional: GitHub notification / email on failed workflow runs.

Local Compose Mongo is **dev only**. Never treat a laptop volume as prod; never recover prod with `docker compose down -v`.

---

## Permissions (role policy summary)

- `s3:ListBucket` on the bucket (prefix `trace/*`)
- `s3:PutObject` / `GetObject` / `DeleteObject` on `trace/*`
- `ssm:GetParameter` on `/trace/prod/MONGODB_URI`

No long-lived AWS access keys in the Trace repo.
