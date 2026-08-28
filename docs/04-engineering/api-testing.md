# API Testing: Trace

**Status:** Baseline · **Last updated:** 2026-06-20

How the Trace **API** is verified, at two levels:

1. **Automated code tests.** Vitest + Supertest + `mongodb-memory-server`, the
   release-blocking backbone (run in CI on every PR).
2. **Live API acceptance.** A scripted `curl`/`jq` pass against a running server
   backed by a real MongoDB, for hands-on/manual confidence.

It complements the [testing strategy](./testing-strategy.md) (philosophy, pyramid,
required suites) and the machine-readable
[OpenAPI contract](../../specs/001-foundation-and-capture/contracts/openapi.yaml).

---

## 1. Automated code tests

```bash
cd backend
npm test               # all suites, in-memory Mongo
npm run test:coverage  # + V8 coverage report
```

Layout (`backend/tests/`):

| Suite | Files | Proves |
|---|---|---|
| **unit** | `unit/password.test.ts`, `unit/token.test.ts` | hashing, JWT sign/verify |
| **integration** | `integration/auth.test.ts`, `auth.rate-limit.test.ts`, `health.test.ts`, `entry-create.test.ts`, `entry-timeline.test.ts`, `entry-curate.test.ts` | API behavior over real queries/indexes |
| **isolation** | `isolation/entry-isolation.test.ts` | user B can never read/patch/delete user A's data |

`backend/vitest.config.ts` wires `tests/setup.ts` as a setup file so the test env
(`NODE_ENV=test`, a test `JWT_SECRET`, etc.) is set **before** any `src/*` module
is imported, required because config is validated at import time.

### Last verified result

```
 Test Files  9 passed (9)
      Tests  32 passed (32)

 % Coverage report from v8
 All files   |  89.25 |  76.42 |  93.54 |  89.21
   Statements: 216/242   Branches: 94/123   Functions: 58/62   Lines: 215/241
```

Coverage is a signal, not a target, gating is on critical-path behavior
(auth, isolation, capture/persistence), all of which is covered.

---

## 2. Live API acceptance (smoke test)

With a server running (`npm run dev`, backed by a real `mongod`):

```bash
cd backend
BASE_URL=http://localhost:4000/api ./scripts/smoke-api.sh
```

The script ([`backend/scripts/smoke-api.sh`](../../backend/scripts/smoke-api.sh))
uses a unique email per run (safe against a persistent DB) and prints PASS/FAIL
per check, exiting non-zero on any failure. It covers:

| Area | Checks |
|---|---|
| Health | `200`, `status=ok`, `db=connected` |
| Auth | register `201`+token; duplicate → `409 EMAIL_IN_USE`; login `200`; bad password → `401 INVALID_CREDENTIALS`; `/me` `200`; no token → `401 UNAUTHORIZED` |
| Capture | create `201`; empty body → `422 VALIDATION_ERROR` |
| Timeline | list `200`; `limit`/`cursor` pagination returns `nextCursor` + correct page sizes |
| Curation | edit `200`; `createdAt` immutable; backdate `occurredAt`; soft-delete `204` (hidden); `includeDeleted=true` shows it; restore `200`; unknown id → `404` |
| Isolation | user B sees zero of A's entries; B's PATCH/DELETE of A's entry → `404` (existence never revealed) |
| Rate limit | burst on `/auth/login` → `429 RATE_LIMITED` |

### Last verified result

```
  passed: 42   failed: 0
```

---

## 3. Manual requests (editor)

[`backend/api.http`](../../backend/api.http) is a ready-to-run request collection
for the VS Code **REST Client** or the JetBrains HTTP client. Run top-to-bottom;
the register/login response token is captured into a variable and reused for the
authenticated requests.

---

## Reference: endpoints, errors, examples

Base path `/api`. Full contract:
[`openapi.yaml`](../../specs/001-foundation-and-capture/contracts/openapi.yaml).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Liveness/readiness |
| POST | `/api/auth/register` | — | Create account → `{ token, user }` |
| POST | `/api/auth/login` | — | Authenticate → `{ token, user }` |
| POST | `/api/auth/logout` | bearer | Stateless logout (`204`) |
| GET | `/api/auth/me` | bearer | Current user |
| GET | `/api/entries` | bearer | Timeline: `?limit&cursor&includeDeleted` |
| POST | `/api/entries` | bearer | Capture an entry |
| PATCH | `/api/entries/:id` | bearer | Edit body / backdate `occurredAt` |
| DELETE | `/api/entries/:id` | bearer | Soft-delete (`204`) |
| POST | `/api/entries/:id/restore` | bearer | Restore a soft-deleted entry |

### Example: register then capture

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"a@example.com","password":"correct horse battery"}' | jq -r .token)

curl -s -X POST http://localhost:4000/api/entries \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"body":"finished the OPNsense base config #network"}' | jq
```

```json
{
  "id": "6a36873e2354842176e35164",
  "body": "finished the OPNsense base config #network",
  "occurredAt": "2026-06-20T12:27:42.018Z",
  "createdAt": "2026-06-20T12:27:42.018Z",
  "updatedAt": "2026-06-20T12:27:42.018Z",
  "deleted": false,
  "source": "manual"
}
```

### Error envelope

All errors use one shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

Notable codes: `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401),
`INVALID_CREDENTIALS` (401), `EMAIL_IN_USE` (409), `NOT_FOUND` (404),
`RATE_LIMITED` (429). A foreign/missing entry is always `404` (isolation:
existence is never revealed). Every response carries `x-request-id` for log
correlation.
