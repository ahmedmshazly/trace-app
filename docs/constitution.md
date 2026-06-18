# Trace Constitution

> The supreme governing document for the Trace project. Every specification,
> plan, task, pull request, and review is measured against these principles.
> When any other document conflicts with this Constitution, this Constitution wins.

Trace is a personal, timestamped life-logging web application. The unit of
writing is a *moment* — an entry automatically anchored to a point in time —
rather than a line of text. Trace is delivered as a hosted, multi-user MERN
application where every user owns a private, isolated corpus they can later
mine for patterns.

---

## Core Principles

### I. Capture Friction Is Sacred

The product exists to make capturing a moment effortless. Every decision —
product, design, or technical — must pass one test: *does this make capturing a
moment faster and lighter, or slower and heavier?*

- The capture input MUST be focused and ready on load; logging requires no prior interaction.
- The full capture loop MUST be completable with the keyboard alone.
- Perceived commit latency MUST stay under 100 ms (optimistic UI is acceptable).
- We capture liberally and judge significance later; the system never asks the user to decide "is this worth logging?" at capture time.
- Chrome, prompts, modals, and configuration that sit between the user and the act of logging are treated as defects, not features.

**Rationale:** Everything downstream — pattern discovery, insight, recommendation —
is worthless without a dense, honest corpus, and the corpus only grows if logging
never feels like a chore.

### II. The Corpus Is the Product — Ownership & Portability

The durable deliverable is not the app; it is each user's clean, analysis-ready
corpus of timestamped entries. The app is the most pleasant way to grow it.

- A user MUST be able to export their entire corpus to open, documented formats (Markdown + JSON) at any time.
- Stored entries MUST remain flat, time-keyed, and consumable by external tooling and analysis engines without preprocessing.
- The entry schema MUST stay documented and stable; breaking schema changes require an ADR and a migration plan.
- No user entry content is ever sold, shared across users, or subjected to third-party content analytics.

**Rationale:** Get the data right and every future capability stays open; get it
wrong and we migrate data forever. Portability is the contract that keeps the
user free and the corpus trustworthy.

### III. Spec-Driven Development (NON-NEGOTIABLE)

No feature is built without first flowing through the spec-driven workflow.

- The order is: **Constitution → Specify → Clarify (if ambiguous) → Plan → Tasks → Analyze (optional) → Implement.**
- Code MUST trace to a task; tasks MUST trace to a plan; plans MUST trace to a spec; specs MUST trace to this Constitution.
- A spec describes *what* and *why* (user value, requirements, success criteria); it MUST NOT prescribe *how* (no stack, no code).
- Ambiguity is resolved before planning, not during implementation. Open questions are marked `[NEEDS CLARIFICATION]` and must be closed before a plan is approved.

**Rationale:** Specs are the single source of truth and the unit of review.
Writing prose before code is what makes the system reviewable and
traceable.

### IV. Test-First & Quality Gates

Quality is enforced by automation, not by hope.

- Critical paths (authentication, data isolation, entry create/commit, export) MUST have automated tests written before or alongside implementation.
- The Red-Green-Refactor discipline applies to all non-trivial logic: write a failing test, make it pass, then refactor.
- Every pull request MUST pass linting, formatting, type checks, and the full test suite before merge. A red pipeline blocks merge.
- A feature is "done" only when its acceptance scenarios from the spec are demonstrably met by tests.

**Rationale:** A multi-user app that holds intimate personal data cannot regress
silently. Gates make correctness the default and reviews about substance.

### V. Security & Privacy by Default

Trace holds intimate personal data for many isolated users. Security is a
first-class requirement, not a later hardening pass.

- Per-user data isolation MUST be enforced server-side on every request; cross-user access MUST be impossible by construction.
- All client–server traffic MUST use HTTPS/TLS in production.
- Credentials MUST be stored only as salted hashes; secrets MUST come from environment configuration, never source control.
- Authentication endpoints MUST be rate-limited; inputs MUST be validated; common web vulnerabilities (injection, XSS, CSRF as applicable) MUST be defended against.
- The system contains no telemetry on entry content and no usage analytics that read user data.

**Rationale:** A single isolation bug betrays every user at once. Privacy is the
trust that makes a life-logging product usable at all.

### VI. Observability & Operability

What we cannot see, we cannot run.

- The system MUST emit structured, correlatable application logs that never contain user entry content or secrets.
- A health/readiness endpoint MUST exist for hosting platforms.
- Deployment MUST be reproducible from configuration alone, with no hard-coded host-specific values.
- Operational concerns (deploy, rollback, backup, restore) MUST be documented as runbooks before first production deploy.

**Rationale:** A hosted multi-user service lives and dies by its operability.
Logs and runbooks turn incidents into routine, not panic.

### VII. Simplicity & YAGNI

Build the smallest thing that fully satisfies the spec.

- Prefer boring, well-understood solutions over clever ones.
- Do not build for hypothetical futures; the data model may *reserve* room (e.g. a `source` field) but features are added when their spec exists, not before.
- Every added dependency, abstraction, or service MUST justify its complexity against a simpler rejected alternative (recorded in the plan's Complexity Tracking).
- Scope discipline is enforced by MoSCoW priorities: the set of **Must** requirements defines the minimal shippable product; everything else is refinement.

**Rationale:** Complexity is the tax that compounds. The V1 mandate is a tight
capture loop, not a platform.

---

## Technology & Architecture Standards

- **Stack:** MERN — MongoDB, Express, React, Node.js. Deviations require an ADR.
- **Deployment model:** hosted, multi-user web application; Linux server target; any modern browser client.
- **Architecture:** strict separation between a documented REST/JSON API (Express) and the React client. Core logic is modular and decoupled from presentation.
- **Local-first development:** the entire stack MUST run locally against a local MongoDB, switching to hosted environments via configuration only (environment variables for DB URI, secrets, allowed origins). "Local" means runs on your machine without internet after install; it does NOT mean the client works without its backend.
- **Data model authority:** `docs/02-architecture/data-model.md` is the canonical schema reference. The `occurredAt` field is the primary analysis axis; `createdAt` is immutable.
- **Decisions of consequence** (stack, auth strategy, schema, hosting) are recorded as Architecture Decision Records under `docs/adr/`.

## Development Workflow & Quality Gates

- **Branching:** trunk-based with short-lived feature branches off `main`. Branch names are descriptive and scoped to one feature.
- **Spec-first:** a feature branch begins with a spec in `specs/`; implementation follows its task list.
- **Pull requests:** every change lands via PR. A PR MUST (1) link to its spec/feature, (2) pass all CI gates, (3) keep documentation in sync with behavior.
- **Definition of Done:** spec acceptance scenarios met + tests green + docs updated + reviewed + merged via PR.
- **Documentation is part of the work:** behavior changes that are not reflected in `docs/` are incomplete.

## Governance

- This Constitution supersedes all other practices and documents.
- **Amendments** require: a written proposal (PR), an explicit rationale, a version bump per the policy below, and a migration/propagation note describing affected specs, plans, templates, and docs.
- **Versioning policy (semantic):**
  - **MAJOR** — removal or redefinition of a principle, or a backward-incompatible governance change.
  - **MINOR** — a new principle/section or materially expanded guidance.
  - **PATCH** — clarifications, wording, and non-semantic fixes.
- **Compliance:** every PR and review verifies compliance with these principles. Violations must be justified in the plan's Complexity Tracking or the PR description, or the change is rejected.
- **Runtime guidance:** day-to-day engineering guidance lives in `docs/04-engineering/`. It MUST stay consistent with this Constitution.

**Version**: 1.0.0 | **Ratified**: 2026-06-18 | **Last Amended**: 2026-06-18
