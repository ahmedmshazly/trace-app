# Phase 0 Research: Export & Portability

Decisions and rationale that de-risk the plan. Each records the decision, why it
was chosen, and the alternatives rejected.

---

## R-001 Delivery model: synchronous streamed download

**Decision**: Export is a synchronous HTTP `GET` that **streams** the document to
the response as it is produced from a MongoDB cursor; the browser receives it as a
file download. No background jobs, no emailed exports in V1.

**Why**: Simple and sufficient at the per-user scale target (≤ 50k entries)
(Constitution VII). Streaming keeps server memory bounded regardless of corpus
size (FR-006, SC-004) without introducing a queue/worker.

**Rejected alternatives**:
- *Background job + notification/email*: operationally heavier (queue, storage,
  delivery) and unjustified at V1 scale (YAGNI).
- *Buffer the whole document then send*: risks memory exhaustion on large
  corpora; fails the bounded-memory requirement.

## R-002 Streaming serialization (JSON & Markdown)

**Decision**: Iterate a Mongo cursor and write incrementally: for JSON, emit a
streaming array (`[`, comma-separated entries, `]`); for Markdown, emit day
headers as the local day changes, then a line per entry. Backpressure is respected
via the response stream.

**Why**: Bounded memory and steady throughput (FR-006). The serializers are pure,
unit-testable functions over an entry iterator (Constitution IV).

**Rejected alternatives**:
- *`JSON.stringify(allEntries)`*: buffers everything; defeats streaming.
- *Templating the whole Markdown in memory*: same buffering problem.

## R-003 Scope reuses the feature-002 query builder

**Decision**: "Everything / date range / current filter" maps to the **same query
builder** used by `GET /entries` in feature 002 (`userId` + `deleted:false` + optional
`tag`/`q`/`before`/`after`). "Current filter" is expressed by passing the active
filter params to the export endpoint.

**Why**: One source of truth for what a filter means (Constitution VII); guarantees
export/in-app parity (SC-003) by construction.

**Rejected alternatives**:
- *A separate export filter implementation*: risks drift between what the UI shows
  and what export produces; two code paths to keep correct.

## R-004 Markdown export shape (canonical)

**Decision**: Follow the canonical shape in
[`docs/02-architecture/data-model.md`](../../docs/02-architecture/data-model.md#export-shape-portability):
a `## YYYY-MM-DD` header per local day, then `HH:MM  <body>  #tags` lines, in
reverse-chronological order. Bodies are emitted safely (no injection that would
restructure the document).

**Why**: Human-readable, diff-friendly, and already documented as the canonical
shape (Constitution II). Local day/time matches the timeline (ADR-0005).

**Rejected alternatives**:
- *One file per entry / per day*: harder to share and archive; a single document
  is the expected artifact.
- *HTML export*: not a plain-text portable format; out of scope.

## R-005 JSON is the round-trip format; Markdown is human-readable

**Decision**: JSON preserves every field (UTC instants, tags, source) and is the
**round-trippable** format (NFR-5.2). Markdown is for humans and is explicitly not
required to re-import losslessly.

**Why**: Trying to make Markdown round-trip would constrain its readability and add
fragile parsing. Two formats, two clearly-scoped jobs (Constitution II, VII).

**Rejected alternatives**:
- *Round-trip via Markdown*: fragile parsing, ambiguous, low value over JSON.

## R-006 Size estimate before commit

**Decision**: A lightweight `GET /export/estimate` returns the entry **count** for
the selected scope plus an **approximate byte size** (count × average entry size,
or a fast partial measure). The UI shows e.g. "1,284 entries · ~2.1 MB" before the
user exports (FR-005).

**Why**: Sets expectations for large exports without producing the full document
twice; a count query is cheap on the existing indexes.

**Rejected alternatives**:
- *Produce the export to measure it*: wasteful (double work).
- *No estimate*: the wireframe explicitly shows a size summary; users want it for
  large corpora.

## R-007 Import (optional): validate, then create via the entry service

**Decision**: If FR-6.4 ships, `POST /import` accepts a JSON document, validates it
with zod against the documented schema, and creates entries **through the existing
entry service** (so tag parsing, isolation, and the `createdAt` policy are
enforced in one place). De-duplication uses a documented rule (e.g. match on
`occurredAt` + normalized `body` for the user) to avoid duplicate re-imports.

**Why**: Reusing the entry service keeps invariants centralized (Constitution V,
VII). Validation makes import safe and predictable (FR-011).

**Rejected alternatives**:
- *Bulk raw insert bypassing the service*: risks skipping isolation/tag/`createdAt`
  rules and importing malformed data.
- *Trusting client-supplied `createdAt`*: violates the immutable-ledger principle;
  `createdAt` records when *this* corpus committed the entry.

## R-008 `createdAt` policy on import

**Decision**: On import, `occurredAt`, `body`, `tags`, and `source` are preserved
from the file; `createdAt` is **set fresh by the server** at import time (the honest
record of when this corpus received the entry). This is documented in the spec
assumptions and the data model.

**Why**: `createdAt` is the immutable ledger of *this* system's commit; importing a
foreign `createdAt` would misrepresent it. `occurredAt` (the analysis axis) is
faithfully preserved.

**Rejected alternatives**:
- *Preserve the file's `createdAt`*: conflates two corpora's ledgers; rejected for
  ledger integrity.
