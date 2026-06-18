# Use Cases — Trace V1

**Status:** Baseline · **Last updated:** 2026-06-18

Actor-centric use cases that complement the requirement registers. Each maps to
functional requirements and to the [flow diagrams](../diagrams/trace-diagrams.md).
Format: brief, with primary flow and notable alternates.

**Actors:** **User** (authenticated account holder) · **Visitor** (unauthenticated) · **System**.

---

## UC-01 — Register an account

- **Actor:** Visitor → User
- **Precondition:** Not authenticated.
- **Trigger:** Visitor chooses to register.
- **Primary flow:**
  1. Visitor submits email + password.
  2. System validates input and confirms the email is unused.
  3. System creates the account, hashes the password, issues a session.
  4. User lands on the focused capture screen.
- **Alternates:** Email in use → clear error, route to login/reset. Invalid input → validation error.
- **Maps to:** FR-7.1, FR-7.2; NFR-4.2, NFR-4.4. Diagram: auth sub-flow.

## UC-02 — Sign in

- **Actor:** User
- **Precondition:** Has an account; not authenticated.
- **Primary flow:** User submits credentials → System verifies → session issued → capture screen.
- **Alternates:** Wrong credentials → error; repeated failures → rate-limited (FR-7.x, NFR-4.5).
- **Maps to:** FR-7.2, FR-7.3.

## UC-03 — Capture a moment *(core)*

- **Actor:** User
- **Precondition:** Authenticated, on the core screen.
- **Trigger:** User types and presses Enter.
- **Primary flow:**
  1. On screen load, the capture input is already focused.
  2. User types a moment (Shift+Enter for newlines).
  3. User presses Enter.
  4. System stamps `occurredAt = now`, sets immutable `createdAt`, persists the entry.
  5. Entry appears at the top of the timeline; input clears and re-focuses.
- **Alternates:** Empty input → no entry. Network blip → optimistic UI + retry, draft preserved.
- **Maps to:** FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-2.3, FR-1.6; NFR-1.2, NFR-3.6, NFR-7.1.

## UC-04 — Browse the timeline

- **Actor:** User
- **Primary flow:** User opens the core screen → entries shown newest-first, grouped by day → user scrolls → older entries load incrementally.
- **Maps to:** FR-3.1, FR-3.2, FR-3.3, FR-3.4; NFR-1.4, NFR-10.2.

## UC-05 — Search & filter

- **Actor:** User
- **Trigger:** User opens search (⌘K).
- **Primary flow:** User enters a query and/or selects a tag and/or a date range → System returns matching entries → user selects a result.
- **Maps to:** FR-4.1, FR-4.2, FR-4.3, FR-4.4; NFR-1.3.

## UC-06 — Browse by tag

- **Actor:** User
- **Primary flow:** User opens the tag index → sees tags with counts → selects a tag → timeline filters to that tag.
- **Maps to:** FR-5.1, FR-5.2.

## UC-07 — Edit / backdate an entry

- **Actor:** User
- **Primary flow:** User selects an entry → edits body and/or adjusts `occurredAt` → System refreshes `updatedAt`, keeps `createdAt`, re-sorts if time changed.
- **Maps to:** FR-2.1, FR-1.5.

## UC-08 — Soft-delete & restore an entry

- **Actor:** User
- **Primary flow:** User soft-deletes an entry (with confirm) → it disappears from views but persists → user restores it → it re-appears.
- **Maps to:** FR-2.2; NFR-2.3. Diagram: entry lifecycle.

## UC-09 — Export the corpus

- **Actor:** User
- **Primary flow:** User opens settings/export → chooses Markdown or JSON (optionally scoped) → System produces a downloadable file preserving all fields.
- **Maps to:** FR-6.1, FR-6.2, FR-6.3; NFR-5.1, NFR-5.2.

## UC-10 — Recover credentials

- **Actor:** User
- **Primary flow:** User requests reset by email → System sends a time-limited reset link (same response regardless of whether the email exists, to prevent enumeration) → user sets a new password → old sessions invalidated.
- **Maps to:** FR-7.5; NFR-4.4. Diagram: auth sub-flow.

## UC-11 — Delete account & data

- **Actor:** User
- **Primary flow:** User requests account deletion → System requires explicit confirmation (irreversible) → account and corpus removed → user logged out.
- **Maps to:** FR-7.6.

## UC-12 — Operate the service *(operator)*

- **Actor:** Deploying operator
- **Primary flow:** Operator deploys via configuration → monitors health (`/api/health`) and structured logs → performs backup/restore per runbook.
- **Maps to:** NFR-3.1–3.5, NFR-4.x; Constitution VI. Docs: [operations](../05-operations/).
