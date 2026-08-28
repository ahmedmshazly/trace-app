# Trace: Product Brief

**Status:** Approved · **Last updated:** 2026-06-18 · **Audience:** everyone

A one-page orientation to what Trace is, why it exists, and the shape of V1.

---

## Problem

People live high-resolution lives but keep low-resolution records of them. By the
time you want to understand a pattern, why your energy crashes, what precedes a
good week, how often a thing actually happens, the raw material is gone. Existing
tools are either too heavy (full journaling apps with friction), too unstructured
(a scratch note), or too rigid (habit trackers that only capture what you
predefined).

## Solution

A frictionless, timestamped capture loop. You type a moment, press Enter, and it
is anchored to *now* on a day-grouped timeline. Over time this accumulates into a
dense, honest, **plain-text-portable** corpus that a future analysis layer (or just your future self) can mine for patterns.

## Product pillars

| Pillar | What it means |
|---|---|
| **Frictionless capture** | Focused-on-load input, keyboard-only loop, sub-100 ms commit. |
| **Time as the primary key** | Every entry is anchored to when it happened; the timeline is the home. |
| **You own the corpus** | Export to Markdown + JSON anytime; the data is never trapped. |
| **Private by construction** | Multi-user with strict per-user isolation; no content analytics. |
| **Analysis-ready data** | Flat, time-keyed, documented schema: consumable without preprocessing. |

## Target user

Individuals who want an honest record of their days and trust it will be valuable
later. V1 leans toward technical, detail-oriented users. See
[`personas.md`](./personas.md).

## Platform & shape

- **Type:** hosted, multi-user web application (SaaS-style isolated accounts).
- **Stack:** MERN (MongoDB, Express, React, Node.js). See [ADR-0002](../adr/0002-mern-stack.md).
- **Surfaces (V1):** Auth · Capture + Timeline (the core) · Search & Filter · Tag Index · Settings & Export.
- **Development:** local-first; the same code runs on `localhost` and promotes to a host by configuration only.

## V1 scope (the Musts)

Register & sign in (isolated) → capture timestamped moments from a focused input →
browse a day-grouped timeline → search and filter by tag/date → export the whole
corpus to Markdown + JSON. All running on a deployable, secure, multi-user
foundation. Full detail in [`../01-requirements/srs.md`](../01-requirements/srs.md).

## Explicitly out of scope for V1

Analysis/insights engine, dashboards, reminders, integrations, offline-first sync,
rich media, cross-user collaboration. See [`../03-project/roadmap.md`](../03-project/roadmap.md).

## Key decisions already made

- GUI front-end (not CLI), built with MERN (*user decision*).
- Multi-user and hosting-ready from V1 (*user decision*).
- Local-first development, hosted via configuration (*Constitution standard*).
- Soft-delete only (no hard delete) in V1. See [ADR-0004](../adr/0004-soft-delete.md).
- UTC storage, local display. See [ADR-0005](../adr/0005-utc-storage-local-display.md).
- Working product name: **Trace** (a trace is, in software, a timestamped sequence of events, and the traces a life leaves behind).

## How the work is organized

Trace uses **Spec-Driven Development**. Every feature flows
Constitution → Spec → Plan → Tasks → Implement. See
[`../04-engineering/development-workflow.md`](../04-engineering/development-workflow.md)
and the live first feature
[`../../specs/001-foundation-and-capture/`](../../specs/001-foundation-and-capture/).
