# Trace: Glossary

**Status:** Living document · **Last updated:** 2026-06-18

A shared vocabulary. When a term here is used in any Trace document, it carries
this precise meaning. Terms are alphabetized.

---

| Term | Definition |
|---|---|
| **ADR** | Architecture Decision Record. A short, immutable document capturing one significant technical decision, its context, and consequences. Stored in [`../adr/`](../adr/). |
| **Backdating** | Adjusting an entry's `occurredAt` to a time earlier than when it was captured, for events logged after the fact. Does not change `createdAt`. |
| **Capture loop** | The core interaction: open → type → commit (Enter) → entry appears → cursor returns. The product's heartbeat; optimized above all else. |
| **Commit** | The act of saving a captured moment (pressing Enter), producing a persisted Entry with an immutable `createdAt`. |
| **Constitution** | The supreme governing document of the project, at [`../constitution.md`](../constitution.md). All other artifacts defer to it. |
| **Corpus** | The complete set of Entries belonging to a single User. The durable deliverable of the product. |
| **`createdAt`** | The immutable timestamp of when an Entry was committed to the system. Set once, never changes. |
| **Draft** | In-progress capture text held on the client, not yet committed to the database. Recoverable on restart. |
| **Entry** | A single logged moment: body text + the time it refers to + metadata, owned by exactly one User. The atomic unit of Trace. |
| **Hard delete** | Permanent, irreversible destruction of data. **Not present in V1**: see soft delete. |
| **Interstitial journaling** | The established practice of timestamping notes inline as you work through the day. The conceptual lineage Trace builds on. |
| **Isolation (per-user)** | The guarantee, enforced server-side on every request, that a User can only ever access their own data. Cross-user access is impossible by construction. |
| **JWT** | JSON Web Token. The stateless bearer token used to authenticate API requests. See [ADR-0003](../adr/0003-jwt-authentication.md). |
| **Local-first (development)** | The practice of running the entire stack on the developer's machine, promoting to hosted environments via configuration only. Distinct from offline-first. |
| **MERN** | The stack: MongoDB, Express, React, Node.js. See [ADR-0002](../adr/0002-mern-stack.md). |
| **Moment** | The conceptual unit of writing in Trace: a thing that happened at a time. Realized technically as an Entry. |
| **MoSCoW** | Prioritization scheme: Must / Should / Could / Won't. The set of **Must** requirements defines the minimal shippable product. |
| **`occurredAt`** | The timestamp of when the logged event actually happened. The **primary analysis axis**. Defaults to capture time; editable (backdating). |
| **Offline-first** | An app capability where the client functions without reaching its backend (cache, queue, sync). **Out of scope for V1**; distinct from local-first development. |
| **Optimistic UI** | Rendering the result of an action immediately (before the server confirms), then reconciling: used to keep capture commit perceived latency under 100 ms. |
| **SDD** | Spec-Driven Development. The workflow where specs are the source of truth and precede code. |
| **Soft delete** | Hiding an Entry from all views via a `deleted` flag while preserving the record, so it can be restored. The only deletion mechanism in V1. |
| **`source`** | A reserved Entry field (default `"manual"`) for future capture methods (e.g. `"voice"`). Unused in V1. |
| **Timeline** | The reverse-chronological, day-grouped view of a User's Entries. The home surface of the app. |
| **Trace** | The product. Also: in software, a trace is a timestamped sequence of recorded events, the name describes the function and the feeling. |
| **User** | An authenticated account holder who owns a private, isolated corpus. |
| **V1 / MVP** | Version 1: the minimal, shippable Trace, capture, store, browse, search, export, on a secure multi-user foundation. |
