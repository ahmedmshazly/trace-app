# ADR-0004: Soft-delete only (no hard delete) in V1

- **Status:** Accepted
- **Date:** 2026-06-18
- **Deciders:** Product + Maintainer (Eng)
- **Related:** [data-model](../02-architecture/data-model.md), [entry lifecycle diagram](../diagrams/trace-entry-lifecycle.mermaid), research [R-07](../../specs/001-foundation-and-capture/research.md), Constitution II, FR-2.2, NFR-2.3

## Context

The corpus is the product (Constitution II), and "no committed entry is ever lost"
(SC-5) is a core promise. Users will inevitably remove entries, sometimes by
mistake. We must decide whether deletion destroys data or hides it recoverably.

## Decision

In V1, deleting an entry performs a **soft delete**: a `deleted` boolean flag
hides the entry from all reads while preserving the document. A **restore**
operation flips it back. **No endpoint permanently destroys an entry in V1.** The
only bulk-erase path is explicit, confirmed **account deletion** (feature 004),
which is the deliberate exception for user data-ownership/erasure rights.

## Consequences

### Positive

- Accidental deletion is always recoverable (NFR-2.3); upholds the durability promise.
- Simpler, safer reads (filter `deleted: false`) and a clean state machine (`Draft → Committed ↔ SoftDeleted`).
- Preserves analysis-ready history.

### Negative / costs

- Storage grows with soft-deleted entries (negligible at V1 scale; revisit if it matters).
- "Delete" is not literal erasure, which must be communicated honestly; account deletion remains the true erase path.

### Neutral / notes

- All Entry reads exclude `deleted: true` unless explicitly restoring or exporting-with-deleted.
- Aligns with the entry-lifecycle diagram and the data-model invariants.

## Alternatives considered

- **Hard delete.** Rejected: irreversible; violates the durability promise and Constitution II.
- **Trash with TTL auto-purge.** Deferred: adds a background purge and a new "permanently gone" state; unnecessary complexity for V1 (Constitution VII). Could be revisited via a new ADR.
