# Implementation Plan: Hardening, Settings & Deploy (V1 GA)

**Branch**: `004-hardening-and-deploy` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-hardening-and-deploy/spec.md`

## Summary

Turn the built feature set into a production-ready V1 GA. This feature ships:
self-service **password reset** (time-limited single-use token, non-enumerating,
session-invalidating); **account settings** (change email/password) and the
**Light/Dark theme** toggle that applies the ADR-0006 token system app-wide; a
fenced **danger zone** for deleting all entries / the whole account with a typed
confirmation, plus a **Trash** browse/restore surface; and the cross-cutting
**production-readiness pass** — rate limiting, security/web-vuln defense,
accessibility (WCAG AA), performance validation, CI/CD gates, configuration-driven
deployment, health/observability wiring, and a rehearsed backup/restore.

The technical approach extends the existing Express/Mongo backend and React/Vite
client and operationalizes the documents under `docs/05-operations/` and
`docs/04-engineering/`. Backend: a `PasswordResetToken` model + `auth.service`
reset/change flows; account/data deletion in `account.service`; rate limiting and
security headers finalized across sensitive endpoints; health + structured logging
verified. Frontend: the full Settings screen (Appearance, Account, Export from
003, Danger zone), the reset screens, the theme provider applying CSS custom-
property themes, and the Trash surface. CI runs the full gate set.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS (server and client)

**Primary Dependencies**: Express 4, Mongoose 8, jsonwebtoken, bcrypt, zod,
helmet, cors, express-rate-limit · a configurable email transport (e.g. nodemailer
with an env-selected provider; dev logs the link) · React 18 + Vite 5, React
Router, TanStack Query · the CSS custom-property theme system (ADR-0006).

**Storage**: MongoDB 7 — adds a `PasswordResetToken` collection (TTL index on
expiry); account/data deletion removes `User` + `Entry` documents for the user.

**Testing**: Vitest (unit) · Supertest + Vitest with `mongodb-memory-server`
(integration — reset, settings, deletion, rate limits, isolation) · Playwright
(E2E — reset flow, theme toggle, danger-zone typed confirmation) · accessibility
checks (axe) and performance benchmarks against the NFR targets.

**Target Platform**: Linux server (API) + any modern browser (client)

**Project Type**: Web application (extends existing `backend/` and `frontend/`)

**Performance Goals**: Maintain capture < 100 ms, cold load < 2 s, search < 300 ms,
smooth at 50k entries/user (NFR-1.*) — validated as a GA gate. Theme applies before
first paint (no FOUC).

**Constraints**: No account enumeration; reset tokens single-use + expiring;
sessions invalidated on reset/account-deletion; destructive actions typed-gated;
config-only deploy with no secrets in source; HTTPS in production; no content
telemetry; logs never contain entry content or secrets.

**Scale/Scope**: Completes the Settings screen, the auth recovery flow, and the
operational/security/quality gates for GA across the whole app.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Capture Friction Is Sacred | Settings/recovery live off the capture path; theme reduces eye strain for long sessions | PASS |
| II. Corpus Is the Product | Account/data deletion delivers the right to leave; export (003) already delivers portability | PASS |
| III. Spec-Driven Development | This plan derives from spec.md; tasks derive from this plan | PASS |
| IV. Test-First & Quality Gates | Reset, deletion, isolation, a11y, and perf gates have tests; CI blocks on red (SC-006) — this feature *is* the gate | PASS |
| V. Security & Privacy by Default | Non-enumerating reset, single-use tokens, rate limiting, web-vuln defense, session invalidation, secrets via config | PASS |
| VI. Observability & Operability | Health endpoint, structured content-free logs, config-only deploy, rehearsed backup/restore, runbooks | PASS |
| VII. Simplicity & YAGNI | Reuses existing services/middleware; email transport is config-selected; no new infra beyond a token collection | PASS |

No violations. Complexity Tracking section below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-hardening-and-deploy/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — decisions & rationale
├── data-model.md        # Phase 1 — PasswordResetToken + deletion semantics
├── quickstart.md        # Phase 1 — local run & verification
├── contracts/
│   └── openapi.yaml     # Phase 1 — reset, account, deletion API
└── tasks.md             # Phase 2: task breakdown
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── password-reset-token.ts  # token + TTL index
│   ├── services/
│   │   ├── auth.service.ts          # + requestReset/completeReset/changePassword/changeEmail
│   │   └── account.service.ts       # deleteAllEntries / deleteAccount (atomic, scoped)
│   ├── lib/
│   │   └── mailer.ts                # config-selected email transport (dev: log link)
│   ├── middleware/
│   │   └── rate-limit.ts            # finalized limits on auth/reset/sensitive routes
│   └── routes/
│       ├── auth.routes.ts           # + /auth/reset/request, /auth/reset/complete, /auth/password, /auth/email
│       └── account.routes.ts        # DELETE /account, DELETE /entries (all), GET /entries (trash)
└── tests/
    ├── integration/                 # reset, settings, deletion, rate limits
    ├── isolation/                   # deletion/settings never cross users
    └── security/                    # web-vuln + headers + enumeration checks

frontend/
├── src/
│   ├── lib/
│   │   └── theme.tsx                # ThemeProvider; CSS custom-property switch; no-FOUC
│   ├── pages/
│   │   ├── ResetRequest.tsx / ResetComplete.tsx
│   │   ├── Settings.tsx             # Appearance + Account + Export(003) + Danger zone
│   │   └── Trash.tsx                # browse + restore soft-deleted
│   └── components/
│       ├── AppearanceToggle.tsx · AccountPanel.tsx · DangerZone.tsx · ConfirmByTyping.tsx
└── tests/
    └── e2e/                         # reset flow, theme toggle, typed-confirm deletion

docs/                                # implement/verify 04-engineering + 05-operations
.github/ or CI config                # pipeline running the full gate set
```

**Structure Decision**: Extends the existing web-application layout. Recovery and
settings reuse the auth service and middleware from 001 (single place for
isolation, hashing, tokens). The theme provider implements ADR-0006 (swap a CSS
custom-property set; no component recoloring). Deletion is centralized in
`account.service` so it is atomic and scoped. This feature also *implements and
verifies* the operations docs rather than introducing parallel procedures.

## Complexity Tracking

> No Constitution violations. No justified complexity required for this feature.
