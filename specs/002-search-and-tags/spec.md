# Feature Specification: Search & Tags

**Feature Branch**: `002-search-and-tags`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Search & Tags: full-text search over the corpus via
a ⌘K command palette, inline #tag parsing, filter by tag and date range
(combinable), and a tag index with per-tag counts."

> This is Stage 2 of Trace (see `docs/03-project/roadmap.md`). It makes a growing
> corpus **retrievable at depth**. It builds directly on feature
> [`001-foundation-and-capture`](../001-foundation-and-capture/) (auth, the
> `Entry` model, the timeline) and ships the ⌘K command palette and tag index
> shown in the [V1 wireframes](../../docs/06-design/ui-ux-spec.md) and
> [user-flow diagram](../../docs/diagrams/trace-diagrams.md). Export is deferred to
> 003; settings/hardening to 004.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find a moment by full-text search (Priority: P1) MVP

An authenticated user presses `⌘K` from anywhere, types a few words they remember,
and sees matching moments instantly, the matched terms emphasized, the most
relevant results first, then presses Enter to jump to a result in the timeline.

**Why this priority**: A dense corpus is worthless if you can't find anything in
it. Full-text retrieval is the single capability that turns the timeline from a
write-only stream into a searchable record. It is independently valuable: even
with no tags and no filters, instant search delivers the core promise of Stage 2.

**Independent Test**: Seed entries, open the palette with `⌘K`, type a term that
appears in some bodies, and confirm only matching entries are returned with the
term emphasized, ranked sensibly, fast, and that selecting a result navigates to
it in the timeline.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the core screen, **When** they press `⌘K`, **Then** a search overlay opens with the input focused and the core screen dimmed behind it.
2. **Given** the search input contains a query, **When** results return, **Then** only the user's own entries whose body matches are shown, most-relevant first, with the matched terms emphasized inline.
3. **Given** a results list, **When** the user presses `↑`/`↓`, **Then** the selection moves; **When** they press `Enter`, **Then** the selected entry opens in the timeline in context.
4. **Given** the overlay is open, **When** the user presses `Esc` or clicks outside, **Then** the overlay dismisses and focus returns to the capture input.
5. **Given** an empty query, **When** the overlay is open, **Then** recent searches and jump-to-tag shortcuts are shown instead of results.
6. **Given** a query with no matches, **When** results return, **Then** a clear "no results" state is shown (not an error).

---

### User Story 2 - Tag moments inline and filter by tag (Priority: P2)

A user writes `#tags` directly in the body of a moment; the tags are parsed and
shown as pills, and the user can filter the timeline to a single tag to see only
those moments.

**Why this priority**: Tags are the lightweight structure that makes the corpus
navigable without forcing taxonomy work at capture time (Constitution I
zero-friction). They are P2 because search (US1) already provides retrieval;
tagging adds a second, complementary axis and is the prerequisite for the tag
index (US4).

**Independent Test**: Capture an entry containing `#work` and `#health`; confirm
the tags are parsed, stored, and rendered as pills; select `#work` and confirm the
timeline shows only entries carrying that tag.

**Acceptance Scenarios**:

1. **Given** a capture body containing `#token` tokens, **When** the entry is committed, **Then** the distinct, normalized tags are parsed from the body and associated with the entry, and the body text is preserved verbatim.
2. **Given** an entry with tags, **When** it renders on the timeline or in search results, **Then** its tags appear as `#tag` pills (carrying the `#` glyph, never color alone).
3. **Given** the corpus has tagged entries, **When** the user selects a tag, **Then** the timeline/results filter to entries carrying that tag, most-recent-first.
4. **Given** an entry whose body is edited to add or remove a `#tag`, **When** it is saved, **Then** its parsed tags update accordingly.
5. **Given** tags differing only by case (`#Work` vs `#work`), **When** parsed, **Then** they are treated as the same tag (normalized).

---

### User Story 3 - Combine text, tag, and date filters (Priority: P2)

A user narrows a search by combining a text query with a `#tag` filter and a date
range, sees the active filters as removable chips, and clears them all at once.

**Why this priority**: Real retrieval is "the thing about the contractor, around
last week." Combining axes is what makes search precise at scale. It is P2 because
each axis is useful alone (US1 text, US2 tag); combining is the refinement that
makes them powerful together (FR-4.4).

**Independent Test**: With a seeded corpus, apply a text query plus a `#tag` plus a
date range; confirm only entries matching *all* active filters are returned;
remove one chip and confirm results widen; "Clear all" resets to the empty state.

**Acceptance Scenarios**:

1. **Given** the palette is open, **When** the user adds a `#tag` filter and/or a date range alongside a text query, **Then** results match the conjunction of all active filters.
2. **Given** active filters, **When** they are shown, **Then** each appears as a removable chip (e.g. `#work ✕`, `Jun 1 – Jun 19 ✕`) with a **Clear all** control.
3. **Given** active filters, **When** the user removes a chip, **Then** results re-compute without that filter.
4. **Given** a date range filter, **When** applied, **Then** only entries whose `occurredAt` falls within the (inclusive) range are returned.

---

### User Story 4 - Browse the tag index (Priority: P3)

A user opens a tag index panel listing every tag in their corpus with its entry
count, sorts by count or alphabetically, filters the list, and selects a tag to
jump to a filtered view.

**Why this priority**: The tag index is the map of one's own corpus, a discovery
surface ("what do I actually write about?"). It is P3 because filtering by a known
tag already works via US2/US3; the index adds browsability and counts on top.

**Independent Test**: With a tagged corpus, open the tag index; confirm every tag
appears with a correct count, that sorting by count and A–Z both work, that the
list filters as you type, and that selecting a tag applies it as a filter and
returns to the timeline/results.

**Acceptance Scenarios**:

1. **Given** a corpus with tagged entries, **When** the tag index opens, **Then** it lists each tag with its entry count, shown both as a frequency bar and a number (never bar/color alone).
2. **Given** the tag index, **When** the user toggles sort, **Then** the list orders by count (desc) or alphabetically (A–Z).
3. **Given** the tag index, **When** the user types in the filter, **Then** the list narrows to matching tags.
4. **Given** the tag index, **When** the user selects a tag, **Then** it is applied as a filter and the user returns to the timeline/search results for that tag.

---

### Edge Cases

- **No results**: a query or filter combination with no matches shows a calm "no results" state, not an error.
- **Search over a soft-deleted entry**: soft-deleted entries are excluded from search, filters, and tag counts (consistent with the timeline).
- **Punctuation-adjacent tags**: `#work.` or `(#idea)` parse the tag without the trailing/surrounding punctuation; an in-word `#` (e.g. `c#`) follows a documented, tested rule.
- **Very many tags on one entry**: all parsed and stored; the row wraps pills gracefully.
- **Empty/duplicate tags**: a bare `#` is not a tag; duplicate tags within one body collapse to one association.
- **Unicode tags**: tags may contain letters/numbers across scripts per a documented character rule; normalization is case-insensitive.
- **Isolation under search**: a user's search/tag/date queries never return or count another user's entries (cross-user impossible).
- **Large corpus latency**: search and filtering remain responsive at the per-user scale target (50k entries).
- **Date range boundaries**: ranges are inclusive and computed in the user's local day (consistent with timeline day grouping); an open-ended range (only `before:` or only `after:`) is valid.
- **Stale recent searches**: recent searches are convenience hints only; clearing them never affects the corpus.

## Requirements *(mandatory)*

> Local IDs (FR-001...) scope this feature; the parenthetical maps to the canonical
> register in `docs/01-requirements/functional-requirements.md`.

### Functional Requirements

**Tags (capture-time structure)**

- **FR-001** (FR-1.6): System MUST parse distinct inline `#tag` tokens from an entry body at create and on edit, associating normalized tags with the entry while preserving the body text verbatim.
- **FR-002**: System MUST normalize tags case-insensitively so that tags differing only by case are the same tag.
- **FR-003**: System MUST render an entry's tags as `#tag` pills wherever the entry is displayed (timeline and search results).

**Search**

- **FR-010** (FR-4.1): System MUST provide full-text search across the authenticated user's entry bodies, returning matching entries ranked by relevance.
- **FR-011**: System MUST open the search experience from anywhere via a keyboard shortcut (`⌘K` / `Ctrl`+`K`) with the input focused, and dismiss it via `Esc` or outside click.
- **FR-012**: System MUST allow keyboard navigation of results (`↑`/`↓` to move, `Enter` to open the selected entry in the timeline).
- **FR-013**: System MUST show, for an empty query, recent searches and jump-to-tag shortcuts as fast entry points.

**Filtering**

- **FR-020** (FR-4.2): Users MUST be able to filter to a single `#tag`.
- **FR-021** (FR-4.3): Users MUST be able to filter by a date range over `occurredAt` (inclusive; open-ended ranges allowed).
- **FR-022** (FR-4.4): System MUST allow text search, tag filter, and date range to be combined; results match the conjunction of all active filters.
- **FR-023**: System MUST present active filters as individually removable chips with a single "Clear all" reset.

**Tag index**

- **FR-030** (FR-5.1): System MUST provide a tag index listing every tag in the user's corpus with its entry count, sortable by count and alphabetically, and filterable by name.
- **FR-031** (FR-5.2): Selecting a tag from the index MUST apply it as a filter and return the user to the timeline/search results.

**Isolation & consistency**

- **FR-040**: System MUST scope all search, filter, and tag-count operations to the authenticated user; cross-user results MUST be impossible.
- **FR-041**: System MUST exclude soft-deleted entries from search results, filtered views, and tag counts.

### Key Entities *(include if feature involves data)*

- **Entry** (extended): gains a `tags` field, an array of normalized tag strings parsed from `body`. All other `Entry` semantics are unchanged from feature 001. See `data-model.md`.
- **Tag (derived)**: not a stored entity in V1, a tag is a normalized string derived from entry bodies. The "tag index" is an aggregation (distinct tags + counts) computed over the user's entries.
- **Recent search (client-local)**: a convenience list of the user's recent queries, held on the client; not part of the corpus and never affecting it.

See `data-model.md` for the canonical delta and `contracts/openapi.yaml` for the
API surface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** (NFR-1.3): Search results return in under 300 ms for a per-user corpus of up to 50,000 entries.
- **SC-002**: A user can go from anywhere to an open, focused search and a navigable result set using the keyboard alone (`⌘K` → type → `↑/↓` → `Enter`).
- **SC-003**: Tags written inline at capture appear as pills and are filterable with no separate tagging step (zero added capture friction).
- **SC-004**: Combined filters (text + tag + date) return exactly the conjunction; removing a filter widens results predictably.
- **SC-005**: Tag-index counts exactly equal the number of non-deleted entries carrying each tag for the authenticated user.
- **SC-006**: Zero cross-user exposure: no search, filter, or tag count ever returns or includes another user's entries (verified by the isolation suite).
- **SC-007**: 100% of P1 (US1) acceptance scenarios are covered by automated tests passing in CI.

## Assumptions

- Builds on feature 001: authentication, the `Entry` model, per-user isolation, and the timeline already exist.
- Tags are **derived from body text** (inline `#tags`); there is no separate tag-management UI (rename/merge/colors) in V1, out of scope.
- "Full-text search" uses the datastore's native text-search capability over `body`; advanced query language (boolean operators, fuzzy matching) is out of V1 scope beyond the documented tag/date/phrase filters.
- Recent searches are stored client-side only; they are not synced across devices in V1.
- Date filters operate on `occurredAt` and use the user's local day boundaries, consistent with timeline grouping (ADR-0005).
- Search ranking uses the datastore's relevance scoring; bespoke ranking tuning is out of V1 scope.
- The `tags` field and its index are reserved in the canonical data model (feature 002 activates them); no schema-breaking change is introduced.
