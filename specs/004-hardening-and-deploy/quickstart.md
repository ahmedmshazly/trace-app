# Quickstart: Hardening, Settings & Deploy (V1 GA)

How to run and verify this feature locally and validate the GA gates. It assumes
features 001-003 are implemented and the implementation tasks in `tasks.md` are
complete.

> Until the application code exists, this document is the target state the
> implementation must satisfy. It doubles as the manual acceptance script.

---

## Prerequisites

- Features 001-003 running locally.
- Node.js 22 LTS, MongoDB 7 local, a POSIX shell, `jq`.
- Email transport configured for dev to **log the reset link** (no external
  account needed): see `backend/.env`.

## 1. Password reset: non-enumerating + session invalidation (US1)

```bash
# Identical response for a registered and an unregistered email (no enumeration)
curl -s -i -X POST http://localhost:4000/api/auth/reset/request \
  -H 'content-type: application/json' -d '{"email":"a@example.com"}' | head -n1
curl -s -i -X POST http://localhost:4000/api/auth/reset/request \
  -H 'content-type: application/json' -d '{"email":"nobody@example.com"}' | head -n1
# → both 202 with the same body

# In dev, the reset link/token is printed to the backend log. Complete the reset:
curl -s -i -X POST http://localhost:4000/api/auth/reset/complete \
  -H 'content-type: application/json' \
  -d '{"token":"<TOKEN_FROM_LOG>","password":"a fresh strong passphrase"}' | head -n1
# → 204; old password now fails; new one works; prior tokens invalidated
```

## 2. Account settings & theme (US2)

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"a@example.com","password":"a fresh strong passphrase"}' | jq -r .token)

# Change password
curl -s -i -X PATCH http://localhost:4000/api/auth/password \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"currentPassword":"a fresh strong passphrase","newPassword":"another strong one"}' | head -n1  # 204
```

In the browser: open **Settings → Appearance**, toggle **Light/Dark** → applies
immediately, persists across reload, and there is **no flash of the wrong theme**
on load; first run honors the OS color scheme (dark default).

## 3. Danger zone: typed confirmation & deletion (US3)

```bash
# Delete all entries (typed confirmation echoed in a header)
curl -s -i -X DELETE "http://localhost:4000/api/entries/all" \
  -H "authorization: Bearer $TOKEN" -H 'X-Confirm: DELETE ALL ENTRIES' | head -n1  # 204

# Browse Trash (soft-deleted) before permanent delete
curl -s "http://localhost:4000/api/entries/trash" -H "authorization: Bearer $TOKEN" | jq '.items | length'

# Delete account (irreversible); session invalidated afterwards
curl -s -i -X DELETE "http://localhost:4000/api/account" \
  -H "authorization: Bearer $TOKEN" -H 'X-Confirm: DELETE MY ACCOUNT' | head -n1  # 204
```

In the browser: destructive actions are **fenced** and require typing a
confirmation phrase before they enable.

## 4. Operability & security gates (US4 / GA)

```bash
# Health/readiness
curl -s http://localhost:4000/api/health | jq   # {"status":"ok",...}

# Rate limiting on reset/auth (repeat rapidly → 429)
for i in $(seq 1 50); do curl -s -o /dev/null -w "%{http_code} " \
  -X POST http://localhost:4000/api/auth/reset/request \
  -H 'content-type: application/json' -d '{"email":"a@example.com"}'; done; echo
# → ... 429 once the limit trips
```

- **Logs**: structured, carry a correlation id, and contain **no entry content or
  secrets** (inspect the backend log).
- **Config-only deploy**: start in a clean environment using only env vars (DB URI,
  JWT secret, allowed origins, mail config), no source edits.
- **Backup/restore**: follow `docs/05-operations/backup-recovery.md` to snapshot
  and restore; verify the corpus is intact.

## 5. Run the gate suites (Constitution IV / SC-006)

```bash
cd backend && npm test            # integration + isolation + security suites
cd frontend && npm test           # unit
cd frontend && npm run test:e2e   # reset flow, theme toggle, typed-confirm deletion
npm run test:a11y                 # axe + keyboard/focus, vs the color-system contrast table
npm run test:perf                 # capture<100ms, cold<2s, search<300ms, 50k smooth
```

## Definition of Done for this feature (and V1 GA)

- [ ] US1: reset is non-enumerating, single-use/expiring, invalidates sessions (SC-001/002).
- [ ] US2: theme applies immediately + persists, no FOUC, OS-default honored; password/email change work (SC-003).
- [ ] US3: destructive actions are typed-gated and scoped to the user; Trash browse/restore works (SC-004).
- [ ] US4: config-only HTTPS deploy, health + content-free structured logs, rate limits, web-vuln defenses (SC-005).
- [ ] CI runs and gates on lint + type-check + unit + integration + isolation + e2e + a11y + perf; red blocks merge (SC-006).
- [ ] Backup/restore rehearsed and documented; corpus recovered intact (SC-007).
- [ ] `docs/` (FR/traceability, 04-engineering, 05-operations) in sync; merged via PR. **→ V1 GA.**
