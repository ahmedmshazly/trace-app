# Phase 1 Data Model: Hardening, Settings & Deploy

The feature-scoped data model **delta** for V1 GA hardening. It adds one entity
(`PasswordResetToken`), extends `User` mutability, and defines deletion semantics.
Canonical reference:
[`docs/02-architecture/data-model.md`](../../docs/02-architecture/data-model.md).

---

## New entity — PasswordResetToken

A short-lived, single-use credential-recovery token. Only the **hash** of the
token is stored; the raw token travels only in the emailed link.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | — |
| `userId` | ObjectId | required · FK → User · indexed | The account being reset |
| `tokenHash` | string | required · indexed | Hash of the raw token (never store the raw token) |
| `expiresAt` | Date (UTC) | required · TTL index | Auto-expires (e.g. 1 hour) |
| `usedAt` | Date (UTC) | nullable | Set when consumed; a used token cannot be reused |
| `createdAt` | Date (UTC) | auto | Issuance instant |

**Indexes**: `{ tokenHash: 1 }` (lookup); **TTL** on `{ expiresAt: 1 }`
(auto-purge).

**Invariants**:
- Single-use: once `usedAt` is set, the token is rejected.
- Expiry-bound: a token past `expiresAt` is rejected (and auto-removed by TTL).
- Issuance never reveals account existence (no enumeration); a token is created
  only when the email maps to a real user, but the API response is identical
  either way.

---

## User — delta

The `User` from feature 001 gains mutability and a session-revocation marker.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `email` | string | unique · lowercased | Now changeable (to an unused, valid address) |
| `passwordHash` | string | required | Now changeable (current+new, or via reset) |
| `sessionEpoch` | integer | default `0` | Bumped on reset / account actions to invalidate prior sessions (R-003) |

`sessionEpoch` (or an equivalent `tokenVersion`) is embedded in issued tokens and
checked on each request; bumping it revokes all outstanding sessions.

---

## Entry — deletion semantics (no field change)

- **Delete all entries**: removes all `Entry` documents for the user (including
  `deleted: true`), scoped by `userId`.
- **Account deletion**: removes the `User`, all their `Entry` documents, and all
  their `PasswordResetToken`s; bumps/invalidates sessions.
- **Trash surface**: reads `Entry` where `{ userId, deleted: true }` to browse and
  restore (restore flips `deleted` back — feature 001 behavior).
- This feature introduces the **only** hard-delete paths in V1 (R-006); routine
  entry deletion remains soft (ADR-0004).

---

## Theme preference (client-persisted)

- The Light/Dark choice is a per-user preference persisted on the client
  (local storage), applied before first paint (R-004). It is a comfort setting,
  not corpus data; it is not required to sync server-side in V1.
- (Optional, non-blocking) a server-side `preferences.theme` could be added later
  for cross-device sync; out of V1 scope.

---

## Migration & operational notes

- Adding `PasswordResetToken` with a TTL index is a migration applied at
  startup/deploy.
- Adding `sessionEpoch` to `User` is additive (default `0`); existing tokens remain
  valid until the first epoch bump.
- Account/data deletion is exercised by tests against `mongodb-memory-server` and
  verified for isolation (no cross-user effect) and atomicity (no half-deleted
  state).
- Backup/restore (per `docs/05-operations/backup-recovery.md`) must recover all
  collections (`User`, `Entry`, `PasswordResetToken`) consistently.
