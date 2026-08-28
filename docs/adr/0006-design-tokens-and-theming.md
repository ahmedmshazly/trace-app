# ADR-0006: Dark-first, two-theme semantic design-token system

- **Status:** Accepted
- **Date:** 2026-06-19
- **Deciders:** Maintainer (Eng + Design)
- **Related:** [color-system](../06-design/color-system.md), [ui-ux-spec](../06-design/ui-ux-spec.md), NFR-7.4 (accessibility), Constitution I (capture friction / calm UI) & VII (simplicity)

## Context

Trace is a keyboard-first instrument people keep open for hours. The V1 wireframes
are deliberately grayscale and structural ("color & theming applied in a later
step"), and a two-theme color system (light + dark) has been defined with
**dark as the lead surface**. We need a single, durable mechanism for applying
color that:

- keeps **dark first-class** (designed, not an inverted light theme),
- guarantees **WCAG 2.1 AA** across both themes (the system ships verified
  contrast ratios per pairing),
- enforces **"never color alone"** (each role has a structural/typographic
  partner),
- lets features 001-003 build before the theme toggle (004) ships, without
  rework,
- stays simple (Constitution VII), no theming framework, no per-component color
  logic.

## Decision

Adopt a **semantic design-token system implemented as CSS custom properties**,
with **two designed themes (dark default, light opt-in)**:

1. Every color role is a named token (e.g. `--color-surface`,
   `--color-accent-primary`, `--color-focus-ring`) defined in
   [color-system.md](../06-design/color-system.md). Tokens map **1:1** to CSS
   custom properties.
2. Themes are property sets on a theme root (e.g. `[data-theme="dark"]` /
   `[data-theme="light"]`). Switching theme swaps the property set, components
   are never recolored.
3. **Components bind only to semantic tokens** (`var(--color-...)`); raw hex in a
   component style is a review failure.
4. **Dark is the default**; first-run honors OS `prefers-color-scheme`, then the
   user's explicit choice (Settings → Appearance, FR-7.7, feature 004).
5. **Accessibility is a gate:** the contrast table in the color system is the
   acceptance reference; any token value change is re-verified before merge.
6. **Never color alone:** every color-coded role ships with a non-color partner
   (glyph, label, weight, shape).

## Consequences

### Positive

- Dark mode is genuinely designed and low-glare; theme swap is a single-layer
  change.
- Contrast is verifiable and gated, satisfying NFR-7.4 across both themes.
- Features 001-003 build against token names; applying themes in 004 is
  non-invasive.
- No theming dependency added, just CSS custom properties (Constitution VII).

### Negative / costs

- Discipline required: reviews must reject raw hex and unverified token changes.
- The contrast table must be kept in lockstep with any palette tuning.

### Neutral / notes

- The theme toggle UI and persistence land with feature 004; the token contract
  exists from the first frontend commit.
- A future high-contrast or additional theme is additive, another property set,
  same component code.

## Alternatives considered

- **Invert light into dark programmatically.** Rejected: produces glaring,
  off-brand dark surfaces; dark must be designed (the lead surface).
- **A CSS-in-JS theming library / UI framework theme.** Rejected: adds a
  dependency and complexity for what plain CSS custom properties already solve
  (Constitution VII).
- **Hard-coded colors per component.** Rejected: not themeable, not auditable for
  contrast, and duplicative.
- **Light-only V1, dark later.** Rejected: contradicts the product's "dark is
  first-class" intent and would force rework.
