# Observability — Trace

**Status:** Baseline · **Last updated:** 2026-06-18

What we can see, we can run. This document defines logging, health, metrics, and
alerting for Trace — designed around a hard privacy constraint: **observability
never exposes user entry content or secrets** (Constitution V & VI).

---

## The privacy constraint (non-negotiable)

> Logs, metrics, and traces may contain operational metadata (timestamps, route,
> status, latency, correlation id, `userId` as an opaque reference) but **never**
> entry bodies, email contents, passwords, tokens, or secrets.

This is a review item and a release-blocking expectation (NFR-4.6).

## Health checks

- **`GET /api/health`** — liveness/readiness probe returning status + uptime (NFR-3.5).
- Used by the platform for rollout gating and by the [runbook](./runbook.md) for diagnosis.
- Post-deploy verification requires a healthy response before traffic shift.

## Logging

- **Structured logs** (JSON) via a structured logger (e.g. pino), to stdout, collected by the platform.
- Each request carries a **correlation id** so a user-reported issue can be traced end-to-end.
- **Levels**: `error` (actionable failures), `warn` (degradations), `info` (lifecycle + request summary), `debug` (dev only).
- **Never logged**: entry `body`, credentials, tokens, full secrets. `userId` is logged as an opaque id only.

Example (shape, illustrative):

```json
{ "level":"info", "ts":"2026-06-18T14:02:00Z", "reqId":"abc123",
  "method":"POST", "route":"/api/entries", "status":201, "ms":18, "userId":"u_…" }
```

## Metrics (Stage 4+)

Operational signals to track:

| Metric | Why |
|---|---|
| Request rate / error rate / latency (per route) | Health + the capture latency budget (SC-2). |
| Capture commit latency (server side) | Core performance promise. |
| Timeline/search latency at volume | NFR-1.3, NFR-10.2. |
| Auth failure / rate-limit hits | Abuse detection (NFR-4.5). |
| DB connection health & query latency | Upstream health. |
| Process health (CPU/mem/uptime) | Capacity & leaks. |

## Tracing (future)

Correlation ids are the V1 mechanism. Distributed tracing is unnecessary with a
single backend service; revisit only if the architecture grows (with an ADR).

## Alerting (Stage 4+)

Alert on symptoms users feel, not noise:

| Alert | Trigger (example) |
|---|---|
| Service unhealthy | `/api/health` failing across instances |
| Error spike | error rate above baseline |
| Latency breach | capture/timeline latency exceeds budget |
| Auth abuse | rate-limit hits spike |
| DB issues | connection failures / query latency spike |
| Backup failure | a scheduled backup did not complete |

Sev1 alerts (privacy/data-integrity) page the accountable human immediately.

## Dashboards (Stage 4+)

A minimal operational dashboard: request/error/latency, capture latency, auth
metrics, DB health, backup status. Deliberately **not** a product-analytics
dashboard — we do not analyze entry content.

## Verification

- An automated test asserts `/api/health` behavior (NFR-3.5).
- Log-content review (no entry content/secrets) is part of security review pre-GA.
