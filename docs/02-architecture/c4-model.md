# C4 Model: Trace

**Status:** Baseline · **Last updated:** 2026-06-18

The [C4 model](https://c4model.com) describes the system at increasing zoom:
**Context → Container → Component**. Code-level (Level 4) is left to the source.
Diagrams are Mermaid so they render in GitHub/VS Code.

---

## Level 1: System Context

Who uses Trace and what it depends on.

```mermaid
flowchart TB
    user["End User<br/>(self-quantifier / journaler)"]
    operator["Deploying Operator"]

    subgraph trace["Trace: personal life-logging system"]
        sys["Trace web application"]
    end

    user -->|"Captures & reviews moments (HTTPS)"| sys
    operator -->|"Deploys, monitors, backs up"| sys

    %% V1 has no external integrations by design
    note["No external service integrations in V1<br/>(calendar/health/analysis are future)"]
```

**Notes:** V1 has **no** third-party integrations. Email delivery for password
reset (feature 004) will be the first external dependency.

## Level 2: Containers

The deployable/executable units.

```mermaid
flowchart TB
    user["End User (browser)"]

    subgraph trace["Trace"]
        spa["Web Client<br/>[React + Vite SPA]<br/>Capture UI, timeline, optimistic UI"]
        api["API Service<br/>[Node + Express, TypeScript]<br/>REST/JSON, stateless, JWT"]
        db[("Database<br/>[MongoDB]<br/>users, entries")]
    end

    user -->|HTTPS/JSON| spa
    spa -->|"HTTPS/JSON (Bearer JWT)"| api
    api -->|Mongoose driver| db
```

| Container | Tech | Responsibility |
|---|---|---|
| Web Client | React 18 + Vite, TS | Capture surface, timeline, search/tag/export UI, optimistic UI, focus & day-grouping |
| API Service | Node 22 + Express, TS | AuthN/AuthZ, isolation, entry CRUD, pagination, export; the only writer to the DB |
| Database | MongoDB 7 | Persistent store of users and entries |

## Level 3: Components (API Service)

Inside the API container.

```mermaid
flowchart TB
    subgraph api["API Service"]
        routes["Routes<br/>auth · entries · health"]
        mw["Middleware<br/>auth(JWT→userId) · requireUser · rateLimit · errorHandler"]
        authsvc["Auth Service<br/>register/login/logout/me"]
        entrysvc["Entry Service<br/>create/list/update/softDelete/restore<br/>(owns userId scoping)"]
        models["Models<br/>User · Entry (+indexes)"]
        cfg["Config<br/>(validated env)"]
        log["Logger<br/>(structured, no content)"]
    end
    db[("MongoDB")]

    routes --> mw
    mw --> authsvc
    mw --> entrysvc
    authsvc --> models
    entrysvc --> models
    models --> db
    routes -.-> cfg
    routes -.-> log
```

## Level 3: Components (Web Client)

Inside the client container.

```mermaid
flowchart TB
    subgraph spa["Web Client"]
        pages["Pages<br/>Login · Register · Capture(core) · Settings"]
        capture["CaptureInput<br/>(focus-on-load, Enter commit, optimistic)"]
        timeline["Timeline<br/>TimelineEntry · DayHeader · infinite scroll"]
        apilayer["API layer<br/>typed client + TanStack Query hooks"]
        ctx["Auth context + theme"]
        util["Day-grouping (local tz)"]
    end
    api["API Service"]

    pages --> capture
    pages --> timeline
    capture --> apilayer
    timeline --> apilayer
    timeline --> util
    apilayer -->|HTTPS Bearer| api
    pages -.-> ctx
```

---

## Mapping to requirements

| C4 element | Requirements |
|---|---|
| API Service · isolation middleware | FR-7.4, NFR-4.3 |
| API Service · Entry Service | FR-1.*, FR-2.*, FR-3.4 |
| Web Client · CaptureInput | FR-1.1, FR-1.3, FR-1.4; NFR-1.2, NFR-7.1 |
| Web Client · Timeline + grouping | FR-3.1, FR-3.2; NFR-1.4 |
| Database · indexes | NFR-1.3, NFR-10.2 |

See the full [traceability matrix](../01-requirements/traceability-matrix.md).
