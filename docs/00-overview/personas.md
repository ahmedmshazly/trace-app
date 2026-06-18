# Trace — Personas

**Status:** Draft · **Last updated:** 2026-06-18

Personas keep design and prioritization honest. V1 is built primarily for the
Primary persona; the others inform later roadmap decisions but must not pull
scope into V1.

---

## Primary — "The Self-Quantifier" (technical, detail-oriented)

| | |
|---|---|
| **Profile** | A developer / engineer / researcher who lives in the keyboard and the terminal. Comfortable with Markdown, values data ownership, skeptical of lock-in. |
| **Goal** | Keep an honest, high-resolution record of their days to later discover patterns (energy, mood, focus, habits) and improve. |
| **Behavior** | Logs many small moments per day, in-flow, without breaking concentration. Will abandon any tool that adds friction. |
| **Needs** | Instant, keyboard-only capture; data they can grep/export; privacy; a tool that gets out of the way. |
| **Frustrations** | Journaling apps that feel heavy; trackers that only capture predefined fields; anything that asks "is this worth saving?" |
| **Trace wins by** | Focused-on-load input, Enter-to-commit, sub-100 ms feedback, Markdown/JSON export, strict privacy. |

This persona maps directly to the V1 governing principle: **capture friction must
be near zero**.

## Secondary — "The Reflective Journaler"

| | |
|---|---|
| **Profile** | Keeps a daily or interstitial journal for reflection and wellbeing; less technical, but values a calm, focused writing space. |
| **Goal** | A trustworthy, private place to note what happened and how they felt, reviewable over time. |
| **Needs** | A quiet, low-stimulation interface; reliable persistence; the comfort that their data is theirs. |
| **Trace wins by** | Calm design, day-grouped timeline, recoverable deletion, export. |
| **V1 note** | Served by the same core loop; informs design tone, not extra features. |

## Future — "The Pattern Seeker" (V2+)

| | |
|---|---|
| **Profile** | An existing Trace user with months of corpus who now wants insight: trends, correlations, "things I didn't notice." |
| **Goal** | Turn the accumulated record into understanding and recommendations. |
| **Needs** | The analysis/insight engine, visualizations — all **out of scope for V1**. |
| **Why we name them now** | This persona is the reason the corpus must be clean and analysis-ready from day one (Constitution II). We build *for* them by getting the data right, not by building their features early. |

## Operator — "The Deployer" (internal)

| | |
|---|---|
| **Profile** | Whoever provisions and runs the hosted Trace service (initially the founder). |
| **Goal** | Deploy reliably, keep the service available, recover from incidents, never lose user data. |
| **Needs** | Config-driven deploys, health checks, structured logs, runbooks, backups. |
| **Trace serves them via** | [`../05-operations/`](../05-operations/) and Constitution VI (Observability & Operability). |

---

## Anti-persona (who Trace is *not* for in V1)

- **Teams wanting shared/collaborative logs** — V1 is strictly isolated single-user accounts; collaboration is out of scope.
- **Users needing offline-first mobile capture** — V1 requires a reachable backend; offline sync is deferred.
- **Users wanting a structured habit/metrics tracker** — Trace is free-text moments first; structure is derived later, not imposed at capture.
