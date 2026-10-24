# Upstream rebase — published and ready for adoption, October 24, 2026

**PM recommendation: ready to adopt via [draft PR #15](https://github.com/drsurfbum/bimcraft-SDH/pull/15).** The PR is mergeable and remains draft/unmerged. Main stays `3e42c21e33e642d1e07bea2fc3356344f91db00e`; all existing branch heads and working changes are preserved. F28-C #12 and F08 #13 are excluded and separate.

- Published clean rebase: [`integration/upstream-main-20261024`](https://github.com/drsurfbum/bimcraft-SDH/tree/integration/upstream-main-20261024), exact head `52988710919747bfde70ec3e44ba576f6d13df58`. Six exact-head workflows pass.
- Published adoption branch: [`integration/upstream-main-adoption-20261024`](https://github.com/drsurfbum/bimcraft-SDH/tree/integration/upstream-main-adoption-20261024), exact head `8e48d64ef16fc3628f112cfd17adb2031be498c8`. Seven exact-head workflows pass.

The adoption branch keeps original main and the clean rebase as ancestors. Four repeated history-merge conflicts were resolved to exactly the candidate’s files; both complete file trees are identical (`93258f6217a6025c5e6e30a552461e8cbb9e3de1`). No main rewrite or force push is needed. The clean rebase remains separately available.

## Exact adoption-head CI

| Workflow | Result |
| --- | --- |
| Tests | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40129014818) — 688 standalone / 707 installed-reader checks, zero failures; 7/7 test files |
| F04 | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40129014904) |
| F05 | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40129014849) |
| F06 | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40129014868) |
| F28-A | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40129014843) |
| F28-B | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40129014827) |
| Upstream compatibility | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40129014893) — 19 browser checks; actual MCP and independent persisted-file checks |

PHP 8.3.6 now exercises actual Spanish, Indonesian and pseudo-locale pages, fallback unit labels and unchanged authored records. The six unit modes, real reloads and live/established fallback pass. Actual MCP edit/read/save/reopen/undo is independently validated. This closes the earlier bounded PHP execution gap; it does not certify every translated label or full platform coverage. No raw IFC/PDF payload is uploaded by the new compatibility workflow.

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

Main adoption awaits user authorization, then exact integrated-main validation. No mark-ready transition, main merge, deployment, active branch rewrite or feature-branch deletion has occurred. The final remote audit confirms every pre-existing head is unchanged; only the two new integration branches were added.

MCP coverage catch-up remains immediate priority. The protocol smoke does not implement audited materials/assembly/reference/documentation/export gaps or certify a configured live client/package. PERF-F04-01, PERF-F05-01 and TEST-F28-01 remain OPEN. Local fixture-isolation/recovery evidence stays separate from integrated-main closure. No speedup or representative-house claim.

Full theme/platform/native-picker/library-service behavior and inherited English workspace labels retain documented limits. Established layout remains default/fallback. Full F28 and broader F05 remain partial. A later upstream contribution still needs deliberate app/test/fixture packaging separate from fork-only plans/evidence and maintainer build/CI documents.
