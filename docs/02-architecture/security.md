# Security Architecture — Trace

**Status:** Baseline · **Last updated:** 2026-06-18 · **Owner:** engineering

Trace holds intimate personal data for many isolated users. Security is a
first-class requirement (Constitution V), not a hardening pass. This document is
the reference for how that requirement is met.

---

## Threat model (V1, summarized)

| Threat | Mitigation |
|---|---|
| **Cross-user data access** (the worst case) | Server-side `userId` scoping in the service layer; isolation test suite; `404` (not `403`) for non-owned resources. |
| Credential theft via DB compromise | Passwords stored only as bcrypt salted hashes; never plaintext/reversible. |
| Brute-force / credential stuffing | Rate limiting on auth endpoints; generic error messages. |
| Token theft | Short-lived JWTs over HTTPS only; (refresh via httpOnly cookie if/when added). |
| Injection (NoSQL/XSS/CSRF) | zod input validation; parameterized queries via Mongoose; output encoding in React; helmet headers; CORS allowlist. |
| Account enumeration | Registration/reset responses do not reveal whether an email exists (uniform responses). |
| Secret leakage | Secrets only via environment; never committed; `.env` gitignored. |
| Data loss | Soft-delete only; durable writes before commit confirmation; backups (ops). |
| Privacy erosion | No telemetry on entry content; no third-party content analytics. |

## Authentication

- **Method (V1):** email + password.
- **Password storage:** bcrypt salted hash, sensible cost factor ([ADR-0003](../adr/0003-jwt-authentication.md), NFR-4.2).
- **Sessions:** stateless JWT bearer access tokens; verified per request → `req.userId`.
- **Logout:** client discards token; server-side denylist/short expiry as needed.
- **Password reset (feature 004):** time-limited single-use link emailed to the registered address; old sessions invalidated on reset; uniform response to prevent enumeration (NFR-4.4).

## Authorization & data isolation *(the central control)*

- Every protected route passes through `requireUser`, which rejects unauthenticated requests.
- **All Entry queries are constructed with `{ userId: req.userId }` inside the service layer** — a single, auditable choke point (research [R-03](../../specs/001-foundation-and-capture/research.md)).
- The client is never trusted to scope data; isolation is enforced server-side regardless of client behavior (defense in depth).
- A dedicated **isolation test suite** asserts that user B can never read/patch/delete user A's entries through any endpoint (SC-4).

## Transport & headers

- **HTTPS/TLS** for all client–server traffic in production (NFR-4.1); TLS terminated at the edge/reverse proxy.
- **helmet** sets security headers (HSTS, no-sniff, frame options, etc.).
- **CORS** restricted to configured `ALLOWED_ORIGINS`.

## Input validation & output safety

- **Validation:** zod schemas at the route boundary; reject malformed input with `422` ([R-08](../../specs/001-foundation-and-capture/research.md)).
- **NoSQL injection:** Mongoose typed queries; never interpolate raw user input into query operators.
- **XSS:** React escapes by default; entry bodies are rendered as text/escaped Markdown, never as raw HTML.
- **CSRF:** bearer-token auth (not cookies) avoids classic CSRF on the API; if cookie-based refresh is added, CSRF protection is added with it.

## Secrets & configuration

- A validated config module loads secrets from environment and **fails fast** on misconfiguration ([R-10](../../specs/001-foundation-and-capture/research.md)).
- Secrets (JWT signing key, DB credentials) are never in source control; `.env` is gitignored; production secrets come from the platform's secret store.
- See [environments](../04-engineering/environments.md).

## Data protection

- **At rest:** datastore encryption at rest enabled where the managed MongoDB supports it (NFR-4.7).
- **In transit:** TLS everywhere.
- **Retention/erasure:** soft-delete keeps data recoverable; account deletion (feature 004) is the explicit, confirmed, irreversible erase path.
- **Minimization:** we store only what the corpus needs; no content telemetry.

## Logging & privacy

- Structured logs carry correlation ids and operational metadata but **never entry content or secrets** (Constitution VI). See [observability](../05-operations/observability.md).

## Security in the SDLC

- Security requirements are explicit NFRs (NFR-4.*) and traced in the [matrix](../01-requirements/traceability-matrix.md).
- The isolation suite and auth tests are **release-blocking** gates in CI ([ci-cd](../04-engineering/ci-cd.md)).
- Dependencies are watched for advisories; security-relevant changes are reviewed with extra care.
- Significant security decisions are recorded as ADRs.

## Known deferrals (tracked, not forgotten)

- Email verification on registration — deferred (V1 assumption).
- MFA / SSO — future.
- Field-level encryption of entry bodies — considered for a future version; flagged in the [risk register](../03-project/risk-register.md).
