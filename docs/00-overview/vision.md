# Trace: Product Vision

**Document owner:** Product · **Status:** Approved · **Last updated:** 2026-06-18

---

## The one-sentence vision

**Trace is a frictionless personal timeline where the unit of writing is a
*moment*, not a line, an effortless, plain-text-portable record of your days
that you can later mine for patterns.**

## The core reframe

In a normal text editor, the address of a piece of text is its **line number**
spatial and arbitrary (line 47 means nothing). In Trace, the address of every
entry is its **timestamp**. Time becomes the primary key of your life's record.

That single change is the whole idea. Anchoring every entry to *when* it happened
is exactly the axis you need to discover patterns later: sleep, mood, energy
crashes, when you context-switched, what you ate, what you finished. The mundane
is where the patterns hide, not the obviously notable.

## The governing principle: capture friction must be near zero

Everything Trace will eventually do, pattern discovery, recommendations, "things
you didn't notice", is worthless without a **dense, honest, consistent corpus**.
And that corpus only grows if logging never feels like a task.

So the product is ruthless about one thing: **capturing a moment must be faster
and lighter than any alternative you'd otherwise reach for.** Faster than opening
a notes app, faster than a scratch file. Every other consideration is secondary
to the capture loop.

This reframes the phrase "anything significant enough." Judging significance in
the moment is cognitive load at exactly the point where friction must be zero.
The rule instead is: **capture liberally, judge later.**

## What we are really building

The honest framing: **the product is a clean, durable, analysis-ready corpus of
timestamped entries; the app is just the most pleasant way to grow it.**

This is why data ownership and portability are non-negotiable (see the
Constitution, Principle II). Even though Trace stores data in MongoDB, a user can
always export their entire corpus to open Markdown and JSON. The corpus is never
trapped, and it stays analysis-ready as plain text.

## Who it's for (V1)

Individuals, initially technical, detail-oriented people, who want an honest,
high-resolution record of their days and believe that record will be valuable to
their future selves. Trace is hosted and multi-user: each person has a private,
isolated corpus. See [`personas.md`](./personas.md).

## What V1 is: in one line

> A dead-simple, effortless, plain-text-portable, timestamped capture loop that
> quietly accumulates an analysis-ready record of your days: capture, store,
> browse, search, export. Nothing more.

## What V1 is deliberately *not*

V1 is not the analysis engine. The single biggest risk to this product is
building the "smart" layer before there is a corpus worth analyzing. We
explicitly defer:

- The pattern / insight / recommendation engine
- Dashboards, charts, and mood graphs
- Reminders or prompts to log
- External integrations (calendar, health)
- Offline-first operation and multi-device sync engineering
- Rich-media capture (voice, images)

The data model *reserves room* for some of these (e.g. a `source` field) without
implementing them, so a later version can extend rather than restructure. See
[`../03-project/roadmap.md`](../03-project/roadmap.md).

## Prior art we borrow from

Trace stands on an established pattern, **interstitial journaling** (timestamping
entries inline as you go), and borrows conventions from `jrnl`, Org-mode
timestamps, and Obsidian daily notes, rather than reinventing them.

## How we measure success

V1 succeeds if a user **actually logs, consistently, with near-zero friction**,
and the resulting corpus is clean and portable enough that any future analysis
layer can consume it directly. Concretely:

- Capture is a single keyboard sequence, sub-100 ms perceived latency.
- No committed moment is ever lost.
- The full corpus is exportable to open formats at any time.
- Each user's data is provably private.

See measurable targets in [`../01-requirements/srs.md`](../01-requirements/srs.md)
(§ Success Criteria) and the feature spec
[`../../specs/001-foundation-and-capture/spec.md`](../../specs/001-foundation-and-capture/spec.md).
