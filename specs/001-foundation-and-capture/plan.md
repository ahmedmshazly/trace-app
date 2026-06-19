# Implementation Plan: Foundation & Core Capture Loop

**Branch**: `001-foundation-and-capture` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-foundation-and-capture/spec.md`

## Summary

Deliver the V1 MVP of Trace: a hosted, multi-user MERN application whose single
defining interaction is capturing a timestamped moment and browsing it on a
day-grouped timeline. The slice includes email/password authentication with
strict per-user data isolation, the focused-on-load capture input, automatic
timestamping with an immutable `createdAt`, the reverse-chronological day-grouped
timeline with incremental loading, and recoverable entry editing/backdating/
soft-delete. Search, tags, and export are deferred to features 002–003.

The technical approach is a conventional two-tier web app: a stateless
Express/Node REST API backed by MongoDB (Mongoose), and a React (Vite) SPA
client. Auth uses JWT access tokens; every data query is filtered by the
authenticated `userId` enforced in middleware. Everything runs locally against a
local MongoDB and promotes to a hosted environment via environment configuration
only.

**Design reference**: the client is built to the
[UI/UX spec](../../docs/06-design/ui-ux-spec.md) and the
[design-token color system](../../docs/06-design/color-system.md) (dark-first,
ADR-0006). Components bind to semantic CSS custom-property tokens (not raw hex),
and render the logo from a single placeholder wordmark component so the final mark
is a one-place swap. The frames are structural; theme application lands with
feature 004, but the token names are used from the first frontend commit.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS (server and client)

**Primary Dependencies**: Express 4, Mongoose 8, jsonwebtoken, bcrypt, zod (input
validation), express-rate-limit, helmet, cors · React 18 + Vite 5, React Router,
TanStack Query (server-state), a lightweight component layer

**Storage**: MongoDB 7 (local instance in dev; managed instance in hosted envs)

**Testing**: Vitest (unit) · Supertest + Vitest (API integration) · Playwright
(end-to-end capture loop and auth isolation) · MongoDB in-memory server for
isolated integration runs

**Target Platform**: Linux server (API) + any modern browser (client)

**Project Type**: Web application (separate `backend/` and `frontend/`)

**Performance Goals**: Capture commit perceived latency < 100 ms (optimistic UI);
core screen interactive < 2 s cold; search-free timeline smooth at 50k entries/user

**Constraints**: Strict per-user isolation enforced server-side; HTTPS/TLS in
production; secrets only via environment; no telemetry on entry content; no hard
delete in V1

**Scale/Scope**: V1 target of small-to-moderate concurrent users, per-user
corpora up to 50k entries; ~5 screens (auth, core capture+timeline, plus later
search/tags/settings)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Capture Friction Is Sacred | Capture is focused-on-load, keyboard-only, optimistic UI < 100 ms (FR-010/011/014, SC-001/002) | PASS |
| II. Corpus Is the Product | Flat, time-keyed `Entry` schema; export is a downstream feature but schema is export-ready | PASS |
| III. Spec-Driven Development | This plan derives from spec.md; tasks derive from this plan | PASS |
| IV. Test-First & Quality Gates | Critical paths (auth, isolation, capture, persistence) have tests before/with implementation (SC-004/005/007) | PASS |
| V. Security & Privacy by Default | JWT + bcrypt + server-side isolation middleware + rate limiting + helmet/cors; secrets from env | PASS |
| VI. Observability & Operability | Structured logs (no entry content), health endpoint, config-driven deploy | PASS |
| VII. Simplicity & YAGNI | Two services, no premature abstraction; `source` reserved but unused | PASS |

No violations. Complexity Tracking section below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-and-capture/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — decisions & rationale
├── data-model.md        # Phase 1 — entities & schema
├── quickstart.md        # Phase 1 — local run & verification
├── contracts/
│   └── openapi.yaml     # Phase 1 — REST API contract
└── tasks.md             # Phase 2: task breakdown
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/          # env loading & validation (zod)
│   ├── models/          # Mongoose models: user.ts, entry.ts
│   ├── middleware/      # auth (JWT verify), requireUser, error handler, rate limit
│   ├── services/        # auth.service.ts, entry.service.ts (business logic)
│   ├── routes/          # auth.routes.ts, entry.routes.ts, health.routes.ts
│   ├── lib/             # logger, password hashing, token utils
│   └── app.ts / server.ts
└── tests/
    ├── unit/
    ├── integration/     # Supertest against in-memory Mongo
    └── isolation/       # cross-user access denial tests

frontend/
├── src/
│   ├── api/             # typed client + TanStack Query hooks
│   ├── components/      # CaptureInput, TimelineEntry, DayHeader, ...
│   ├── pages/           # Login, Register, Capture (core), Settings (later)
│   ├── lib/             # auth context, time/day grouping, theme
│   └── main.tsx
└── tests/
    ├── unit/
    └── e2e/             # Playwright: capture loop, auth isolation

docs/                    # enterprise documentation (already present)
```

**Structure Decision**: Web-application layout with independent `backend/` and
`frontend/` packages (Constitution: strict UI/API separation, NFR-8.1). Each is
independently buildable, testable, and deployable. The API is the documented
contract (`contracts/openapi.yaml`); the client consumes it and holds no business
logic that the server does not also enforce (defense in depth for isolation).

## Complexity Tracking

> No Constitution violations. No justified complexity required for this feature.
