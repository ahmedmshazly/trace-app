# ADR-0003: JWT bearer authentication with bcrypt password hashing

- **Status:** Accepted
- **Date:** 2026-06-18
- **Deciders:** Maintainer (Eng)
- **Related:** [security](../02-architecture/security.md), [api-design](../02-architecture/api-design.md), research [R-01](../../specs/001-foundation-and-capture/research.md), [R-02](../../specs/001-foundation-and-capture/research.md), Constitution V

## Context

Trace is multi-user and must enforce strict per-user isolation on a **stateless**
API (NFR-3.4) that can be redeployed/scaled without sticky sessions. We need an
authentication mechanism that (a) carries identity to every request cheaply,
(b) integrates uniformly with isolation enforcement, and a credential storage
scheme that meets Constitution V ("salted hashes only").

## Decision

We will authenticate API requests with **stateless JWT bearer access tokens**
(`Authorization: Bearer <token>`), verified in middleware that resolves
`req.userId` for downstream isolation. Passwords are stored only as **bcrypt
salted hashes**. The token-signing secret comes from environment configuration.
A refresh-token mechanism (httpOnly cookie) may be added later if token-expiry UX
requires it.

## Consequences

### Positive

- Stateless: no shared session store, no sticky routing — supports horizontal scale (NFR-3.4).
- Uniform identity on every request → a single, auditable isolation choke point ([R-03](../../specs/001-foundation-and-capture/research.md)).
- bcrypt is battle-tested and adaptive; meets credential-protection requirements (NFR-4.2).
- Bearer-token (not cookie) auth sidesteps classic CSRF on the API.

### Negative / costs

- Stateless tokens are harder to revoke before expiry; mitigated by short lifetimes and (if needed) a denylist or rotation. Rotating `JWT_SECRET` invalidates all tokens (operational note in the [runbook](../05-operations/runbook.md)).
- Token storage on the client must avoid XSS exposure; React's escaping + careful storage choices mitigate.

### Neutral / notes

- Email verification, MFA, and SSO are explicitly deferred (V1 assumptions).
- If cookie-based refresh is introduced, CSRF protection is introduced with it.

## Alternatives considered

- **Server-side sessions** — rejected: require shared session storage / sticky sessions; violate the stateless-API standard.
- **OAuth/SSO** — deferred: out of scope for V1; provider complexity with no V1 value.
- **argon2** for hashing — deferred: excellent but heavier native dependency than needed for V1; bcrypt suffices.
