# Technology Stack — Trace

**Status:** Baseline · **Last updated:** 2026-06-18

The chosen technologies and why. Stack-level decisions are recorded as
[ADRs](../adr/). Deviations from this stack require an ADR (Constitution).

---

## Summary

**MERN + TypeScript**, two packages (`backend/`, `frontend/`), local-first dev,
hosted via configuration. See [ADR-0002](../adr/0002-mern-stack.md).

## Backend

| Concern | Choice | Why |
|---|---|---|
| Runtime | Node.js 22 LTS | Long-term support; single language across tiers. |
| Language | TypeScript 5 | Type safety across the contract; fewer runtime errors. |
| Web framework | Express 4 | Minimal, ubiquitous, well-understood (Constitution VII). |
| ODM | Mongoose 8 | Schema, indexes, validation, typed queries over MongoDB. |
| Auth | jsonwebtoken + bcrypt | Stateless JWT; salted password hashing ([ADR-0003](../adr/0003-jwt-authentication.md)). |
| Validation | zod | Single validation layer at the boundary; infer types ([R-08](../../specs/001-foundation-and-capture/research.md)). |
| Hardening | helmet, cors, express-rate-limit | Security headers, origin allowlist, brute-force defense. |
| Logging | structured logger (e.g. pino) | Correlatable logs without entry content (Constitution VI). |

## Frontend

| Concern | Choice | Why |
|---|---|---|
| UI library | React 18 | Mandated by MERN; mature ecosystem. |
| Build/dev | Vite 5 | Fast dev server + optimized production build (NFR-3.3). |
| Language | TypeScript 5 | Shared types with the API contract. |
| Routing | React Router | Standard SPA routing. |
| Server state | TanStack Query | Caching + optimistic updates for the capture hot path ([R-04](../../specs/001-foundation-and-capture/research.md)). |
| Styling | lightweight, token-driven | Calm, accessible design from the design system; dark mode first-class. |

## Datastore

| Concern | Choice | Why |
|---|---|---|
| Database | MongoDB 7 | Document model fits the flat, time-keyed Entry; mandated by MERN. |
| Local dev | local MongoDB (or Docker) | Local-first development (Constitution). |
| Hosted | managed MongoDB | Backups, encryption at rest, availability (ops). |

## Tooling & quality

| Concern | Choice | Why |
|---|---|---|
| Unit tests | Vitest | Fast, TS-native (both packages). |
| API integration | Supertest + `mongodb-memory-server` | Hermetic, real query/index behavior ([R-09](../../specs/001-foundation-and-capture/research.md)). |
| End-to-end | Playwright | Capture loop + auth isolation in a real browser. |
| Lint/format | ESLint + Prettier | Consistent, enforced in CI. |
| API contract | OpenAPI 3.1 | Documented, testable contract (NFR-8.3). |
| SDD workflow | Markdown specs in `specs/` | Constitution → spec → plan → tasks → implement. |
| Diagrams | Mermaid | Plain-text, diffable, renders in GitHub/VS Code. |
| CI | GitHub Actions (planned) | Lint + typecheck + test gates ([ci-cd](../04-engineering/ci-cd.md)). |

## Versions & support policy

- Pin major versions; track LTS for Node and the current stable for MongoDB.
- Dependencies are updated deliberately; security advisories are acted on promptly.
- New dependencies must justify their complexity (Constitution VII) and, if architecturally significant, get an ADR.

## Rejected / deferred technologies

| Option | Status | Reason |
|---|---|---|
| PostgreSQL (relational) | Rejected for V1 | MERN mandates MongoDB; the flat document fits the model. (Revisit only via ADR.) |
| argon2 password hashing | Deferred | bcrypt is sufficient for V1; heavier native dep. |
| Microservices / queue / cache tier | Deferred | YAGNI for V1 scale (Constitution VII). |
| Redux / heavy state lib | Rejected | TanStack Query covers server state; local UI state is light. |
| Server-side sessions | Rejected | Stateless API requirement (NFR-3.4). |
