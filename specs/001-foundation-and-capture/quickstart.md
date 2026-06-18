# Quickstart: Foundation & Core Capture Loop

How to run and verify this feature locally. This is the developer's
local-first loop (Constitution: local dev, hosted via config only). It assumes
the implementation tasks in `tasks.md` are complete.

> Until the application code exists, this document is the target state the
> implementation must satisfy. It doubles as the manual acceptance script.

---

## Prerequisites

- Node.js 22 LTS and npm
- MongoDB 7 running locally (`mongodb://localhost:27017`) — via local install or Docker
- A POSIX shell

## 1. Configure environment

Each package reads configuration from environment variables (no secrets in
source — Constitution V). Copy the examples and adjust:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env` (illustrative):

```dotenv
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/trace_dev
JWT_SECRET=dev-only-change-me
ALLOWED_ORIGINS=http://localhost:5173
```

## 2. Install and run

```bash
# API
cd backend && npm install && npm run dev      # http://localhost:4000

# Client (new terminal)
cd frontend && npm install && npm run dev     # http://localhost:5173
```

## 3. Verify the acceptance scenarios

### Health (FR / Constitution VI)

```bash
curl -s http://localhost:4000/api/health
# → {"status":"ok","uptime":...}
```

### Register, capture, and read back (US1 + US2)

```bash
# Register (US2 / FR-001)
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"a@example.com","password":"correct horse battery"}' | jq -r .token)

# Capture a moment (US1 / FR-011/012/013)
curl -s -X POST http://localhost:4000/api/entries \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"body":"finished the OPNsense base config #network"}' | jq

# Read the timeline (US3 / FR-020/021)
curl -s http://localhost:4000/api/entries \
  -H "authorization: Bearer $TOKEN" | jq
```

### Isolation (US2 / FR-040, SC-004)

```bash
# Register a second user, confirm they see none of the first user's entries
TOKEN_B=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"b@example.com","password":"another good passphrase"}' | jq -r .token)

curl -s http://localhost:4000/api/entries -H "authorization: Bearer $TOKEN_B" | jq '.items | length'
# → 0   (B must never see A's entries)
```

### In the browser (US1 friction check, SC-001/002/003)

1. Open http://localhost:5173 and log in.
2. Confirm the capture input is **already focused** — no click needed.
3. Type a moment and press **Enter** → it appears at the top of the timeline instantly; the input clears and re-focuses.
4. Press **Shift+Enter** → a newline is inserted (no commit).
5. Reload → the entry is still there.

## 4. Run the test suites (Constitution IV)

```bash
# Backend: unit + integration (in-memory Mongo) + isolation
cd backend && npm test

# Frontend: unit
cd frontend && npm test

# End-to-end: capture loop + auth isolation (Playwright)
cd frontend && npm run test:e2e
```

## Definition of Done for this feature

- [ ] All P1 acceptance scenarios (US1, US2) pass via automated tests (SC-007).
- [ ] Isolation suite proves no cross-user access (SC-004).
- [ ] An entry survives reload, logout/login, and server restart (SC-005).
- [ ] Capture commit perceived latency < 100 ms; core screen interactive < 2 s cold (SC-002/003).
- [ ] `docs/` updated where behavior changed; CI green; merged via PR.
