# Restore drill — Trace

**Status:** Procedure · **Last updated:** 2026-07-15

Quarterly (or after any backup-path change), prove recoverability. An untested
backup is not a backup.

Record results in the ops log / risk register. Capture: date, operator, Path A
or B, RPO/RTO observed, pass/fail.

---

## Path A — Atlas PITR / snapshot → scratch

1. In Atlas, restore a snapshot (or PITR timestamp) into a **new** cluster or
   temporary database — not the live production cluster.
2. Point a scratch env (local or Vercel Preview with a scratch `MONGODB_URI`) at
   the restored instance.
3. Verify: `/api/health`, entry counts, spot-check moments, second-user isolation.
4. Do **not** cut production `MONGODB_URI` unless this is a real incident restore.
5. Tear down the scratch cluster when done (cost).

## Path B — S3 mongodump → scratch

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

## Soft-delete vs hard loss

- User mistakes → in-app soft-delete restore (no DB restore).
- Hard loss / corruption → Path A or Path B.

## Acceptance (durability)

- [ ] Laptop Compose `down -v` does not affect prod (prod is Atlas).
- [ ] Path A or Path B restore to scratch succeeds with verified counts.
- [ ] Latest S3 object exists under `trace/YYYY/MM/DD/`.
- [ ] GHA backup uses OIDC only (no static AWS keys in git).
