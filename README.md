# Trace

> A frictionless personal timeline where the unit of writing is a **moment**, not
> a line — an effortless, plain-text-portable record of your days that you can
> later mine for patterns.

Trace is a personal, timestamped life-logging web application, delivered as a
**hosted, multi-user MERN** app. Every entry is automatically anchored to *when*
it happened; time is the primary key of your record. The governing principle is
simple and ruthless: **capture friction must be near zero.**

**Status:** In development — V1 fully specified & governed; the **backend
(feature 001)** is implemented and tested; the **frontend web client** is
implemented and deployable to Vercel.

---

## What's here

This repository contains the governed foundation, the V1 **UI/UX design layer**
(wireframes + dark-first color system), a Spec-Driven Development setup
in which **all four V1
features (001–004) are fully specified, planned, and tasked**, and the
**implemented backend** for feature 001 (stateless Express/MongoDB API with
per-user isolation, the capture loop, the day-ordered timeline, and curation).
The frontend (`frontend/`) is built next against these specs.

```
.
├── backend/         Implemented API (feature 001) — Express · Mongoose · TypeScript
├── frontend/        React web client (Vite) — wired to the API, Vercel-ready
├── api/             Vercel serverless entry (rewrites /api/* to Express)
├── vercel.json      Production deployment config (static client + serverless API)
├── specs/           Feature specs (Spec-Driven Development)
│   ├── 001-foundation-and-capture/   spec · plan · research · data-model · contracts · tasks
│   ├── 002-search-and-tags/          ⌘K search, inline #tags, filters, tag index
│   ├── 003-export-portability/       Markdown/JSON export, scope, round-trip import
│   └── 004-hardening-and-deploy/     reset, settings, theme, danger zone, GA gates
├── docs/            Enterprise documentation (start at docs/README.md)
│   ├── constitution.md   <- the project's supreme governing document
│   ├── 00-overview · 01-requirements · 02-architecture
│   ├── 03-project  · 04-engineering  · 05-operations
│   ├── 06-design/   UI/UX spec · color system (dark-first) · component inventory
│   ├── adr/         Architecture Decision Records
│   └── diagrams/    Mermaid flow & lifecycle diagrams
├── .github/workflows/  CI (lint · format · typecheck · test · build)
└── README.md        (this file)
```

## Start here

| If you want… | Go to |
|---|---|
| The big picture | [docs/00-overview/vision.md](docs/00-overview/vision.md) |
| The full doc map | [docs/README.md](docs/README.md) |
| What V1 must do | [docs/01-requirements/srs.md](docs/01-requirements/srs.md) |
| How it's built | [docs/02-architecture/architecture-overview.md](docs/02-architecture/architecture-overview.md) |
| The governing rules | [docs/constitution.md](docs/constitution.md) |
| The first feature | [specs/001-foundation-and-capture/](specs/001-foundation-and-capture/) |
| The implemented API | [backend/README.md](backend/README.md) |
| The UI/UX design & color system | [docs/06-design/](docs/06-design/README.md) |
| The flow diagrams | [docs/diagrams/trace-diagrams.md](docs/diagrams/trace-diagrams.md) |

## How we work — Spec-Driven Development

Every Trace feature flows:

**Constitution → Specify → Clarify → Plan → Tasks → Implement**

No code without a spec; no spec without the Constitution. See
[docs/04-engineering/development-workflow.md](docs/04-engineering/development-workflow.md).

## Tech stack (V1)

**MERN + TypeScript** — MongoDB · Express · React (Vite) · Node.js. Stateless JWT
API, strict per-user data isolation, local-first development promoted to a host by
configuration. Rationale: [ADR-0002](docs/adr/0002-mern-stack.md),
[docs/02-architecture/tech-stack.md](docs/02-architecture/tech-stack.md).

## Roadmap (stage-based)

`Stage 0 Foundations ✓` → `001 Foundation & Capture (backend ✓ · frontend ✓)` →
`002 Search & Tags` → `003 Export` → `004 Hardening & Deploy (V1 GA)` →
`V2+ Analysis engine`. See [docs/03-project/roadmap.md](docs/03-project/roadmap.md).

## Principles (the short version)

1. **Capture friction is sacred** — logging is effortless or it's broken.
2. **The corpus is the product** — you own it; export anytime.
3. **Spec-Driven Development** — specs precede code, always.
4. **Test-first & quality gates** — critical paths are proven, CI gates merges.
5. **Security & privacy by default** — strict per-user isolation; no content telemetry.
6. **Observability & operability** — runnable, recoverable, debuggable.
7. **Simplicity & YAGNI** — build the smallest thing that satisfies the spec.

Full text: [the Constitution](docs/constitution.md).

## Deploy to Vercel

Trace ships with a production-ready Vercel configuration: the React client is
served as static assets and the Express API runs as a serverless function on the
same origin (`/api/*`).

### Prerequisites

- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or other managed MongoDB reachable from Vercel).
- A Vercel account linked to this repository.

### One-time setup

1. Import the repo in [Vercel](https://vercel.com/new).
2. Leave **Framework Preset** as *Other* (configured via `vercel.json`).
3. Add environment variables from [`.env.example`](.env.example):
   - `MONGODB_URI` — your Atlas connection string
   - `JWT_SECRET` — generate with `openssl rand -hex 32`
   - `ALLOWED_ORIGINS` — `https://trace.ahmdmshazly.me` (optionally keep `*.vercel.app` aliases)
   - `APP_ORIGIN` — `https://trace.ahmdmshazly.me`
   - `NODE_ENV=production`
4. Push to `main` (GitHub → Vercel) or `vercel --prod`.

Off-box durability (Atlas PITR + nightly S3 via OIDC): see
[docs/05-operations/aws-backup.md](docs/05-operations/aws-backup.md).

### Verify after deploy

```bash
curl -s https://trace.ahmdmshazly.me/api/health
```

See [docs/05-operations/deployment.md](docs/05-operations/deployment.md) for
the full release procedure, rollback, and post-deploy checklist.
