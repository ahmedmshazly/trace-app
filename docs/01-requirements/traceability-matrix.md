# Requirements Traceability Matrix — Trace V1

**Status:** Living document · **Last updated:** 2026-06-18

End-to-end traceability so nothing is orphaned and nothing is built without a
reason. Reads left-to-right: **Constitution principle → Requirement → User story
→ Design artifact → Verification**. Update this matrix whenever requirements,
specs, or tests change (Constitution III).

Legend for features/stories: US1 capture · US2 auth+isolation · US3 timeline ·
US4 curation (see [`specs/001-foundation-and-capture/spec.md`](../../specs/001-foundation-and-capture/spec.md)).
Later features are now fully specified: [002 search/tags](../../specs/002-search-and-tags/),
[003 export](../../specs/003-export-portability/),
[004 hardening/deploy](../../specs/004-hardening-and-deploy/) (see [roadmap](../03-project/roadmap.md)).
The interface design that realizes these requirements lives in the
[design layer](../06-design/README.md): [UI/UX spec](../06-design/ui-ux-spec.md),
[color system](../06-design/color-system.md) (dark-first, [ADR-0006](../adr/0006-design-tokens-and-theming.md)).

---

## Functional requirements → everything

| FR | Principle | Story / Feature | Design artifact | Verification |
|---|---|---|---|---|
| FR-1.1 Focus on load | I | US1 (001) | ui-ux-spec §5; user-flow `HOME` | E2E capture-loop, SC-1/3 |
| FR-1.2 Auto timestamp | I, II | US1 (001) | data-model `occurredAt` | Integration entry-create |
| FR-1.3 Keyboard commit | I | US1 (001) | Flow: core loop | E2E capture-loop |
| FR-1.4 Multi-line | I | US1 (001) | Flow: core loop | E2E capture-loop |
| FR-1.5 Backdate | — | US4 (001) | entry-lifecycle; data-model | Integration entry-curate |
| FR-1.6 Inline tags | II | 002 | 002 data-model (tags); ui-ux-spec §5 | Integration (002) |
| FR-2.1 Edit | — | US4 (001) | entry-lifecycle | Integration entry-curate |
| FR-2.2 Soft delete | II | US4 (001) | entry-lifecycle; ADR-0004 | Integration entry-curate |
| FR-2.3 Immutable createdAt | II | US1 (001) | data-model; ADR-0004 | Integration entry-create |
| FR-3.1 Chronological | I | US3 (001) | flow; api-design | Integration timeline |
| FR-3.2 Day grouping | I | US3 (001) | grouping util; ADR-0005 | Integration + E2E |
| FR-3.3 Date nav | — | US3 (001) | flow | Demo |
| FR-3.4 Incremental load | VII | US3 (001) | research R-06; api-design | Integration timeline |
| FR-4.1 Full-text search | I | 002 | ui-ux-spec §6; 002 contracts | Integration (002) |
| FR-4.2 Tag filter | — | 002 | ui-ux-spec §6; 002 contracts | Integration (002) |
| FR-4.3 Date filter | — | 002 | ui-ux-spec §6; 002 contracts | Integration (002) |
| FR-4.4 Combined query | — | 002 | ui-ux-spec §6; 002 research R-005 | Integration (002) |
| FR-5.1 Tag index | — | 002 | ui-ux-spec §7; 002 contracts | Integration (002) |
| FR-5.2 Tag drill-down | — | 002 | ui-ux-spec §7; 002 | Demo (002) |
| FR-6.1 Markdown export | II | 003 | ui-ux-spec §8; 003 data-model | Integration (003) |
| FR-6.2 JSON export | II | 003 | 003 contracts; data-model | Integration (003) |
| FR-6.3 Scoped export | II | 003 | ui-ux-spec §8; 003 contracts | Integration (003) |
| FR-6.4 JSON import | II | 003+ | 003 contracts; research R-007/008 | Integration |
| FR-7.1 Registration | V | US2 (001) | flow: auth sub-flow; ADR-0003 | Integration auth |
| FR-7.2 Authentication | V | US2 (001) | security; ADR-0003 | Integration auth |
| FR-7.3 Sessions/logout | V | US2 (001) | security | Integration auth |
| FR-7.4 Scoped access | V | US2 (001) | security; research R-03 | Isolation suite |
| FR-7.5 Credential recovery | V | 004 | ui-ux-spec §4C; auth sub-flow; 004 | Integration (004) |
| FR-7.6 Account deletion | V, II | 004 | ui-ux-spec §8; 004 contracts | Integration (004) |
| FR-7.7 Account settings | — | 004 | ui-ux-spec §8; ADR-0006; 004 | Demo (004) |

## Non-functional requirements → verification

| NFR | Principle | Verification | Owner doc |
|---|---|---|---|
| NFR-1.* Performance | I | Benchmarks; SC-2/3/6 | testing-strategy, srs |
| NFR-2.* Reliability | II, IV | Persistence + crash + soft-delete tests; SC-5 | testing-strategy |
| NFR-3.* Availability/Deploy | VI | Inspection + health test | deployment, ci-cd |
| NFR-4.* Security/Privacy | V | Isolation suite + security review; SC-4 | security, testing-strategy |
| NFR-5.* Portability | II | Export/import tests; SC-7 | api-design |
| NFR-6.* Analysis-readiness | II | Schema inspection | data-model |
| NFR-7.* Usability | I | E2E + a11y checks (vs color-system contrast table) | 06-design + testing-strategy |
| NFR-8.* Maintainability | VII | Inspection; OpenAPI present | architecture |
| NFR-9.* Platform portability | — | Inspection | tech-stack |
| NFR-10.* Scalability | — | Load/scale benchmarks | testing-strategy |

## Success criteria → coverage

| SC | Statement | Covered by |
|---|---|---|
| SC-1 | Single keyboard sequence to capture | E2E capture-loop (US1) |
| SC-2 | Commit < 100 ms perceived | Perf benchmark; optimistic UI (R-04) |
| SC-3 | Core screen interactive < 2 s cold | Perf benchmark |
| SC-4 | Zero cross-user exposure | Isolation suite (US2) |
| SC-5 | No committed entry lost | Persistence tests (US1) |
| SC-6 | Responsive at 50k entries/user | Scale benchmark (US3) |
| SC-7 | Full corpus exportable | Export tests (003) |

---

**Coverage rule:** every **Must** FR must have at least one automated verification
before its feature is "done." Gaps in this matrix are release blockers.
