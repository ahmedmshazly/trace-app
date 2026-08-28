# API Design: Trace

**Status:** Baseline · **Last updated:** 2026-06-18

REST/JSON conventions for the Trace API. The machine-readable contract is the
OpenAPI document at
[`specs/001-foundation-and-capture/contracts/openapi.yaml`](../../specs/001-foundation-and-capture/contracts/openapi.yaml);
this document explains the conventions behind it (NFR-8.3).

---

## Principles

- **Documented contract first.** The OpenAPI file is the source of truth for endpoints; the client is generated/typed against it.
- **Stateless.** Auth is a bearer JWT; no server-side session state (NFR-3.4).
- **Scoped by construction.** Every `/entries` operation acts only on the authenticated user's data (NFR-4.3).
- **Predictable shapes.** Consistent success and error envelopes; consistent status codes.

## Base & versioning

- Base path: `/api`.
- V1 is unversioned in the path; a future breaking change introduces `/api/v2` (with an ADR). Additive changes are backward-compatible.

## Authentication

- `Authorization: Bearer <JWT>` on every protected request.
- Token issued by `/auth/register` and `/auth/login`; verified in middleware → `req.userId`.
- See [security](./security.md) and [ADR-0003](../adr/0003-jwt-authentication.md).

## Resources & endpoints (V1)

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | Liveness/readiness | none |
| POST | `/api/auth/register` | Create account, issue token | none |
| POST | `/api/auth/login` | Authenticate, issue token | none |
| POST | `/api/auth/logout` | Invalidate session | bearer |
| GET | `/api/auth/me` | Current user | bearer |
| GET | `/api/entries` | Timeline (cursor-paginated) | bearer |
| POST | `/api/entries` | Capture (create) an entry | bearer |
| PATCH | `/api/entries/:id` | Edit body / backdate | bearer |
| DELETE | `/api/entries/:id` | Soft-delete | bearer |
| POST | `/api/entries/:id/restore` | Restore soft-deleted | bearer |

Later features add (now fully specified, with their own OpenAPI deltas): search +
tag index ([002](../../specs/002-search-and-tags/contracts/openapi.yaml)
`GET /api/entries?q=...&tag=...&before=...&after=...`, `GET /api/tags`), export + import
([003](../../specs/003-export-portability/contracts/openapi.yaml)
`GET /api/export?format=md|json`, `GET /api/export/estimate`, `POST /api/import`),
and recovery/settings/deletion
([004](../../specs/004-hardening-and-deploy/contracts/openapi.yaml)
`/api/auth/reset/*`, `PATCH /api/auth/password|email`, `DELETE /api/account`).

## Pagination (timeline)

Keyset/cursor pagination on `(occurredAt, _id)` descending ([R-06](../../specs/001-foundation-and-capture/research.md)):

```
GET /api/entries?limit=50&cursor=<opaque>
→ { "items": [ ...Entry ], "nextCursor": "<opaque>|null" }
```

- `nextCursor` is `null` when the corpus is exhausted.
- Offset pagination is deliberately avoided (degrades deep into history).

## Request validation

All bodies/params are validated with zod at the route boundary ([R-08](../../specs/001-foundation-and-capture/research.md)).
Invalid requests return `422` with a structured error.

## Error envelope

A single, consistent shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "body must not be empty", "details": { } } }
```

| Status | When |
|---|---|
| 400 | Malformed request |
| 401 | Missing/invalid auth |
| 403 | Authenticated but not permitted (reserved) |
| 404 | Resource not found **or not owned by the caller** (isolation: we do not reveal existence) |
| 409 | Conflict (e.g. email already registered) |
| 422 | Validation failure |
| 429 | Rate-limited |
| 500 | Unexpected server error (no internal details leaked) |

> **Isolation nuance:** requesting another user's resource returns `404`, not
> `403`; we never confirm that a resource the caller doesn't own exists.

## Conventions

- **Timestamps:** ISO-8601 UTC strings (`2026-06-18T14:02:00Z`).
- **IDs:** opaque strings (Mongo ObjectId hex).
- **Immutability:** `createdAt` is read-only; sending it on create/update is ignored.
- **Naming:** `camelCase` JSON fields; plural resource collections.
- **Idempotency:** PUT/PATCH/DELETE are idempotent; POST create is not.

## Security headers & CORS

`helmet` for sensible security headers; CORS restricted to `ALLOWED_ORIGINS` from
config; HTTPS enforced in production (NFR-4.1). See [security](./security.md).

## Contract testing

The API is verified against the OpenAPI contract via integration tests
(Supertest) including the isolation suite. Keeping the contract and tests in lockstep
is a [Definition of Done](../04-engineering/development-workflow.md) item.
