# Phase 1 Data Model: Export & Portability

Export & Portability introduces **no new persistent fields or collections**. It
operates over the existing `Entry` schema (feature 001 + the `tags` field
activated in feature 002). This document defines the **export/import shapes** —
the transient artifacts produced and consumed — and references the canonical
data model.

Canonical reference:
[`docs/02-architecture/data-model.md`](../../docs/02-architecture/data-model.md#export-shape-portability).

---

## What is read

- `Entry` documents for the authenticated user where `deleted: false`, in the
  scope's order (reverse-chronological by `occurredAt`), via existing indexes.
- No schema change; no migration.

---

## JSON export shape (canonical, round-trippable)

A single JSON document: an array of entry objects with all fields preserved.

```json
{
  "trace": { "version": 1, "exportedAt": "2026-06-19T14:02:00Z", "count": 1284 },
  "entries": [
    {
      "id": "665f1c...",
      "body": "shipped the cursor pagination fix #work",
      "occurredAt": "2026-06-19T16:18:00Z",
      "createdAt": "2026-06-19T16:18:02Z",
      "updatedAt": "2026-06-19T16:18:02Z",
      "tags": ["work"],
      "source": "manual"
    }
  ]
}
```

- UTC instants preserved verbatim (analysis-ready, NFR-6.1).
- `tags` and `source` included.
- A small envelope (`trace` metadata) makes the file self-describing and supports
  forward-compatible import (unknown fields ignored, required fields validated).

> The streaming serializer emits this shape incrementally; the example shows the
> logical structure, not an in-memory buffer.

---

## Markdown export shape (canonical, human-readable)

Day-grouped, local time, inline tags — matching the canonical shape:

```markdown
## 2026-06-19
16:18  shipped the cursor pagination fix  #work
13:02  walked to the river at lunch  #walk #mood

## 2026-06-18
21:30  finished the book, quietly proud  #read
```

- `## YYYY-MM-DD` header per **local** day; `HH:MM` local time per entry
  (ADR-0005).
- Reverse-chronological.
- Bodies emitted safely (Markdown-significant characters in a body do not
  restructure the document).
- Markdown is **human-readable and not required to round-trip** (JSON is the
  round-trip format).

---

## Import payload (transient, optional — FR-6.4)

- Accepts the JSON export shape above (the `entries` array; envelope optional).
- Validated with zod: each entry requires `body` (non-empty) and `occurredAt`
  (valid ISO-8601); `tags`/`source` optional; unknown fields ignored.
- On create (via the existing entry service):
  - `body`, `occurredAt`, `tags`, `source` preserved;
  - `tags` re-derived from `body` if absent/inconsistent (parse-on-write, feature
    002);
  - **`createdAt` set fresh by the server** at import time (R-008);
  - all entries scoped to the authenticated user.
- **De-duplication rule (documented)**: skip an entry if one with the same
  `occurredAt` and normalized `body` already exists for the user (idempotent
  re-import).

---

## Invariants

- **Isolation**: exports read only the authenticated user's entries; imports write
  only to the authenticated user (FR-020).
- **Live corpus**: soft-deleted entries are never exported (FR-004).
- **Bounded memory**: exports stream; the full document is never held in memory
  (FR-006).
- **Ledger integrity**: import never adopts a foreign `createdAt`; `occurredAt` is
  preserved (R-008).
