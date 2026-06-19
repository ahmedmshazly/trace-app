# Trace — Design

**Status:** Baseline · **Last updated:** 2026-06-19

The design layer turns the product principles (Constitution I — *Capture Friction
Is Sacred*; NFR-7 — *Usability*) into a concrete, buildable interface. These are
the **V1 wireframes locked to layout + flow** plus the **two-theme color system**.
They are the canonical front-end design reference: feature specs describe *what*
and *why*; this layer describes *how it looks and behaves* so engineering and
design stay in lockstep.

> **Governance:** this layer defers to the
> [Constitution](../constitution.md) and the
> [SRS](../01-requirements/srs.md). It does not introduce requirements; it
> realizes them. Where a screen implies a requirement, that requirement is traced
> in the [traceability matrix](../01-requirements/traceability-matrix.md).

---

## What's here

| Document | Purpose |
|---|---|
| [UI/UX Specification](./ui-ux-spec.md) | Interaction model, screen inventory, per-screen layout & flows, the keyboard map, responsive/mobile behavior, accessibility, and the logo placeholder. |
| [Color System](./color-system.md) | The two-theme (dark-first) semantic token palette, the CSS custom-property contract, WCAG contrast verification, and the *never color alone* rule. |
| [Component Inventory](./component-inventory.md) | The catalog of UI components the wireframes imply, each mapped to the feature that owns it and to its design tokens. |

## How design maps to features

The wireframes cover the **entire V1 product**; the work is delivered in
roadmap-sequenced feature slices (Spec-Driven Development). Each screen below is
owned by the feature that ships it:

| Screen / surface | Feature | Spec |
|---|---|---|
| Auth — login, register, reset confirmation | 001 (gateway) · 004 (reset flow) | [001](../../specs/001-foundation-and-capture/), [004](../../specs/004-hardening-and-deploy/) |
| Capture + Timeline (sticky bar), curation, mobile | 001 | [001](../../specs/001-foundation-and-capture/) |
| ⌘K command palette / search · Tag index panel | 002 | [002](../../specs/002-search-and-tags/) |
| Settings & Export | 003 (export) · 004 (theme, account, danger zone) | [003](../../specs/003-export-portability/), [004](../../specs/004-hardening-and-deploy/) |
| Theme application (light/dark) across all screens | 004 | [004](../../specs/004-hardening-and-deploy/) |

## Source materials

- **Wireframes** — *Trace — V1 wireframes* (low-fidelity, grayscale, structural;
  these frames lock layout + flow). Color & theming are applied as a later step,
  captured in [color-system.md](./color-system.md).
- **Color system** — *Trace — Color System v1 · light + dark*.
- **Flow diagrams** — [`docs/diagrams/trace-diagrams.md`](../diagrams/trace-diagrams.md)
  (user flow, entry lifecycle, auth sub-flow) are the upstream behavioral source
  these wireframes realize.

## Conventions

- **Dark mode is the lead surface.** Light is a peer, not an afterthought; both
  are designed (see [color-system.md](./color-system.md)).
- **Keyboard-first.** Every primary action has a key path; the mouse/touch is a
  convenience, never a requirement (NFR-7.1).
- **Logo:** a text wordmark **`trace`** is used as a placeholder everywhere a logo
  appears until a final mark is supplied. See
  [ui-ux-spec.md § Logo](./ui-ux-spec.md#logo-placeholder).
- **Theming decision of record:** [ADR-0006](../adr/0006-design-tokens-and-theming.md).
