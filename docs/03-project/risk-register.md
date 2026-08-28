# Risk Register: Trace

**Status:** Living document · **Last updated:** 2026-06-18

Risks to V1, scored and owned. Reviewed at each stage gate (see
[delivery-plan](./delivery-plan.md)).

**Likelihood / Impact:** Low / Med / High. **Exposure** = L×I (qualitative).

---

## Product & scope risks

| ID | Risk | L | I | Exposure | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-P1 | **Scope creep into the analysis engine** before a corpus exists: the single biggest product risk. | Med | High | High | Hard scope boundary in SRS + roadmap; V2 items require formal amendment; MoSCoW Musts only for GA. | Product |
| R-P2 | Capture friction creeps up (more chrome, more steps), eroding the core value. | Med | High | High | Constitution I as a gate on every PR; perf budgets (SC-2/3); keyboard-first e2e tests. | Product/Eng |
| R-P3 | Low adoption because the value compounds slowly (a sparse corpus isn't useful yet). | Med | Med | Med | Make day-1 capture delightful; emphasize export so early data is never wasted. | Product |

## Technical risks

| ID | Risk | L | I | Exposure | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-T1 | **Cross-user data leak** (isolation bug): catastrophic for a privacy product. | Low | High | High | Centralized `userId` scoping; dedicated isolation suite as a release-blocking gate (SC-4); `404` for non-owned resources. | Eng |
| R-T2 | Timeline/search degrades at scale (50k entries/user). | Med | Med | Med | Keyset pagination + compound index; scale benchmarks (NFR-1.3/10.2). | Eng |
| R-T3 | Optimistic capture diverges from server state on failure (lost/duplicated entries). | Med | Med | Med | Reconcile-on-confirm + retry; never drop draft text; persistence tests (SC-5). | Eng |
| R-T4 | Timezone/day-boundary bugs in grouping/backdating. | Med | Med | Med | Store UTC, group local (ADR-0005); explicit edge-case tests. | Eng |
| R-T5 | Secret leakage via committed config. | Low | High | Med | `.env` gitignored; validated config; secret store in hosted envs. | Eng/Ops |

## Process & delivery risks

| ID | Risk | L | I | Exposure | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-D1 | Single-maintainer bus factor. | Med | Med | Med | Thorough docs + specs so any contributor can pick up work; everything in version control. | Product/Eng |
| R-D2 | Docs drift from code (decisions made in code, not reflected in docs). | Med | Med | Med | "Docs updated" in Definition of Done; ADRs for decisions; traceability matrix maintained. | Eng |
| R-D3 | Code lands without spec/test grounding. | Med | High | High | SDD is non-negotiable (Constitution III); tests + CI gates; PR review. | Eng |

## Operational risks

| ID | Risk | L | I | Exposure | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-O1 | Data loss in production (no/late backups). | Low | High | Med | Backup + restore runbook before GA; managed DB with PITR; restore drills. | Ops |
| R-O2 | Outage with no diagnosis path. | Med | Med | Med | Health endpoint + structured logs + runbooks (Constitution VI). | Ops |
| R-O3 | Cost/availability of hosted MongoDB. | Low | Med | Low | Managed tier sized to V1; alerting; documented scaling path. | Ops |

## Security & privacy risks

| ID | Risk | L | I | Exposure | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R-S1 | Credential stuffing / brute force. | Med | Med | Med | Rate limiting; bcrypt; generic errors (NFR-4.5). | Eng |
| R-S2 | Entry bodies exposed at rest. | Low | High | Med | Encryption at rest; (field-level encryption considered for a future version). | Ops/Eng |
| R-S3 | Account enumeration via auth/reset responses. | Med | Low | Low | Uniform responses (NFR-4.4). | Eng |

---

## Top risks to watch (this stage)

1. **R-T1 / R-P1 / R-P2.** Isolation correctness, scope discipline, and capture friction are the three that most threaten the product's identity. Each has a hard, automated or process gate.

## Review cadence

Reviewed at every roadmap stage gate and whenever a new feature spec is opened.
New risks are added with an ID; closed risks are marked resolved with the date and
the control that closed them.
