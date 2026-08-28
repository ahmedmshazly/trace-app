# ADR-0003: JWT authentication with bcrypt password hashing

- **Status:** Accepted (amended 2026-07-16)
- **Date:** 2026-06-18
- **Deciders:** Maintainer (Eng)
- **Related:** [security](../02-architecture/security.md), [api-design](../02-architecture/api-design.md), research [R-01](../../specs/001-foundation-and-capture/research.md), [R-02](../../specs/001-foundation-and-capture/research.md), Constitution V

## Context

Trace is multi-user and must enforce strict per-user isolation on a **stateless**
API (NFR-3.4) that can be redeployed/scaled without sticky sessions. We need an
authentication mechanism that (a) carries identity to every request cheaply,
(b) integrates uniformly with isolation enforcement, and a credential storage
scheme that meets Constitution V ("salted hashes only"). Browser clients must
not keep long-lived JWTs in JavaScript-readable storage (XSS → corpus theft).

## Decision

We authenticate API requests with **stateless JWTs** verified in middleware that
resolves `req.userId` for downstream isolation. Passwords are stored only as
**bcrypt salted hashes**. The token-signing secret comes from environment
configuration.

**Transport:**

- **Browser (SPA):** the JWT is set as an `HttpOnly; SameSite=Strict; Path=/`
  cookie (`trace_session`) on login/register/password-reset. The SPA sends
  `credentials: 'include'` and never stores the token in `localStorage`.
- **API clients / tests:** `Authorization: Bearer <token>` remains supported
  (Bearer wins when both cookie and header are present).

`SameSite=Strict` on a same-origin SPA deployment mitigates classic CSRF for
cookie-authenticated mutating requests.

## Consequences

### Positive

- Stateless: no shared session store, no sticky routing, supports horizontal scale (NFR-3.4).
- Uniform identity on every request → a single, auditable isolation choke point ([R-03](../../specs/001-foundation-and-capture/research.md)).
- bcrypt is battle-tested and adaptive; meets credential-protection requirements (NFR-4.2).
- httpOnly cookie keeps the JWT out of `document` / XSS-readable storage for the SPA.

### Negative / costs

- Stateless tokens are harder to revoke before expiry; mitigated by short lifetimes and `sessionEpoch` bumps (password reset / account delete). Rotating `JWT_SECRET` invalidates all tokens (operational note in the [runbook](../05-operations/runbook.md)).
- Cookie auth requires careful cookie flags (`Secure` in production / Vercel) and same-origin (or explicit CORS credentials) deployment.

### Neutral / notes

- Email verification, MFA, and SSO are explicitly deferred (V1 assumptions).
- A separate short-lived access + refresh dual-token scheme remains optional future work.

## Alternatives considered

- **Server-side sessions.** Rejected: require shared session storage / sticky sessions; violate the stateless-API standard.
- **OAuth/SSO.** Deferred: out of scope for V1; provider complexity with no V1 value.
- **argon2** for hashing, deferred: excellent but heavier native dependency than needed for V1; bcrypt suffices.
- **localStorage bearer only.** Rejected after audit: XSS can exfiltrate intimate corpus tokens.
