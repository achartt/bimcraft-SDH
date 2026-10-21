# F01 feature handoff

Feature: F01 — Integration baseline and standalone test workflow.
State: **review fixes implemented; renewed clean baseline and CI validation pending**. Draft review only; neither F01 nor the prototype is merged.

## Ownership and exact state

- Branch: `feature/f01-integration-baseline`.
- Checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f01`.
- Port: 8016; owner chat `01a15f51-58fb-74b2-a2fe-d32bfcbd3c09`. Port 8015 was preserved.
- Approved base: `72664187a1cc2694d1f8972fd2e1aa5b46106bc3`.
- Source-sync implementation: `e5da3321cd52150530d00b3123c7f5234dedccd3`. This handoff/evidence follow-up changes documentation only. Exact final delivery head and its CI status are recorded in [draft PR #2](https://github.com/achartt/bimcraft-SDH/pull/2).
- PR target: `feature/wall-assemblies-dimensions`. PR #1 reverified open/draft/unmerged at the approved base; main remains `5d0e2b1cb59e3f28e72fed8c5fc6004d44564832`.
- Fresh source-sync validation clone: `/private/tmp/bimcraft-f01-sync-20261021`, created using `git clone --no-local`, with no copied vendor cache, `.cc-test` or sibling apps. Vendor setup fetched and verified all 110 files. Both local runtime reports have `dirty: false`.

## Review follow-up

Review of PR head `b2724e786a8f397037936ce6d6a38b7388fe7598` found five defects in the new test boundaries:

1. **P2 — Incomplete pin metadata could disable checks.** An empty file map or omitted import/key list could report bundled integrity without checking required assets. Validation now requires complete file/import sets, valid hashes/provenance and language keys matching the hash-verified source literals. Existing hashes were independently rechecked against the recorded immutable base; none changed.
2. **P2 — Unusable translations could pass.** Null values and empty plural objects passed the presence check; a partial live source catalog could also escape validation. Both local and live catalogs now require usable strings/plural forms.
3. **P2 — Broken TakeoffCraft could be skipped.** An empty app root or dangling root/`dev` link was treated as absent. Only actual app-root absence now skips; path errors and partial checkouts fail.
4. **P2 — Incomplete PDF-reader packages could be skipped.** Testing the entry file's existence classified a present package without that entry as absent. Only package absence now skips; partial packages, broken parent links and import/runtime errors fail.

5. **P2 — Checksums could claim stale provenance.** Updating an asset and its checksum while retaining the old revision was not independently checked. Baseline now compares pin hashes/imports/key lists with actual Git blobs at the recorded revision; missing history and mismatches fail. CI fetches full history.

Regression reproduction before fixes: **34 passed, 10 failed** (new tests exposed ten false-green cases in the old implementation). After fixes and expanded PDF/schema/source tests: **63 contract tests pass** (44 source-sync/provenance, 19 runner/dependency). The previous validation table below remains historical until clean validation of this review revision completes. No application code, source-sync pin hash, other app or merge is included.

## Source-sync resolution

The two previous standalone failures were missing source-app dependencies, not observed differences in the bundled assets. The checks now verify the bundled terrain files and generated electrical symbols against SHA-256 pins derived from the immutable approved BimCraft base. Terrain additionally checks its three vendor mappings, 38 required translation keys and invalid object-string translations. No `app/` file changed and no other app was imported.

Absent CivilCraft/CadCraft app roots produce named **live source comparison** skips, separate from executed bundled-integrity passes. Present source apps still run the original byte comparison or electrical generator/comparator. Partial installs, broken paths/imports, malformed JSON and changed source output fail. Pin mismatch and missing local assets fail even when upstream is absent. Check mode cannot rewrite assets or pins; write mode requires real sources. Pin provenance and the manual review/update procedure are in [the workflow](F01-INTEGRATION-BASELINE.md#bundled-terrainelectrical-integrity-and-live-source-comparison).

The 26 source-sync harness tests exercise these boundaries, including controlled matching source fixtures. These fixtures test the comparator/generator paths; they do not establish independent CivilCraft/CadCraft integration. Real upstream parity remains unverified.

## Acceptance

| Criterion | Result and evidence |
| --- | --- |
| 1. Fresh checkout starts on 8016 and loads fixture | Previously demonstrated on implementation head `4c01852`, Node 22.23.3: six model elements, 164 triangles; `browser-clean-node22.jpg`. Startup/application code is unchanged by the sync fix. Fresh sync clone independently fetched its vendors and completed baseline. |
| 2. Explicit baseline, execution assertions and nonzero failures | Pass. Clean Node 22/26: **574 passed, 0 failed, exit 0**. All 15 focused tests and named modes execute. Twenty-six source-sync tests and eight runner tests verify failure propagation, discovery and dependency boundaries. |
| 3. Missing TakeoffCraft does not abort residential coverage | Pass. BimCraft quantities and PDF generation execute; cross-app checks print a named skip. Partial/broken dependencies fail in harness. Real TakeoffCraft integration remains unverified. |
| 4. Fixture editing, dimensions, isolation, persistence and missing hosts | Pass within prototype scope. Lifecycle scenario rerun with the fix. Prior browser evidence demonstrates edit, undo/redo, Save IFC/reopen with 9½-inch finish and 5½-inch core dimensions, and visible unresolved missing-host rows. Full-plan and 1:10 detail PDFs rendered and inspected. Short labels at 1:50 remain an application limitation. |
| 5. CI invokes baseline; reader availability explicit | Pass on source-sync implementation: baseline **578 / 0**, legacy `npm test -- --oracles` **3 / 3 files**, evidence upload successful. Final-head status is in PR #2. |
| 6. Prototype vs F01 vs integrated work distinguished | Pass. No application changes, source PM edits or merge. Main still lacks prototype/F01. |

## Validation

Fresh Node 22 command: `npm run test:baseline` (downloads and verifies vendors).
Node 26 command in that clone: `npm run test:baseline -- --offline`.

| Stage | Clean Node 22.23.3 | Clean Node 26.9.0 | GitHub Ubuntu / Node 22 |
| --- | --- | --- | --- |
| Precision | 7 / 0 | 7 / 0 | 7 / 0 |
| Materials | 8 / 0 | 8 / 0 | 8 / 0 |
| Model | 122 / 0 | 122 / 0 | 124 / 0 |
| Comforts | 103 / 0 | 103 / 0 | 103 / 0 |
| Views2 | 104 / 0 | 104 / 0 | 104 / 0 |
| Residential | 195 / 0 | 195 / 0 | 197 / 0 |
| Fixture lifecycle | 1 / 0 | 1 / 0 | 1 / 0 |
| Source-sync contracts | 26 / 0 | 26 / 0 | 26 / 0 |
| Runner contracts | 8 / 0 | 8 / 0 | 8 / 0 |
| Total / exit | 574 / 0; exit 0 | 574 / 0; exit 0 | 578 / 0; exit 0 |

Cells are passed / failed; skipped coverage is never included. New evidence is in `evidence/f01/source-sync/`: Node 22 full stage logs and summary, both command logs, Node 26 summary and complete successful GitHub job log. Remote extra passes come from Poppler PDF checks. The successful implementation CI run is [39644245908](https://github.com/achartt/bimcraft-SDH/actions/runs/39644245908). GitHub uses the PR merge checkout; local reports identify the branch SHA directly. The PR records the subsequent documentation-only head's CI observation.

Historical red logs remain unchanged: earlier standalone deliveries had 545 local / 549 remote passes and two source-sync failures; initial residential testing aborted at missing TakeoffCraft. Those results are superseded by the source-sync evidence, not relabeled as passes.

The earlier local full `npm test -- --oracles` command passed its three discovered files, but pinned `ezdxf==1.4.4` and `ifcopenshell==0.9.0` could not install on this Python environment. Its partial venvs subsequently caused four genuine schema-check failures. These logs remain retained. The fresh baseline does not install or inherit those partial venvs; this change does not suppress their failures or fix optional package installation.

| Optional capability | Availability and evidence |
| --- | --- |
| CivilCraft/CadCraft live source parity | Actual sources absent; explicitly skipped and unverified. Bundled integrity and harness comparison paths pass separately. |
| TakeoffCraft real reader/estimate/pack sync | Absent; skipped and unverified. Absence, incomplete directory and thrown import tested. |
| External IFC reader (`web-ifc`) | Absent/skipped in fresh baseline. Installed by the separate full oracle setup; it is not IFC schema validation. |
| IFC schema (`IfcOpenShell`) | Absent/skipped in fresh baseline. Prior local pinned install and partial-venv attempts failed; no positive schema acceptance claimed. |
| PDF reader (`pdftotext`) | Absent locally; PDF text checks skipped. GitHub installs Poppler. |
| PDF inspection (`pdfinfo`, `pdftoppm`) | Bundled tools used separately for prior one-page A4 export inspection; does not imply all local suite PDF checks ran. |
| Library-repository residential assets | Absent, named skip. Synthetic fixture needs none. |

## Remaining review items

1. Independent IFC schema acceptance and real CivilCraft/CadCraft/TakeoffCraft integration remain unverified. Review legacy optional-reader setup and partial venv reporting separately.
2. Review PR #1's application diff: stable IDs, unknown-version handling, geometry/reference precision, IFC2X3/IFC4 compatibility and supported host limits. F01 exercises these contracts without certifying every imported IFC case.
3. Prior UI observations remain: blank/clipped controls and suppressed short dimension labels at whole-house scale. The 1:10 detail supplies numeric review evidence; no UI/renderer fix is included.

Shared contracts: explicit baseline discovery and exit reporting, separate optional notices, reviewed source pins, feature-owned fixture/evidence layout. No schema, geometry, material-default, reference, license or kernel changes. Stable IDs, explicit cores, cavity widths, zero-width membranes, six reference modes and project isolation remain intact.

Recommended next action: review draft PR #2's runner and pinned-asset boundary, then obtain the independent validation needed before considering PR #1/F01 integration. Keep both PRs unmerged until approved.
