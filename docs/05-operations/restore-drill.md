# Restore drill — Trace

**Status:** Procedure · **Last updated:** 2026-07-16

Quarterly (or after any backup-path change), prove recoverability. An untested
backup is not a backup.

Record results in the ops log / risk register. Capture: date, operator, Path A /
B / C, RPO/RTO observed, pass/fail.

---

## Path A — Atlas PITR / snapshot → scratch

1. In Atlas, restore a snapshot (or PITR timestamp) into a **new** cluster or
   temporary database — not the live production cluster.
2. Point a scratch env (local or Vercel Preview with a scratch `MONGODB_URI`) at
   the restored instance.
3. Verify: `/api/health`, entry counts, spot-check moments, second-user isolation.
4. Do **not** cut production `MONGODB_URI` unless this is a real incident restore.
5. Tear down the scratch cluster when done (cost).

## Path B — S3 mongodump → scratch Atlas

1. Dry-run list latest object:
   ```bash
   DRY_RUN=1 ./scripts/backup/restore-from-s3.sh
   ```
2. Create a scratch Atlas DB / cluster; set `RESTORE_MONGODB_URI` to it.
3. Ensure `RESTORE_MONGODB_URI` ≠ production `MONGODB_URI` (script refuses equality).
4. Restore:
   ```bash
   RESTORE_MONGODB_URI='mongodb+srv://…/trace_scratch' \
     ./scripts/backup/restore-from-s3.sh
   ```
5. Same verification as Path A.
6. Only on real disaster: re-point Vercel `MONGODB_URI`, redeploy/smoke, communicate.

## Path C — AWS EC2 warm standby (owned Mongo)

Standby host: EC2 tagged `Name=trace-mongo-standby` (Docker `mongo:7`).  
Sync: GitHub Actions → SSM Run Command → [`restore-standby-on-host.sh`](../../scripts/backup/restore-standby-on-host.sh).  
URI: SSM `/trace/dr/MONGODB_URI_STANDBY` (Elastic IP). While idle, **27017 has no SG ingress** and Mongo binds `127.0.0.1` only.

### Refresh standby (no cutover)

```bash
gh workflow run "Restore Mongo standby" --repo ahmedmshazly/trace
# wait for Success; confirm collections via SSM if needed
```

### Preview cutover drill (do not touch Production)

1. Confirm latest restore-standby workflow is green.
2. Open ingress and rebind Mongo for Vercel reachability:
   ```bash
   SG=sg-0519d7a26870b1ea0   # trace-mongo-standby
   IID=i-00c3cef5a86c0ed0f
   aws ec2 authorize-security-group-ingress --region eu-central-1 \
     --group-id "$SG" --protocol tcp --port 27017 --cidr 0.0.0.0/0
   aws ssm send-command --region eu-central-1 --instance-ids "$IID" \
     --document-name AWS-RunShellScript --parameters commands='[
       "source /root/trace-mongo.env",
       "docker rm -f trace-mongo",
       "docker run -d --name trace-mongo --restart unless-stopped -p 0.0.0.0:27017:27017 -v /data/mongo:/data/db -e MONGO_INITDB_ROOT_USERNAME=$MONGO_USER -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD mongo:7"
     ]'
   ```
3. Point **Preview only** `MONGODB_URI` at `/trace/dr/MONGODB_URI_STANDBY`; deploy a Preview URL; smoke `/api/health` + register + capture.
4. Revert Preview `MONGODB_URI` to Atlas; close SG 27017; rebind Mongo to `127.0.0.1:27017`.

### Real incident cutover

Same as Preview drill, but Production `MONGODB_URI` + announce. After Atlas recovery, reverse-sync and flip back.

## Soft-delete vs hard loss

- User mistakes → in-app soft-delete restore (no DB restore).
- Hard loss / corruption → Path A, B, or C.

## Acceptance (durability)

- [x] Laptop Compose `down -v` does not affect prod (prod is Atlas).
- [ ] Path A or Path B restore to scratch succeeds with verified counts.
- [x] Latest S3 object exists under `trace/YYYY/MM/DD/` (and CRR replica `…-ew1`).
- [x] GHA backup uses OIDC only (no static AWS keys in git).
- [ ] Path C Preview drill: standby health + capture smoke, then reverted.

## Drill log

| Date | Path | Result | Notes |
|------|------|--------|-------|
| 2026-07-16 | C (setup) | pending | EC2 `i-00c3cef5a86c0ed0f` EIP `51.102.93.91`; CRR + 6h dump enabled |
