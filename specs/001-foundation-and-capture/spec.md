# Feature Specification: Foundation & Core Capture Loop

**Feature Branch**: `001-foundation-and-capture`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Foundation and core capture loop: multi-user auth, the focused-on-load capture input, automatic timestamping, and the day-grouped timeline"

> This is the V1 MVP slice of Trace. It establishes the multi-user, hosted
> foundation and the single interaction that defines the product: capturing a
> timestamped moment and seeing it on a day-grouped timeline. Search, tags, and
> export are deferred to later features (002, 003). See `docs/03-project/roadmap.md`.

> **Design reference**: the screens for this feature, the auth gateway, the
> sticky capture bar, the day-grouped timeline, inline edit/backdate/soft-delete,
> the draft-restore (Keep/Discard) banner, and the mobile bottom-sheet, are
> specified in the [UI/UX spec](../../docs/06-design/ui-ux-spec.md) and the
> [color system](../../docs/06-design/color-system.md) (dark-first, ADR-0006).
> The logo is a text wordmark placeholder until a final mark is supplied
> ([ui-ux-spec § Logo](../../docs/06-design/ui-ux-spec.md#logo-placeholder)).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture a moment with zero friction (Priority: P1) 🎯 MVP

An authenticated user opens Trace, the capture input is already focused, they
type a moment, press Enter, and it instantly appears at the top of today's
timeline, automatically timestamped. The cursor returns to the input, ready
for the next moment.

**Why this priority**: This is the entire reason Trace exists. If this loop is
not effortless, nothing else matters. A user who can only capture moments
(and nothing else) already has a viable, valuable product.

**Independent Test**: Log in, type text, press Enter, observe the entry appear
in the timeline with a correct timestamp and the input cleared and re-focused.
Reload the page and confirm the entry persisted.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the core screen, **When** the screen finishes loading, **Then** the capture input is focused and ready for typing with no further interaction.
2. **Given** the capture input contains text, **When** the user presses Enter, **Then** the system creates an entry stamped with the current time, displays it at the top of the timeline, clears the input, and re-focuses the input, all within 100 ms of perceived latency.
3. **Given** the capture input contains multi-line text, **When** the user presses Shift+Enter, **Then** a newline is inserted and the entry is NOT committed.
4. **Given** a committed entry, **When** the user reloads the page, **Then** the entry is still present with its original timestamp.
5. **Given** an empty capture input, **When** the user presses Enter, **Then** no entry is created.

---

### User Story 2 - Register, sign in, and stay isolated (Priority: P1)

A new visitor creates an account, signs in, and sees only their own corpus.
A second user signing in sees a completely separate corpus. No user can reach
another user's entries by any means.

**Why this priority**: Trace is multi-user and hosted from day one. Without
authentication and strict per-user isolation, capture cannot be safely exposed.
This is co-P1 with capture because capture is meaningless without an account to
own the corpus and a guarantee the corpus is private.

**Independent Test**: Register user A, create entries; register user B in a
separate session; confirm B sees none of A's entries and that direct API
requests for A's entries while authenticated as B are rejected.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration screen, **When** they submit a valid, unused email and a valid password, **Then** an account is created, a session is established, and they land on the focused capture screen.
2. **Given** a registered user on the login screen, **When** they submit correct credentials, **Then** a session is established and they reach the capture screen.
3. **Given** a registered user, **When** they submit an incorrect password repeatedly, **Then** the system rejects the attempts and rate-limits further attempts.
4. **Given** two users A and B with their own entries, **When** B is authenticated and requests the timeline, **Then** only B's entries are returned and A's are never visible.
5. **Given** an authenticated user, **When** they log out, **Then** their session is invalidated and protected screens are no longer reachable.

---

### User Story 3 - Browse the day-grouped timeline (Priority: P2)

A user with many entries across several days sees them in reverse-chronological
order, grouped under clear day headers ("Today", "Yesterday", then dates), and
can scroll back through history without the page becoming sluggish.

**Why this priority**: Capture without retrieval is a write-only void. The
timeline is what makes the corpus feel real and reviewable. It is P2 (not P1)
because a minimal MVP can ship with a flat newest-first list; day grouping and
incremental loading are the refinements that make it pleasant at scale.

**Independent Test**: Seed entries across multiple days, load the timeline, and
verify entries are grouped under correct day headers in reverse-chronological
order, and that scrolling loads older entries incrementally.

**Acceptance Scenarios**:

1. **Given** entries spanning multiple days, **When** the timeline loads, **Then** entries are displayed most-recent-first and grouped under day headers.
2. **Given** today's and yesterday's entries, **When** the timeline renders, **Then** their headers read "Today" and "Yesterday" respectively, and older days show their date.
3. **Given** a corpus larger than one page, **When** the user scrolls to the bottom, **Then** older entries load incrementally without a full-page reload and without perceptible jank.

---

### User Story 4 - Correct and curate entries (Priority: P3)

A user fixes a typo in an entry, adjusts the time of an entry they logged after
the fact (backdating), and removes an entry they no longer want, with the
ability to recover it, since nothing is ever truly destroyed in V1.

**Why this priority**: Real logs accumulate mistakes. Editing, backdating, and
recoverable deletion keep the corpus honest and trustworthy. It is P3 because
the capture-and-browse loop is independently valuable before curation exists.

**Independent Test**: Create an entry, edit its body, adjust its `occurredAt`,
soft-delete it (confirm it disappears from the timeline), and restore it.

**Acceptance Scenarios**:

1. **Given** an existing entry, **When** the user edits its body and saves, **Then** the body updates and `updatedAt` refreshes while `createdAt` is unchanged.
2. **Given** an existing entry, **When** the user adjusts its occurrence time, **Then** the entry re-sorts into the correct position on the timeline.
3. **Given** an existing entry, **When** the user soft-deletes it and confirms, **Then** it disappears from the timeline but remains recoverable.
4. **Given** a soft-deleted entry, **When** the user restores it, **Then** it re-appears on the timeline in its original position.

---

### Edge Cases

- **Empty / whitespace-only capture**: pressing Enter with no meaningful content creates no entry.
- **Very long entry body**: extremely long text is accepted and stored without truncation; the timeline wraps it gracefully.
- **Clock/timezone**: timestamps are stored in UTC and displayed in the user's local timezone; day grouping uses the user's local day boundaries.
- **Backdating across a day boundary**: an entry backdated to a prior day moves under that day's header.
- **Duplicate registration email**: registering with an already-used email is rejected with a clear, non-enumerating message path (see auth sub-flow).
- **Expired/invalid session mid-capture**: in-progress draft text is not lost; the user is prompted to re-authenticate and the draft is preserved.
- **Transient network loss on commit**: the client surfaces a clear retry state and does not silently drop the user's text.
- **Concurrent sessions**: the same user logged in on two devices sees a consistent corpus on reload.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Accounts**

- **FR-001**: System MUST allow a visitor to register an account with an email and password.
- **FR-002**: System MUST reject registration when the email is already in use.
- **FR-003**: System MUST authenticate a registered user via email and password and establish a session on success.
- **FR-004**: System MUST allow an authenticated user to log out, invalidating the session.
- **FR-005**: System MUST require authentication before any corpus data is read or written.
- **FR-006**: System MUST rate-limit authentication attempts to defend against brute force.

**Capture**

- **FR-010**: System MUST present the capture input focused and ready on load of the core screen.
- **FR-011**: System MUST commit an entry on Enter and insert a newline on Shift+Enter.
- **FR-012**: System MUST assign each new entry an occurrence time (`occurredAt`) defaulting to the moment of creation.
- **FR-013**: System MUST record an immutable creation time (`createdAt`) for every entry.
- **FR-014**: System MUST clear and re-focus the capture input immediately after a successful commit.
- **FR-015**: System MUST NOT create an entry from empty or whitespace-only input.

**Timeline & Browse**

- **FR-020**: System MUST display a user's entries in reverse-chronological order by occurrence time.
- **FR-021**: System MUST group entries under day headers, with relative labels for today and yesterday.
- **FR-022**: System MUST load entry history incrementally to remain responsive over a large corpus.

**Entry Management**

- **FR-030**: Users MUST be able to edit the body of an existing entry; the system refreshes `updatedAt` and preserves `createdAt`.
- **FR-031**: Users MUST be able to adjust an entry's `occurredAt` (backdating), after which it re-sorts on the timeline.
- **FR-032**: Users MUST be able to soft-delete an entry (hidden, recoverable) and restore it; the system MUST NOT permanently destroy entry data in V1.

**Data Isolation**

- **FR-040**: System MUST scope every entry read and write to the authenticated user; cross-user access MUST be impossible.

### Key Entities *(include if feature involves data)*

- **User**: an account holder who owns a private corpus. Key attributes: unique email, salted password hash, timestamps. Relationships: owns many Entries.
- **Entry**: a single timestamped moment. Key attributes: owning user reference, body text (Markdown-friendly), `occurredAt` (primary analysis axis, editable), `createdAt` (immutable), `updatedAt`, soft-delete flag, capture source. Relationships: belongs to exactly one User.

See `data-model.md` for the canonical schema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a warm load, a user can capture a moment (focus → type → Enter → visible on timeline) in a single keystroke sequence with no mouse use.
- **SC-002**: Perceived latency from pressing Enter to the entry appearing on the timeline is under 100 ms at the median.
- **SC-003**: The core screen is interactive (capture input focused) within 2 seconds of a cold load.
- **SC-004**: Zero cross-user data exposure: in isolation tests, no authenticated user can read or mutate another user's entries through any endpoint.
- **SC-005**: No committed entry is ever lost: after commit confirmation, the entry survives reload, logout/login, and server restart.
- **SC-006**: The timeline remains smooth (no perceptible jank) and search-free browsing stays responsive for a per-user corpus of at least 50,000 entries.
- **SC-007**: 100% of P1 acceptance scenarios are covered by automated tests that pass in CI.

## Assumptions

- Users have a modern browser and stable connectivity during use (offline-first operation is explicitly out of scope; see roadmap).
- Email + password is the V1 authentication method; SSO/OAuth and email verification are deferred.
- Timestamps are stored in UTC; the client renders them in the user's local timezone.
- "Multi-user" means many isolated private accounts (SaaS-style); cross-user sharing, teams, and roles are out of scope for V1.
- The data model reserves a `source` field for future capture methods (e.g. voice) without implementing them now.
- Search, tag index, and export are separate downstream features and are not part of this MVP slice.
