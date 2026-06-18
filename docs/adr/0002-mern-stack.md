# ADR-0002: Adopt the MERN stack with TypeScript

- **Status:** Accepted
- **Date:** 2026-06-18
- **Deciders:** Product + Maintainer (Eng)
- **Related:** [tech-stack](../02-architecture/tech-stack.md), [SRS](../01-requirements/srs.md), Constitution (Technology & Architecture Standards)

## Context

Trace V1 is a hosted, multi-user web application with a GUI front-end. We need a
stack that supports: a fast, modern SPA (frictionless capture), a stateless REST
API (hostable/scalable), and a flat, time-keyed, export-friendly document store
(the corpus). The product owner explicitly chose a GUI built with the **MERN**
stack. Team familiarity and a single language across tiers are valuable for a
small/single-maintainer team.

## Decision

We will build Trace on **MERN** — **M**ongoDB, **E**xpress, **R**eact,
**N**ode.js — with **TypeScript** across both the API and the client. The
repository is organized as two packages, `backend/` and `frontend/`, with a strict
API/UI separation (NFR-8.1).

## Consequences

### Positive

- One language (TypeScript) end-to-end; shared types around the API contract.
- React + Vite enable the optimistic, low-latency capture UI (Constitution I).
- MongoDB's document model maps cleanly onto the flat `Entry` schema and keeps the corpus export-friendly (Constitution II).
- Stateless Express API satisfies the hostable/scalable requirement (NFR-3.4).
- Large ecosystem, abundant references — low complexity (Constitution VII).

### Negative / costs

- MongoDB is a document store, not plain text; data portability must be *engineered* via export (FR-6.1/6.2) rather than being inherent. We accept this and make export a release-blocking Must.
- No relational integrity guarantees; invariants (isolation, immutability) must be enforced in the application layer.

### Neutral / notes

- "Local-first development, hosted via configuration" is a stack-agnostic standard layered on top (Constitution; [environments](../04-engineering/environments.md)).

## Alternatives considered

- **PostgreSQL-based stack** — rejected for V1: the owner chose MERN; the document model fits; relational features aren't needed for the flat schema. (Revisit only via a new ADR.)
- **A CLI-first tool** (originally floated) — rejected: the owner chose a GUI.
- **Next.js full-stack** — deferred: a clean API/SPA split keeps the contract explicit and the API independently hostable; can revisit if SSR needs emerge.
