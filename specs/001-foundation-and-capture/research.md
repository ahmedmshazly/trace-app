# Phase 0 Research: Foundation & Core Capture Loop

Decisions and rationale that de-risk the plan. Each entry records the decision,
why it was chosen, and the alternatives rejected. These feed directly into the
data model, contracts, and tasks.

---

## R-01 Authentication strategy: JWT access tokens

**Decision**: Stateless JWT access tokens (short-lived), sent as `Authorization:
Bearer`, verified in middleware that attaches `req.userId`. A refresh mechanism
(httpOnly cookie) is added if/when token expiry UX requires it.

**Why**: The Constitution requires a stateless API (NFR-3.4) so it can be
redeployed and horizontally scaled without sticky sessions. JWT verification is
cheap and keeps isolation enforcement uniform across every route.

**Rejected alternatives**:
- *Server-side sessions*: require shared session storage and sticky routing; violates the stateless-API standard.
- *OAuth/SSO*: out of scope for V1 (spec assumption); adds provider complexity with no V1 value.

## R-02 Password storage: bcrypt

**Decision**: `bcrypt` with a sensible cost factor; store only the salted hash.

**Why**: Constitution V mandates salted hashes only. bcrypt is battle-tested,
ubiquitous in the Node ecosystem, and adaptive.

**Rejected alternatives**: argon2 (excellent, but heavier native dependency than
needed for V1); plain hashing or reversible storage (forbidden by Constitution).

## R-03 Per-user data isolation: enforced in middleware + query scoping

**Decision**: A `requireUser` middleware rejects unauthenticated requests; every
`Entry` query is built with `{ userId: req.userId }` inside the service layer.
A dedicated isolation test suite asserts cross-user access is impossible.

**Why**: Constitution V, "cross-user access MUST be impossible by construction."
Centralizing the `userId` filter in the service layer (not scattered in routes)
makes it auditable and hard to bypass.

**Rejected alternatives**: relying on the client to request only its own data
(no defense in depth); per-route ad-hoc filtering (error-prone, hard to audit).

## R-04 Optimistic UI for the capture commit

**Decision**: On Enter, the client immediately renders the new entry on the
timeline with a provisional state and fires the create request; on success it
reconciles, on failure it surfaces a retry without losing the text.

**Why**: Constitution I, perceived commit latency must be < 100 ms. A network
round trip cannot guarantee that; optimistic rendering can.

**Rejected alternatives**: blocking spinner until the server responds (fails the
latency budget and the friction principle).

## R-05 Timestamps: store UTC, group by local day

**Decision**: Persist `occurredAt`/`createdAt` as UTC instants; the client
converts to local time for display and computes day-group boundaries in the
user's timezone.

**Why**: Correctness across timezones and DST; the corpus stays unambiguous and
analysis-ready (Constitution II) while the UI stays human (Constitution I).

**Rejected alternatives**: storing local wall-clock times (ambiguous, breaks
analysis and cross-device consistency).

## R-06 Incremental timeline loading: cursor pagination on `occurredAt`

**Decision**: Page the timeline with a keyset/cursor on `(occurredAt, _id)`
descending, backed by a compound index. Load older pages on scroll.

**Why**: Constitution VII + performance goals, keyset pagination stays O(1) per
page and smooth at 50k entries/user, unlike offset pagination which degrades.

**Rejected alternatives**: offset/limit pagination (slow deep into history);
loading the whole corpus (fails at scale).

## R-07 Soft delete, never hard delete (V1)

**Decision**: A `deleted` boolean hides entries from all reads; restore flips it
back. No endpoint permanently removes an entry in V1 (account deletion is the
only bulk-erase path, in a later feature).

**Why**: Constitution II + spec FR-032 / NFR-2.3, data is durable and
recoverable; the user never loses a moment by accident.

**Rejected alternatives**: hard delete (irreversible, violates durability).

## R-08 Input validation: zod at the API boundary

**Decision**: Validate and parse all request bodies/params with zod schemas at
the route boundary; reject malformed input with structured 4xx errors.

**Why**: Constitution V, input validation and web-vuln defense. A single
validation layer keeps the API contract honest and the services clean.

**Rejected alternatives**: ad-hoc manual checks (inconsistent, leaky).

## R-09 Testing stack: Vitest + Supertest + Playwright + in-memory Mongo

**Decision**: Vitest for unit, Supertest+Vitest for API integration against
`mongodb-memory-server`, Playwright for end-to-end (capture loop, auth
isolation). Critical paths are tested first.

**Why**: Constitution IV, automated gates on the critical paths. In-memory
Mongo gives fast, hermetic integration tests with no external dependency.

**Rejected alternatives**: a single heavy E2E layer (slow feedback); mocking the
database (misses real query/index behavior, especially isolation).

## R-10 Configuration & secrets: environment-only via validated config module

**Decision**: A single `config` module loads and validates environment variables
(DB URI, JWT secret, port, allowed origins) with zod at startup; the app fails
fast if config is invalid. No secrets in source.

**Why**: Constitution V + VI, config-driven, reproducible deploys with no
hard-coded host values; fail-fast prevents misconfigured production starts.

**Rejected alternatives**: scattered `process.env` reads (no validation, late
failures); committed config (secret leakage).
