# Local Development: Trace

**Status:** Baseline · **Last updated:** 2026-06-20

How to bring the Trace **backend** up on a developer machine and verify it like
the real thing, a real MongoDB, a validated `.env`, the full test suites, a live
API acceptance run, and an optional Docker stack that mirrors a hosted deploy.

This is the concrete, machine-verified companion to the feature
[quickstart](../../specs/001-foundation-and-capture/quickstart.md) and the
[environments contract](../04-engineering/environments.md).

> Scope: the backend (feature 001). There is no `frontend/` yet, so "testing"
> here means **API testing + the automated code test suites**.

---

## Prerequisites

| Tool | Version used | Notes |
|---|---|---|
| Node.js | 22 LTS (`v22.x`) | `engines: >=22`. Managed via `nvm`; see `backend/.nvmrc`. |
| npm | 10.x | Ships with Node 22. |
| MongoDB | 8.0 Community | Real `mongod` on `localhost:27017`. |
| `mongosh` | 2.x | DB shell, used for verification. |
| Docker + Compose v2 | optional | Only for the production-like container stack. |
| `curl`, `jq` | any recent | Used by the smoke test. |

### Install Node 22 (nvm)

```bash
nvm install 22          # downloads Node 22 LTS + npm
nvm use 22              # or: cd backend && nvm use   (reads .nvmrc)
node -v && npm -v
```

> On some setups the editor-bundled `node` has no `npm` on PATH. Always run a
> shell where `nvm use 22` has been sourced before `npm` commands.

### Install MongoDB 8.0 (Ubuntu/Pop!_OS 24.04 "noble")

```bash
# Repo key + source
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
  | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install + run as a systemd service
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod

# Verify
mongosh --quiet --eval "db.runCommand({ ping: 1 })"   # → { ok: 1 }
```

Other platforms: install MongoDB Community 7/8 by their docs, or use the Docker
stack below, anything that exposes a `mongod` at the URI in `.env` works.

---

## 1. Configure the environment

Configuration is environment-driven and **validated at startup**, the process
fails fast on missing/invalid values (`backend/src/config/index.ts`).

```bash
cd backend
cp .env.example .env
# Set a strong secret (JWT_SECRET must be >= 16 chars):
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env
```

`.env` is gitignored and must never be committed. The committed
[`.env.example`](../../backend/.env.example) documents every variable.

| Variable | Local value | Meaning |
|---|---|---|
| `NODE_ENV` | `development` | Standard Node env |
| `PORT` | `4000` | API listen port |
| `MONGODB_URI` | `mongodb://localhost:27017/trace_dev` | Connection string |
| `JWT_SECRET` | *(generated)* | Token signing key: secret |
| `JWT_EXPIRES_IN` | `7d` | Access-token lifetime |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS allowlist |
| `LOG_LEVEL` | `info` | Logger level |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | `900000` / `10` | Auth rate limit |

> **How `.env` is loaded:** the app code reads only `process.env` (12-factor, in
> hosted envs the platform injects config). For local convenience the `dev` and
> `start` npm scripts pass Node's `--env-file-if-exists=.env`, so `npm run dev`
> just works after you create `.env`. Tests set their own env in
> `tests/setup.ts` and ignore `.env`.

---

## 2. Install and run

```bash
cd backend
npm install
npm run dev      # tsx watch → http://localhost:4000
```

Healthy startup logs `MongoDB connected` and `Trace API listening`. Verify:

```bash
curl -s http://localhost:4000/api/health | jq
# → { "status": "ok", "uptime": <n>, "db": "connected" }
```

Run the compiled artifact (what production runs):

```bash
npm run build && npm start    # node dist/server.js
```

---

## 3. Verify: automated tests

```bash
npm test               # unit + integration + isolation (in-memory Mongo)
npm run test:coverage  # same, with a V8 coverage report
```

The integration/isolation suites spin up an ephemeral `mongodb-memory-server`
(no external Mongo needed; the first run downloads the mongod binary). See the
[testing strategy](../04-engineering/testing-strategy.md).

Last verified run: **9 test files / 32 tests passing**; coverage **~89% statements,
93% functions**.

---

## 4. Verify: live API acceptance

With the server running (`npm run dev`), run the scripted end-to-end smoke test:

```bash
cd backend
BASE_URL=http://localhost:4000/api ./scripts/smoke-api.sh
```

It exercises health, auth (register/login/me + duplicate/bad-password/no-token
errors), capture, timeline + cursor pagination, curation (edit/backdate/
soft-delete/restore, `createdAt` immutability), **cross-user isolation**, and
auth **rate limiting**, printing PASS/FAIL per check. Last verified: **42/42
passing**. Details and a manual request collection (`backend/api.http`) are in
[API testing](../04-engineering/api-testing.md).

> The rate-limit check intentionally trips the limiter (it runs last). Restart
> the server to reset the in-memory limiter before re-running.

Confirm persistence (data survives in the real DB):

```bash
mongosh "mongodb://localhost:27017/trace_dev" --quiet \
  --eval "print('users:', db.users.countDocuments()); print('entries:', db.entries.countDocuments())"
```

---

## 5. Production-like stack (Docker, optional)

The repo ships a backend [`Dockerfile`](../../backend/Dockerfile) (multi-stage,
non-root, healthcheck) and a root [`docker-compose.yml`](../../docker-compose.yml)
that runs the API container against a MongoDB container, mirroring a hosted
deploy (managed Mongo + stateless API steered purely by environment).

```bash
# from the repo root
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build -d
curl -s http://localhost:4000/api/health | jq
docker compose down            # add -v to also drop the DB volume
```

Compose injects `MONGODB_URI=mongodb://mongo:27017/trace` and the secrets as real
environment variables, no `.env` file inside the image.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Invalid configuration ... MONGODB_URI / JWT_SECRET ... undefined` at startup | `.env` missing or not loaded. Create `backend/.env` (step 1); the `dev`/`start` scripts load it via `--env-file-if-exists`. |
| `npm: command not found` | Open a shell and run `nvm use 22` first. |
| Server won't bind / `EADDRINUSE :4000` | A previous server is still running: `pkill -f "tsx watch"; pkill -f dist/server.js`, or change `PORT`. |
| `MongooseServerSelectionError` on boot | `mongod` not running: `sudo systemctl status mongod` (or start the Docker stack). |
| Tests fail with the same config error | Ensure `backend/vitest.config.ts` exists: it wires `tests/setup.ts` so env is set before `src/*` is imported. |
| `429 RATE_LIMITED` during manual auth calls | Rate limiter tripped (e.g. by the smoke test). Restart the server to reset it. |

## Definition of Done (local)

- [x] `mongod` reachable; `GET /api/health` → `{"status":"ok","db":"connected"}`.
- [x] `npm run typecheck/lint/format:check/build` clean.
- [x] `npm test` green (incl. isolation + persistence).
- [x] `scripts/smoke-api.sh` passes end-to-end against the live server.
- [x] Optional: `docker compose up` brings up an equivalent stack.
