# F01 feature handoff

Feature: F01 — Integration baseline and standalone test workflow.
State: **independent fixture and real upstream validation completed; approved export defects fixed**. Draft review only; PR #1 and PR #2 remain unmerged. Final committed-head CI observation is recorded in [PR #2](https://github.com/achartt/bimcraft-SDH/pull/2).

## Ownership and exact state

- Branch / checkout: `feature/f01-integration-baseline`, `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f01`.
- Port / owner: 8016, chat `01a15f51-58fb-74b2-a2fe-d32bfcbd3c09`. Port 8015 and the source checkout were preserved.
- Approved base / PR target: `72664187a1cc2694d1f8972fd2e1aa5b46106bc3`, `feature/wall-assemblies-dimensions`.
- Prior delivered head: `5c05e7a9874cdca451f5d19a3175eb2d2a2da2a6`; this follow-up extends its reviewed test-boundary fixes. Exact final SHA, clean-head results and CI links are in PR #2 to avoid a self-referential commit ID.
- PR #1 reverified open/draft/unmerged at the approved base; main remains `5d0e2b1cb59e3f28e72fed8c5fc6004d44564832`.
- Independent environment: `/private/tmp/f01-independent-validation-20261021`, Python 3.12.14 / IfcOpenShell 0.9.0 / pytest 9.1.1; Node 22.23.3 / web-ifc 0.0.78 / pdfjs-dist 6.3.289 / bundled Poppler. No oracle code is shipped or imported into the application.

## Findings and approved corrections

Independent validation found that the inherited Python wrapper ignored IfcOpenShell's lowercase `error` severity. Its initial zero-error report was false; this was corrected before acceptance. File-path validation now retains parser findings, error severities are normalized, unknown severities fail, and `--rules` enables EXPRESS checks.

The user explicitly approved these application changes:

1. `project-materials.js`: IFC4 material-property Name is an `IfcIdentifier`, not an `IfcLabel` wrapper. IFC2X3's distinct argument remains unchanged.
2. `ifc-place.js`: relating an already typed object to the same type is idempotent, preventing duplicated RelatedObjects on assembly edits. This prevents new duplicates; it is not an arbitrary imported-file migration.
3. `new-model.js`: ADDED owner history receives the required modification timestamp, equal to its creation timestamp.
4. `ifc-place.js`: newly created representation subcontexts include the four derived fields before ParentContext/TargetView. Broader independent checks found this additional defect; the user separately approved the tested correction.

The original fixture set had **6 / 10 / 9 schema+EXPRESS errors**. The seed was narrowly repaired (five Name values and one timestamp), and both derivatives regenerated through the corrected producers. GlobalIds and geometry were preserved. Broader installed-reader testing then exposed **two failing suites** from the subcontext defect; after its correction all twelve saved IFC4/IFC2X3/unit variants pass structural validation. Before-fix errors remain in `evidence/f01/independent/`.

The three source-sync asset hashes and recorded base revision remain unchanged. No upstream app was imported wholesale, no CAD kernel was installed/replaced in the product, and no PM ledger/source checkout was edited.

## Acceptance and validation

| Criterion | Current evidence |
| --- | --- |
| Fresh standalone start and fixture loading | Prior isolated Node 22 startup/browser evidence on 8016 remains in `evidence/f01/`; export corrections do not alter fixture geometry. Final-head standalone baseline is rerun separately from enriched validation. |
| Explicit baseline and nonzero failures | Nine stages include all 15 focused tests, named modes, lifecycle, 44 sync/provenance and 19 runner contracts. Historical clean baseline: 603 local / 607 Ubuntu checks. Installed-reader and final-head counts are separate below/in the PR. |
| Optional-source boundaries | Only absent app/package roots skip. Present partial trees, broken links/imports, malformed JSON and drift fail. Controlled failure tests remain; actual sources now pass as well. |
| Independent fixture acceptance | **Six IFC files pass**: committed seed/edited/missing-host plus a freshly generated trio, with zero IfcOpenShell schema/EXPRESS diagnostics. Independent Body geometry, thickness, height, opening/window, real dimension curves, IDs/references and missing-host checks pass. Three real negative controls must fail. |
| Lifecycle and print evidence | Core-anchored edit 209.55 → 241.30 mm, core 139.7 mm, stable IDs, material-default isolation, 25.4 mm cavity, zero membrane, undo/redo/reopen and missing host pass. Regenerated plan/detail PDFs are byte-identical to previously rendered/inspected exports. |
| Real upstream parity / integration | CivilCraft terrain, CadCraft 16 symbols, TakeoffCraft 31 mappings and RC.8 **15/0** pass from immutable real sources; no upstream skips. |
| CI | Requires standalone baseline, independent fixture acceptance and legacy tests, then reruns the baseline with installed readers. Evidence uploads even on failure. Final observed run is linked in PR #2. |
| Integration state | Both PRs draft/unmerged; main lacks prototype/F01. Four application export fixes are explicitly approved follow-up scope. |

Enriched run with approved fixes, all selected upstream files and installed readers: **637 passed, 0 failed, exit 0**.

| Stage | Pass / fail |
| --- | --- |
| Precision / materials | 7 / 0; 8 / 0 |
| Model | 129 / 0 |
| Comforts | 106 / 0 |
| Views2 | 105 / 0 |
| Residential | 218 / 0 |
| Fixture lifecycle | 1 / 0 |
| Source-sync / runner contracts | 44 / 0; 19 / 0 |

Only the unrelated library-repository asset check skips in that run. The report honestly says `dirty: true`: the isolated clone started at the prior head and received the approved patches. Clean committed-head and remote results are recorded separately in the PR. Optional skips are never included in pass counts.

## Real source provenance

Only **26 files / 840,876 bytes** were fetched into the isolated mirror, including required transitive imports and six packs. The committed `upstream-files.json` records immutable revisions, paths, Git blob IDs and SHA-256 values; all were verified. Actual source files remain outside the repository.

| Source | Revision | Result |
| --- | --- | --- |
| CivilCraft | `b57d9a6bfb08881625c4b7361d0b7083d1bfd916` | Terrain copies/imports/translations match |
| CadCraft | `93b7f5eb58b94e726a5d5333dd792cca8f1d7a14` | Generator matches all 16 symbols |
| TakeoffCraft | `0a334c467cd3f750afd818523fd48bb7715e736f` | 31 mappings match; PDF attachment/readProject/quantity/estimate tests pass |

RC.8 reads the actual 3-sheet PDF with pdfjs and TakeoffCraft, loads 23 items/255 marks without warnings, verifies measured quantities, runs the estimate formulas and checks the 21-piece cut list. Poppler independently opens the PDF. Its only schema notice is “nothing saved”: RC.8 produces PDF/JSON, not IFC. Reproduction commands and exact outputs are in [the independent packet](../../evidence/f01/independent/README.md). Baseline setup/CI never fetches these other apps; the explicit helper fetches only the reviewed file closure. Parity is established at the recorded revisions, not at every future upstream tip.

## Reader availability and remaining limits

| Capability | Result / limit |
| --- | --- |
| IfcOpenShell | Mandatory dedicated fixture checks pass with EXPRESS rules; broader saved-model structural checks pass with the approved fixes. Python 3.12 resolved the earlier Python 3.9 install gap. |
| web-ifc | Independent counts/identity/geometry pass for all six files (6/6/4 meshed products, 140/140/48 triangles per set). **Material/color diagnostics remain** for the valid null-material cavity layer; this is not a clean appearance acceptance claim. |
| PDF | Actual TakeoffCraft/pdfjs attachment readback and Poppler pass. Regenerated review PDFs exactly match the previously inspected files. Short full-plan labels are still suppressed by the prototype; detail export supplies readable dimensions. |
| Library repository | Absent; item checks explicitly skip. Not needed by this synthetic fixture. |
| Existing partial local venvs | The main working checkout's old partial venv still fails four schema checks. These failures are preserved in the evidence; no environment deletion or false-green skip was used. Fresh/isolated environments pass. |

Black-box web-ifc experiments eliminated its messages by removing only material associations or assigning a temporary cavity material, while preserving mesh counts. Those temporary variants were **not** substituted for the accepted fixture. IfcOpenShell accepts the original null material; changing cavity semantics solely to suppress reader messages would be inappropriate. Keep this interoperability limit visible when reviewing PR #1.

Prior review history remains valid: incomplete pins, unusable translations, partial TakeoffCraft roots, partial PDF packages and rehashed assets with stale provenance were fixed with 63 contract tests. Missing Git history still fails; CI fetches full history. Evidence remains under `evidence/f01/review/` and `source-sync/`. Earlier source-sync/partial-venv failures remain historical evidence, not passes.

No known schema blocker remains in the exercised fixture and named regression modes. This does not certify arbitrary imported IFCs, all prototype UI behavior, solid-material takeoffs, roof/window scope or performance. Review PR #1's remaining application scope and the documented web-ifc appearance limitation. Stable material/type/product/reference IDs, explicit cores, all six reference modes, zero-width membranes and project isolation remain intact.

Recommended next action: review the approved export fixes and the independent evidence in draft PR #2. Keep both PRs unmerged until integration is separately approved.
