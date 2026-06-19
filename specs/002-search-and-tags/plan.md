# Implementation Plan: Search & Tags

**Branch**: `002-search-and-tags` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-search-and-tags/spec.md`

## Summary

Make the corpus retrievable at depth. This feature adds: inline `#tag` parsing on
entry create/edit (stored as a normalized `tags` array on `Entry`); full-text
search over the authenticated user's entry bodies surfaced through a `⌘K` command
palette; single-tag and date-range filters that combine with text search; and a
tag index with per-tag counts. It builds on feature 001's `Entry` model, auth,
isolation, and timeline.

The technical approach extends the existing Express/Mongo backend and React/Vite
client. Server-side: a MongoDB **text index** on `body` for relevance search, a
**`{ userId, tags }`** index for tag filtering, and the existing
`{ userId, occurredAt, _id }` index for date-bounded, paginated results — every
query scoped by `req.userId`. Tag parsing is a pure, tested function applied in
the entry service. Client-side: a `⌘K` command-palette overlay and a slide-in tag
index panel, both reusing the timeline's entry treatment, wired with TanStack
Query. The UI is built against the design tokens (the wireframes are structural;
theming is applied in 004).

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS (server and client)

**Primary Dependencies**: Express 4, Mongoose 8, zod (query validation) · React 18
+ Vite 5, React Router, TanStack Query. No new runtime dependencies anticipated;
search uses MongoDB's built-in text index (or an equivalent `$regex`/Atlas Search
strategy documented in research). A small debounce utility on the client.

**Storage**: MongoDB 7 — adds a text index on `Entry.body` and a `{ userId, tags }`
compound index (migrations; verified against performance targets).

**Testing**: Vitest (unit — tag parser, query builders) · Supertest + Vitest with
`mongodb-memory-server` (API integration — search/filter/tag-index, isolation) ·
Playwright (E2E — `⌘K` search flow, tag filter, tag index)

**Target Platform**: Linux server (API) + any modern browser (client)

**Project Type**: Web application (extends existing `backend/` and `frontend/`)

**Performance Goals**: Search results < 300 ms at 50k entries/user (NFR-1.3,
SC-001); palette open and keystroke feedback feel instant; tag index renders
without jank.

**Constraints**: Strict per-user isolation on every search/filter/count query;
soft-deleted entries excluded everywhere; tags derived from body (no separate
taxonomy); recent searches client-local; no content telemetry.

**Scale/Scope**: Per-user corpora up to 50k entries; adds 2 surfaces (⌘K palette,
tag index panel) and extends the entry create/edit path with tag parsing.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Capture Friction Is Sacred | Tags are parsed from the body with zero extra capture steps; search is `⌘K`, keyboard-first | PASS |
| II. Corpus Is the Product | Tags enrich the flat, time-keyed schema for analysis; `tags` is a documented, additive field | PASS |
| III. Spec-Driven Development | This plan derives from spec.md; tasks derive from this plan | PASS |
| IV. Test-First & Quality Gates | Tag parser, search/filter query builders, and isolation have tests before/with implementation (SC-005/006/007) | PASS |
| V. Security & Privacy by Default | Every query scoped to `req.userId`; query inputs validated with zod; isolation suite extended to search/filter/counts | PASS |
| VI. Observability & Operability | Search queries logged with correlation id and timing (never entry content); index changes treated as migrations | PASS |
| VII. Simplicity & YAGNI | Tags derived (no tag entity/management); search uses native datastore capability; no new services | PASS |

No violations. Complexity Tracking section below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-search-and-tags/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — decisions & rationale
├── data-model.md        # Phase 1 — Entry delta (tags), indexes, tag aggregation
├── quickstart.md        # Phase 1 — local run & verification
├── contracts/
│   └── openapi.yaml     # Phase 1 — search, filter, tag-index API delta
└── tasks.md             # Phase 2: task breakdown
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── lib/
│   │   └── tags.ts          # pure #tag parser + normalizer (unit-tested)
│   ├── models/
│   │   └── entry.ts         # + tags: string[]; + text index + {userId,tags} index
│   ├── services/
│   │   └── entry.service.ts # parse tags on create/update; search() + filter() + tagIndex()
│   └── routes/
│       ├── entry.routes.ts  # GET /entries gains q, tag, before/after; search semantics
│       └── tag.routes.ts    # GET /tags (tag index with counts)
└── tests/
    ├── unit/                # tag parser/normalizer
    ├── integration/         # search, tag filter, date filter, combined, tag index
    └── isolation/           # search/filter/counts never cross users

frontend/
├── src/
│   ├── api/
│   │   ├── search.ts        # search/filter query hooks (TanStack Query)
│   │   └── tags.ts          # tag index hook
│   ├── components/
│   │   ├── CommandPalette.tsx   # ⌘K overlay (search + filter chips + results)
│   │   ├── FilterChip.tsx
│   │   ├── TagPill.tsx
│   │   ├── TagIndexPanel.tsx    # slide-in panel
│   │   └── SearchResultRow.tsx  # reuses TimelineEntry treatment
│   └── lib/
│       ├── hotkeys.ts       # ⌘K / Ctrl+K binding
│       └── recentSearches.ts# client-local recent searches
└── tests/
    └── e2e/                 # ⌘K search, tag filter, tag index (Playwright)

docs/                        # update FR/traceability + design references
```

**Structure Decision**: Extends the existing web-application layout from feature
001 (independent `backend/` and `frontend/`). No new packages or services. Search
relies on a datastore index (research R-001) and tag parsing is isolated in a pure,
unit-tested `lib/tags.ts` so it is auditable and reused on create and edit. The API
remains the documented contract; the client holds no logic the server does not also
enforce (isolation defense-in-depth).

## Complexity Tracking

> No Constitution violations. No justified complexity required for this feature.
