# Software Requirements Specification: Trace

**Document type:** Software Requirements Specification (SRS)
**Product:** Trace · **Version:** 1.0 (supersedes draft 0.2) · **Scope:** V1
**Stack:** MERN · **Deployment:** Hosted, multi-user web application
**Status:** Baseline · **Last updated:** 2026-06-18

> This is the canonical, project-wide SRS. Feature-level specifications (e.g.
> [`specs/001-foundation-and-capture/spec.md`](../../specs/001-foundation-and-capture/spec.md))
> derive their requirements from this document. Where a feature spec and this SRS
> disagree, this SRS is authoritative for *scope*, and the
> [Constitution](../constitution.md) is authoritative for *principles*.

---

## 1. Introduction

### 1.1 Purpose

Trace is a personal, timestamped life-logging application delivered as a hosted,
multi-user web service. The unit of writing is a *moment*, an entry anchored to
a point in time, rather than a line. Each user maintains a private, isolated
corpus. V1's sole purpose is to make capturing and retrieving a dense, honest,
analysis-ready record of daily events effortless, on infrastructure that can be
deployed and hosted.

### 1.2 Scope

V1 delivers: account registration & authentication, the frictionless capture
loop, a day-grouped timeline, search & filtering, a tag index, and full corpus
export, on a secure, multi-user, hostable foundation. Downstream analysis
(pattern discovery, recommendations, insights) is **explicitly deferred** (§7).

### 1.3 Definitions

See the [Glossary](../00-overview/glossary.md). Key terms: *Moment*, *Entry*,
*Corpus*, *`occurredAt`* (primary analysis axis), *`createdAt`* (immutable),
*Capture loop*, *Isolation*.

### 1.4 Requirement priority (MoSCoW)

- **(Must).** V1 is broken, insecure, or pointless without it. The set of Musts is the minimal shippable product.
- **(Should).** Strongly wanted in V1; omit only under pressure.
- **(Could).** Desirable; may slip without harm.

### 1.5 References

- [Constitution](../constitution.md) · [Vision](../00-overview/vision.md) · [Architecture Overview](../02-architecture/architecture-overview.md) · [Data Model](../02-architecture/data-model.md) · [API Design](../02-architecture/api-design.md) · [Flow Diagrams](../diagrams/trace-diagrams.md)

---

## 2. Overall description

### 2.1 Product perspective

A conventional two-tier web application: a stateless Express/Node REST API over
MongoDB, and a React SPA client. See [Architecture Overview](../02-architecture/architecture-overview.md).

### 2.2 User classes

| Class | Description |
|---|---|
| **End user** | An account holder who captures and reviews their own private corpus. |
| **Deploying operator** | Provisions and runs the hosted service. Needs only configuration + runbooks. |

### 2.3 Operating environment

- **Server:** Linux host.
- **Client:** any modern browser.
- **Datastore:** MongoDB (local in dev, managed in hosted environments).

### 2.4 Assumptions & dependencies

- Multi-user = many isolated private accounts (SaaS-style); no cross-user sharing in V1.
- Email + password authentication; SSO/OAuth and email verification deferred.
- Stable connectivity during use; offline-first operation is out of scope.
- Timestamps stored in UTC; displayed in the user's local timezone.
- The data model reserves room for future capabilities (e.g. `source`) without implementing them.

---

## 3. Functional requirements

Requirements are grouped by capability. Each carries an ID and a priority. The
authoritative, flat register is [`functional-requirements.md`](./functional-requirements.md);
this section gives the structured view.

### 3.1 Capture *(the core loop)*

- **FR-1.1 Ready to capture on launch** *(Must)*. Once authenticated, the System shall place a capture input in focus on load of the core screen.
- **FR-1.2 Automatic timestamping** *(Must)*. Each new entry shall receive an `occurredAt` defaulting to the moment of creation.
- **FR-1.3 Keyboard commit** *(Must)*. An entry shall be committable with the keyboard alone (Enter).
- **FR-1.4 Multi-line entries** *(Should)*. Multi-line bodies shall be supported with a distinct gesture (Shift+Enter) for newline vs. commit.
- **FR-1.5 Editable event time** *(Should)*. The user shall be able to adjust an entry's `occurredAt` (backdating).
- **FR-1.6 Inline tags** *(Should)*. `#tag` tokens shall be parsed from the body and associated as structured tags.

### 3.2 Entry management

- **FR-2.1 Edit entry** *(Should)*. The body of an existing entry shall be editable.
- **FR-2.2 Soft delete** *(Should)*. Entries shall be removable via recoverable soft-delete, not destructive deletion.
- **FR-2.3 Immutable creation record** *(Must)*. An immutable `createdAt` shall be recorded for every entry, independent of later edits.

### 3.3 Browse & timeline

- **FR-3.1 Chronological timeline** *(Must)*. A user's entries shall display most-recent-first by occurrence time.
- **FR-3.2 Day grouping** *(Must)*. Entries shall be grouped under day headers (Today / Yesterday / date).
- **FR-3.3 Date navigation** *(Should)*. The user shall be able to jump to a specific date and move between days.
- **FR-3.4 Incremental loading** *(Should)*. History shall load incrementally to stay responsive over a large corpus.

### 3.4 Search & filter

- **FR-4.1 Full-text search** *(Must)*. The user's entry bodies shall be searchable by free-text query.
- **FR-4.2 Filter by tag** *(Should)*. The timeline shall be filterable to entries bearing a selected tag.
- **FR-4.3 Filter by date range** *(Should)*. Entries shall be filterable to a user-specified date range.
- **FR-4.4 Combined query** *(Could)*. Text search shall be combinable with tag and/or date filters.

### 3.5 Tags

- **FR-5.1 Tag index** *(Should)*. The set of tags in use shall be presented with per-tag entry counts.
- **FR-5.2 Tag drill-down** *(Should)*. Selecting a tag shall filter the timeline to that tag.

### 3.6 Portability & export

- **FR-6.1 Markdown export** *(Must)*. The user's corpus shall be exportable as timestamped Markdown.
- **FR-6.2 JSON export** *(Must)*. The user's corpus shall be exportable as structured JSON preserving all fields.
- **FR-6.3 Scoped export** *(Should)*. A filtered or date-bounded subset shall be exportable.
- **FR-6.4 JSON import** *(Could)*. Previously exported JSON shall be importable into the user's own corpus.

### 3.7 Accounts & authentication

- **FR-7.1 Registration** *(Must)*. A visitor shall be able to create an account with credentials.
- **FR-7.2 Authentication** *(Must)*. Authentication shall be required before any corpus data is accessed.
- **FR-7.3 Session management** *(Must)*. A session shall be maintained and the user shall be able to log out.
- **FR-7.4 Scoped access** *(Must)*. Only the authenticated user's own entries shall be presented/operated on (enforcement: NFR-4.3).
- **FR-7.5 Credential recovery** *(Should)*. A mechanism to recover/reset credentials shall be provided.
- **FR-7.6 Account & data deletion** *(Should)*. A user shall be able to delete their account and associated corpus.
- **FR-7.7 Account settings** *(Could)*. A user shall be able to view/update basic account settings.

---

## 4. Data requirements

The canonical logical model is [`../02-architecture/data-model.md`](../02-architecture/data-model.md).
Summary: two entities, **User** (owns many) and **Entry**. The Entry schema is
intentionally **flat, user-scoped, time-keyed, and tag-indexed** so a future
analysis layer can consume each corpus directly. Although storage is MongoDB, the
export requirements (FR-6.1/6.2) guarantee the corpus is always recoverable as
open, greppable text.

---

## 5. Non-functional requirements

The authoritative register with measurable targets is
[`non-functional-requirements.md`](./non-functional-requirements.md). Summary:

| Area | Headline requirement |
|---|---|
| Performance | Capture commit < 100 ms perceived; core screen interactive < 2 s cold; search < 300 ms at 50k entries. |
| Reliability | No committed entry ever lost; recoverable deletion; crash safety. |
| Availability & Deployment | Reliably reachable; config-driven deploy with no hard-coded secrets; production-served client; stateless API. |
| Privacy & Security | HTTPS/TLS; salted password hashes; enforced per-user isolation; web-vuln & brute-force defense; no content telemetry. |
| Portability | Full corpus exportable to open formats; round-trippable. |
| Analysis-readiness | Clean, flat, documented, stable, queryable schema. |
| Usability | Keyboard-first; minimal chrome; zero-config start; accessibility (AA). |
| Maintainability | Strict UI/API separation; modular, testable; documented contract. |
| Scalability | Sustains concurrent users; ≥ 50k entries per user. |

---

## 6. External interface requirements

- **API:** documented REST/JSON over HTTPS. Contract: [`../02-architecture/api-design.md`](../02-architecture/api-design.md) and the OpenAPI file in the feature spec.
- **UI:** responsive React SPA; desktop-primary, mobile-capable capture. Design direction: [Flow Diagrams](../diagrams/trace-diagrams.md).
- **Data export:** Markdown and JSON files conforming to a documented shape.

---

## 7. Out of scope (V1)

Explicitly deferred to preserve V1 focus (see [roadmap](../03-project/roadmap.md)):

- The analysis / insight engine (pattern detection, recommendations, anomaly surfacing).
- Dashboards and visualizations.
- Reminders or prompts to log.
- External integrations (calendar, health, etc.).
- Offline-first operation with conflict resolution and real-time sync. (Cross-device *access* is inherent to the hosted model, since you log in from any device, but offline/sync engineering is not built.)
- Rich-media capture (voice, images).
- Cross-user collaboration, sharing, teams, roles.

The data model reserves room for some of these (e.g. `source`) without
implementing them, so a later version can extend rather than restructure.

---

## 8. Success criteria

Technology-agnostic, measurable outcomes for V1:

- **SC-1.** Capture is a single keyboard sequence with no mouse use.
- **SC-2.** Capture commit perceived latency < 100 ms (median).
- **SC-3.** Core screen interactive (input focused) < 2 s cold load.
- **SC-4.** Zero cross-user data exposure under isolation testing.
- **SC-5.** No committed entry is ever lost (survives reload, logout/login, restart).
- **SC-6.** Timeline and search stay responsive at ≥ 50k entries per user.
- **SC-7.** The full corpus is exportable to Markdown + JSON at any time.

---

## 9. Minimal V1 (the Musts at a glance)

A user registers and authenticates over HTTPS with credentials safely hashed and
strict per-user isolation enforced server-side. Once in, they capture an entry
from a focused-on-launch, keyboard-driven input with automatic timestamping;
it is stored as an immutable-on-creation, user-scoped document; they browse it in
a day-grouped reverse-chronological timeline, find it by full-text search, and
export their whole corpus to Markdown + JSON. The whole thing deploys via
configuration with no hard-coded secrets, serves a production client, and never
loses an entry. Everything else is refinement.

---

## Appendix: Revision history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-06-18 | Initial draft (single-user, local-first). |
| 0.2 | 2026-06-18 | Multi-user, hosting-ready revision. |
| 1.0 | 2026-06-18 | Baselined as canonical project SRS; integrated into enterprise docs and specs. |
