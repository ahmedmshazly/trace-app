---
description: "Task list for Hardening, Settings & Deploy / V1 GA (004)"
---

# Tasks: Hardening, Settings & Deploy (V1 GA)

**Input**: Design documents from `/specs/004-hardening-and-deploy/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml; features 001-003 implemented.

**Tests**: Tests ARE included and are the point of this feature. Trace's
Constitution (IV. Test-First & Quality Gates) mandates automated tests for the
critical paths (reset, deletion, isolation) and makes accessibility, security, and
performance **release-blocking CI gates**. Those tests are written before/with
their implementation.

**Organization**: Tasks are grouped by user story so each story can be
implemented, tested, and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (reset), US2 (settings + theme), US3 (deletion + trash), US4 (operability/security/GA gates)
- File paths follow the `backend/` + `frontend/` structure in plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Add `mailer` config (transport selection + env vars; dev logs the link) to the config module and `backend/.env.example` in `backend/src/config/index.ts`.
- [ ] T002 [P] Add account/auth route modules scaffold (`backend/src/routes/account.routes.ts`) and register on the Express app.
- [ ] T003 [P] Add the frontend `ThemeProvider` scaffold + pre-paint theme bootstrap (no-FOUC inline script) in `frontend/src/lib/theme.tsx` and `frontend/index.html`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Implement the `PasswordResetToken` model with TTL + `tokenHash` index in `backend/src/models/password-reset-token.ts`.
- [ ] T005 Add `sessionEpoch` (or `tokenVersion`) to the `User` model and embed/verify it in the JWT middleware so sessions can be revoked (R-003) in `backend/src/models/user.ts` and `backend/src/middleware/auth.ts`.
- [ ] T006 [P] Implement the `mailer` abstraction (`backend/src/lib/mailer.ts`) with a dev "log link" transport and a config-selected provider.
- [ ] T007 Finalize the rate-limit middleware with tuned limits for auth/reset/sensitive routes in `backend/src/middleware/rate-limit.ts`.

**Checkpoint**: Foundation ready, token model, session revocation, mailer, limits.

---

## Phase 3: User Story 1 - Recover access to my account (Priority: P1) 🎯 GA-critical

**Goal**: Non-enumerating, single-use, expiring password reset that invalidates prior sessions.

**Independent Test**: Identical responses for known/unknown emails; valid token resets password; old password + old sessions fail; expired/used tokens rejected.

### Tests for User Story 1 (write first, must fail)

- [ ] T008 [P] [US1] Integration test: reset request returns identical response for registered vs unregistered email (no enumeration, FR-002) in `backend/tests/integration/reset-enumeration.test.ts`.
- [ ] T009 [P] [US1] Integration test: valid token resets password; old password fails; prior sessions invalidated (FR-001/003) in `backend/tests/integration/reset-complete.test.ts`.
- [ ] T010 [P] [US1] Integration test: expired/used/invalid token rejected; reset endpoints rate-limited (FR-004) in `backend/tests/integration/reset-token-rules.test.ts`.
- [ ] T011 [P] [US1] E2E test: request reset → use logged link → set new password → sign in in `frontend/tests/e2e/reset.spec.ts`.

### Implementation for User Story 1

- [ ] T012 [US1] Implement `auth.service` requestReset() (create hashed token, expiry, send via mailer; identical outward behavior) and completeReset() (verify, update password, mark used, bump sessionEpoch) in `backend/src/services/auth.service.ts`.
- [ ] T013 [US1] Implement `POST /auth/reset/request` and `POST /auth/reset/complete` with zod validation + rate limiting in `backend/src/routes/auth.routes.ts`.
- [ ] T014 [P] [US1] Frontend `ResetRequest` + `ResetComplete` pages (non-enumerating confirmation matching the wireframe) in `frontend/src/pages/ResetRequest.tsx` and `frontend/src/pages/ResetComplete.tsx`.

**Checkpoint**: Secure self-service recovery works.

---

## Phase 4: User Story 2 - Account settings & appearance (Priority: P2)

**Goal**: View account; change password/email; Light/Dark theme that applies immediately, persists, no FOUC.

**Independent Test**: Toggle theme persists across reload; password/email change authenticate correctly.

### Tests for User Story 2 (write first, must fail)

- [ ] T015 [P] [US2] Integration test: change password (current+new), new works, old fails (FR-010) in `backend/tests/integration/change-password.test.ts`.
- [ ] T016 [P] [US2] Integration test: change email to unused/valid succeeds; duplicate/invalid rejected non-enumerating (FR-010) in `backend/tests/integration/change-email.test.ts`.
- [ ] T017 [P] [US2] E2E test: theme toggle applies immediately + persists across reload, no FOUC; OS default honored on first run (FR-011, SC-003) in `frontend/tests/e2e/theme.spec.ts`.

### Implementation for User Story 2

- [ ] T018 [US2] Implement `auth.service` changePassword() + changeEmail() (scoped, validated) in `backend/src/services/auth.service.ts`.
- [ ] T019 [US2] Implement `PATCH /auth/password` and `PATCH /auth/email` in `backend/src/routes/auth.routes.ts`.
- [ ] T020 [US2] Implement `ThemeProvider` applying the ADR-0006 CSS custom-property themes + persistence + pre-paint resolution in `frontend/src/lib/theme.tsx`.
- [ ] T021 [P] [US2] Frontend `Settings` page composing `AppearanceToggle`, `AccountPanel`, and the `ExportPanel` (feature 003) in `frontend/src/pages/Settings.tsx`.

**Checkpoint**: Settings + first-class theming.

---

## Phase 5: User Story 3 - Delete my data and my account (Priority: P2)

**Goal**: Fenced, typed-gated deletion of all entries / the account; Trash browse + restore.

**Independent Test**: Typed confirm required; delete-all empties only this user's corpus; delete-account removes account+corpus and ends session; Trash lists/restores soft-deleted.

### Tests for User Story 3 (write first, must fail)

- [ ] T022 [P] [US3] Integration test: delete-all-entries removes only the user's entries (incl. soft-deleted); isolation preserved (FR-020/030) in `backend/tests/integration/delete-all-entries.test.ts`.
- [ ] T023 [P] [US3] Integration test: delete-account removes user + entries + reset tokens, invalidates sessions (FR-022) in `backend/tests/integration/delete-account.test.ts`.
- [ ] T024 [P] [US3] Integration test: Trash lists soft-deleted; restore re-appears on timeline (FR-023) in `backend/tests/integration/trash-restore.test.ts`.
- [ ] T025 [P] [US3] Isolation test: deletion never affects another user's data (FR-030) in `backend/tests/isolation/delete-isolation.test.ts`.
- [ ] T026 [P] [US3] E2E test: danger zone requires typed confirmation before enabling; deletion signs the user out in `frontend/tests/e2e/danger-zone.spec.ts`.

### Implementation for User Story 3

- [ ] T027 [US3] Implement `account.service` deleteAllEntries() + deleteAccount() (scoped, atomic, session invalidation) in `backend/src/services/account.service.ts`.
- [ ] T028 [US3] Implement `DELETE /entries/all`, `DELETE /account`, and `GET /entries/trash` with confirmation header + ownership checks in `backend/src/routes/account.routes.ts`.
- [ ] T029 [P] [US3] Frontend `DangerZone` + `ConfirmByTyping` + `Trash` page (browse/restore) in `frontend/src/components/DangerZone.tsx`, `frontend/src/components/ConfirmByTyping.tsx`, and `frontend/src/pages/Trash.tsx`.

**Checkpoint**: The right to leave, safely gated.

---

## Phase 6: User Story 4 - Operate Trace safely in production (Priority: P1) 🎯 GA-gate

**Goal**: Config-only HTTPS deploy, health + content-free structured logs, rate limits, web-vuln defense, CI gates, a11y + perf validation, rehearsed backup/restore.

**Independent Test**: Deploy from config to a clean env; probes/logs/metrics work; full security/isolation/a11y/perf suites green; backup → restore recovers the corpus.

### Tests & gates for User Story 4 (write/verify as gates)

- [ ] T030 [P] [US4] Security suite: enumeration checks, helmet headers present, CORS from allowed origins, zod validation on boundaries, rate-limit behavior (FR-042, NFR-4.4/4.5) in `backend/tests/security/`.
- [ ] T031 [P] [US4] Health + logging test: `/api/health` readiness; logs carry correlation id and contain no entry content/secrets (FR-041, NFR-3.5) in `backend/tests/integration/health-logging.test.ts`.
- [ ] T032 [P] [US4] Accessibility gate: axe + keyboard/focus across screens, verified against the color-system contrast table (NFR-7.4) in `frontend/tests/a11y/`.
- [ ] T033 [P] [US4] Performance gate: capture < 100 ms, cold < 2 s, search < 300 ms, smooth at 50k entries (NFR-1.*) in `frontend/tests/perf/` and `backend/tests/integration/`.

### Implementation for User Story 4

- [ ] T034 [US4] Finalize structured logging (correlation id middleware; redact/never log entry content or secrets) per `docs/05-operations/observability.md` in `backend/src/lib/logger.ts` and `backend/src/middleware/`.
- [ ] T035 [US4] Verify config-only deployment (no hard-coded host values/secrets; fail-fast on bad config) and document the production build serve per `docs/05-operations/deployment.md`.
- [ ] T036 [US4] Implement the CI pipeline (lint, type-check, unit, integration, isolation, e2e, a11y, perf; red blocks merge) per `docs/04-engineering/ci-cd.md`.
- [ ] T037 [US4] Rehearse and document backup/restore per `docs/05-operations/backup-recovery.md` (recovers User + Entry + PasswordResetToken intact) (FR-044, SC-007).

**Checkpoint**: 🎯 V1 GA gates satisfied.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T038 [P] Apply the two-theme color tokens across all existing screens (001-003) so dark/light render correctly everywhere (ADR-0006).
- [ ] T039 [P] Reduced-motion + secure-headers + cookie posture review in `frontend/` and `backend/`.
- [ ] T040 [P] Update `docs/` (functional-requirements verification for FR-7.5/7.6/7.7, traceability matrix 004 rows, security, runbook, deployment, ci-cd) to match shipped behavior.
- [ ] T041 Run `quickstart.md` end-to-end as the manual acceptance + GA-readiness script; confirm the Definition of Done.
- [ ] T042 Tag the V1 GA release once all gates are green and docs are in sync.

---

## Dependencies & Execution Order

- **Setup (P1)** → **Foundational (P2)** block everything.
- **US1 (reset)** and **US4 (operability/security gates)** are P1/GA-critical; **US2 (settings/theme)** and **US3 (deletion/trash)** are P2.
- US1 depends on the token model + mailer + session revocation (P2 foundational). US3 depends on session revocation. US4's gates depend on the whole app being present (run last as the GA gate), though security/logging hardening can proceed in parallel.
- Suggested order: US1 → US2 → US3 → US4, with US4's hardening tasks interleaved as components land.
- **Polish (P7)** comes after the targeted stories; T038 (apply themes everywhere) and T042 (GA tag) are the closing steps.

### Within each story

- Tests for critical paths are written first and must fail before implementation.
- Models → services → routes → frontend wiring; gates verified in CI.
- Commit after each task or logical group (Constitution: small logical commits).

## MVP definition

For GA, the release-blocking set is **US1 (recovery) + US4 (operability/security/
quality gates)**; US2 (settings/theme) and US3 (deletion/trash) complete the
credible, trustworthy V1. When all four stories' Definitions of Done are met and
CI gates are green, Trace is **V1 GA**.
