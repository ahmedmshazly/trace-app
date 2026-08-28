# Phase 0 Research: Hardening, Settings & Deploy (V1 GA)

Decisions and rationale that de-risk the plan. Each records the decision, why it
was chosen, and the alternatives rejected.

---

## R-001 Password reset: hashed, single-use, expiring token

**Decision**: On a reset request, generate a cryptographically random token, store
only its **hash** with the user id and a short **expiry** (e.g. 1 hour), and email
the raw token in a link. Completion verifies the hash, checks expiry/used-state,
updates the password (bcrypt), marks the token used, and **invalidates prior
sessions**. A **TTL index** auto-expires tokens.

**Why**: Mirrors the credential-protection rules (Constitution V): never store a
usable secret, time-box exposure, single-use. Session invalidation closes the
hijack window (FR-003).

**Rejected alternatives**:
- *Store the raw token*: a database read would expose working reset links.
- *Long-lived/multi-use tokens*: widen the attack window unnecessarily.
- *Stateless signed reset JWT*: harder to single-use/revoke than a stored token.

## R-002 No account enumeration on reset (and email change)

**Decision**: The reset-request response is **identical** whether or not the email
exists; email is sent only if the account exists. Rate-limit the endpoint. Apply
the same non-revealing posture to email-change conflicts (clear, non-enumerating
errors).

**Why**: NFR-4.4 and the auth sub-flow design explicitly require no enumeration
a privacy and anti-abuse guarantee for a product holding intimate data.

**Rejected alternatives**:
- *"No account with that email" message*: leaks which emails are registered.

## R-003 Session invalidation strategy

**Decision**: Adopt a token-invalidation mechanism that lets reset and account
deletion **revoke existing sessions**, e.g. a per-user `tokenVersion`/`sessionEpoch`
claim checked on each request, bumped on reset/delete. (If 001 used short-lived
JWTs only, this adds the minimal server-side check needed for revocation.)

**Why**: Stateless JWTs alone cannot be revoked before expiry; reset and deletion
must take effect immediately (FR-003, FR-022). A version claim is the lightest
mechanism consistent with the stateless-API standard.

**Rejected alternatives**:
- *Wait for token expiry*: leaves a compromised/old session valid after reset.
- *Full server-side session store*: heavier; the version claim suffices.

## R-004 Theme system: CSS custom properties, dark default, no FOUC

**Decision**: Implement the ADR-0006 token contract, themes are CSS custom-
property sets toggled via `[data-theme]`. The initial theme is resolved **before
first paint** from a stored preference, else the OS `prefers-color-scheme`,
defaulting to dark. Persist the user's explicit choice.

**Why**: Dark is first-class (ADR-0006); applying the theme pre-paint avoids a
flash of the wrong theme (FOUC). Custom properties keep the swap a single-layer
change (Constitution VII).

**Rejected alternatives**:
- *Theme via JS after mount*: causes FOUC.
- *Per-component conditional colors*: not themeable/auditable.

## R-005 Account & data deletion: scoped and atomic

**Decision**: "Delete all entries" removes the user's `Entry` documents (including
soft-deleted) in one scoped operation. "Delete account" removes the `User`, all
their entries, and reset tokens, then invalidates sessions. Both run in
`account.service` behind a typed confirmation and are scoped by `userId`. Use a
transaction or a clearly-reported ordered delete so state is never ambiguous.

**Why**: Constitution II (right to leave) and V (isolation). Centralizing in one
service makes the scope auditable; atomicity avoids half-deleted corpora.

**Rejected alternatives**:
- *Soft-delete the account*: contradicts a genuine "erase my data" guarantee.
- *Client-driven bulk delete*: cannot guarantee scope/atomicity.

## R-006 This is the only hard-delete path (V1)

**Decision**: Routine entry deletion stays **soft** (feature 001, ADR-0004). The
**only** hard/bulk-erase paths are the explicit "delete all entries" and "delete
account" actions, each typed-gated. The Trash surface browses/restores soft-deleted
entries (the everyday recovery path).

**Why**: Preserves "no silent loss" for daily use (NFR-2.3) while honoring explicit
erasure requests (FR-7.6).

**Rejected alternatives**:
- *Allow per-entry hard delete in the UI*: reintroduces accidental permanent loss.

## R-007 Email transport: configurable, dev-friendly

**Decision**: A `mailer` abstraction selects its transport from configuration
(provider + credentials via env). In local/dev the transport **logs the reset
link** instead of sending mail; production uses a real provider. No provider lock-in
in code.

**Why**: Local-first development (Constitution standards) without external accounts;
config-only switch to a hosted provider (NFR-3.2). Keeps secrets out of source.

**Rejected alternatives**:
- *Hard-code a provider SDK*: couples the app to one vendor and needs creds to run
  locally.

## R-008 Rate limiting & web-vulnerability posture (finalized)

**Decision**: Finalize `express-rate-limit` on auth, reset, and other sensitive
endpoints with tuned limits (normal use never blocked; 429 on abuse). Confirm
helmet security headers, CORS from `ALLOWED_ORIGINS`, zod validation on every
boundary, and CSRF posture appropriate to bearer-token auth. Add a focused
security test suite (enumeration, headers, limit behavior, injection/XSS vectors).

**Why**: NFR-4.4/4.5 are release-blocking; a hosted multi-user app must resist abuse
and common web attacks. Tests make the posture durable (Constitution IV).

**Rejected alternatives**:
- *Defer hardening to "later"*: contradicts security-by-default; GA-blocking.

## R-009 CI/CD, observability, backup: implement the existing docs

**Decision**: Implement the pipeline in `docs/04-engineering/ci-cd.md` (lint,
type-check, unit, integration, isolation, e2e; red blocks merge), the
config-driven deploy in `docs/05-operations/deployment.md`, the structured logging
and health/metrics in `observability.md`, and rehearse the procedure in
`backup-recovery.md`. These docs are authoritative; this feature realizes and
verifies them rather than redefining them.

**Why**: Constitution VI, operability must be reproducible and documented before
first production deploy. Reusing the existing docs avoids divergence.

**Rejected alternatives**:
- *New ad-hoc ops procedures*: would drift from the documented runbooks.

## R-010 Accessibility & performance validation as GA gates

**Decision**: Run an accessibility pass (axe + manual keyboard/focus) verified
against the [color-system contrast table](../../docs/06-design/color-system.md#contrast-verification),
and performance benchmarks for capture latency, cold load, search, and 50k-entry
smoothness. Both must pass in CI to ship GA (SC-006).

**Why**: NFR-7.4 and NFR-1.* are release-blocking quality bars; making them CI
gates prevents silent regressions (Constitution IV).

**Rejected alternatives**:
- *Manual-only, one-off checks*: not durable; regressions slip in.
