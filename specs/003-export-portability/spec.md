# Feature Specification: Export & Portability

**Feature Branch**: `003-export-portability`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Export & portability: export the corpus to Markdown
and JSON, scope an export to everything / a date range / the current filter, and
(optionally) re-import previously exported JSON. Make data ownership real."

> This is Stage 3 of Trace (see `docs/03-project/roadmap.md`). It delivers
> Constitution II (*The Corpus Is the Product. Ownership & Portability*) as a
> shipped capability. It builds on feature 001 (the `Entry` model, auth,
> isolation) and reuses the filter semantics from feature 002 for "current
> filter" / date-range scope. It realizes the **Settings → Export** panel in the
> [V1 wireframes](../../docs/06-design/ui-ux-spec.md#8-settings--export). The rest
> of Settings (theme, account, danger zone) ships with feature 004.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export the whole corpus (Priority: P1) 🎯 MVP

A user opens Settings, chooses a format (Markdown or JSON), and exports their
entire corpus to a single downloaded file they fully own and can read or process
anywhere.

**Why this priority**: Portability is the contract that keeps the user free and
the corpus trustworthy (Constitution II). The single most important portability
guarantee is "you can get *everything* out, anytime." Whole-corpus export in both
open formats is independently valuable and is the heart of this feature.

**Independent Test**: With a populated corpus, request a full Markdown export and a
full JSON export; confirm each download contains every non-deleted entry with all
fields/structure, in the documented format, and only that user's data.

**Acceptance Scenarios**:

1. **Given** an authenticated user with entries, **When** they export as **JSON** with scope "Everything", **Then** they receive a JSON document containing an array of all their non-deleted entries with every field preserved (`body`, `occurredAt`, `createdAt`, `updatedAt`, `tags`, `source`).
2. **Given** an authenticated user with entries, **When** they export as **Markdown** with scope "Everything", **Then** they receive a Markdown document with entries grouped under day headers, each line carrying its local time and inline tags, in the documented shape.
3. **Given** the export screen, **When** a scope/format is selected, **Then** an estimate of the export size (entry count and approximate bytes) is shown before the user commits.
4. **Given** a soft-deleted entry exists, **When** the user exports, **Then** the deleted entry is **not** included (export reflects the live corpus).
5. **Given** two users, **When** one exports, **Then** the export contains only that user's entries (cross-user inclusion impossible).

---

### User Story 2 - Export a scoped subset (Priority: P2)

A user exports only part of their corpus, a date range, or whatever filter is
currently applied (a tag, a search), rather than everything.

**Why this priority**: Whole-corpus export (US1) delivers the ownership guarantee;
scoped export is the practical refinement for sharing or archiving a slice (e.g.
"export my `#work` entries for last quarter"). It is P2 because it reuses the
feature-002 filter semantics and is not required for the core portability promise.

**Independent Test**: Apply a date range and/or a current filter, export with that
scope, and confirm the output contains exactly the entries that the same filter
returns in the timeline/search, no more, no fewer.

**Acceptance Scenarios**:

1. **Given** a date range, **When** the user exports with scope "Date range", **Then** the output contains exactly the non-deleted entries whose `occurredAt` falls within the (inclusive) range.
2. **Given** an active filter (tag and/or text query) in the app, **When** the user exports with scope "Current filter", **Then** the output contains exactly the entries that filter currently returns.
3. **Given** a scoped export, **When** it completes, **Then** the chosen format (Markdown/JSON) and the documented structure are identical to the full export, only the set of entries differs.
4. **Given** a scope that matches no entries, **When** the user exports, **Then** they receive a well-formed empty document (an empty JSON array / a Markdown file with no entries), not an error.

---

### User Story 3 - Re-import previously exported JSON (Priority: P3, optional)

A user imports a previously exported JSON file back into their own corpus
restoring from a backup or moving between accounts they own.

**Why this priority**: Round-trippability proves the JSON export is genuinely
self-contained (NFR-5.2) and completes the ownership story. It is P3 and optional
(FR-6.4 is a *Could*): it is valuable but not required to ship the portability
guarantee, and it introduces write-path and de-duplication considerations.

**Independent Test**: Export a corpus to JSON, import it into an empty account, and
confirm the imported entries match the originals in body, timestamps, and tags;
re-importing the same file does not create duplicates.

**Acceptance Scenarios**:

1. **Given** a valid exported JSON file, **When** the user imports it, **Then** each entry is created in the user's corpus preserving `body`, `occurredAt`, `tags`, and `source`, with a fresh server-set `createdAt` policy documented.
2. **Given** a JSON file that does not match the documented schema, **When** the user imports it, **Then** the import is rejected with a clear validation error and no partial corpus changes (atomic per-file or clearly reported per-entry).
3. **Given** a file that has already been imported, **When** the user imports it again, **Then** duplicate entries are avoided per the documented de-duplication rule.
4. **Given** an import, **When** it runs, **Then** all created entries belong to the authenticated user only (isolation preserved).

---

### Edge Cases

- **Large corpus export**: a 50k-entry export streams rather than buffering the whole document in memory; the request does not time out or exhaust server memory.
- **Empty corpus**: exporting yields a well-formed empty document.
- **Unicode & Markdown-significant characters in bodies**: content is preserved exactly; Markdown export does not corrupt or unintentionally render injected Markdown (bodies are emitted safely).
- **Soft-deleted entries**: never appear in any export.
- **Timezone in Markdown**: day headers and times in Markdown use the user's local day/time (consistent with the timeline, ADR-0005); JSON preserves UTC instants.
- **Concurrent capture during export**: the export reflects a consistent snapshot; entries committed mid-export may or may not appear but the document is never malformed.
- **Import of an unfamiliar/extra field**: unknown fields are ignored (forward-compatible) while required fields are validated.
- **Filename & content type**: downloads have a sensible filename (e.g. `trace-export-YYYYMMDD.json|.md`) and correct content type.

## Requirements *(mandatory)*

> Local IDs (FR-001...) scope this feature; the parenthetical maps to the canonical
> register in `docs/01-requirements/functional-requirements.md`.

### Functional Requirements

**Export**

- **FR-001** (FR-6.2): System MUST export the authenticated user's corpus as structured JSON, an array of entries with all fields preserved (round-trippable).
- **FR-002** (FR-6.1): System MUST export the corpus as timestamped Markdown, entries grouped under day headers with local time and inline tags, in the documented shape.
- **FR-003** (FR-6.3): Users MUST be able to scope an export to **everything**, a **date range**, or the **current filter** (tag/text), reusing feature-002 filter semantics.
- **FR-004**: System MUST exclude soft-deleted entries from all exports.
- **FR-005**: System MUST show an export size estimate (entry count + approximate bytes) before the export is committed.
- **FR-006**: System MUST stream large exports so memory use stays bounded regardless of corpus size (NFR-10.2).
- **FR-007**: System MUST deliver exports as a download with a sensible filename and correct content type.

**Import (optional, FR-6.4 *Could*)**

- **FR-010** (FR-6.4): Users SHOULD be able to import previously exported JSON into their own corpus, preserving `body`, `occurredAt`, `tags`, and `source`.
- **FR-011**: System MUST validate an import against the documented JSON schema and reject malformed input with a clear error and no partial/ambiguous state.
- **FR-012**: System MUST avoid creating duplicates on re-import per a documented de-duplication rule.

**Isolation**

- **FR-020**: System MUST scope every export and import to the authenticated user; cross-user inclusion or write MUST be impossible.

### Key Entities *(include if feature involves data)*

- **Entry** (unchanged): the export/import operate over the existing `Entry` schema (feature 001 + the `tags` field from feature 002). No new persistent fields are introduced by export.
- **Export document (derived)**: a transient artifact (JSON array or Markdown text) computed on demand from the user's entries; not stored server-side.
- **Import payload (transient)**: a validated JSON document supplied by the user; consumed to create entries, not stored as-is.

The canonical export shapes are documented in
[`docs/02-architecture/data-model.md`](../../docs/02-architecture/data-model.md#export-shape-portability);
see `contracts/openapi.yaml` for the API surface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** (NFR-5.1, SC-7): A user can export their entire corpus to both Markdown and JSON at any time, with every non-deleted entry present.
- **SC-002** (NFR-5.2): A JSON export is self-contained and round-trippable, re-importing it reconstructs an equivalent corpus (body, timestamps, tags, source preserved).
- **SC-003**: Scoped exports contain exactly the entries the equivalent in-app filter returns, verified by parity tests.
- **SC-004**: A 50k-entry export completes with bounded memory (streamed) and within an acceptable time budget on a representative dev machine.
- **SC-005**: Zero cross-user exposure: an export/import never includes or writes another user's entries (verified by the isolation suite).
- **SC-006**: Markdown and JSON exports preserve Unicode and Markdown-significant characters exactly; no content corruption or unintended rendering.
- **SC-007**: 100% of P1 (US1) acceptance scenarios are covered by automated tests passing in CI.

## Assumptions

- Builds on features 001 (Entry, auth, isolation) and 002 (tags + filter semantics for "current filter"/date-range scope).
- Export is **synchronous download** in V1 (no background job queue, no emailed exports), sufficient at the per-user scale target.
- JSON is the canonical round-trippable format; Markdown is a human-readable, lossy-for-reimport format (Markdown is not required to round-trip).
- Import (FR-6.4) is *Could*/optional; if descoped from V1, US1+US2 still fully deliver the portability guarantee (SC-001).
- `createdAt` policy on import is documented (a re-import sets a fresh server `createdAt` while preserving `occurredAt`), consistent with the immutable-ledger principle (the ledger records when *this* corpus committed the entry).
- Exports reflect the live corpus and never include soft-deleted entries.
