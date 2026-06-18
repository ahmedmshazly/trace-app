# Non-Functional Requirements Register — Trace V1

**Status:** Baseline · **Last updated:** 2026-06-18

Quality attributes with **measurable, testable targets**. Each NFR maps to one or
more Constitution principles. Verification: T = automated test, M = measurement/
benchmark, I = inspection/audit, D = demo.

---

## NFR-1 Performance *(Constitution I)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-1.1 | Launch readiness | Capture input focused & usable < 2 s cold; ~instant warm. | M |
| NFR-1.2 | Commit responsiveness | Confirmation < 100 ms perceived (optimistic UI allowed). | M |
| NFR-1.3 | Search latency | Results < 300 ms for ≤ 50k entries/user. | M |
| NFR-1.4 | Smooth scrolling | No perceptible jank scrolling a large corpus. | M, D |

## NFR-2 Reliability & integrity *(Constitution II, IV)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-2.1 | No data loss | No committed entry lost; durable before commit confirmed. | T |
| NFR-2.2 | Crash safety | No corruption on unexpected termination; uncommitted draft recoverable. | T |
| NFR-2.3 | Recoverable deletion | Deletion is soft and recoverable; no silent destruction. | T |

## NFR-3 Availability & deployment *(Constitution VI)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-3.1 | Service availability | Reliably reachable; downtime minimized across deploys. | M |
| NFR-3.2 | Config-driven deployment | All env-specific settings via configuration; no secrets/host values in source. | I |
| NFR-3.3 | Production-served client | React client served as an optimized production build. | I |
| NFR-3.4 | Stateless API | Token-based auth, no server-local session affinity. | I, T |
| NFR-3.5 | Health endpoint | `/api/health` readiness/liveness probe exists. | T |
| NFR-3.6 | Graceful connectivity handling | Transient network loss does not lose in-progress entry. | T, D |

## NFR-4 Privacy & security *(Constitution V)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-4.1 | Transport encryption | HTTPS/TLS for all client–server traffic in production. | I |
| NFR-4.2 | Credential protection | Passwords stored only as salted hashes (bcrypt). | I, T |
| NFR-4.3 | Authorization & isolation | Every request scoped to authenticated user; cross-user access impossible. | T (isolation suite) |
| NFR-4.4 | Web-vulnerability protection | Defend injection, XSS, CSRF (as applicable); validate all input. | T, I |
| NFR-4.5 | Abuse protection | Auth & sensitive endpoints rate-limited. | T |
| NFR-4.6 | No content analytics | No telemetry on entry content; no third-party content analytics. | I |
| NFR-4.7 | Encryption at rest | Datastore supports encryption at rest. | I |
| NFR-4.8 | Secret management | Secrets via secure configuration, never in source control. | I |

## NFR-5 Portability (anti-lock-in) *(Constitution II)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-5.1 | Open-format export | Full corpus exportable to Markdown + JSON at any time. | T, D |
| NFR-5.2 | Round-trippable | Exported data is self-contained and re-importable. | T |

## NFR-6 Analysis-readiness *(Constitution II)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-6.1 | Consumable structure | Entries stored as clean, flat, queryable documents (no preprocessing). | I |
| NFR-6.2 | Stable schema | Documented, stable schema with explicit user/time/tag fields. | I |

## NFR-7 Usability *(Constitution I)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-7.1 | Keyboard-first | Full capture loop completable without a mouse. | T, D |
| NFR-7.2 | Minimal chrome | Capture is the default surface after login; minimal UI between user and logging. | D |
| NFR-7.3 | Zero-config start | A registered user can begin logging with sensible defaults, no required config. | D |
| NFR-7.4 | Accessibility | WCAG AA contrast, visible focus states, keyboard navigability. | T, I |
| NFR-7.5 | Low-friction onboarding | User reaches capture surface immediately after authenticating. | D |

## NFR-8 Maintainability & architecture *(Constitution VII)*

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-8.1 | UI/API separation | React UI consumes a documented REST/JSON API; clean layer separation. | I |
| NFR-8.2 | Modularity | Core logic modular, testable, decoupled from presentation. | I |
| NFR-8.3 | Documented contract | API contract documented (OpenAPI). | I |

## NFR-9 Platform portability

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-9.1 | Linux server | API deployable on a Linux host. | I |
| NFR-9.2 | Any modern browser | Client runs in any modern browser. | D |
| NFR-9.3 | No OS lock-in | Core functionality avoids OS-specific dependencies. | I |

## NFR-10 Scalability

| ID | Requirement | Target | Verify |
|---|---|---|---|
| NFR-10.1 | Concurrent users | Maintains stated performance under concurrent multi-user load. | M |
| NFR-10.2 | Per-user corpus size | Sustains performance for ≥ 50k entries/user. | M |

---

**Total:** 33 non-functional requirements across 10 quality areas. The **Must**-
equivalent gates (no data loss, isolation, HTTPS, hashed credentials, config-driven
deploy, export) are release-blocking.
