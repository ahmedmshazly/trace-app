---
description: "Task list for Foundation & Core Capture Loop (001)"
---

# Tasks: Foundation & Core Capture Loop

**Input**: Design documents from `/specs/001-foundation-and-capture/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests ARE included. Trace's Constitution (IV. Test-First & Quality
Gates) mandates automated tests for the critical paths (auth, isolation, capture,
persistence). Test tasks for those paths are written before their implementation.

**Organization**: Tasks are grouped by user story so each story can be
implemented, tested, and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (capture), US2 (auth+isolation), US3 (timeline), US4 (curation)
- File paths follow the `backend/` + `frontend/` structure in plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Initialize `backend/` Node+TypeScript project (Express, Mongoose, zod, jsonwebtoken, bcrypt, helmet, cors, express-rate-limit) with `package.json`, `tsconfig.json`.
- [ ] T002 [P] Initialize `frontend/` React+Vite+TypeScript project (React Router, TanStack Query) with `package.json`, `tsconfig.json`, `vite.config.ts`.
- [ ] T003 [P] Configure linting/formatting (ESLint + Prettier) and shared scripts in both packages.
- [ ] T004 [P] Add `.env.example` to `backend/` and `frontend/`; add `.gitignore` entries for `.env` and build artifacts.
- [ ] T005 [P] Configure test runners: Vitest (both), Supertest + `mongodb-memory-server` (backend), Playwright (frontend e2e).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Implement validated config module `backend/src/config/index.ts` (zod-parse env, fail-fast) per research R-10.
- [ ] T007 [P] Implement structured logger `backend/src/lib/logger.ts` (never logs entry content or secrets — Constitution VI).
- [ ] T008 Implement MongoDB connection + lifecycle in `backend/src/lib/db.ts`.
- [ ] T009 Create Express app `backend/src/app.ts` with helmet, cors (allowed origins from config), JSON parsing, and a global error handler `backend/src/middleware/error.ts`.
- [ ] T010 [P] Implement `User` model `backend/src/models/user.ts` and `Entry` model `backend/src/models/entry.ts` with indexes per data-model.md (unique email; compound `{userId, occurredAt:-1, _id:-1}`).
- [ ] T011 Implement auth middleware `backend/src/middleware/auth.ts` (verify JWT → `req.userId`) and `requireUser` guard per research R-03.
- [ ] T012 [P] Implement password utils `backend/src/lib/password.ts` (bcrypt hash/verify) and token utils `backend/src/lib/token.ts` (sign/verify JWT).
- [ ] T013 Implement health route `backend/src/routes/health.routes.ts` (`GET /api/health`) per contracts.
- [ ] T014 [P] Frontend foundation: API client `frontend/src/api/client.ts`, auth context `frontend/src/lib/auth.tsx`, router shell, theme + protected-route wrapper.

**Checkpoint**: Foundation ready — user stories can begin.

---

## Phase 3: User Story 2 - Register, sign in, stay isolated (Priority: P1)

> Implemented first because every other story requires an authenticated, isolated user.

**Goal**: Accounts, sessions, and provably impossible cross-user access.

**Independent Test**: Register A and B; confirm B sees none of A's data via any endpoint.

### Tests for User Story 2 (write first, must fail)

- [ ] T015 [P] [US2] Integration test: register/login happy path + duplicate-email + bad-password in `backend/tests/integration/auth.test.ts`.
- [ ] T016 [P] [US2] Integration test: rate-limiting on repeated failed logins (FR-006) in `backend/tests/integration/auth.rate-limit.test.ts`.
- [ ] T017 [P] [US2] Isolation test: user B cannot read/patch/delete user A's entries (FR-040, SC-004) in `backend/tests/isolation/entry-isolation.test.ts`.

### Implementation for User Story 2

- [ ] T018 [US2] Implement `auth.service.ts` (register, login, logout, me) with bcrypt + JWT in `backend/src/services/auth.service.ts`.
- [ ] T019 [US2] Implement auth routes `backend/src/routes/auth.routes.ts` (`/register`, `/login`, `/logout`, `/me`) with zod validation (R-08) and rate limiter on auth endpoints.
- [ ] T020 [US2] Wire `requireUser` so every `/entries` route is scoped to `req.userId` (centralized isolation, R-03).
- [ ] T021 [P] [US2] Frontend Login + Register pages and auth flow (`frontend/src/pages/Login.tsx`, `Register.tsx`) consuming the auth API; redirect to capture on success.
- [ ] T022 [P] [US2] E2E test: register → land on focused capture screen; second user sees empty timeline in `frontend/tests/e2e/auth-isolation.spec.ts`.

**Checkpoint**: Auth + isolation verified by tests.

---

## Phase 4: User Story 1 - Capture a moment with zero friction (Priority: P1) 🎯 MVP

**Goal**: The capture loop — focused-on-load input, Enter to commit, instant timeline insert, immutable `createdAt`.

**Independent Test**: Log in, type, Enter → entry persists and appears; Shift+Enter inserts newline; reload persists.

### Tests for User Story 1 (write first, must fail)

- [ ] T023 [P] [US1] Integration test: `POST /entries` sets `occurredAt`=now + immutable `createdAt`, rejects empty body (FR-012/013/015) in `backend/tests/integration/entry-create.test.ts`.
- [ ] T024 [P] [US1] Integration test: created entry is readable via `GET /entries` and persists (SC-005) in `backend/tests/integration/entry-persist.test.ts`.
- [ ] T025 [P] [US1] E2E test: focus-on-load, type, Enter → entry appears + input cleared/refocused; Shift+Enter newline; reload persists in `frontend/tests/e2e/capture-loop.spec.ts`.

### Implementation for User Story 1

- [ ] T026 [US1] Implement `entry.service.ts` create() (server-set `createdAt`, default `occurredAt`, trim/reject empty) in `backend/src/services/entry.service.ts`.
- [ ] T027 [US1] Implement `POST /entries` and `GET /entries` (basic) in `backend/src/routes/entry.routes.ts` with zod validation.
- [ ] T028 [P] [US1] Frontend `CaptureInput` component: auto-focus on mount, Enter to commit, Shift+Enter newline, optimistic insert + reconcile/retry (R-04) in `frontend/src/components/CaptureInput.tsx`.
- [ ] T029 [P] [US1] Frontend `TimelineEntry` component + capture page wiring in `frontend/src/pages/Capture.tsx` and `frontend/src/components/TimelineEntry.tsx`.
- [ ] T030 [US1] TanStack Query create-entry mutation with optimistic update in `frontend/src/api/entries.ts`.

**Checkpoint**: 🎯 MVP — a user can register, sign in, and capture moments that persist. Deployable.

---

## Phase 5: User Story 3 - Browse the day-grouped timeline (Priority: P2)

**Goal**: Reverse-chronological, day-grouped timeline with cursor pagination.

**Independent Test**: Seed multi-day entries → correct day headers, newest-first, incremental scroll load.

### Tests for User Story 3

- [ ] T031 [P] [US3] Integration test: cursor pagination on `(occurredAt,_id)` desc, excludes deleted (R-06, FR-020/022) in `backend/tests/integration/entry-timeline.test.ts`.

### Implementation for User Story 3

- [ ] T032 [US3] Extend `entry.service.ts` list() with keyset cursor pagination + `nextCursor` per contracts.
- [ ] T033 [US3] Extend `GET /entries` to accept `limit`/`cursor`/`includeDeleted`.
- [ ] T034 [P] [US3] Frontend day-grouping util (`Today`/`Yesterday`/date in local tz, R-05) in `frontend/src/lib/grouping.ts` + `DayHeader` component.
- [ ] T035 [US3] Frontend infinite-scroll timeline (TanStack Query `useInfiniteQuery`) in `frontend/src/pages/Capture.tsx`.

**Checkpoint**: Timeline is pleasant at scale.

---

## Phase 6: User Story 4 - Correct and curate entries (Priority: P3)

**Goal**: Edit, backdate, soft-delete, restore — no hard delete (R-07, FR-030/031/032).

**Independent Test**: Edit body, backdate (re-sorts), soft-delete (disappears), restore (re-appears).

### Tests for User Story 4

- [ ] T036 [P] [US4] Integration test: PATCH edits body + backdates (`createdAt` immutable, `updatedAt` refreshes); DELETE soft-deletes; restore re-appears in `backend/tests/integration/entry-curate.test.ts`.

### Implementation for User Story 4

- [ ] T037 [US4] Extend `entry.service.ts` with update(), softDelete(), restore() (reject `createdAt` mutation).
- [ ] T038 [US4] Implement `PATCH /entries/:id`, `DELETE /entries/:id`, `POST /entries/:id/restore` with ownership checks.
- [ ] T039 [P] [US4] Frontend entry actions (edit inline, time adjuster, delete-with-confirm, restore) in `frontend/src/components/TimelineEntry.tsx`.

**Checkpoint**: Full V1 capture+curate loop complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T040 [P] Add backend request logging (correlation id; no entry content) and finalize error-response shape per contracts.
- [ ] T041 [P] Accessibility pass on capture + auth screens (focus states, contrast, keyboard nav — NFR-7.4).
- [ ] T042 [P] Performance check against SC-002/003/006; add the compound index migration/verification.
- [ ] T043 [P] Update `docs/` (architecture, API) to match shipped behavior; verify against `contracts/openapi.yaml`.
- [ ] T044 Run `quickstart.md` end-to-end as the manual acceptance script; confirm Definition of Done.
- [ ] T045 Wire CI (lint + typecheck + unit + integration + e2e) per `docs/04-engineering/ci-cd.md`.

---

## Dependencies & Execution Order

- **Setup (P1)** → **Foundational (P2)** block everything.
- **US2 (auth/isolation)** is implemented before **US1** because capture requires an authenticated, isolated user. Both are P1 for shipping.
- **US3** and **US4** depend only on Foundational + the entry endpoints; can proceed in priority order or in parallel by different developers.
- **Polish (P7)** comes after the targeted stories.

### Within each story

- Tests for critical paths are written first and must fail before implementation.
- Models → services → routes → frontend wiring.
- Commit after each task or logical group (Constitution: small logical commits).

## MVP definition

Setup + Foundational + **US2 + US1** = the shippable MVP: register, sign in
(isolated), and capture timestamped moments that persist. US3/US4 are
incremental refinements that do not break the MVP.
