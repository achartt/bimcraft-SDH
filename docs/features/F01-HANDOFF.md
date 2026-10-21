# F01 feature handoff

Feature: F01 — Integration baseline and standalone test workflow.
State: **source-sync boundary implemented; fresh validation of this revision pending**. Draft review is appropriate; neither F01 nor the prototype is merged.

## Ownership and exact state

- Branch: `feature/f01-integration-baseline`.
- Checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f01`.
- Port: 8016; owner chat `01a15f51-58fb-74b2-a2fe-d32bfcbd3c09`. Port 8015 was preserved.
- Approved base: `72664187a1cc2694d1f8972fd2e1aa5b46106bc3`.
- Implementation head: `4c018522552b0fe5897558315b6e509611e2770b`; subsequent delivery commit contains only evidence and documentation. The final exact delivery head and its CI status are recorded in [draft PR #2](https://github.com/achartt/bimcraft-SDH/pull/2).
- PR target: `feature/wall-assemblies-dimensions`. PR #1 was reverified open/draft/unmerged with unchanged base/head before publication.
- Independent clone: `/private/tmp/bimcraft-f01-clean-20261021`, created using `git clone --no-local`, with no copied vendor cache or `.cc-test`. Both clone and feature checkout belong to this F01 chat.

The source-sync follow-up adds immutable bundle pins and 26 failure-path tests; real upstream comparisons remain explicitly unverified when sources are absent. The validation tables below describe the previous delivery and will be superseded after fresh validation.

## Acceptance

| Criterion | Result and evidence |
| --- | --- |
| 1. Fresh checkout starts on 8016 and loads fixture | Pass on implementation head, Node 22.23.3; six model elements, 164 triangles. `browser-clean-node22.jpg`. Initial fresh vendor fetch encountered a transient network error; retry fetched the remaining 10 files and verified all 110. No sibling app dependencies were used. |
| 2. Explicit baseline, execution assertions and nonzero failures | Pass for workflow; baseline itself is red. Both clean runtimes report 545 passes, 2 failures. All 15 focused tests plus named modes execute. Seven runner tests cover discovery, insufficient counts, skips, deliberate process failure/continuation and absent/partial/broken TakeoffCraft. |
| 3. Missing TakeoffCraft does not abort BimCraft residential coverage | Pass. RC.8 BimCraft quantities and PDF generation execute. Cross-app checks print a named skip. Real TakeoffCraft present-path integration remains unverified; harness proves malformed present installations fail rather than skip. |
| 4. Fixture editing, dimensions, isolation, persistence and missing hosts | Pass within documented prototype scope. Scripted lifecycle checks exact dimensions/anchors/IDs, opening retention, material isolation, cavity/membrane, undo/redo and reopen. Browser independently demonstrates edit, undo/redo, Save as IFC, reopen with 9 1/2-inch finish and 5 1/2-inch core dimensions, and explicit unresolved missing-host rows. Full-plan and 1:10 detail PDFs rendered and inspected. Short labels at 1:50 remain an application limitation. |
| 5. CI invokes baseline; reader availability explicit | Pass for wiring/reporting; CI is not green. First remote run on implementation head: 549 passes and 2 failures in baseline, legacy full command succeeds, artifacts uploaded. Final-head status is in PR #2. Reader availability is separated below. |
| 6. Prototype vs F01 vs integrated work distinguished | Pass. No `app/` changes. Source PM notes unchanged. Main still lacks prototype/F01. No merge or integrated SHA claimed. |

## Validation

Command: `npm run test:baseline -- --offline` after `npm run fetch-vendor`.

| Stage | Clean Node 22.23.3 | Clean Node 26.9.0 | First GitHub Ubuntu/Node 22 baseline |
| --- | --- | --- | --- |
| Precision | 7 / 0 | 7 / 0 | 7 / 0 |
| Materials | 8 / 0 | 8 / 0 | 8 / 0 |
| Model | 122 / 0 | 122 / 0 | 124 / 0 |
| Comforts | 103 / 0 | 103 / 0 | 103 / 0 |
| Views2 | 104 / 0 | 104 / 0 | 104 / 0 |
| Residential | 193 / 2 | 193 / 2 | 195 / 2 |
| Fixture lifecycle | 1 / 0 | 1 / 0 | 1 / 0 |
| Runner contracts | 7 / 0 | 7 / 0 | 7 / 0 |
| Baseline exit | 1 | 1 | 1 |

Cells are passed / failed; skipped coverage is never added to these numbers. Remote extra passes come from installed PDF tooling. Raw clean logs and JSON summaries identify the tested SHA and `dirty: false`. First remote run: https://github.com/achartt/bimcraft-SDH/actions/runs/39640704015 . The baseline step fails, the subsequent full oracle step passes, and evidence upload succeeds.

Initial pre-change baseline reproduced 7/8 and 122/103/104, then residential aborted importing TakeoffCraft. `npm test -- --oracles` on the development checkout passes three discovered test files, but pinned `ezdxf==1.4.4` and `ifcopenshell==0.9.0` cannot install on this local Python environment. A later oracle-equipped baseline sees four legacy schema-check failures because partial venvs exist without IfcOpenShell, in addition to the two source-sync failures. Those logs are retained, not relabeled green. The clean baseline above ran without those partial venvs.

| Optional capability | Availability and evidence |
| --- | --- |
| TakeoffCraft real reader/estimate/pack sync | Absent; skipped and unverified. Absence, incomplete directory, and thrown import tested in harness. |
| External IFC reader (`web-ifc`) | Absent in fresh baseline. Installed by full `--oracles` setup in development checkout; subsequent named-mode oracle checks execute. This is separate from IFC schema validation. |
| IFC schema (`IfcOpenShell`) | Absent in fresh baseline and skipped. Local pinned install fails. Partial-venv schema attempts fail, providing no positive validation evidence. |
| PDF reader (`pdftotext`) | Absent in local baseline; PDF text checks skipped. GitHub installs Poppler. |
| PDF inspection (`pdfinfo`, `pdftoppm`) | Bundled tools available for separate export inspection; one-page A4 PDFs rendered. Does not imply all local suite PDF checks ran. |
| Library-repository residential assets | Absent, named skip. Synthetic fixture needs none of them. |

## Remaining blockers and review items

1. Terrain now checks the approved-base bundle hashes, vendor imports and required translations; absent CivilCraft is a named live-comparison skip. Partial or broken sources still fail.
2. Electrical now checks the approved-base generated-file hash; absent CadCraft is a named live-comparison skip. Its original generator/comparator still runs whenever the source app is present. No other app was imported.
3. Independent IFC schema acceptance and a real TakeoffCraft present-dependency run remain unverified. Review legacy optional-reader exception handling and partial venv reporting separately.
4. PR #1 still needs application-diff review: stable IDs, unknown-version behavior, geometry/reference precision, IFC2X3/IFC4 compatibility and supported host limits. F01 tests those existing contracts but does not redesign or certify every imported IFC case.
5. UI observations: some menu/toolbar labels are blank, and narrow layout clips controls. Short printed dimension labels are suppressed at whole-house scale. The 1:10 detail provides reviewable numeric evidence; no renderer/UI fixes are included.

Shared contracts: adds `test:baseline` and `fixture:f01`, explicit discovery/exit reporting, `.cc-test/baseline` logs and feature-owned fixture/export layout. RC.8 optionality is restricted to an absent app directory. No schema, geometry, material defaults, reference semantics, dependency licenses or kernel changes. Two custom types, explicit cores, cavity widths, zero membrane records, six existing reference modes and project isolation remain intact.

Recommended next action: review draft PR #2's runner/fixture boundary, including the pinned source-sync contract, then coordinate independent upstream and external validation before approving integration of PR #1 and F01. Keep subsequent feature work pinned to an explicitly accepted SHA. Do not mark the foundation integrated merely because the workflow is reproducible.
