# Trace — Backend (API)

The stateless **Express + MongoDB** REST API for Trace, implementing feature
[`001-foundation-and-capture`](../specs/001-foundation-and-capture/): email/password
auth with strict per-user isolation, the capture loop, the day-ordered timeline,
and recoverable entry curation.

- **Spec**: [`specs/001-foundation-and-capture/`](../specs/001-foundation-and-capture/)
- **Contract**: [`contracts/openapi.yaml`](../specs/001-foundation-and-capture/contracts/openapi.yaml)
- **Architecture**: [`docs/02-architecture/architecture-overview.md`](../docs/02-architecture/architecture-overview.md)
- **Config contract**: [`docs/04-engineering/environments.md`](../docs/04-engineering/environments.md)

---

## Stack

TypeScript (strict) · Node 22 · Express 4 · Mongoose 8 · zod (boundary validation)
· JWT (`jsonwebtoken`) · bcrypt (`bcryptjs`, pure-JS) · helmet · cors ·
express-rate-limit · pino (structured logs). Tests: Vitest + Supertest +
`mongodb-memory-server`.

## Quick start

```bash
cd backend
cp .env.example .env           # adjust as needed (see the config contract)
npm install
npm run dev                    # http://localhost:4000  (tsx watch)
```

Requires a MongoDB reachable at `MONGODB_URI` (local install or Docker). The
process **fails fast** if required configuration is missing or invalid.

```bash
curl -s http://localhost:4000/api/health        # { "status": "ok", ... }
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Run with reload (`tsx watch`) |
| `npm run build` | Compile to `dist/` (`tsc`) |
| `npm start` | Run the compiled server (`node dist/server.js`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm test` | Run the full Vitest suite |
| `npm run test:coverage` | Tests with V8 coverage |

## Configuration

All configuration is environment-driven and validated at startup
(`src/config`). See [`.env.example`](./.env.example) and the
[config contract](../docs/04-engineering/environments.md). Key variables:
`PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ALLOWED_ORIGINS`,
`LOG_LEVEL`, `RATE_LIMIT_*`. **No secrets in source**; `.env` is gitignored.

## Project layout

```text
src/
├── config/        validated env (zod, fail-fast)
├── lib/           logger, db, password, token, errors, async-handler
├── models/        Mongoose schemas + indexes (User, Entry)
├── middleware/    request-context, auth (JWT→userId), requireUser, rate-limit, error
├── routes/        health, auth, entries (zod validation at the boundary)
├── services/      business logic + the userId isolation scope (auth, entry)
├── app.ts         Express app factory (no listen) — used by tests and server
└── server.ts      bootstrap: connect DB → listen → graceful shutdown
tests/
├── unit/          password, token
├── integration/   auth, rate-limit, health, entry create/timeline/curate
└── isolation/     cross-user access denial
```

**Layering is strict**: routes → middleware → services → models. Routes never
touch the database; services own the `userId` scope (the single, auditable place
isolation is enforced). `createdAt` is never accepted from input or mutated.

## API surface (V1)

Base path `/api`. Full machine-readable contract:
[`openapi.yaml`](../specs/001-foundation-and-capture/contracts/openapi.yaml).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Liveness/readiness |
| POST | `/api/auth/register` | — | Create account → `{ token, user }` |
| POST | `/api/auth/login` | — | Authenticate → `{ token, user }` |
| POST | `/api/auth/logout` | bearer | Stateless logout (204) |
| GET | `/api/auth/me` | bearer | Current user |
| GET | `/api/entries` | bearer | Timeline (cursor-paginated): `?limit&cursor&includeDeleted` |
| POST | `/api/entries` | bearer | Capture an entry |
| PATCH | `/api/entries/:id` | bearer | Edit body / backdate `occurredAt` |
| DELETE | `/api/entries/:id` | bearer | Soft-delete (204) |
| POST | `/api/entries/:id/restore` | bearer | Restore a soft-deleted entry |

## Frontend integration notes

- **Auth**: `register`/`login` return `{ token, user }`. Send `Authorization:
  Bearer <token>` on every protected request. `401` means re-authenticate.
- **Timestamps** are ISO-8601 **UTC** strings; the client converts to local time
  and computes day-group boundaries (ADR-0005). `createdAt` is immutable.
- **Pagination**: `GET /api/entries` returns `{ items, nextCursor }`. Pass
  `nextCursor` back as `?cursor=` to load older entries; `null` means the end.
- **Errors** use one envelope: `{ "error": { "code", "message", "details?" } }`.
  Notable codes: `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401),
  `INVALID_CREDENTIALS` (401), `EMAIL_IN_USE` (409), `NOT_FOUND` (404),
  `RATE_LIMITED` (429). A foreign/missing entry is `404` (isolation: existence is
  never revealed).
- **CORS**: set the client origin in `ALLOWED_ORIGINS` (default
  `http://localhost:5173`). The client's `VITE_API_BASE_URL` should be
  `http://localhost:4000/api`.
- **Capture hot path**: the API stamps `occurredAt` (default now) and an immutable
  `createdAt`; the client renders optimistically and reconciles on the `201`.
- **Correlation**: every response carries `x-request-id` (echoed from the request
  if provided) for log correlation.

## Testing

```bash
npm test            # unit + integration + isolation (in-memory Mongo)
npm run test:coverage
```

The integration/isolation suites run against an ephemeral `mongodb-memory-server`
(no external Mongo needed). The **isolation** and **persistence** suites protect
the product's core promises and must always pass (Constitution IV). See the
[testing strategy](../docs/04-engineering/testing-strategy.md).
