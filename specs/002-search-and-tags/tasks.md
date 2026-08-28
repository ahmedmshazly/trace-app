---
description: "Task list for Search & Tags (002)"
---

# Tasks: Search & Tags

**Input**: Design documents from `/specs/002-search-and-tags/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml; feature 001 implemented.

**Tests**: Tests ARE included. Trace's Constitution (IV. Test-First & Quality
Gates) mandates automated tests for critical paths (here: the tag parser,
search/filter query builders, tag-index counts, and isolation). Those tests are
written before their implementation.

**Organization**: Tasks are grouped by user story so each story can be
implemented, tested, and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (search), US2 (inline tags + tag filter), US3 (combined filters), US4 (tag index)
- File paths follow the `backend/` + `frontend/` structure in plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Add an idempotent index/migration step for the `Entry` text index on `body` and the `{ userId, tags }` compound index in `backend/src/lib/db.ts` (or a `backend/src/migrations/` runner), verified at startup.
- [ ] T002 [P] Add a one-time `tags` backfill migration (re-parse `body` for pre-existing entries) in `backend/src/migrations/002-backfill-tags.ts`.
- [ ] T003 [P] Add a corpus seed/benchmark helper (≥ 50k entries for one user) in `backend/tests/helpers/seed.ts` to support the NFR-1.3 latency check.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Implement the pure `#tag` parser/normalizer in `backend/src/lib/tags.ts` per data-model.md (Unicode `[\p{L}\p{N}_]`, lowercased, de-duped, punctuation/in-word rules).
- [ ] T005 [P] Unit tests for `tags.ts` covering all rule rows in data-model.md (case, dupes, punctuation, in-word `#`, Unicode, bare `#`) in `backend/tests/unit/tags.test.ts` (write first, must fail).
- [ ] T006 Extend the `Entry` model with `tags: string[]` (default `[]`, indexed) in `backend/src/models/entry.ts`.
- [ ] T007 Wire tag parsing into `entry.service.ts` create() and update() so `tags` is derived from `body` server-side (never from client input) in `backend/src/services/entry.service.ts`.
- [ ] T008 Add zod query-schema for `GET /entries` params (`q`, `tag`, `before`, `after`, `limit`, `cursor`) and `GET /tags` params (`sort`, `filter`) in `backend/src/routes/` validators.

**Checkpoint**: Foundation ready, tags are parsed/stored; query validation exists.

---

## Phase 3: User Story 1 - Find a moment by full-text search (Priority: P1) 🎯 MVP

**Goal**: `⌘K` full-text search over the user's bodies, relevance-ranked, keyboard-driven.

**Independent Test**: Seed entries, `⌘K`, type a term → only matching own entries, emphasized, ranked; `↑/↓`+`Enter` navigates; `Esc` closes.

### Tests for User Story 1 (write first, must fail)

- [ ] T009 [P] [US1] Integration test: `GET /entries?q=` returns only the user's matching, non-deleted entries, relevance-ranked (FR-010) in `backend/tests/integration/search.test.ts`.
- [ ] T010 [P] [US1] Integration test: search latency < 300 ms against a 50k-entry seeded corpus (SC-001/NFR-1.3) in `backend/tests/integration/search-perf.test.ts`.
- [ ] T011 [P] [US1] Isolation test: user B's search never returns user A's entries (FR-040, SC-006) in `backend/tests/isolation/search-isolation.test.ts`.
- [ ] T012 [P] [US1] E2E test: `⌘K` opens focused overlay; type → emphasized results; `↑/↓`+`Enter` opens entry; `Esc` closes in `frontend/tests/e2e/search.spec.ts`.

### Implementation for User Story 1

- [ ] T013 [US1] Implement `entry.service.ts` search() using the `$text` index + `textScore` ranking, scoped by `userId`/`deleted:false`, with score-cursor pagination (R-006) in `backend/src/services/entry.service.ts`.
- [ ] T014 [US1] Extend `GET /entries` to accept and apply `q` per contracts in `backend/src/routes/entry.routes.ts`.
- [ ] T015 [P] [US1] Frontend `⌘K` hotkey binding + recent-searches store in `frontend/src/lib/hotkeys.ts` and `frontend/src/lib/recentSearches.ts`.
- [ ] T016 [P] [US1] Frontend `CommandPalette` overlay (focused input, dimmed backdrop, debounced query, keyboard nav, empty-query recents/jump-to-tag) in `frontend/src/components/CommandPalette.tsx`.
- [ ] T017 [P] [US1] Frontend `SearchResultRow` (reuses `TimelineEntry` treatment; inline match emphasis) + search query hook in `frontend/src/components/SearchResultRow.tsx` and `frontend/src/api/search.ts`.

**Checkpoint**: 🎯 Stage-2 MVP, a user can find any moment instantly via `⌘K`.

---

## Phase 4: User Story 2 - Tag moments inline and filter by tag (Priority: P2)

**Goal**: `#tags` parsed from the body, rendered as pills, filter timeline to one tag.

**Independent Test**: Capture with `#work #health` → tags parsed/rendered; select `#work` → timeline shows only `#work`.

### Tests for User Story 2 (write first, must fail)

- [ ] T018 [P] [US2] Integration test: create/edit parses + normalizes tags; body preserved verbatim (FR-001/002) in `backend/tests/integration/tags-parse.test.ts`.
- [ ] T019 [P] [US2] Integration test: `GET /entries?tag=work` returns only `#work`, non-deleted, own entries, newest-first (FR-020) in `backend/tests/integration/tag-filter.test.ts`.
- [ ] T020 [P] [US2] E2E test: capture with tags → pills shown; select a tag → filtered timeline in `frontend/tests/e2e/tags.spec.ts`.

### Implementation for User Story 2

- [ ] T021 [US2] Apply the `tag` filter in `entry.service.ts` list() using the `{ userId, tags }` index in `backend/src/services/entry.service.ts`.
- [ ] T022 [US2] Extend `GET /entries` to accept and apply `tag` per contracts in `backend/src/routes/entry.routes.ts`.
- [ ] T023 [P] [US2] Frontend `TagPill` component (the `#` glyph + pill; tokens) in `frontend/src/components/TagPill.tsx`.
- [ ] T024 [US2] Render tag pills on `TimelineEntry`/`SearchResultRow`; selecting a pill applies the tag filter in `frontend/src/components/TimelineEntry.tsx`.

**Checkpoint**: Tags parsed, shown, and filterable.

---

## Phase 5: User Story 3 - Combine text, tag, and date filters (Priority: P2)

**Goal**: Combinable text + tag + date-range filters with removable chips and Clear all.

**Independent Test**: Apply text+tag+date → conjunction only; remove a chip → widens; Clear all → empty state.

### Tests for User Story 3 (write first, must fail)

- [ ] T025 [P] [US3] Integration test: `before`/`after` date range over `occurredAt` (inclusive, open-ended allowed) (FR-021) in `backend/tests/integration/date-filter.test.ts`.
- [ ] T026 [P] [US3] Integration test: combined `q`+`tag`+date returns exactly the conjunction (FR-022, SC-004) in `backend/tests/integration/combined-filter.test.ts`.
- [ ] T027 [P] [US3] E2E test: chips add/remove; Clear all resets (FR-023) in `frontend/tests/e2e/filters.spec.ts`.

### Implementation for User Story 3

- [ ] T028 [US3] Compose the conjunctive query (`q` + `tag` + `before`/`after`) in `entry.service.ts`, choosing relevance vs chronological order per R-006, in `backend/src/services/entry.service.ts`.
- [ ] T029 [US3] Extend `GET /entries` to accept and apply `before`/`after` per contracts in `backend/src/routes/entry.routes.ts`.
- [ ] T030 [P] [US3] Frontend `FilterChip` + active-filter bar + Clear all in `frontend/src/components/FilterChip.tsx` and the `CommandPalette`.

**Checkpoint**: Precise, combinable retrieval.

---

## Phase 6: User Story 4 - Browse the tag index (Priority: P3)

**Goal**: Tag index panel with per-tag counts, sort (count/A–Z), name filter, drill-down.

**Independent Test**: Open index → tags + counts (bar + number); toggle sort; filter list; select a tag → filtered view.

### Tests for User Story 4 (write first, must fail)

- [ ] T031 [P] [US4] Integration test: `GET /tags` returns exact per-user counts, excludes deleted, supports `sort` + `filter` (FR-030, SC-005) in `backend/tests/integration/tag-index.test.ts`.
- [ ] T032 [P] [US4] Isolation test: `GET /tags` never includes another user's tags/counts (FR-040) in `backend/tests/isolation/tag-index-isolation.test.ts`.
- [ ] T033 [P] [US4] E2E test: tag index opens, sorts, filters, drills down to filtered timeline in `frontend/tests/e2e/tag-index.spec.ts`.

### Implementation for User Story 4

- [ ] T034 [US4] Implement `entry.service.ts` tagIndex() aggregation (match userId/!deleted → unwind tags → group count → sort) in `backend/src/services/entry.service.ts`.
- [ ] T035 [US4] Implement `GET /tags` route with `sort`/`filter` in `backend/src/routes/tag.routes.ts`.
- [ ] T036 [P] [US4] Frontend `TagIndexPanel` (slide-in, frequency bar + numeric count, sort toggle, name filter, drill-down) + hook in `frontend/src/components/TagIndexPanel.tsx` and `frontend/src/api/tags.ts`.

**Checkpoint**: The corpus is browsable by tag.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T037 [P] Add search query logging (correlation id + timing; never entry content) in `backend/src/routes/entry.routes.ts` (Constitution VI).
- [ ] T038 [P] Accessibility pass on the `⌘K` palette and tag index (focus trap-in/restore, `↑/↓`/`Enter`/`Esc`, ARIA, "never color alone") in `frontend/src/components/` (NFR-7.4).
- [ ] T039 [P] Mobile: full-screen palette + app-bar search button; tag index as full-screen/sheet (≥ 44px targets) in `frontend/src/components/`.
- [ ] T040 [P] Update `docs/` (functional-requirements verification, traceability matrix 002 rows, api-design search/tags note) and verify against `contracts/openapi.yaml`.
- [ ] T041 Run `quickstart.md` end-to-end as the manual acceptance script; confirm Definition of Done.
- [ ] T042 Extend CI to run the new suites (unit/integration/isolation/e2e) per `docs/04-engineering/ci-cd.md`.

---

## Dependencies & Execution Order

- **Setup (P1)** → **Foundational (P2)** block everything.
- **US1 (search)** is the P1 MVP of this feature; implement first.
- **US2 (tags)** is a prerequisite for **US4 (tag index)**. **US3 (combined)** builds on US1+US2 filters.
- Order: US1 → US2 → US3 → US4. US3 and the US4 frontend can proceed in parallel with different developers once their backend filters exist.
- **Polish (P7)** comes after the targeted stories.

### Within each story

- Tests for critical paths are written first and must fail before implementation.
- Parser/model → service → routes → frontend wiring.
- Commit after each task or logical group (Constitution: small logical commits).

## MVP definition

Setup + Foundational + **US1 (search)** = the shippable increment for Stage 2:
instant `⌘K` full-text retrieval over the corpus. US2-US4 are incremental
refinements (tags, combined filters, tag index) that do not break search.
