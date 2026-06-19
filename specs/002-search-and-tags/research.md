# Phase 0 Research: Search & Tags

Decisions and rationale that de-risk the plan. Each records the decision, why it
was chosen, and the alternatives rejected. These feed the data model, contracts,
and tasks.

---

## R-001 — Full-text search: MongoDB text index on `body`

**Decision**: Use a MongoDB **text index** on `Entry.body` and the `$text`
operator with `textScore` for relevance ranking. Every search query is combined
with `{ userId: req.userId, deleted: false }`.

**Why**: It satisfies FR-4.1 and the < 300 ms target (NFR-1.3, SC-001) at the V1
scale (≤ 50k entries/user) with no new infrastructure (Constitution VII). It keeps
the corpus self-contained and analysis-ready (Constitution II).

**Rejected alternatives**:
- *External search engine (Elasticsearch/Meilisearch)* — powerful but adds a
  service, sync, and operational burden unjustified at V1 scale.
- *Unindexed `$regex` scans* — simple but degrade badly as the corpus grows;
  fail the latency target deep into history.
- *Atlas Search* — a strong hosted option; recorded as the documented upgrade path
  if/when relevance/scale needs exceed the native text index, but not required for
  V1 and would couple V1 to a specific host.

## R-002 — Tag model: derived `tags: string[]` parsed from `body`

**Decision**: Tags are **not a separate collection**. A pure parser extracts
distinct `#tag` tokens from `body` and stores them as a normalized `tags: string[]`
on the `Entry`. Parsing runs on create and on every body edit.

**Why**: Zero capture friction (Constitution I) — the user just writes; no tag
management UI. A denormalized array indexes well for filtering and counting and
keeps the schema flat and analysis-ready (Constitution II, VII).

**Rejected alternatives**:
- *Separate `Tag` collection + join* — premature normalization; adds writes and
  joins for no V1 value (YAGNI).
- *Parse tags on read* — wasteful and inconsistent; parse-on-write is canonical
  and lets the `{ userId, tags }` index do the work.

## R-003 — Tag normalization & parsing rule

**Decision**: A tag is `#` followed by one or more Unicode letters/numbers/`_`
(no whitespace). Tags are **lowercased** for storage and comparison; the original
body text is preserved verbatim. Trailing/surrounding punctuation is excluded
(`#work.` → `work`); a bare `#` is not a tag; duplicates within one body collapse;
an in-word `#` (e.g. `c#`) is not parsed as a tag (documented, tested rule).

**Why**: Predictable, testable behavior (Constitution IV) and case-insensitive
navigation (`#Work` == `#work`) without surprising the writer or altering their
text.

**Rejected alternatives**:
- *Case-sensitive tags* — fragments the index and confuses navigation.
- *ASCII-only tags* — excludes non-Latin writers; the corpus must be inclusive.

## R-004 — Tag index: server-side aggregation with counts

**Decision**: Compute the tag index via a MongoDB aggregation
(`$match` userId + not deleted → `$unwind tags` → `$group` count → `$sort`) behind
`GET /tags`. Sorting (count/A–Z) and name-filtering are supported server-side;
small result sets render with frequency bars + numeric counts on the client.

**Why**: Counts must be exact and isolation-safe (SC-005, FR-040). Aggregation on
the indexed `tags` field is efficient at V1 scale and keeps the client thin.

**Rejected alternatives**:
- *Maintain a per-user tag-count document on every write* — added write-path
  complexity and consistency risk for marginal read benefit at V1 scale (YAGNI).
- *Client-side counting* — cannot be done without shipping the whole corpus;
  fails isolation and scale.

## R-005 — Filtering model: one endpoint, composable query params

**Decision**: Extend `GET /entries` to accept optional `q` (text), `tag`, and
`before`/`after` (date range over `occurredAt`) params; the service composes a
single Mongo query as the **conjunction** of the present filters, always anchored
by `userId` and `deleted:false`, and reuses the existing keyset cursor pagination.

**Why**: One coherent, documented surface for "list/search/filter" (FR-4.4,
Constitution VII) rather than parallel endpoints. Reuses the timeline's pagination
and isolation guarantees.

**Rejected alternatives**:
- *Separate `/search` endpoint distinct from `/entries`* — duplicates pagination,
  validation, and isolation logic; two code paths to keep correct.
- *Client-side filtering* — fails at scale and leaks isolation.

## R-006 — Result ranking & pagination interaction

**Decision**: When a text query `q` is present, rank by `textScore` (relevance);
when no `q` (pure tag/date filter or plain timeline), order by `occurredAt` desc
(timeline order). Pagination uses keyset on `occurredAt,_id` for the chronological
case and a documented score+`_id` cursor for the relevance case.

**Why**: Matches user expectation — searches are relevance-first; filtered browsing
is time-first — while preserving stable, performant pagination (R-06 from 001).

**Rejected alternatives**:
- *Always relevance-rank* — wrong for pure date/tag browsing where chronology is
  the point.
- *Always chronological* — buries the best text matches.

## R-007 — `⌘K` command palette & keyboard model

**Decision**: A single global hotkey (`⌘K` / `Ctrl`+`K`) opens an overlay
(`--color-elevated`) with the input focused; `↑/↓` move selection, `Enter` opens
the selected entry in the timeline, `Esc`/outside-click dismisses and returns focus
to capture. Queries are debounced before hitting the API.

**Why**: Keyboard-first (NFR-7.1) and matches the wireframes; debounce protects the
latency budget and the server. Reuses the timeline entry treatment for results
(Constitution VII).

**Rejected alternatives**:
- *A dedicated search page/route* — heavier, breaks the "stay in context" flow.
- *Search-as-you-type with no debounce* — wastes queries and risks jank.

## R-008 — Recent searches: client-local only

**Decision**: Store recent searches in client-local storage; they are convenience
hints, never written to the corpus, never synced in V1.

**Why**: They are not user content and carry no analysis value; keeping them off
the server avoids privacy surface and schema growth (Constitution II, V, VII).

**Rejected alternatives**:
- *Persist recent searches server-side* — adds storage and privacy considerations
  for a pure convenience; deferred unless cross-device demand appears.
