# Quickstart: Export & Portability

How to run and verify this feature locally. It assumes features 001 and 002 are
implemented and running, and that the implementation tasks in `tasks.md` are
complete.

> Until the application code exists, this document is the target state the
> implementation must satisfy. It doubles as the manual acceptance script.

---

## Prerequisites

- Features 001 + 002 running locally.
- Node.js 22 LTS, MongoDB 7 local, a POSIX shell, `jq`.
- A populated corpus (use the seed helper for a large-corpus check).

## 1. Full export (US1)

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"a@example.com","password":"correct horse battery"}' | jq -r .token)

# JSON, everything (round-trippable)
curl -s "http://localhost:4000/api/export?format=json" \
  -H "authorization: Bearer $TOKEN" -o trace-export.json
jq '.trace.count, (.entries | length)' trace-export.json   # counts match

# Markdown, everything (human-readable)
curl -s "http://localhost:4000/api/export?format=md" \
  -H "authorization: Bearer $TOKEN" -o trace-export.md
head -n 6 trace-export.md
# ## 2026-06-19
# 16:18  shipped the cursor pagination fix  #work
```

## 2. Size estimate (FR-005)

```bash
curl -s "http://localhost:4000/api/export/estimate" \
  -H "authorization: Bearer $TOKEN" | jq
# → { "count": 1284, "approxBytes": 2202010 }   ("1,284 entries · ~2.1 MB")
```

## 3. Scoped export (US2)

```bash
# Date range
curl -s "http://localhost:4000/api/export?format=json&after=2026-06-01T00:00:00Z&before=2026-06-30T23:59:59Z" \
  -H "authorization: Bearer $TOKEN" | jq '.entries | length'

# Current filter (a tag), parity with GET /entries?tag=work
curl -s "http://localhost:4000/api/export?format=json&tag=work" \
  -H "authorization: Bearer $TOKEN" | jq '.entries | length'
curl -s "http://localhost:4000/api/entries?tag=work" \
  -H "authorization: Bearer $TOKEN" | jq '.items | length'
# the two counts must match (SC-003 parity)
```

## 4. Round-trip import (US3, optional / FR-6.4)

```bash
# Import into a fresh account; counts reconstruct
TOKEN_C=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"c@example.com","password":"import round trip pass"}' | jq -r .token)

curl -s -X POST http://localhost:4000/api/import \
  -H "authorization: Bearer $TOKEN_C" -H 'content-type: application/json' \
  --data-binary @trace-export.json | jq
# → { "imported": 1284, "skipped": 0, "total": 1284 }

# Re-import is idempotent (de-dup)
curl -s -X POST http://localhost:4000/api/import \
  -H "authorization: Bearer $TOKEN_C" -H 'content-type: application/json' \
  --data-binary @trace-export.json | jq '.skipped'
# → 1284 (no duplicates created)
```

## 5. Isolation (FR-020, SC-005)

```bash
TOKEN_B=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"b@example.com","password":"another good passphrase"}' | jq -r .token)
curl -s "http://localhost:4000/api/export?format=json" -H "authorization: Bearer $TOKEN_B" | jq '.entries | length'
# → only B's entries (never A's)
```

## 6. In the browser (US1/US2)

1. Open **Settings** → **Export**.
2. Pick **Format** (Markdown / JSON) and **Scope** (Everything / Date range / Current filter).
3. Confirm the **size summary** updates (e.g. "1,284 entries · ~2.1 MB").
4. Click **Export** → a file downloads with a sensible name; soft-deleted entries are absent.

## 7. Run the test suites (Constitution IV)

```bash
cd backend && npm test          # unit (serializers, scope mapping, import validator) + integration + isolation
cd frontend && npm test         # unit
cd frontend && npm run test:e2e # export from Settings (Playwright)
```

## Definition of Done for this feature

- [ ] US1 acceptance scenarios pass via automated tests (SC-007); full MD + JSON export of the whole corpus (SC-001).
- [ ] JSON export round-trips: re-import reconstructs an equivalent corpus (SC-002).
- [ ] Scoped exports match the equivalent in-app filter exactly (SC-003 parity tests).
- [ ] 50k-entry export streams with bounded memory within the time budget (SC-004).
- [ ] Unicode + Markdown-significant content preserved exactly (SC-006).
- [ ] Isolation suite proves no cross-user export/import exposure (SC-005).
- [ ] `docs/` (FR/traceability/API) updated; CI green; merged via PR.
