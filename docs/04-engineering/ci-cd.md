# CI/CD — Trace

**Status:** Baseline (pipeline to be wired in Stage 4 / feature 004) · **Last updated:** 2026-06-18

Continuous Integration enforces the quality gates on every change; Continuous
Delivery promotes `main` to environments via configuration. Constitution IV (gates)
and VI (config-driven deploy) drive this design.

---

## Principles

- **Every PR runs the full gate suite.** A red pipeline blocks merge.
- **`main` stays releasable.** Only green, reviewed changes land.
- **Config-driven promotion.** The same artifacts run in every environment, differing only by configuration/secrets ([environments](./environments.md)).
- **Secrets come from the platform**, never the repo.

## CI pipeline (on every pull request)

```mermaid
flowchart LR
    A[Checkout] --> B[Install]
    B --> C[Lint + Format check]
    C --> D[Typecheck]
    D --> E[Unit tests]
    E --> F[Integration tests\n(in-memory Mongo + isolation suite)]
    F --> G[Build client + server]
    G --> H[E2E (Playwright)\nfor UI-affecting changes]
    H --> I{All green?}
    I -- yes --> J[Mergeable]
    I -- no --> K[Blocked]
```

| Stage | Tool | Gate |
|---|---|---|
| Lint + format | ESLint + Prettier | No violations |
| Typecheck | tsc `--noEmit` | No type errors |
| Unit | Vitest | All pass |
| Integration | Vitest + Supertest + `mongodb-memory-server` | All pass — **incl. isolation suite (release-blocking)** |
| Build | Vite / tsc | Both packages build |
| E2E | Playwright | Capture loop + auth isolation pass |

## Sample workflow (illustrative)

To be added as `.github/workflows/ci.yml` when the app code lands (Stage 1+):

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [backend, frontend]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: ${{ matrix.package }}/package-lock.json }
      - run: npm ci
        working-directory: ${{ matrix.package }}
      - run: npm run lint
        working-directory: ${{ matrix.package }}
      - run: npm run typecheck
        working-directory: ${{ matrix.package }}
      - run: npm test
        working-directory: ${{ matrix.package }}
      - run: npm run build
        working-directory: ${{ matrix.package }}
  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      # install, build, start API+client, then:
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        working-directory: frontend
```

> Integration tests use `mongodb-memory-server`, so CI needs **no external
> MongoDB** for unit/integration. E2E may use a service container or an ephemeral
> Mongo.

## Branch protection (recommended, Stage 4)

- Require the CI checks to pass before merge.
- Require at least one review.
- Disallow force-push to `main`; keep history linear (squash/rebase).

## CD / promotion model

- **Build once** (immutable artifacts: server bundle + static client).
- **Promote by config**: `dev` → `staging` → `prod` differ only by environment variables and secrets.
- The **stateless API** allows rolling redeploys without sticky sessions (NFR-3.4).
- A deploy is gated on the release-blocking checks and a healthy `/api/health` after rollout. See [deployment](../05-operations/deployment.md).

## Release gating (Stage 4 / GA)

A release may proceed only when:

- CI is green on `main`.
- Release-blocking NFRs hold: isolation (SC-4), no-data-loss (SC-5), HTTPS, hashed credentials, config-driven deploy, export.
- Runbooks and backups exist ([operations](../05-operations/)).

## Future enhancements (post-GA)

- Dependency vulnerability scanning in CI.
- Preview deployments per PR.
- Automated performance budgets in CI (capture latency, search).
