# RACI & Roles: Trace

**Status:** Baseline · **Last updated:** 2026-06-18

Who does what. **R**esponsible (does the work) · **A**ccountable (owns the
outcome, one per row) · **C**onsulted (gives input) · **I**nformed (kept aware).

> Trace is currently maintained by a single person working under the
> [Constitution](../constitution.md). The RACI still matters: it names *which hat* is
> worn for each decision, and scales cleanly if the team grows.

---

## Roles

| Role | Description |
|---|---|
| **Product** | Owns vision, scope, priorities, the SRS, and the roadmap. |
| **Eng** | Owns architecture, implementation, tests, and code quality. |
| **Ops** | Owns deployment, availability, backups, and incident response. |
| **Maintainer** | The accountable human (currently one person wearing all hats). |

## RACI by activity

| Activity | Product | Eng | Ops | Maintainer (A default) |
|---|---|---|---|---|
| Define/amend the Constitution | C | C | C | **A/R** |
| Author/approve a feature spec | **A/R** | C | I | A |
| Clarify ambiguous requirements | A | C | I | A |
| Produce implementation plan | C | **A/R** | C | A |
| Generate task breakdown | I | **A/R** | I | A |
| Implement code & tests | I | **A/R** | I | A |
| Review & approve PR | C | **A/R** | C | A |
| Maintain docs & traceability | C | **A/R** | C | A |
| CI/CD pipeline | I | **A/R** | C | A |
| Deploy to production | I | C | **A/R** | A |
| Backups & restore drills | I | C | **A/R** | A |
| Incident response | I | C | **A/R** | A |
| Security review | C | **A/R** | C | A |
| Risk register upkeep | **A/R** | C | C | A |
| Roadmap & release decisions | **A/R** | C | C | A |

## Decision rights

- **Scope of V1.** Product is accountable; changes require an SRS update.
- **Principles.** Changing a Constitution principle requires a Maintainer-approved amendment (semantic version bump).
- **Architecture of consequence.** Eng is accountable; recorded as an ADR.
- **Go/no-go to deploy.** Ops is accountable, gated on Eng's quality sign-off.

## Escalation

Blocking ambiguity → escalate to Product (scope) or Eng (technical). Principle
conflicts → escalate to Maintainer for a Constitution decision.
