# Trace — Documentation

Enterprise documentation for **Trace**, a personal, timestamped life-logging web
application (hosted, multi-user, MERN). This is the map; start here.

> **Governance:** the supreme document is the
> [Constitution](constitution.md). All documentation defers to
> it. Work is executed via **Spec-Driven Development**
> ([`specs/`](../specs/)).

---

## How the documentation is organized

Documentation is layered from *why* → *what* → *how* → *run*:

```
docs/
├── 00-overview/      Why Trace exists — vision, brief, personas, glossary
├── 01-requirements/  What V1 must do — SRS, FR/NFR registers, use cases, traceability
├── 02-architecture/  How it's built — overview, C4, data model, API, security, stack
├── 03-project/       How it's delivered — roadmap, delivery plan, risks, RACI
├── 04-engineering/   How we work — workflow, git, standards, testing, CI/CD, envs
├── 05-operations/    How it's run — deployment, runbook, observability, backup
├── adr/              Why we chose X — Architecture Decision Records
└── diagrams/         Flow & lifecycle diagrams (Mermaid)
```

## Reading paths by role

| You are… | Start with |
|---|---|
| **New to the project** | [Vision](00-overview/vision.md) → [Product Brief](00-overview/product-brief.md) → [Glossary](00-overview/glossary.md) |
| **Product / planning** | [SRS](01-requirements/srs.md) → [Roadmap](03-project/roadmap.md) → [Risk Register](03-project/risk-register.md) |
| **Engineer (building)** | [Constitution](constitution.md) → [Development Workflow](04-engineering/development-workflow.md) → [Architecture Overview](02-architecture/architecture-overview.md) → feature [`specs/001`](../specs/001-foundation-and-capture/) |
| **Engineer (specific decision)** | [ADRs](adr/) |
| **Operator** | [Deployment](05-operations/deployment.md) → [Runbook](05-operations/runbook.md) → [Backup & Recovery](05-operations/backup-recovery.md) |
| **Designer** | [Flow Diagrams](diagrams/trace-diagrams.md) → [Vision](00-overview/vision.md) → [SRS](01-requirements/srs.md) |

## Full index

### 00 · Overview
- [Vision](00-overview/vision.md) — the product thesis and the governing principle
- [Product Brief](00-overview/product-brief.md) — one-page orientation
- [Personas](00-overview/personas.md) — who Trace is (and isn't) for
- [Glossary](00-overview/glossary.md) — shared vocabulary

### 01 · Requirements
- [SRS](01-requirements/srs.md) — canonical Software Requirements Specification (v1.0)
- [Functional Requirements](01-requirements/functional-requirements.md) — FR register (30)
- [Non-Functional Requirements](01-requirements/non-functional-requirements.md) — NFR register (33)
- [Use Cases](01-requirements/use-cases.md) — UC-01..12
- [Traceability Matrix](01-requirements/traceability-matrix.md) — principle → requirement → story → design → test

### 02 · Architecture
- [Architecture Overview](02-architecture/architecture-overview.md)
- [C4 Model](02-architecture/c4-model.md)
- [Data Model (canonical)](02-architecture/data-model.md)
- [API Design](02-architecture/api-design.md)
- [Security Architecture](02-architecture/security.md)
- [Technology Stack](02-architecture/tech-stack.md)

### 03 · Project
- [Roadmap](03-project/roadmap.md) — stage-based
- [Delivery Plan](03-project/delivery-plan.md)
- [Risk Register](03-project/risk-register.md)
- [RACI & Roles](03-project/raci.md)

### 04 · Engineering
- [Development Workflow](04-engineering/development-workflow.md) — Spec-Driven Development
- [Git Workflow](04-engineering/git-workflow.md)
- [Coding Standards](04-engineering/coding-standards.md)
- [Testing Strategy](04-engineering/testing-strategy.md)
- [CI/CD](04-engineering/ci-cd.md)
- [Environments & Configuration](04-engineering/environments.md)

### 05 · Operations
- [Deployment](05-operations/deployment.md)
- [Runbook](05-operations/runbook.md)
- [Observability](05-operations/observability.md)
- [Backup & Recovery](05-operations/backup-recovery.md)

### ADRs
- [ADR Index](adr/README.md) — decisions 0001–0005

### Diagrams
- [Flow Diagrams](diagrams/trace-diagrams.md) — user flow, entry lifecycle, auth sub-flow

## Conventions

- All diagrams are **Mermaid** (render on GitHub / VS Code / mermaid.live).
- Documentation is part of the work: a behavior change with stale docs is incomplete (Definition of Done).
- Decisions of consequence become [ADRs](adr/); requirements stay traced in the [matrix](01-requirements/traceability-matrix.md).
