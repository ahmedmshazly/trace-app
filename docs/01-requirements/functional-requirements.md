# Functional Requirements Register: Trace V1

**Status:** Baseline · **Last updated:** 2026-06-18

The flat, authoritative register of all V1 functional requirements. The
structured/contextual view is in [`srs.md`](./srs.md) §3. Traceability to user
stories, design, and tests is in [`traceability-matrix.md`](./traceability-matrix.md).

**Priority:** Must / Should / Could (MoSCoW).
**Verification:** how the requirement is confirmed met (T = automated test, D = demo/manual, I = inspection).

---

## Capture

| ID | Requirement | Priority | Verify |
|---|---|---|---|
| FR-1.1 | Capture input is focused and ready on load of the core screen. | Must | T, D |
| FR-1.2 | Each new entry receives `occurredAt` defaulting to creation time. | Must | T |
| FR-1.3 | An entry is committable with the keyboard alone (Enter). | Must | T, D |
| FR-1.4 | Multi-line bodies supported; Shift+Enter = newline, Enter = commit. | Should | T, D |
| FR-1.5 | User can adjust an entry's `occurredAt` (backdating). | Should | T |
| FR-1.6 | `#tag` tokens parsed from body into structured tags. | Should | T |

## Entry management

| ID | Requirement | Priority | Verify |
|---|---|---|---|
| FR-2.1 | Body of an existing entry is editable. | Should | T |
| FR-2.2 | Entries removable via recoverable soft-delete (no hard delete). | Should | T |
| FR-2.3 | Immutable `createdAt` recorded for every entry. | Must | T |

## Browse & timeline

| ID | Requirement | Priority | Verify |
|---|---|---|---|
| FR-3.1 | Entries display most-recent-first by occurrence time. | Must | T, D |
| FR-3.2 | Entries grouped under day headers (Today/Yesterday/date). | Must | T, D |
| FR-3.3 | Jump to a specific date; move between days. | Should | D |
| FR-3.4 | History loads incrementally (cursor pagination). | Should | T |

## Search & filter

| ID | Requirement | Priority | Verify |
|---|---|---|---|
| FR-4.1 | Full-text search across the user's entry bodies. | Must | T |
| FR-4.2 | Filter timeline by a selected tag. | Should | T |
| FR-4.3 | Filter entries by a date range. | Should | T |
| FR-4.4 | Combine text search with tag and/or date filters. | Could | T |

## Tags

| ID | Requirement | Priority | Verify |
|---|---|---|---|
| FR-5.1 | Tag index of tags in use with per-tag counts. | Should | T, D |
| FR-5.2 | Selecting a tag filters the timeline to that tag. | Should | D |

## Portability & export

| ID | Requirement | Priority | Verify |
|---|---|---|---|
| FR-6.1 | Export corpus as timestamped Markdown. | Must | T, D |
| FR-6.2 | Export corpus as structured JSON (all fields). | Must | T |
| FR-6.3 | Export a filtered/date-bounded subset. | Should | T |
| FR-6.4 | Import previously exported JSON into own corpus. | Could | T |

## Accounts & authentication

| ID | Requirement | Priority | Verify |
|---|---|---|---|
| FR-7.1 | Register an account with credentials. | Must | T, D |
| FR-7.2 | Authentication required before any corpus access. | Must | T |
| FR-7.3 | Session maintained; user can log out. | Must | T, D |
| FR-7.4 | Only the authenticated user's entries are presented/operated on. | Must | T |
| FR-7.5 | Mechanism to recover/reset credentials. | Should | T, D |
| FR-7.6 | Delete account and associated corpus. | Should | T, D |
| FR-7.7 | View/update basic account settings. | Could | D |

---

**Totals:** 30 functional requirements, **13 Must**, **13 Should**, **4 Could**.
The 13 Musts constitute the minimal shippable V1.
