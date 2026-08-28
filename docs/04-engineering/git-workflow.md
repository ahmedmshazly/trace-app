# Git Workflow: Trace

**Status:** Baseline · **Last updated:** 2026-06-18

Branching, commits, and PR conventions. Goal: `main` is always releasable.

---

## Model: trunk-based with short-lived feature branches

- `main` is the trunk and is always in a releasable state.
- Work happens on **short-lived feature branches** cut from `main`.
- Branches merge back via **pull request** with green CI and review.
- No long-running divergent branches.

## Branch naming

```
<type>/<short-description>
```

- `type` ∈ `feat` · `fix` · `docs` · `chore` · `refactor` · `test` · `perf`.
- Description is lowercase kebab-case, scoped to one change.
- For features, align the branch with the feature folder, e.g. a feature in `specs/001-foundation-and-capture/` is built on a branch named for that work.

Examples: `feat/capture-loop`, `fix/timeline-day-boundary`, `docs/srs-baseline`.

## Commits

- **Conventional Commits**: `type(scope): summary`.
  - e.g. `feat(entry): immutable createdAt on commit`, `test(auth): isolation suite`.
- **One logical change per commit.** Don't batch unrelated changes.
- Imperative mood, present tense ("add", not "added").
- Body explains *why* when it isn't obvious; reference the feature/spec.
- Commit after each task or coherent group (Constitution: small logical commits).

## Pull requests

A PR MUST:

1. Be scoped to one feature or coherent sub-slice.
2. Link to its spec/feature (`specs/NNN-...`).
3. Pass all CI gates (lint, typecheck, unit, integration incl. isolation, e2e for UI).
4. Keep docs in sync with behavior (Definition of Done).
5. Update the [traceability matrix](../01-requirements/traceability-matrix.md) where requirements were realized.

PR description should summarize **what** and **why**, list notable decisions, and
note any new ADRs.

## Review

- At least one reviewing pass before merge (the accountable human; see [RACI](../03-project/raci.md)).
- Review focuses on substance: correctness, isolation/security, adherence to the Constitution, test coverage, not formatting (that's automated).

## Merge policy

- **Squash or rebase** to keep `main` history linear and readable; each merged PR is a coherent unit.
- Do not force-push shared branches; do not amend others' commits.
- Do not enable auto-merge unless explicitly decided.

## Hygiene

- `.env`, build artifacts, `node_modules/`, and coverage output are gitignored.
- Secrets never enter git history (see [security](../02-architecture/security.md)).
- Large/binary/generated files are avoided in the repo.

## Releases (from Stage 4 onward)

- Releases are cut from `main` and tagged (semantic version).
- A release is gated on green CI and the release-blocking NFRs (isolation, no-data-loss, HTTPS, hashed credentials, config-driven deploy, export). See [ci-cd](./ci-cd.md) and [deployment](../05-operations/deployment.md).
