# Feature Specification: Hardening, Settings & Deploy (V1 GA)

**Feature Branch**: `004-hardening-and-deploy`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Hardening & deploy for V1 GA: credential recovery,
account settings (incl. light/dark theme), account & data deletion with a fenced
danger zone, plus the production-readiness pass, rate limiting, security review,
accessibility, performance validation, CI/CD, deployment, observability,
backups, and runbooks."

> This is Stage 4 of Trace (see `docs/03-project/roadmap.md`), the slice that
> turns the built feature set into a **production-ready, operable, secure V1
> General Availability** release. It completes the **Settings** screen (theme,
> account, danger zone) and the **password reset** flow from the
> [V1 wireframes](../../docs/06-design/ui-ux-spec.md) and
> [auth sub-flow](../../docs/diagrams/trace-diagrams.md), applies the
> [two-theme color system](../../docs/06-design/color-system.md) (ADR-0006), and
> wires the operational concerns documented under
> [`docs/05-operations/`](../../docs/05-operations/) and
> [`docs/04-engineering/ci-cd.md`](../../docs/04-engineering/ci-cd.md).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recover access to my account (Priority: P1) GA-critical

A user who has forgotten their password requests a reset from the login screen,
receives a reset link by email, sets a new password, and signs in, and the flow
never reveals whether an email is registered.

**Why this priority**: A multi-user hosted product is not shippable to real users
without self-service account recovery; locked-out users are lost users. It is
P1/GA-critical and must be done securely (no account enumeration, sessions
invalidated on reset).

**Independent Test**: Request a reset for a registered and an unregistered email
and confirm identical responses; complete a reset with a valid token, confirm the
new password works, the old password fails, and prior sessions are invalidated.

**Acceptance Scenarios**:

1. **Given** the login screen, **When** the user requests a password reset for any email, **Then** the confirmation is identical whether or not the email is registered (no enumeration, NFR-4.4).
2. **Given** a registered email, **When** a reset is requested, **Then** a time-limited, single-use reset link is sent to that address (and only that address).
3. **Given** a valid, unexpired reset token, **When** the user sets a new valid password, **Then** the password is updated, the user can sign in with it, and all prior sessions are invalidated.
4. **Given** an expired, used, or invalid reset token, **When** the user attempts to reset, **Then** the attempt is rejected with a clear, non-enumerating message.
5. **Given** the reset request endpoint, **When** it is called repeatedly, **Then** it is rate-limited (NFR-4.5).

---

### User Story 2 - Manage account settings & appearance (Priority: P2)

A user opens Settings to view their account, change their email and/or password,
and switch between light and dark themes, with dark as the first-class default.

**Why this priority**: Settings are expected of any account-based product and make
the app livable (theme is a comfort feature for an app kept open for hours). It is
P2 because the core product is fully usable without it, but it is part of a
credible GA.

**Independent Test**: Toggle the theme and confirm it applies immediately and
persists across reload; change the password and confirm the new one authenticates;
change the email and confirm login uses the new address (with appropriate
validation).

**Acceptance Scenarios**:

1. **Given** the Settings screen, **When** it loads, **Then** it shows the account email and an Appearance toggle reflecting the current theme.
2. **Given** the Appearance toggle, **When** the user switches Light/Dark, **Then** the theme applies immediately across the app and persists across reloads and sessions (ADR-0006).
3. **Given** first run with no saved preference, **When** the app loads, **Then** it honors the OS color-scheme preference, defaulting to dark as first-class.
4. **Given** the account panel, **When** the user changes their password (current + new), **Then** the new password authenticates and the old one no longer does.
5. **Given** the account panel, **When** the user changes their email to an unused, valid address, **Then** future logins use the new email; a duplicate/invalid address is rejected clearly.

---

### User Story 3 - Delete my data and my account (Priority: P2)

A user permanently deletes all their entries, or deletes their entire account and
corpus, from a clearly fenced danger zone that requires a typed confirmation
because these actions are irreversible.

**Why this priority**: Data ownership includes the right to leave (Constitution
II). Destructive actions must exist but be hard to trigger by accident. It is P2
because it is not part of the daily loop, but it is required for a trustworthy GA
and for privacy/compliance expectations.

**Independent Test**: Trigger "delete all entries" behind the typed confirmation
and confirm the corpus is emptied for that user only; trigger "delete account" and
confirm the account and its corpus are removed and the session ends.

**Acceptance Scenarios**:

1. **Given** the Settings danger zone, **When** the user chooses a destructive action, **Then** it is visually fenced and requires a typed second confirmation before it proceeds.
2. **Given** the typed confirmation, **When** the user confirms "delete all entries", **Then** all of that user's entries are removed and no other user's data is affected.
3. **Given** the typed confirmation, **When** the user confirms "delete account", **Then** the account and its entire corpus are removed, the session is invalidated, and the user is signed out.
4. **Given** soft-deleted ("Trash") entries, **When** the user opens the Trash surface, **Then** they can browse and restore previously hidden entries (the V1 recovery path), and account deletion removes Trash too.
5. **Given** a destructive action, **When** it runs, **Then** it affects only the authenticated user's data (isolation preserved).

---

### User Story 4 - Operate Trace safely in production (Priority: P1) GA-gate

As the operator/maintainer, I can deploy Trace from configuration alone, observe
its health, defend it against abuse, recover it from backup, and trust that it
meets its security, accessibility, and performance bars, so V1 can go GA.

**Why this priority**: A hosted multi-user product lives or dies by operability
and security (Constitution V, VI). These are the release-blocking gates for GA;
without them the product is built but not shippable.

**Independent Test**: Deploy to a clean environment using only configuration;
confirm the health endpoint, structured logs, and metrics; run the full security/
isolation/a11y/perf suites green; perform a backup and a restore.

**Acceptance Scenarios**:

1. **Given** a clean environment, **When** Trace is deployed using only environment configuration (no source edits, no hard-coded host values), **Then** it starts, connects, and serves over HTTPS/TLS (NFR-3.2, NFR-4.1).
2. **Given** a running instance, **When** the platform probes `/api/health`, **Then** it reports readiness/liveness; **When** requests are served, **Then** structured logs carry a correlation id and never contain entry content or secrets (NFR-3.5, Constitution VI).
3. **Given** auth and other sensitive endpoints, **When** they receive excessive requests, **Then** they are rate-limited (NFR-4.5); common web vulnerabilities (injection, XSS, CSRF as applicable) are defended and inputs validated (NFR-4.4).
4. **Given** the CI pipeline, **When** a PR is opened, **Then** lint, type-check, unit, integration, isolation, and e2e suites run and a red pipeline blocks merge (Constitution IV).
5. **Given** the accessibility and performance bars, **When** they are evaluated, **Then** WCAG AA contrast/keyboard/focus pass (NFR-7.4, verified against the color-system contrast table) and the performance targets hold (capture < 100 ms, cold load < 2 s, search < 300 ms, smooth at 50k entries, NFR-1.*).
6. **Given** a backup, **When** a restore is performed per the runbook, **Then** the corpus is recovered intact (NFR-2.1) and the procedure is documented and repeatable.

---

### Edge Cases

- **Reset token reuse / race**: a token is single-use and expires; a second use or a concurrent reset is rejected cleanly.
- **Email change to an in-use address**: rejected with a clear, non-enumerating message.
- **Password change with wrong current password**: rejected; sessions unaffected.
- **Theme flash on load (FOUC)**: the chosen theme is applied before first paint to avoid a flash of the wrong theme.
- **Reduced motion**: motion respects the OS reduced-motion preference.
- **Delete during active session on another device**: account deletion invalidates all sessions; the other device is logged out on its next request.
- **Partial failure mid-delete**: deletion is atomic or clearly reported; the corpus is never left half-deleted in an ambiguous state.
- **Rate-limit false positives**: limits are tuned so normal use is never blocked; limit responses are clear (429) and non-enumerating.
- **Config missing/invalid at boot**: the service fails fast with a clear error rather than starting misconfigured (research R-10 from 001).
- **Secrets**: never logged, never in source; rotated via configuration.

## Requirements *(mandatory)*

> Local IDs (FR-001...) scope this feature; the parenthetical maps to the canonical
> register in `docs/01-requirements/functional-requirements.md`. Operational
> requirements map to the NFR register.

### Functional Requirements

**Credential recovery**

- **FR-001** (FR-7.5): System MUST let a user request a password reset by email and complete it via a time-limited, single-use link.
- **FR-002**: The reset request response MUST be identical whether or not the email is registered (no account enumeration).
- **FR-003**: Completing a reset MUST invalidate the user's prior sessions.
- **FR-004**: Reset request and reset-completion endpoints MUST be rate-limited.

**Account settings**

- **FR-010** (FR-7.7): Users MUST be able to view their account email and change their password (current + new) and email (unused, valid).
- **FR-011**: System MUST provide a Light/Dark appearance toggle that applies immediately and persists per user (ADR-0006); first run honors the OS preference with dark as default.

**Account & data deletion**

- **FR-020** (FR-7.6): Users MUST be able to delete all their entries, and to delete their entire account and corpus.
- **FR-021**: Destructive actions MUST be visually fenced and gated behind a typed second confirmation.
- **FR-022**: Account deletion MUST remove the account, its entire corpus (including Trash), and invalidate all sessions.
- **FR-023**: Users MUST be able to browse and restore soft-deleted ("Trash") entries (the V1 recovery surface for soft-delete from feature 001).

**Isolation**

- **FR-030**: Every settings, recovery, and deletion operation MUST be scoped to the authenticated user; cross-user effect MUST be impossible.

**Production readiness (operationalizing the NFRs)**

- **FR-040** (NFR-3.2): Deployment MUST be reproducible from configuration alone, with no hard-coded host-specific values or secrets in source.
- **FR-041** (NFR-3.5, VI): A health/readiness endpoint MUST exist and structured logs MUST carry correlation ids and never contain entry content or secrets.
- **FR-042** (NFR-4.4/4.5): Sensitive endpoints MUST be rate-limited; inputs validated; common web vulnerabilities defended.
- **FR-043** (Constitution IV): CI MUST run lint, type-check, unit, integration, isolation, and e2e suites, and block merge on failure.
- **FR-044** (NFR-2.1): A documented, repeatable backup-and-restore procedure MUST recover the corpus intact.

### Key Entities *(include if feature involves data)*

- **User** (extended): gains the ability to change `email`/`passwordHash`; account deletion removes the user.
- **PasswordResetToken (new)**: a short-lived, single-use token associated with a user, with an expiry and a used/active state; never reveals account existence by its issuance.
- **Entry** (unchanged): "delete all entries" and account deletion remove the user's entries (including soft-deleted); the Trash surface reads soft-deleted entries.

See `data-model.md` for the reset-token entity and deletion semantics, and
`contracts/openapi.yaml` for the API surface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A locked-out user can regain access via a self-service reset, and the flow never reveals whether an email is registered (verified by identical-response tests).
- **SC-002**: A password reset invalidates prior sessions and the old password no longer authenticates.
- **SC-003**: The theme preference applies immediately and persists across reload and re-login, with no flash of the wrong theme; first run honors the OS preference.
- **SC-004**: Destructive actions cannot be triggered without a typed confirmation; "delete all entries" and "delete account" remove only the authenticated user's data (verified by isolation tests).
- **SC-005**: Trace deploys to a clean environment from configuration alone and serves over HTTPS, with a working health endpoint and structured, content-free logs.
- **SC-006**: All release-blocking gates pass in CI, security/isolation, accessibility (WCAG AA against the contrast table), and performance (capture < 100 ms, cold < 2 s, search < 300 ms, smooth at 50k), and a red pipeline blocks merge.
- **SC-007**: A backup can be restored per the runbook to recover the corpus intact (rehearsed, documented).

## Assumptions

- Builds on features 001-003 (auth, entries, search/tags, export).
- Email delivery uses a configurable transport (provider via environment config); local/dev may log the reset link instead of sending mail. SSO/MFA remain out of V1 scope.
- The theme system is the CSS custom-property token contract from ADR-0006; this feature ships the toggle, persistence, and full theme application across screens.
- Hard deletion exists **only** for the explicit account/data-deletion actions; routine entry deletion remains soft (feature 001, ADR-0004). Account deletion is the sole bulk-erase path.
- Operational documents under `docs/05-operations/` and `docs/04-engineering/ci-cd.md` are the authoritative procedures this feature implements/verifies rather than redefines.
- HTTPS/TLS is terminated at the platform/infrastructure layer; the app enforces secure assumptions (no secrets in source, secure cookies/headers as applicable).
