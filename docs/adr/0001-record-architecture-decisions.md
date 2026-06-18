# ADR-0001: Record architecture decisions (use ADRs)

- **Status:** Accepted
- **Date:** 2026-06-18
- **Deciders:** Maintainer (Eng)
- **Related:** Constitution (Technology & Architecture Standards, Governance)

## Context

Trace is built spec-first. Significant technical
decisions need a durable, discoverable rationale so future contributors understand *why* a choice was made and don't silently re-litigate or
contradict it. The Constitution already mandates ADRs for stack/auth/schema/
hosting decisions; this ADR formalizes the practice itself.

## Decision

We will record significant architecture decisions as **Architecture Decision
Records (ADRs)** stored in `docs/adr/`, one file per decision, numbered
sequentially, following Michael Nygard's lightweight template. ADRs are immutable
once **Accepted**; a changed decision is captured by a **new** ADR that supersedes
the old one.

## Consequences

### Positive

- A traceable, append-only history of *why* the system is the way it is.
- Onboarding is faster; decisions aren't buried in chat or commits.
- Reinforces Spec-Driven Development: decisions are explicit artifacts.

### Negative / costs

- A small, ongoing discipline cost to write and maintain ADRs.

### Neutral / notes

- ADRs complement (don't replace) the feature `research.md` decision logs; feature-local choices live there, project-wide/architectural ones become ADRs.

## Alternatives considered

- **Decisions only in commit messages / PRs** — rejected: not discoverable, scatters rationale.
- **A single "decisions" wiki page** — rejected: grows unwieldy, no per-decision status/supersession.
