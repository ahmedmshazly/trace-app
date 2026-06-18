# ADR-0005: Store timestamps in UTC, display and group in local time

- **Status:** Accepted
- **Date:** 2026-06-18
- **Deciders:** Maintainer (Eng)
- **Related:** [data-model](../02-architecture/data-model.md), research [R-05](../../specs/001-foundation-and-capture/research.md), Constitution I & II

## Context

Time is the **primary key** of Trace's data model — `occurredAt` is the main
analysis axis and `createdAt` is the immutable ledger. The timeline groups entries
by **day**, and users can **backdate** entries. Users may travel across timezones
or use the app from multiple locations/devices. We must choose a single,
unambiguous time representation that keeps the corpus analysis-ready while keeping
the UI human.

## Decision

We will **store all timestamps as UTC instants** in the database, and **convert to
the user's local timezone for display and for computing day-group boundaries** on
the client. Timestamps cross the API as ISO-8601 UTC strings.

## Consequences

### Positive

- Unambiguous, correct ordering and comparison across timezones and DST — the corpus stays analysis-ready (Constitution II).
- Consistent behavior across devices for the same user.
- Day grouping ("Today"/"Yesterday"/date) is computed in the user's local day, matching human expectation (Constitution I).

### Negative / costs

- The client must do timezone conversion and local day-boundary math (a small, well-contained utility); edge cases (midnight, DST, backdating across a day boundary) need explicit tests.

### Neutral / notes

- Backdating changes `occurredAt` (UTC) and re-sorts the entry; `createdAt` (UTC) never changes.
- A future per-user "preferred timezone" setting can layer on top without changing storage.

## Alternatives considered

- **Store local wall-clock times** — rejected: ambiguous, breaks cross-device consistency and analysis, and mishandles DST.
- **Store UTC and also display in UTC** — rejected: violates the human/low-friction UI principle; "Today" must mean the user's today.
