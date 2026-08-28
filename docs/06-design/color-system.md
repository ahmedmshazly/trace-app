# Color System: Trace V1

**Status:** Baseline · **Last updated:** 2026-06-19 · **Source:** *Trace. Color
System v1 · light + dark* · **Decision of record:**
[ADR-0006](../adr/0006-design-tokens-and-theming.md)

A quiet, two-theme palette for a keyboard-first life-logging instrument. **Few
colors, each with a single job.** Dark mode is the lead surface, muted
navy-teal, low-glare, comfortable across hours. The teal accent is rationed: it
appears only where something matters *right now*, the focus ring, the commit
action, the primary CTA.

---

## Philosophy

| Principle | What it means in practice |
|---|---|
| **Restraint** | Two neutrals carry ~95% of every screen. Accent is the exception, never the rule. |
| **Dark-first** | Dark is *designed, not inverted*: deep navy bases (not black); text never glares. |
| **Never color alone** | Every role has a structural or typographic partner: a shape, label, weight, or icon. |

These map to the interface principles in [ui-ux-spec.md](./ui-ux-spec.md) and to
Constitution V/NFR-7.4 (accessibility). Color carries meaning, but never *only*
through color.

---

## Token contract

Semantic roles map **1:1 to CSS custom properties**. Engineering binds components
to these tokens, never to raw hex. Swapping or tuning a theme is a single change
at the token layer. Swatch values are **light**, then **dark**.

### Backgrounds

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-base` | `#eceff3` | `#15151f` | Outermost app shell / page |
| `--color-surface` | `#fbfcfd` | `#1e1e2e` | Cards, capture input, entry rows |
| `--color-elevated` | `#ffffff` | `#292940` | ⌘K overlay, dropdowns, backdate, tooltips |

### Text

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-text-primary` | `#1c2433` | `#c9d1e4` | Body text & entry bodies |
| `--color-text-secondary` | `#565f6e` | `#a6adc8` | Timestamps, labels, metadata |
| `--color-text-muted` | `#8a94a3` | `#7a7f96` | Placeholder, disabled, helper hints |
| `--color-text-on-accent` | `#ffffff` | `#0f1f1c` | Text on the primary accent fill |

### Accent (rationed)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-accent-primary` | `#15807a` | `#74cabb` | Commit, focus ring, primary CTA: rationed |
| `--color-accent-secondary` | `#2f6fce` | `#8aa9e6` | `#tags`, links, interactive hover |

### Structure

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-border` | `#dce1e7` | `#313146` | Dividers, input outlines, separators |
| `--color-day-header` | `#8a94a3` | `#6c7086` | Today / Yesterday / date headers: recedes |
| `--color-tag-pill-bg` | `#e6effb` | `#29304a` | Background of inline `#tag` chips |

### States

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-state-success` | `#1a7f4f` | `#88c9a1` | Entry committed confirmation |
| `--color-state-warning` | `#9a6a00` | `#e5c890` | Draft preserved / connectivity |
| `--color-state-error` | `#c2364a` | `#eb8a9c` | Destructive actions, form errors |
| `--color-state-info` | `#2f6fce` | `#8aa9e6` | Neutral informational hints |

### Focus

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-focus-ring` | `#15807a` | `#8fe0d0` | Keyboard-focus indicator (3px halo) |

---

## Contrast verification (WCAG 2.1)

Normal text targets **4.5:1**; large text & UI components target **3:1**.
Placeholder & disabled (`text-muted`) is non-essential and held to **≥ 3:1**.

| Pairing | Theme | Ratio | Result |
|---|---|---|---|
| `text-primary` on `surface` | Light | 15.6:1 | AAA |
| `text-primary` on `surface` | Dark | 10.7:1 | AAA |
| `text-secondary` on `surface` | Light | 6.4:1 | AAA |
| `text-secondary` on `surface` | Dark | 7.4:1 | AAA |
| `text-muted` (placeholder) on `surface` | Light | 3.1:1 | AA-lg |
| `text-muted` (placeholder) on `surface` | Dark | 4.1:1 | AA-lg |
| `text-on-accent` on `accent-primary` | Light | 4.8:1 | AA |
| `text-on-accent` on `accent-primary` | Dark | 8.9:1 | AAA |
| `accent-secondary` (`#tag` / link) on `surface` | Light | 4.9:1 | AA |
| `accent-secondary` (`#tag` pill) on `tag-pill-bg` | Dark | 5.3:1 | AA |
| `state-error` on `surface` | Light | 5.4:1 | AA |
| `state-error` on `surface` | Dark | 6.8:1 | AAA |
| `focus-ring` vs adjacent `surface` | Light | 3.4:1 | AA-UI |
| `focus-ring` vs adjacent `surface` | Dark | 3.6:1 | AA-UI |
| `day-header` on `base` | Light | 3.2:1 | AA-lg |
| `day-header` on `base` | Dark | 3.3:1 | AA-lg |

> **Verification is a gate, not a footnote.** Any token value change must be
> re-checked against this table before merge (Definition of Done, NFR-7.4). The
> table is the acceptance reference for the accessibility pass in feature 004.

---

## Never color alone: the structural partners

Color is never the sole signal. Each color-coded role ships with a non-color
partner so the meaning survives for color-blind users, in grayscale, and under
the structural wireframes:

| Role | Color signal | Structural / typographic partner |
|---|---|---|
| Tags | `accent-secondary` on `tag-pill-bg` | the `#` glyph + pill shape |
| Delete / destructive | `state-error` | a `⌫` icon **and** a confirm step |
| Day headers | `day-header` (recedes) | smaller size + letter-spacing (not hue) |
| Keyboard focus | `focus-ring` | a **3px halo**: perceptible without its color |
| Commit / primary CTA | `accent-primary` | label (`commit`) + position + weight |
| Draft / connectivity | `state-warning` | banner + explicit **Keep / Discard** controls |

---

## Applied sample (the "judgment surface")

The wireframes render the same slice of the core screen in **both themes**: a
focused capture input, a day-grouped timeline with one row in its hover/action
state, the primary CTA, and the ⌘K overlay. Reading that sample against this
table:

- **Dark is the lead.** `--color-base` `#15151f` is a deep navy, not black;
  `--color-text-primary` `#c9d1e4` reads at 10.7:1, clear without glare.
- **Accent is rationed.** Teal (`--color-accent-primary`) appears only on the
  focus ring, the commit affordance, and the primary CTA, nowhere else.
- **Tags and links** use the secondary accent (`--color-accent-secondary`),
  visually distinct from the rationed primary teal.
- **Structure recedes.** Borders, day headers, and timestamps sit in the neutral
  range so the **entry body** is the loudest element on every row.

---

## Implementation notes (for feature 004: theming)

- Define all tokens as **CSS custom properties** on a theme root; switch themes by
  swapping the property set (e.g. `[data-theme="dark"]`), not by recoloring
  components.
- **Dark is the default theme**; light is the opt-in. The Settings → Appearance
  toggle persists the choice per user (FR-7.7).
- Respect the OS `prefers-color-scheme` for the first-run default, then honor the
  user's explicit choice.
- Components reference only semantic tokens (e.g. `var(--color-surface)`); raw hex
  in component styles is a review failure.
- The full theme switch lands with feature 004; features 001-003 build against the
  token names so applying the themes is non-invasive (the wireframes are
  structural by design, *"color & theming applied in a later step"*).
