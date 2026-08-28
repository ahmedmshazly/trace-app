# Component Inventory — Trace V1

**Status:** Baseline · **Last updated:** 2026-06-19

The catalog of UI components the V1 wireframes imply. Each entry names the
component, the screen(s) it appears on, the **feature that ships it**, and the key
design tokens it binds. This is the bridge between
[ui-ux-spec.md](./ui-ux-spec.md) (behavior), [color-system.md](./color-system.md)
(tokens), and the per-feature implementation plans under
[`specs/`](../../specs/).

> Components bind to **semantic tokens only** (e.g. `var(--color-surface)`), never
> raw hex (see [ADR-0006](../adr/0006-design-tokens-and-theming.md)). Naming below
> is indicative; the implementing feature's plan is authoritative for file paths.

---

## Foundation & shell

| Component | Appears on | Feature | Key tokens / notes |
|---|---|---|---|
| `Logo` (wordmark placeholder) | Auth, core header, mobile app bar | 001 | Text `trace`; single source so the final mark is a one-place swap (see ui-ux-spec § Logo) |
| `AppShell` / layout | All authed screens | 001 | `--color-base`; hosts the sticky capture bar + scrolling timeline |
| `ThemeProvider` / theme root | All screens | 004 | Defines the CSS custom-property set; `[data-theme]` switch |
| `ProtectedRoute` | All authed screens | 001 | Redirects unauthenticated users to the gateway |
| `FocusRing` (style primitive) | Every focusable element | 001 | `--color-focus-ring`; 3px halo |

## Auth

| Component | Appears on | Feature | Key tokens / notes |
|---|---|---|---|
| `AuthShell` | Login, Register, Reset | 001 | Calm single-column gateway; wordmark + subtitle |
| `TextField` (email/password) | Auth forms, settings | 001 | `--color-surface`, `--color-border`, focus ring; visible focus mandatory |
| `PrimaryButton` (CTA) | Sign in, Create account, Export | 001 | `--color-accent-primary` + `--color-text-on-accent`; rationed |
| `InlineLink` | “Create account”, “Forgot password?” | 001 | `--color-accent-secondary` |
| `ResetSentConfirmation` | Reset flow | 004 | Non-enumerating copy; identical regardless of email existence |

## Capture + Timeline (core)

| Component | Appears on | Feature | Key tokens / notes |
|---|---|---|---|
| `CaptureBar` (sticky) | Core screen | 001 | Pinned top; `--color-surface`; grows multi-line; `⏎ commit` · `⇧⏎ newline` |
| `CaptureStatus` | Capture bar | 001 | `anchored · <time>` / `draft saved`; `--color-text-secondary` |
| `DraftRestoreBanner` | Core screen | 001 | `--color-state-warning`; **Keep** / **Discard** |
| `SearchHint` (⌘K) | Core header | 001 (hint) · 002 (opens palette) | `--color-text-muted` |
| `Timeline` (infinite scroll) | Core screen | 001 (list) · 003 (load-more) | Reverse-chrono; cursor pagination |
| `DayHeader` | Timeline | 001 | `--color-day-header`; recedes via size + letter-spacing |
| `TimelineEntry` (row) | Timeline, search results | 001 | `--color-surface`; body is the loudest element |
| `EntryTimestamp` | Entry row | 001 | `--color-text-secondary` |
| `TagPill` (`#tag`) | Entry row, palette, tag index | 002 | `--color-tag-pill-bg` + `--color-accent-secondary`; `#` glyph |
| `EntryActions` (hover/focus) | Entry row | 001 | `✎ edit` · `◷ time` · `⌫ delete` |
| `EntryInlineEditor` | Entry row (edit) | 001 | In place, not modal; `Enter` save / `Esc` cancel; dims siblings |
| `BackdateControl` | Entry row (time) | 001 | Date+time + presets (`-1h`, `this morning`, `yesterday`); `createdAt` locked 🔒 |
| `SoftDeleteConfirm` | Entry row (delete) | 001 | Inline confirm; `--color-state-error` + `⌫` + confirm step |
| `EmptyState` | Core screen (first run) | 001 | "Nothing logged yet..." |
| `LoadingOlder` | Timeline bottom | 001 | “Loading older moments…” |

## Search & tags (⌘K + panel)

| Component | Appears on | Feature | Key tokens / notes |
|---|---|---|---|
| `CommandPalette` (⌘K overlay) | Over core screen | 002 | `--color-elevated`; dims backdrop; `↑↓ navigate · ⏎ open · esc close` |
| `SearchInput` | Palette | 002 | Focused on open; `--color-surface` |
| `FilterChip` (removable) | Palette | 002 | `#tag` + date-range chips; **Clear all** |
| `RecentSearches` / `JumpToTag` | Palette (empty query) | 002 | Fast entry points; tag counts |
| `SearchResultRow` | Palette results | 002 | Reuses `TimelineEntry`; inline match emphasis; keyboard-highlight |
| `TagIndexPanel` (slide-in) | Over core screen | 002 | `--color-elevated`; `Tags · <count>` |
| `TagListRow` | Tag index | 002 | Frequency **bar** + **numeric** count (never bar alone) |
| `SortToggle` (By count / A–Z) | Tag index | 002 | — |

## Settings & export

| Component | Appears on | Feature | Key tokens / notes |
|---|---|---|---|
| `SettingsScreen` | Settings | 003 (export) · 004 (rest) | `← back to timeline`; utility, not showcase |
| `ExportPanel` | Settings | 003 | Format (MD/JSON), Scope (Everything/Date range/Current filter), size summary |
| `AppearanceToggle` (Light/Dark) | Settings | 004 | Persists theme; “Dark is first-class” |
| `AccountPanel` | Settings | 004 | Email + Change |
| `DangerZone` | Settings | 004 | Fenced region; `--color-state-error`; typed second confirmation |
| `ConfirmByTyping` | Danger zone | 004 | Gates delete-all / delete-account |

## Mobile-specific

| Component | Appears on | Feature | Key tokens / notes |
|---|---|---|---|
| `MobileAppBar` | Mobile (all authed) | 001 | Hosts wordmark + search button |
| `BottomSheet` (entry actions) | Mobile entry tap | 001 | Edit · Adjust time · Delete (confirm); targets ≥ 44px |
| `MobileSearch` (full-screen) | Mobile ⌘K | 002 | Full-screen palette; keyboard up |

---

## Cross-cutting rules

- **Tokens, not hex.** Every component styles via semantic CSS custom properties.
- **Keyboard parity.** Each interactive component has a keyboard path matching the
  [keyboard map](./ui-ux-spec.md#22-the-keyboard-map).
- **Reuse the row.** Search results and timeline rows share one `TimelineEntry`
  treatment — consistency and less code (Constitution VII).
- **Confirm in place.** Edit, backdate, and delete confirmations are inline, never
  modal (except where mobile uses a bottom sheet).
- **One Logo source.** The placeholder wordmark renders from a single component so
  the final logo is a single swap.
