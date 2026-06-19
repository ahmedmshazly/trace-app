# Implementation Plan: Export & Portability

**Branch**: `003-export-portability` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-export-portability/spec.md`

## Summary

Make data ownership real. This feature streams the authenticated user's corpus out
as **JSON** (round-trippable, all fields) and **Markdown** (human-readable, day-
grouped), scoped to **everything / a date range / the current filter**, with a
pre-commit size estimate; and optionally re-imports previously exported JSON. It
builds on feature 001 (the `Entry` model, auth, isolation) and reuses feature
002's filter query for scoped exports.

The technical approach extends the existing Express/Mongo backend and React/Vite
client. Server-side: an `export.service.ts` that **streams** entries from a cursor
through a format serializer (JSON array / Markdown writer) to the HTTP response —
bounded memory regardless of corpus size (FR-006) — reusing the feature-002 query
builder for scope; a `count`/size-estimate endpoint; and an optional validated
`import.service.ts`. Client-side: the **Settings → Export** panel (format toggle,
scope selector, size summary, Export action) and, if shipped, an import control.
Built against the design tokens; the settings shell is shared with feature 004.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS (server and client)

**Primary Dependencies**: Express 4, Mongoose 8 (cursor streaming), zod (query +
import validation) · React 18 + Vite 5, TanStack Query. JSON is serialized as a
stream; Markdown via a small in-repo writer (no new heavy dependency). No new
runtime services.

**Storage**: MongoDB 7 — no new collections or fields; reads use existing indexes
(`{ userId, occurredAt, _id }`, `{ userId, tags }`). Import writes `Entry`
documents via the existing entry service.

**Testing**: Vitest (unit — Markdown/JSON serializers, scope→query mapping,
import validator) · Supertest + Vitest with `mongodb-memory-server` (API
integration — export content/scope/streaming, import, isolation) · Playwright
(E2E — export from Settings)

**Target Platform**: Linux server (API) + any modern browser (client)

**Project Type**: Web application (extends existing `backend/` and `frontend/`)

**Performance Goals**: 50k-entry export completes with bounded memory (streamed)
within an acceptable time budget (SC-004, NFR-10.2); size estimate is fast (count
query).

**Constraints**: Strict per-user isolation on export and import; soft-deleted
entries excluded; export reflects a consistent snapshot; bodies emitted safely
(no Markdown injection/corruption); no content telemetry.

**Scale/Scope**: Per-user corpora up to 50k entries; adds the export surface and
(optionally) an import path; reuses settings shell from 004.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Capture Friction Is Sacred | Export is a utility screen off the capture path; it does not touch the capture loop | PASS |
| II. Corpus Is the Product | This feature *is* the portability guarantee — open MD+JSON, round-trippable, user-owned | PASS |
| III. Spec-Driven Development | This plan derives from spec.md; tasks derive from this plan | PASS |
| IV. Test-First & Quality Gates | Serializers, scope parity, round-trip, and isolation have tests before/with implementation (SC-002/003/005/007) | PASS |
| V. Security & Privacy by Default | Export/import scoped to `req.userId`; import validated with zod; isolation suite extended | PASS |
| VI. Observability & Operability | Export requests logged (id, scope, count, timing — never entry content); streaming avoids memory blowups | PASS |
| VII. Simplicity & YAGNI | Synchronous streamed download; no job queue; Markdown writer in-repo; import optional | PASS |

No violations. Complexity Tracking section below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-export-portability/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — decisions & rationale
├── data-model.md        # Phase 1 — export/import shapes (no new persistent fields)
├── quickstart.md        # Phase 1 — local run & verification
├── contracts/
│   └── openapi.yaml     # Phase 1 — export/size/import API
└── tasks.md             # Phase 2: task breakdown
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── services/
│   │   ├── export.service.ts   # scope→query, stream entries → serializer
│   │   └── import.service.ts    # validate + create (optional, FR-6.4)
│   ├── lib/
│   │   ├── serialize-json.ts    # streaming JSON array writer
│   │   └── serialize-markdown.ts# day-grouped, local-time, tag-aware MD writer
│   └── routes/
│       └── export.routes.ts     # GET /export, GET /export/estimate, POST /import
└── tests/
    ├── unit/                    # serializers, scope mapping, import validator
    ├── integration/             # export content/scope/stream, import, parity
    └── isolation/               # export/import never cross users

frontend/
├── src/
│   ├── api/
│   │   └── export.ts            # export/estimate/import hooks
│   └── components/
│       └── ExportPanel.tsx      # format + scope + size summary + Export (in SettingsScreen)
└── tests/
    └── e2e/                     # export from Settings (Playwright)

docs/                            # update FR verification + traceability + api-design
```

**Structure Decision**: Extends the existing web-application layout. The export
path is read-only and streams from a Mongo cursor through a format serializer to
the response, so memory stays bounded (FR-006). Scope reuses the feature-002 query
builder (Constitution VII — no duplicate filter logic). Import (optional) writes
through the existing entry service so all invariants (isolation, tag parsing,
immutable `createdAt`) are enforced in one place.

## Complexity Tracking

> No Constitution violations. No justified complexity required for this feature.
