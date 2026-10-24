# Isolated upstream rebase — locally validated October 24, 2026

**Candidate complete:** `integration/upstream-main-20261024` at `fbe2efb3ef001f8e182e2bb4ceebc2874ecbfd85`. This is a local candidate, not a published GitHub commit/PR. Original approved main remains `3e42c21e33e642d1e07bea2fc3356344f91db00e`; no existing branch was rewritten. F28-C PR #12 and F08 PR #13 are excluded and remain separate.

## Integrated scope

Rebased the accepted fork through F28-B onto the user-selected upstream main `46275e4e09aa7a086836b98372f73422dec6d74d`, preserving original authors and merge structure. Initial divergence was 62 fork-only commits (52 non-merge) and 16 upstream-only commits. Complete original/candidate history bundles and the preservation audit are retained locally.

Resolved custom wall-selector, package-script, sheet-scale and unit-state conflicts. Preserved dynamic wall assemblies, persistent references, layered drawings, schedules and opt-in workspace behavior together with upstream's six display units, global unit control, catalogs, framing/roof and connector/plumbing changes. Audited and restored the original F03/F04 merge-only workflow and performance-tracking changes.

## Validation

- **707 baseline checks**, zero failures, with independent readers and Poppler.
- **7/7 legacy/upstream test files**, including connector, fixture, pipe and drainage suites; **14/14 focused F28/F03 tests**.
- Fresh browser checks: F04 **15**, F05 **18**, F06 **22**, F28-A **32**, F28-B **42**, six-unit compatibility **16**; all pass.
- Actual MCP discovery/new/edit/read/save/reopen/undo/save/reopen passes. Independent saved-file validation confirms its results. Catalog is 31 family-wide tools, not a count of BimCraft capabilities.
- Independent IFC/schema, persistent-reference, CSV and vector-PDF checks pass. F02's maximum point, dimension and shape errors remain below the existing 0.005 mm fixture bound. Rendered actual section, schedule and legend exports were inspected.
- Preserved all upstream new/changed English (95), Spanish (73) and Indonesian (6) catalog entries. Actual six-unit input, shared state, reload persistence and live/established fallback pass without altering raw authored model values.
- Before/after audit confirms no head, branch-reference or working-file-status changes across 13 existing checkouts. Existing previews and unsaved browser work were preserved.

Tests keep exact source heads and environments. All tested revisions have the same application-tree hash; later changes are test-only. The corrected upstream roof oracle now checks both enabled-soffit and disabled-soffit states. F28-B fixtures use fresh contexts and expect the unit selector at its upstream toolbar location. F06 records narrowly identified headless GPU driver warnings separately from application errors. Historical failed/setup attempts remain recorded.

## Remaining work and limits

No candidate remote CI, publication, PR, main merge, deployment or active branch rewrite has happened. Review this candidate before deciding how to adopt it; a future upstream contribution still needs deliberate app/test/fixture packaging separate from fork-only plans/evidence and maintainer build/CI documents.

MCP coverage catch-up remains immediate priority; the basic protocol smoke test does not implement the audited semantic gaps or certify a configured live client/package. PERF-F04-01, PERF-F05-01 and TEST-F28-01 remain OPEN. Local fixture-isolation checks pass; integrated recovery/closure remains separate. No speedup or representative-house claim.

PHP is absent locally, so full server-rendered localized UI/platform coverage was not repeated. Catalog/fallback logic and source preservation were checked; inherited English workspace labels, broader theme/platform/library services and optional missing sibling-repository checks retain their documented limits. Established layout remains default/fallback. Full F28 and broader F05 scopes remain partial.
