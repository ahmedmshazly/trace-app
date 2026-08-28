# Quickstart: Search & Tags

How to run and verify this feature locally. It assumes feature 001 is implemented
and running, and that the implementation tasks in `tasks.md` are complete.

> Until the application code exists, this document is the target state the
> implementation must satisfy. It doubles as the manual acceptance script.

---

## Prerequisites

- Feature 001 running locally (see
  [`specs/001-foundation-and-capture/quickstart.md`](../001-foundation-and-capture/quickstart.md)).
- Node.js 22 LTS, MongoDB 7 local, a POSIX shell, `jq`.
- The new indexes applied (text index on `body`, `{ userId, tags }`), applied at
  startup/deploy; for an existing dev corpus, run the tags backfill migration.

## 1. Capture tagged moments

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"a@example.com","password":"correct horse battery"}' | jq -r .token)

curl -s -X POST http://localhost:4000/api/entries \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"body":"shipped the cursor pagination fix #work"}' | jq '.tags'
# → ["work"]

curl -s -X POST http://localhost:4000/api/entries \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"body":"walked to the river at lunch #walk #mood"}' | jq '.tags'
# → ["walk","mood"]
```

## 2. Search & filter (US1, US3)

```bash
# Full-text search (relevance-ranked)
curl -s "http://localhost:4000/api/entries?q=pagination" \
  -H "authorization: Bearer $TOKEN" | jq '.items[].body'

# Filter by a single tag (US2)
curl -s "http://localhost:4000/api/entries?tag=work" \
  -H "authorization: Bearer $TOKEN" | jq '.items | length'

# Combine text + tag + date range (US3 / FR-4.4)
curl -s "http://localhost:4000/api/entries?q=fix&tag=work&after=2026-06-01T00:00:00Z&before=2026-06-30T23:59:59Z" \
  -H "authorization: Bearer $TOKEN" | jq '.items[].body'
```

## 3. Tag index (US4)

```bash
# By count (default)
curl -s "http://localhost:4000/api/tags" -H "authorization: Bearer $TOKEN" | jq
# → { "tags": [ {"tag":"work","count":128}, {"tag":"health","count":54}, ... ], "total": 24 }

# Alphabetical, name-filtered
curl -s "http://localhost:4000/api/tags?sort=alpha&filter=wo" -H "authorization: Bearer $TOKEN" | jq '.tags'
```

## 4. Isolation (FR-040, SC-006)

```bash
TOKEN_B=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"b@example.com","password":"another good passphrase"}' | jq -r .token)

# B's search/tag results never include A's entries
curl -s "http://localhost:4000/api/entries?q=pagination" -H "authorization: Bearer $TOKEN_B" | jq '.items | length'
# → 0
curl -s "http://localhost:4000/api/tags" -H "authorization: Bearer $TOKEN_B" | jq '.tags | length'
# → only B's tags (never A's)
```

## 5. In the browser (US1/US3/US4)

1. Log in and press **⌘K** → the search overlay opens, input focused, core screen dimmed.
2. Type a term → results appear with matches emphasized; **↑/↓** move selection, **Enter** opens the entry, **Esc** closes.
3. Add a **#tag** chip and a **date range** → results narrow to the conjunction; remove a chip to widen; **Clear all** resets.
4. Open the **tag index** panel → tags with counts (bar + number); toggle **By count / A–Z**; filter the list; select a tag → returns to the filtered timeline.

## 6. Run the test suites (Constitution IV)

```bash
cd backend && npm test          # unit (tag parser) + integration (search/filter/tag index) + isolation
cd frontend && npm test         # unit
cd frontend && npm run test:e2e # ⌘K search, tag filter, tag index (Playwright)
```

## Definition of Done for this feature

- [ ] US1 (search) acceptance scenarios pass via automated tests (SC-007).
- [ ] Search returns < 300 ms at 50k entries/user (SC-001, NFR-1.3), benchmarked.
- [ ] Combined filters return exactly the conjunction (SC-004); chips add/remove correctly.
- [ ] Tag-index counts exactly match non-deleted tagged entries per user (SC-005).
- [ ] Isolation suite proves no cross-user search/filter/count exposure (SC-006).
- [ ] Soft-deleted entries excluded from search, filters, and counts (FR-041).
- [ ] `docs/` (FR/traceability/API) updated; CI green; merged via PR.
