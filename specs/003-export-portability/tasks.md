---
description: "Task list for Export & Portability (003)"
---

# Tasks: Export & Portability

**Input**: Design documents from `/specs/003-export-portability/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml; features 001 + 002 implemented.

**Tests**: Tests ARE included. Trace's Constitution (IV. Test-First & Quality
Gates) mandates automated tests for critical paths (here: the serializers, scope→
in-app parity, JSON round-trip, streaming/memory, and isolation). Those tests are
written before their implementation.

**Organization**: Tasks are grouped by user story so each story can be
implemented, tested, and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (full export), US2 (scoped export), US3 (import, optional)
- File paths follow the `backend/` + `frontend/` structure in plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Add export route module scaffold `backend/src/routes/export.routes.ts` and register it on the Express app.
- [ ] T002 [P] Add a large-corpus seed helper (≥ 50k entries for one user) for the streaming/memory check in `backend/tests/helpers/seed.ts` (reuse from 002 if present).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Implement the streaming JSON serializer (envelope + incremental `entries` array) in `backend/src/lib/serialize-json.ts`.
- [ ] T004 [P] Implement the Markdown serializer (local day headers, `HH:MM` lines, inline tags, safe body emission) in `backend/src/lib/serialize-markdown.ts` per data-model.md.
- [ ] T005 [P] Unit tests for both serializers (shape, ordering, Unicode + Markdown-significant chars, empty corpus) in `backend/tests/unit/serializers.test.ts` (write first, must fail).
- [ ] T006 Implement `export.service.ts` that maps scope → the feature-002 query builder and streams a Mongo cursor through a chosen serializer to a writable stream in `backend/src/services/export.service.ts`.

**Checkpoint**: Foundation ready, serializers + streaming export service exist.

---

## Phase 3: User Story 1 - Export the whole corpus (Priority: P1) 🎯 MVP

**Goal**: Stream the entire corpus as JSON and Markdown; exclude soft-deleted; bounded memory.

**Independent Test**: Export everything as JSON and MD → every non-deleted entry present, documented shape, own data only.

### Tests for User Story 1 (write first, must fail)

- [ ] T007 [P] [US1] Integration test: `GET /export?format=json` returns all non-deleted entries with all fields; excludes deleted (FR-001/004) in `backend/tests/integration/export-json.test.ts`.
- [ ] T008 [P] [US1] Integration test: `GET /export?format=md` produces the documented day-grouped Markdown (FR-002) in `backend/tests/integration/export-md.test.ts`.
- [ ] T009 [P] [US1] Integration test: 50k-entry export streams with bounded memory within the time budget (SC-004, FR-006) in `backend/tests/integration/export-stream.test.ts`.
- [ ] T010 [P] [US1] Isolation test: export contains only the authenticated user's entries (FR-020, SC-005) in `backend/tests/isolation/export-isolation.test.ts`.
- [ ] T011 [P] [US1] E2E test: Settings → Export → download a full JSON and MD file in `frontend/tests/e2e/export.spec.ts`.

### Implementation for User Story 1

- [ ] T012 [US1] Implement `GET /export` (format=json|md, full scope) with streaming response, `Content-Disposition` filename, and content type in `backend/src/routes/export.routes.ts`.
- [ ] T013 [P] [US1] Frontend `ExportPanel` (format toggle, Export action, download handling) within `SettingsScreen` in `frontend/src/components/ExportPanel.tsx` and `frontend/src/api/export.ts`.

**Checkpoint**: 🎯 Stage-3 MVP, the user can export the entire corpus to MD + JSON.

---

## Phase 4: User Story 2 - Export a scoped subset (Priority: P2)

**Goal**: Scope an export to a date range or the current filter; show a size estimate.

**Independent Test**: Export with a date range / current filter → output equals the equivalent in-app filter; size summary shown before commit.

### Tests for User Story 2 (write first, must fail)

- [ ] T014 [P] [US2] Integration test: scoped export (tag / q / before+after) equals `GET /entries` with the same params, parity (FR-003, SC-003) in `backend/tests/integration/export-scope-parity.test.ts`.
- [ ] T015 [P] [US2] Integration test: `GET /export/estimate` returns correct count + plausible approxBytes per scope (FR-005) in `backend/tests/integration/export-estimate.test.ts`.
- [ ] T016 [P] [US2] Integration test: empty-scope export yields a well-formed empty document (edge case) in `backend/tests/integration/export-empty.test.ts`.

### Implementation for User Story 2

- [ ] T017 [US2] Extend `GET /export` to accept and apply `tag`/`q`/`before`/`after` via the shared query builder in `backend/src/routes/export.routes.ts`.
- [ ] T018 [US2] Implement `GET /export/estimate` (count + approx size for scope) in `backend/src/routes/export.routes.ts`.
- [ ] T019 [P] [US2] Frontend scope selector (Everything / Date range / Current filter) + live size summary in `frontend/src/components/ExportPanel.tsx`.

**Checkpoint**: Scoped export with parity and size estimate.

---

## Phase 5: User Story 3 - Re-import previously exported JSON (Priority: P3, optional / FR-6.4)

**Goal**: Validate + import JSON into the user's corpus; idempotent re-import; ledger-correct `createdAt`.

**Independent Test**: Export → import into a fresh account → equivalent corpus; re-import creates no duplicates.

### Tests for User Story 3 (write first, must fail)

- [ ] T020 [P] [US3] Integration test: round-trip, export then import reconstructs an equivalent corpus (body/occurredAt/tags/source preserved; createdAt fresh) (FR-010, SC-002, R-008) in `backend/tests/integration/import-roundtrip.test.ts`.
- [ ] T021 [P] [US3] Integration test: malformed payload rejected with a clear error and no partial state (FR-011) in `backend/tests/integration/import-validation.test.ts`.
- [ ] T022 [P] [US3] Integration test: re-importing the same file skips duplicates per the de-dup rule (FR-012) in `backend/tests/integration/import-dedup.test.ts`.
- [ ] T023 [P] [US3] Isolation test: import writes only to the authenticated user (FR-020) in `backend/tests/isolation/import-isolation.test.ts`.

### Implementation for User Story 3

- [ ] T024 [US3] Implement `import.service.ts` (zod-validate; create via the existing entry service; fresh `createdAt`; de-dup on occurredAt+normalized body) in `backend/src/services/import.service.ts`.
- [ ] T025 [US3] Implement `POST /import` route returning `{ imported, skipped, total }` in `backend/src/routes/export.routes.ts`.
- [ ] T026 [P] [US3] Frontend import control (file picker + result summary) in `frontend/src/components/ExportPanel.tsx`.

**Checkpoint**: Portability is round-trippable.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T027 [P] Add export/import request logging (id, scope, count, timing; never entry content) in `backend/src/routes/export.routes.ts` (Constitution VI).
- [ ] T028 [P] Accessibility pass on the Export panel (keyboard, focus, labels, "never color alone") in `frontend/src/components/ExportPanel.tsx` (NFR-7.4).
- [ ] T029 [P] Update `docs/` (functional-requirements verification, traceability matrix 003 rows + SC-7, api-design export note) and verify against `contracts/openapi.yaml`.
- [ ] T030 Run `quickstart.md` end-to-end as the manual acceptance script; confirm Definition of Done.
- [ ] T031 Extend CI to run the new suites (unit/integration/isolation/e2e) per `docs/04-engineering/ci-cd.md`.

---

## Dependencies & Execution Order

- **Setup (P1)** → **Foundational (P2)** block everything.
- **US1 (full export)** is the P1 MVP; implement first.
- **US2 (scoped export)** depends on US1 streaming + the feature-002 query builder.
- **US3 (import)** is optional (FR-6.4 *Could*); it depends on the entry service and the JSON shape. It can be descoped without affecting SC-001 (the portability guarantee).
- **Polish (P6)** comes after the targeted stories.

### Within each story

- Tests for critical paths are written first and must fail before implementation.
- Serializers/service → routes → frontend wiring.
- Commit after each task or logical group (Constitution: small logical commits).

## MVP definition

Setup + Foundational + **US1 (full export)** = the shippable increment for Stage 3:
the user can export their entire corpus to Markdown and JSON. US2 (scoped) and US3
(import) are refinements that do not break full export.
