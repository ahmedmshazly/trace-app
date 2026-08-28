# Phase 1 Data Model: Search & Tags

The feature-scoped data model **delta** for Search & Tags. The canonical,
project-wide reference is [`docs/02-architecture/data-model.md`](../../docs/02-architecture/data-model.md)
(which already reserves `tags` and the search/tag indexes); this file activates
them. No breaking schema change is introduced, `tags` is additive.

---

## Entry: delta

The `Entry` from feature 001 gains one field and two indexes.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `tags` | string[] | default `[]` · indexed | Distinct, normalized tags parsed from `body`. Activated by this feature. |

All other `Entry` fields (`userId`, `body`, `occurredAt`, `createdAt`,
`updatedAt`, `deleted`, `source`) are unchanged from
[`specs/001-foundation-and-capture/data-model.md`](../001-foundation-and-capture/data-model.md).

### Indexes (added by this feature)

- **Text index on `body`.** Serves full-text relevance search (`$text` +
  `textScore`). Scoped at query time by `{ userId, deleted: false }`.
- **Compound `{ userId: 1, tags: 1 }`.** Serves single-tag filtering and the tag
  aggregation.
- Existing `{ userId: 1, occurredAt: -1, _id: -1 }` (from 001) continues to serve
  date-range filtering and chronological pagination.

### Invariants (added/affected)

- **Parse-on-write**: `tags` is derived from `body` by the server on create and on
  every body edit; it is never accepted directly from client input.
- **Normalization**: tags are lowercased and de-duplicated; the body text is
  preserved verbatim (parsing never rewrites the body).
- **Isolation & visibility**: search, filters, and tag counts are always scoped by
  `userId` and exclude `deleted: true` (FR-040, FR-041).

---

## Tag parsing rule (canonical for V1)

A tag is `#` immediately followed by one or more characters from
`[\p{L}\p{N}_]` (Unicode letters, numbers, underscore), not preceded by a word
character (so `c#` does not parse). Examples:

| Body fragment | Parsed tags |
|---|---|
| `shipped the fix #work` | `["work"]` |
| `#Work and #work` | `["work"]` (normalized + de-duped) |
| `wrapped up (#idea) today.` | `["idea"]` |
| `a bare # is nothing` | `[]` |
| `email me at a#b` | `[]` (in-word `#` not a tag) |

The authoritative rule and its tests live in `backend/src/lib/tags.ts` and its unit
suite (Constitution IV).

---

## Tag index (derived aggregation: not a stored entity)

The tag index is computed on demand, not stored:

```text
match  { userId, deleted: false }
unwind tags
group  by tag → count
sort   by count desc (or tag asc for A–Z)
```

- Counts equal the number of non-deleted entries carrying each tag for the
  authenticated user (SC-005).
- Optional server-side name filter narrows the returned tags.

---

## Migration & performance notes

- Adding the text index and `{ userId, tags }` index is a **migration**; it is
  applied idempotently at startup/deploy and verified against the latency target
  (NFR-1.3) on a representative corpus (50k entries/user).
- Backfilling `tags` for pre-existing entries (created before this feature) is a
  one-time migration that re-parses `body`; entries created after this feature get
  `tags` at write time.
- Any future change to the parsing rule is a documented migration (re-parse) plus
  an update to this file and the canonical data model.
