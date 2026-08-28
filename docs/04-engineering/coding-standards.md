# Coding Standards: Trace

**Status:** Baseline · **Last updated:** 2026-06-18

Conventions that keep the codebase consistent, readable, and safe. Enforced by
tooling where possible (ESLint, Prettier, tsc) so reviews focus on substance.

---

## Language & general

- **TypeScript everywhere**, `strict` mode on (both `backend/` and `frontend/`).
- Prefer explicit types at module boundaries; let inference handle locals.
- No `any` except at well-justified, commented boundaries; prefer `unknown` + narrowing.
- Small, single-purpose modules; keep functions short and named by intent.
- **No dead code, no commented-out code** in commits.

## Formatting & linting

- **Prettier** is the single formatter; **ESLint** enforces correctness rules.
- CI fails on lint/format violations and type errors. Don't hand-format; run the tools.

## Comments

- Comment **why**, not **what**. The code says what it does.
- Avoid narrating comments (`// increment i`). Reserve comments for intent, trade-offs, and non-obvious constraints (Constitution / repo policy).
- Public service functions get a short doc comment describing contract + invariants (e.g. "scopes by userId").

## Naming

- `camelCase` variables/functions; `PascalCase` types/components; `UPPER_SNAKE` constants.
- Files: `kebab-case.ts` for modules; `PascalCase.tsx` for React components.
- Names reflect domain language from the [glossary](../00-overview/glossary.md) (`Entry`, `occurredAt`, `corpus`).

## Backend conventions

- **Layering is strict** ([architecture](../02-architecture/architecture-overview.md)): routes → middleware → services → models. Routes never touch the DB; services own business logic and the `userId` scope.
- **Validation at the boundary** with zod; never trust client input.
- **Isolation is centralized**: build every Entry query with `{ userId }` in the service layer, never scatter it.
- **Immutability respected**: never accept or mutate `createdAt`.
- **Errors**: throw typed/domain errors; the central error handler maps them to the [error envelope](../02-architecture/api-design.md).
- **No secrets in code**: read config only through the validated config module.
- **Logging**: structured logger only; never log entry content or secrets.

## Frontend conventions

- **Components are presentational + hooks for logic**; server state via TanStack Query, not ad-hoc fetch-in-effect.
- **Accessibility is not optional**: semantic HTML, labels, visible focus, keyboard paths (NFR-7.4).
- **Capture hot path** stays optimistic and never blocks on the network ([R-04](../../specs/001-foundation-and-capture/research.md)).
- **No business authority on the client**: treat all client-side checks as UX, with the server as the source of truth.
- Use the design tokens/theme; don't hardcode colors (dark mode is first-class).

## Tests

- Tests live beside the code's package under `tests/`.
- Critical paths (auth, isolation, capture, persistence) are tested first (Constitution IV).
- Tests are deterministic and hermetic (in-memory Mongo for integration).
- See [testing-strategy](./testing-strategy.md).

## Dependencies

- Add a dependency only when it earns its complexity (Constitution VII).
- Pin majors; prefer well-maintained, widely-used libraries.
- Architecturally significant additions get an [ADR](../adr/).

## Error & edge handling

- Handle the edge cases enumerated in specs (empty input, timezone boundaries, network blips, expired sessions). Don't swallow errors silently.
- Fail fast on misconfiguration at startup (validated config).

## Definition of "clean" for a PR

- Passes lint/format/typecheck/tests.
- No `any`-leaks, no dead code, no narrating comments.
- Isolation and immutability invariants preserved.
- Docs updated where behavior changed.
