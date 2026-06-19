# Architecture Decision Records (ADRs)

This directory records the **significant** technical decisions for Trace — the
ones that are expensive to reverse or that future contributors will ask "why?"
about. ADRs are short, immutable once accepted, and superseded (never edited)
when a decision changes.

Format follows [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-record).

## When to write an ADR

Write one when a decision:

- Is architecturally significant (stack, storage, auth, schema, hosting, cross-cutting patterns).
- Is hard or costly to reverse.
- Deviates from a default or a Constitution standard.
- Future-you would want the rationale for.

ADRs are required by the [Constitution](../constitution.md)
(Technology & Architecture Standards) for stack/auth/schema/hosting decisions.

## Lifecycle

`Proposed → Accepted → (later) Superseded by ADR-XXXX`. Accepted ADRs are not
edited; a new ADR supersedes an old one.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](./0001-record-architecture-decisions.md) | Record architecture decisions (use ADRs) | Accepted |
| [0002](./0002-mern-stack.md) | Adopt the MERN stack with TypeScript | Accepted |
| [0003](./0003-jwt-authentication.md) | JWT bearer auth with bcrypt password hashing | Accepted |
| [0004](./0004-soft-delete.md) | Soft-delete only (no hard delete) in V1 | Accepted |
| [0005](./0005-utc-storage-local-display.md) | Store timestamps in UTC, display/group in local time | Accepted |
| [0006](./0006-design-tokens-and-theming.md) | Dark-first, two-theme semantic design-token system | Accepted |

## Template

Copy [`0000-template.md`](./0000-template.md) for a new record and give it the
next number.
