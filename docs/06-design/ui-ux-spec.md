# UI/UX Specification — Trace V1

**Status:** Baseline · **Last updated:** 2026-06-19 · **Source:** *Trace — V1
wireframes* (low-fidelity, structural; frames lock layout + flow)

This document is the canonical description of Trace's screens, interactions, and
keyboard model. It realizes the requirements in the
[SRS](../01-requirements/srs.md) and the behaviors in the
[flow diagrams](../diagrams/trace-diagrams.md). Color and theming are specified
separately in [color-system.md](./color-system.md); components in
[component-inventory.md](./component-inventory.md).

> The wireframes are **grayscale and structural on purpose** — they lock layout
> and flow before color. Where a frame implies a measurable behavior (focus on
> load, optimistic append, < 100 ms commit), that behavior is owned by a
> functional/non-functional requirement and traced accordingly.

---

## 1. Design principles (interface-level)

These derive from Constitution I (*Capture Friction Is Sacred*) and NFR-7
(*Usability*), made concrete for the interface:

1. **The keyboard is the interface.** The full capture loop — and every primary
   action — is reachable without a pointer (NFR-7.1). Pointer and touch are
   conveniences layered on top.
2. **Capture is the default surface.** After authentication the user lands on the
   capture input, already focused, with no intervening chrome (FR-1.1, NFR-7.2).
3. **Chrome is a defect.** No formatting toolbar, no buttons between the user and
   logging, no modal dialogs for routine actions. Editing, backdating, and delete
   confirmation happen **inline, in place** — never in a separate modal.
4. **Optimistic, never lossy.** Actions reflect instantly (optimistic UI,
   < 100 ms perceived — NFR-1.2); in-progress text is never lost to reload or
   network loss (draft preservation — NFR-2.2, NFR-3.6).
5. **The ledger is honest.** `createdAt` is shown but locked; `occurredAt` is
   editable. The interface makes the distinction visible (a lock glyph on
   `createdAt`).
6. **Recede the structure, surface the moment.** Day headers, timestamps, and
   metadata recede (size, weight, color); the entry body is the loudest thing on
   the row.
7. **Never color alone.** Every state has a non-color partner — a glyph, a label,
   a weight, a shape (see [color-system.md](./color-system.md)).

---

## 2. Global interaction model

### 2.1 The sticky capture bar

The defining layout decision: the **capture input is pinned to the top of the
viewport**; the timeline scrolls *beneath* it and is always visible no matter how
far the user scrolls. The capture bar is the heartbeat of the app and never
leaves the screen.

- Focused on load — caret ready, no click needed (FR-1.1).
- Grows to fit multi-line input; no formatting toolbar, no buttons.
- Annotated affordances on the field: `⏎ commit` · `⇧⏎ newline`.
- A persistent `⌘K search` hint sits top-right.
- A subtle `draft saved` / `anchored · <time>` status sits on the field.

### 2.2 The keyboard map

| Context | Key | Action | Requirement |
|---|---|---|---|
| Capture field | `Enter` | Commit the entry (optimistic append) | FR-1.3, FR-1.4 |
| Capture field | `Shift`+`Enter` | Insert a newline (no commit) | FR-1.4 |
| Anywhere (authed) | `⌘K` / `Ctrl`+`K` | Open command palette / search | FR-4.1, NFR-7.1 |
| Command palette | `↑` / `↓` | Move selection through results | — |
| Command palette | `Enter` | Open the selected result in the timeline | — |
| Command palette | `Esc` | Dismiss the palette | — |
| Entry (inline edit) | `Enter` | Save the edit | FR-2.1 |
| Entry (inline edit) | `Esc` | Cancel the edit | FR-2.1 |
| Confirm step (delete/backdate) | `Esc` | Cancel | FR-2.2 |
| Forms (auth) | `Tab` / `Shift`+`Tab` | Move between fields (visible focus ring) | NFR-7.4 |

> Every focusable element shows a **3px focus halo** (see
> [color-system.md](./color-system.md) → `--color-focus-ring`). Focus order
> follows visual order; no focus traps outside intentional dialogs.

### 2.3 Optimistic commit & feedback states

| State | Trigger | Surface treatment | Partner signal (non-color) |
|---|---|---|---|
| Committed | `Enter` on non-empty input | Entry appears instantly at the top of *Today*; input clears & re-focuses | brief success cue; `just now` label |
| Draft saved | Keystroke in capture field | `draft saved` micro-status on the field | dot + label |
| Draft restored | Reload / reconnect with unsaved text | Banner above the field: *“Draft restored — unsaved text from your last visit”* with **Keep** / **Discard** | warning tone + explicit buttons |
| Connectivity loss on commit | Network failure mid-commit | Retry affordance; text retained verbatim | label + retry control |
| Empty submit | `Enter` on empty/whitespace | No-op (no entry created) | nothing appears |

---

## 3. Screen inventory

| # | Screen / surface | Primary job | Feature owner |
|---|---|---|---|
| A | Auth — Login | Gateway in | 001 |
| B | Auth — Register | Create a private corpus | 001 |
| C | Auth — Reset (request + sent confirmation) | Recover credentials without enumeration | 004 |
| D | Core — Capture + Timeline | Capture a moment; browse the day-grouped record | 001 |
| E | Core — Entry curation (edit / backdate / soft-delete) | Keep the corpus honest | 001 |
| F | Command palette (⌘K) — search & filter | Retrieve at depth | 002 |
| G | Tag index panel | Navigate by tag | 002 |
| H | Settings & Export | Export, theme, account, danger zone | 003 (export) · 004 (rest) |

---

## 4. Auth screens (A · B · C)

**Tone:** a gateway, not a marketing page. Calm, fast, single-column, no
marketing copy — just the wordmark, a one-line subtitle, and the form.

### A. Login
- Wordmark **`trace`** (placeholder, see §10) + subtitle *“a timestamped record of
  your moments.”*
- Fields: **email** (focused on load), **password** — each with a **visible
  keyboard-focus ring** (critical for a keyboard-first tool, NFR-7.4).
- Primary action: **Sign in**.
- Secondary links: **Create account**, **Forgot password?**

### B. Register
- Same calm shell as login; no marketing.
- Fields: **email**, **password**, **confirm password**.
- Primary action: **Create account**. Footer: *“Already have an account? Sign in.”*
- On success: account created, session established, land on the focused capture
  screen (FR-7.1).

### C. Reset — request & sent confirmation
- Request: enter registered email → submit.
- **Sent confirmation:** checkmark + *“Check your inbox — if an account exists for
  `<email>`, a reset link is on its way.”* + **Back to sign in**.
- **The confirmation is identical whether or not the email exists** — prevents
  account enumeration (NFR-4.4). Owned by feature 004 (the gateway shells exist
  in 001; the working reset flow ships in 004).

### Mobile · login
- Single column, generous tap targets, wordmark centered; same gateway, scaled to
  thumb reach (NFR-9.2).

---

## 5. Core — Capture + Timeline (D)

The chosen direction. The capture input is **pinned to the top**; the timeline
scrolls beneath it, always visible.

### State 1 — Empty / first-run
- Placeholder: *“What just happened?”* · caret ready on load.
- Field status: `anchored · Today <time>` · affordances `⏎ commit` · `⇧⏎ newline`.
- `⌘K search` hint top-right.
- Empty state: *"Nothing logged yet. Your first moment starts in the field above.
  Just start typing."*

### State 2 — Capture, typing (multi-line)
- The field **grows to fit** multi-line text. `Enter` commits; `Shift`+`Enter`
  inserts a newline. No formatting toolbar, no buttons — the keyboard is the whole
  interface.

### State 3 — Draft restored on reload / network loss
- In-progress text is persisted locally on **every keystroke**. After a reload or
  dropped connection it is **restored verbatim** with a quiet banner: *“Draft
  restored — unsaved text from your last visit”* + **Keep** / **Discard**. The user
  never loses a moment mid-thought (NFR-2.2, NFR-3.6).

### State 4 — Populated
- Entries grouped under **day headers** — relative `Today` / `Yesterday`, then
  dates (FR-3.2). Headers recede (size + letter-spacing, not hue).
- Each row: a receding **timestamp**, the **entry body** (loudest element), and
  inline **`#tag` pills** parsed from the body (FR-1.6, owned by 002).
- **Hover/focus reveals row actions:** `✎ edit` · `◷ time` · `⌫ delete` (FR-2.1,
  FR-1.5, FR-2.2).
- Newest entry appears **instantly on Enter** (optimistic append, FR-1.3) with a
  `just now` label until reconciled.
- A `draft saved` indicator persists in-progress text across reload/network loss.

### State 5 — Older history · load more
- The timeline is **reverse-chronological by `occurredAt`** (FR-3.1). Scrolling to
  the bottom loads the next page via **cursor pagination** — no page numbers, a
  continuous record back through time (FR-3.4). A *“Loading older moments…”* cue
  marks the fetch.

### State 6 — Entry mid-edit (E)
- The body becomes an **inline editor in place** — same typography, **not a
  modal**. **Save** / **Cancel** below; `Enter` saves, `Esc` cancels. Other entries
  **dim** to focus attention. `createdAt` is preserved; `updatedAt` refreshes
  (FR-2.1, FR-2.3).

### State 7 — Backdate control (E)
- An **“Adjust occurrence time”** control opens in place with **date + time**
  inputs and **quick presets** (`-1h`, `this morning`, `yesterday`). `occurredAt`
  is editable; `createdAt` is shown but **immutable** (rendered with a lock glyph:
  *“created <time> · locked 🔒”*). On set, the entry **re-sorts** into the correct
  timeline position (FR-1.5).

### State 8 — Soft-delete confirm (E)
- Delete asks for confirmation **inline (not a full modal)**: *“Hide this entry?
  Nothing is erased — restore it anytime from Trash.”* + **Hide** / **Cancel**.
  **Soft-delete only** — hidden, restorable; never destroyed in V1 (FR-2.2,
  NFR-2.3). The destructive control pairs red with a `⌫` glyph and the confirm step
  (never color alone).

---

## 6. Command palette / search (F) — ⌘K overlay

Opened with `⌘K` from anywhere; layered over the core screen (dimmed behind).
Full-text search combined with `#tag` and date-range filters. Results reuse the
timeline's entry treatment. Arrow keys move the selection; `Enter` jumps to the
entry in context; `Esc` (or click/tap outside) dismisses. **Owned by feature 002.**

### State 1 — Empty query
- Input *"Search moments..."* focused on open.
- With no query: **recent searches** + **jump-to-tag** shortcuts (e.g. `#work 128`,
  `#health 54`, `#idea 37`, `#read 22`) as fast entry points.
- Footer hint: `↑↓ navigate · ⏎ open · esc close`.

### State 2 — Results · filters active
- Active **`#tag`** and **date-range** filters shown as **removable chips** (e.g.
  `#work ✕`, `Jun 1 – Jun 19 ✕`) with a **Clear all** reset.
- Results show entry rows with the matched terms **emphasized inline**; the
  selected result is **keyboard-highlighted**.
- Filters combine with text search (FR-4.4); search target < 300 ms at 50k
  entries/user (NFR-1.3).

### State 3 — Mobile · full-screen
- On mobile the palette is **full-screen**; the app-bar search button opens it with
  the input focused and the keyboard up. Filter chips wrap; **Cancel** dismisses.

---

## 7. Tag index panel (G)

Chosen as a **slide-in panel** (from the right), not a full screen — lower
friction, keeps the user in context. **Owned by feature 002.**

- Header `Tags · <count>` with a **filter tags** input and a **By count / A–Z**
  sort toggle.
- Each tag shows its **entry count**, both as a **frequency bar** and a **numeric
  count** (never bar/color alone) (FR-5.1).
- Selecting a tag **applies it as a filter** and returns the user to the timeline /
  search results (hands off to the ⌘K overlay) (FR-5.2).

---

## 8. Settings & Export (H)

A utility screen — minimal, not a showcase. *“← back to timeline”* always
available.

| Section | Controls | Feature |
|---|---|---|
| **Export** | Format **Markdown / JSON**; Scope **Everything / Date range / Current filter**; corpus size summary (e.g. *“1,284 entries · ~2.1 MB”*); **Export** action | 003 |
| **Appearance** | **Light / Dark** toggle — *“Dark is first-class, not an afterthought.”* | 004 |
| **Account** | Email shown; **Change** | 004 |
| **Danger zone** | **Delete all entries** · **Delete account** — irreversible; each gated behind a **typed second confirmation** | 004 |
| — | **Log out** | 001 |

Destructive actions are **visually fenced** (a bordered danger region) and
require a typed confirmation — color (error red) is reinforced by a warning glyph,
a fenced region, and a typed gate.

---

## 9. Responsive & mobile behavior

The wireframes specify an explicit mobile treatment (not a reflow afterthought):

- **Capture is pinned below the app bar and focused the instant the screen opens;**
  the keyboard rises immediately — open app, type, `Enter`.
- **Search lives in the app bar** within thumb reach (the `⌘K` equivalent); tapping
  it opens the full-screen palette with the keyboard up.
- **Entry actions open on *tap* as a bottom sheet, not hover:** **Edit entry ·
  Adjust time · Delete (confirm)**.
- **Touch targets ≥ 44px.** Interactions are *tap, not hover; thumb-reach, not
  precision* (NFR-9.2).

| Breakpoint behavior | Desktop | Mobile |
|---|---|---|
| Capture bar | Sticky top of viewport | Pinned below app bar |
| Row actions | Reveal on hover/focus | Bottom sheet on tap |
| Search (⌘K) | Centered overlay | Full-screen, app-bar button |
| Tag index | Slide-in side panel | Full-screen / sheet |

---

## 10. Accessibility (NFR-7.4)

- **WCAG 2.1 AA** is the floor; contrast ratios are verified per token pairing in
  [color-system.md](./color-system.md#contrast-verification).
- **Visible focus** on every interactive element — a 3px halo, perceptible without
  relying on its color.
- **Full keyboard operability** — see the keyboard map (§2.2); focus order follows
  visual order; inline editors and confirm steps are reachable and dismissible
  with the keyboard.
- **Never color alone** — every color-coded state has a structural/typographic
  partner (glyph, label, weight, shape). Examples: `#` glyph on tags, `⌫` + confirm
  on delete, lock glyph on `createdAt`, size/letter-spacing (not hue) on day
  headers.
- **Semantics** — headings for day groups; labelled form fields; the capture field
  is a labelled multiline input; live regions announce optimistic commit, draft
  restore, and errors.
- **Targets & motion** — touch targets ≥ 44px; motion is subtle and respects
  reduced-motion preferences.

---

## Logo placeholder

Until a final logo is supplied, every place a logo would appear uses a **text
wordmark `trace`** (lowercase), set in the product type. This applies to:

- the auth screens (centered above the form),
- the core screen header (top-left, beside the `⌘K search` hint),
- the mobile app bar.

**Placeholder contract for engineering:** render the wordmark from a single
`Logo` component (or token) so swapping in the final mark is a one-place change.
Do not bake the wordmark into multiple screens. The space should comfortably
accommodate a future horizontal mark without layout shift.

---

## Open design questions

These are intentionally deferred (no reasonable default needed for V1 layout
lock); they do not block planning:

- **Trash / restore surface** — soft-delete is restorable “from Trash”; the Trash
  browse surface itself is a small screen owned by feature 004 (curation already
  ships restore via API in 001).
- **Tag rename / merge** — out of V1 scope; tags are derived from body text.
- **Final logo** — pending; placeholder wordmark in the meantime (see above).
