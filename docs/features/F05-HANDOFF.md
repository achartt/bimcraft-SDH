# F05 - Layer-aware straight-wall sections and elevations

PM accepted the bounded slice with follow-ups on 2026-10-22; ready for integration review.
Merge authorization remains separate. This does **not** complete the broader
F05 roadmap card. Draft PR: https://github.com/achartt/bimcraft-SDH/pull/7 (main).
No merge, deployment, roadmap edit, delegation or cross-chat message was performed.

## Ownership and revisions

- Owner: this F05 feature chat, `01a164f8-c26a-733e-bf5c-4aa494b5b0d3`.
- Branch: `feature/f05-wall-sections-elevations`.
- Checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f05`.
- Approved base: `ff0344b46ca1c29962772528c23f62d175c6d2ea`.
- Final code head: `ed1003d6d5c48e1efd50085291cdd8596bde20fb`.
  PM-reviewed delivery: `2eecde15e2b0e503ae1b55b0ae05137308027126` (documentation/evidence
  descendant with identical application, test, fixture and workflow trees). Subsequent
  acceptance/follow-up documentation does not extend the validated application scope.
  Use `git rev-parse HEAD` for the current branch head; recording a document's own commit
  hash inside itself is self-referential.
- Reserved preview: `http://127.0.0.1:8024/`; free at setup. Sandbox denied local
  listener startup (`EPERM`). No local preview is running; other previews were preserved.
- Complete-history supplied bundle verified, then cloned into the previously absent
  isolated destination. Exact base and F02/F03 `91b907f`/F04 ancestry verified before edits.
  No newer main substituted. PM roadmap/template copies were read without modification.
- Shell GitHub DNS was unavailable. GitHub connector published the exact local trees;
  returned commit metadata was reconstructed and SHA-verified before synchronizing this
  checkout. No working files were reset. Existing F03 fixtures/instrumentation remain unchanged.

## User-visible behavior and reproduction

1. Check port 8024 is free, run `npm run fetch-vendor`, then
   `npm start -- --port 8024 --host 127.0.0.1 --offline` on a host allowing listeners.
2. Open `fixtures/f05/wall-views.ifc` in a separate test tab. Turn on **Draw**, use
   the plan layout and Fit. The synthetic fixture has two opposite wall axes, two
   assemblies, explicit cores, ventilated cavities, zero membranes, one door and two windows.
3. In the project browser open **Sections > Section A** graphics using its settings
   button. Choose Coarse, Medium or Fine, a scale denominator (0 = automatic), and optional
   crop `left, bottom, right, top` in view mm. The existing section-line Properties retain
   Look/Flip and Depth (0 = all). Elevation settings use the same scale/crop controls.
4. Open **Sheets > F05-01 Wall section and south elevation**. Section A cuts both windows
   at x=3200. The section is 1:20 and south elevation 1:50. The exterior wall shows solid
   bands below sill 850 and above head 2200, with actual window geometry in the opening.
   The reversed partition has sill 1100/head 2100. Elevations show surfaces/openings only.
5. Edit the first wall's Properties height to 3150 mm; edit its first assembly layer
   from 19.05 to 25.4 mm; edit the first window width to 1600 and sill to 950 mm.
   Reopen the sheet. It regenerates from the current model. Material colors/patterns and
   defaults update presentation; changing a material default to 333 mm does not resize layers.
6. Undo and Redo. Save as IFC, then reopen the actual downloaded file. The section line,
   view settings, sheet placements, material styles and model references survive.
   Open the original fixture in another tab to verify project isolation.
7. For an enlarged detail, set Section A scale to 5 and crop `-150,400,150,1400`.
   Create a new A3 sheet, add Section A at its automatic placement scale, and download PDF.
   Its authored scale is 1:5. Crop does not invent a ground line or add a 500 mm model-space
   margin. The section title remains on the page. Print at actual size, without fit-to-page.
8. To create another section, use **Annotate > Section line**, click two points on a
   line perpendicular to the wall (for example x=5000, y=-450 to y=2200). Configure its
   look/depth and graphics. Existing cardinal orthographic elevations update automatically.

Coarse uses envelope poché; Medium uses material colors, exact boundaries and membranes;
Fine adds project cut patterns. Cavities remain blank at their authored widths. Zero
membranes are dashed vector strokes, with no fill area or invented thickness. Core flags
remain explicit layer metadata; core widths are unchanged. Cut outlines are heavy;
projected visible edges are thin. Level marks and notes are separate overlays.

## Acceptance

| Criterion | Result and evidence |
| --- | --- |
| 1. Deterministic fixture | PASS. Byte-identical regeneration; two assemblies, opposite axes, 139.7/88.9 mm explicit cores, 25.4/38.1 mm cavities, zero membranes, hosted door/windows, section/elevation and saved sheet. |
| 2. Dimensions/orientation/openings | PASS for supported scope. 18 F05 tests include look reversal; before/at/inside/after opening jambs; sill/head intervals; clipping; exact layer widths and zero membrane area. |
| 3. Cut/projected/detail separation | PASS. Shared cut primitives, white cavity masks, thin visible edges, no hidden elevation bands. Medium/Fine physical boundaries identical; drawing reads do not write. Actual browser controls exercised. |
| 4. Updates and defaults | PASS. Wall height, assembly, window width/sill changes propagate to current section/elevation/sheet; actual edited PDF independently reads 215.9 mm total and 950 mm lower cut. Material defaults leave geometry unchanged. |
| 5. Persistence/isolation | PASS. UI Undo/Redo, actual browser IFC download/reopen and second-tab isolation. Node IFC4/IFC2X3 lifecycle tests and existing F02 reference tests retained. |
| 6. Invalid/unsupported records | PASS within documented scope. Missing settings are read-only Coarse defaults. Unknown/corrupt/duplicate records refuse writes and remain unchanged. Missing section references refuse settings writes; invalid planes/depths refuse projection. Unsupported cuts use diagnosed envelope fallback. |
| 7. Screen/vector/sheets | PASS for fixture scales. Shared SVG/PDF primitives, inspected actual browser downloads and enlarged detail. Independent pypdf path measurements below; no raster XObjects. Bounded regression evidence only. |
| 8. Performance | MEASURED. Equivalent fixture/base/environment, five warmups and 30 retained raw samples. Generation, drawing/frame proxies and PDF time separated. Full drawing-set generation remains a noticeable synchronous operation; PERF-F05-01 and the separate PERF-F04-01 stay open. |

## PM acceptance and integration gate (2026-10-22)

PM found no supported-scope correctness blocker in reviewed delivery
`2eecde15e2b0e503ae1b55b0ae05137308027126` against approved main
`ff0344b46ca1c29962772528c23f62d175c6d2ea`. The review accepts this bounded straight-wall
slice with follow-ups; it does not authorize merge or deployment or complete the roadmap card.

Fresh PM evidence, reported in this owner chat, is retained separately in the PM workspace
at `reviews/F05-PM-2026-10-22/`. PM reported 655 baseline checks with zero failures
(optional readers/source integrations explicitly unavailable), 18 focused F05 tests and
four F03 harness tests passing. Mac Chromium 151 passed all 18 workflow checks, including
edits, material-default isolation, Undo/Redo, actual IFC save/reopen, project isolation and
another section. Four IFC outputs passed independent schema/EXPRESS validation, including
IFC2X3. Regenerated and actual downloaded PDFs passed independent vector readback with
the same 209.55/215.9 mm totals, 25.4 mm cavity, line-only membranes and approximately
0.000002056 mm checked height error. PM inspected normal/detail browser images and the
rendered edited PDF. These are PM results, distinct from the feature-owner runs below.

The previously pending delivery-head F04 browser rerun was independently checked through
GitHub after the PM review: completed successfully (last updated `2026-10-22T20:47:42Z`), including
the browser workflow, same-machine measurements and independent browser PDF readback.
All three delivery-head workflows now report success for the exact reviewed SHA:

| Workflow | Delivery-head result |
| --- | --- |
| [Tests 39850333813](https://github.com/achartt/bimcraft-SDH/actions/runs/39850333813) | Completed, success |
| [F05 browser 39850333823](https://github.com/achartt/bimcraft-SDH/actions/runs/39850333823) | Completed, success |
| [F04 browser 39850333751](https://github.com/achartt/bimcraft-SDH/actions/runs/39850333751) | Completed, success; pending review gate cleared for this delivery |

PR #7 was still draft, unmerged and mergeable when checked. Revalidate the eventual
integrated commit. [PERF-F05-01](F05-FOLLOWUPS.md) records the medium, nonblocking
drawing-set generation finding separately from F04's Fine-frame follow-up. No optimization
was included in recording the review.

## Supported geometry and safe fallbacks

Supported: isolated straight, constant-width authored wall envelopes; vertical planes
perpendicular to the wall axis at an interior station; either wall/exterior orientation;
rectangular hosted openings using actual width/sill/head; independent stacked levels;
cardinal orthographic elevations with existing triangle-depth visibility. The normal
fixture totals 209.55 mm / 155.575 mm. Edited exterior total is 215.9 mm.

Not certified: curves, oblique/end-cap cuts, junction ownership/complex joins, overlapping
walls, variable layers/imported-wall editing, finish wrapping, roof attachments or
per-layer 3D solids. Such cut walls retain inherited mesh envelope poché with a drawing
warning, rather than fabricated layers. Missing materials/unsupported recipes likewise
produce `unavailable-layers` and envelope fallback. `unsupported-cut` means use a
perpendicular plane through an isolated straight wall; `end-cut` means move off the end;
`invalid-wall`/`invalid-opening` mean repair the authored dimensions before relying on the
cut. Unknown settings show preservation/recovery feedback and disable settings saving.
Invalid/missing section levels or planes are omitted as missing views, never plausible cuts.

The existing sampled hidden-line visibility tolerances remain. Exact cut-band widths do
not certify arbitrary projected occlusion edges to 0.005 mm. No new associative section
or elevation dimension family, generalized detailing tools, window parametric system,
assembly schedules or roof workflow is included. Existing view-owned detail/annotation
systems remain separate; no drafted line is promoted into model geometry.

## Validation and evidence

- Exact approved baseline, local Node 26.9.0 with bundled Poppler: **641/0**.
- Final local baseline with installed web-ifc/IfcOpenShell readers: **677/0**, including
  **18/0 F05**, **13/0 F04**, **21/0 F02**, original precision/material/model/comforts/views2/res
  stages and unchanged minimum guards. Summary: `evidence/f05/baseline-summary.json`.
- F03 harness: **4/4**. Legacy test files: **3/3**, both the attempted oracle setup/run
  and the final offline run. Local optional oracle package downloads were blocked by DNS;
  those notices are not installed-reader passes. Full installed-reader CI is separate.
- Independent IfcOpenShell 0.9.0: four F05 IFC4/IFC2X3 outputs, zero schema/EXPRESS findings,
  stable IDs, actual layer/cavity/membrane semantics and physical-data isolation on style edit.
  F02/F04 independent acceptance was rerun, without changing their fixtures or thresholds.
- The inherited IFC2X3 steel test input has Axis without RefDirection at #135 (WR5).
  The F05 test explicitly completes that placement in its own input before authoring;
  it does not modify the inherited fixture, repair user files or suppress validator findings.
- Real Chromium workflow and downloaded-PDF acceptance ran on an isolated Actions runner.
  Screenshots, raw timings, actual PDFs and reader reports are in `evidence/f05/browser-ci`;
  lossless original artifact ZIP retains every captured screenshot.
- Local public preview was unavailable because of listener sandboxing. Chromium automation
  used existing selection/read hooks only for setup/inspection; edits use real UI controls.
  Collapsed inherited menus were revealed with DOM clicks. The omitted bootstrap-icons
  stylesheet MIME errors are explicitly recorded/allowlisted; no other browser error passed.
- Retained local failures include the initial test assertions (Buffer vs Uint8Array and
  comparing an anchor's changing offset field), an overlapping mirror-runner invocation,
  and incomplete optional reader installations. Corrected inputs/environment and sequential
  reruns pass. No threshold or execution-count gate was lowered. No failure was counted as a skip.

Independent vector readback: A3 page, section 1:20, detail 1:5, no raster XObjects.
Checked material widths 19.05/12.7/139.7/12.7 mm (edited siding 25.4 mm), total
209.55 mm (edited 215.9), cavity 25.4 mm, lower spans 850/450/950 mm; membrane paths
have zero horizontal extent. Maximum relevant height error is approximately
**0.000002056 mm**, below **0.005 mm**. These selected orthogonal fixture measurements
are a bounded regression criterion, not universal CAD or printer calibration accuracy.

Visual inspection found and corrected a false elevation diagonal from mesh triangulation,
clipped enlarged-detail titles, crop-bottom ground-line invention and the inherited
thickness-along-length overall note (6000 mm wall formerly labeled approximately 6210).
Authored envelope/opening edges now feed the existing visibility buffer for supported walls.
Existing crowded short plan labels and icon/menu accessibility remain inherited follow-ups.

## Performance

Local Apple M5 Pro / arm64 / 48 GiB / Node 26.9.0; same 45,618-byte fixture and triangles,
five warmups plus 30 samples, no outlier removal. Projection excludes model/mesh preparation;
composition, SVG serialization and PDF serialization are separately timed. Whole-process RSS
is recorded, not presented as per-model peak memory. See `performance-node.json`.

| Local Node operation | Approved Coarse p50/p95 ms | F05 Fine p50/p95 ms |
| --- | ---: | ---: |
| Section projection | 3.610 / 4.091 | 3.125 / 3.389 |
| Sheet composition | 0.017 / 0.034 | 0.030 / 0.054 |
| SVG serialization | 0.061 / 0.076 | 0.108 / 0.127 |
| Vector PDF serialization | 0.314 / 0.417 | 0.760 / 0.885 |

This compares an envelope workload to added Fine graphics, not equal-detail optimization.
The browser harness separately times complete `sheetInput` generation (four elevations,
one section and other existing set inputs), SVG generation, DOM assignment/layout, rAF
intervals and PDF generation. DOM/rAF are presentation proxies, not GPU timing or pan/zoom
latency. Browser raw records identify hardware/version and retain all samples.

Final code-head browser run [39847466052](https://github.com/achartt/bimcraft-SDH/actions/runs/39847466052)
passed the complete UI lifecycle and independent downloaded-PDF readback. AMD EPYC 9V74,
Chromium 141.0.7390.37, Node 22.23.3, Linux, SwiftShader, 1680 x 1100, DPR 1.

| Browser operation | Approved Coarse p50/p95 ms | F05 Coarse p50/p95 ms | F05 Fine p50/p95 ms |
| --- | ---: | ---: | ---: |
| Complete drawing-set generation | 176.2 / 179.6 | 213.6 / 236.0 | 199.6 / 209.5 |
| SVG serialization | 0.2 / 1.9 | 0.2 / 0.7 | 0.5 / 2.7 |
| DOM assignment / forced layout | 1.2 / 1.5 | 1.1 / 2.1 | 2.2 / 3.2 |
| rAF interval | 16.7 / 16.7 | 16.7 / 16.8 | 16.7 / 16.8 |
| Vector PDF generation | 1.4 / 1.7 | 1.2 / 2.0 | 3.6 / 6.1 |

Set-generation cost rose by about 30 ms at Fine p95 in this run. Coarse's slower tail is
retained; no samples were removed or reordered. This synchronous complete-set cost is a
finding, not a reason for an unrelated optimization. The earlier `79f4ed` reference on
AMD EPYC 7763 had p95 236.0 before / 258.9 Fine and PDF 5.1 / 10.4 ms; its original ZIP is
retained separately. Do not pool the two hardware environments. Neither run certifies
production capacity or resolves F04 Fine-plan responsiveness.

The final browser artifact ZIP SHA-256 is
`829b0eec8b65aebd9b1a2609cfd488910482a68af08e4f9c93a4885275d1127e`.
Final code-head F04 browser acceptance also passes in
[39847466170](https://github.com/achartt/bimcraft-SDH/actions/runs/39847466170).
The complete Tests workflow passed with **659/0 before optional-reader installation**
and **677/0 with installed readers**, F03 4/4 and legacy files 3/3, at [39847466112](https://github.com/achartt/bimcraft-SDH/actions/runs/39847466112);
The selected log is `evidence/f05/ci-final-code-summary.log`. Initial F05 browser attempts
without a vendor cache stalled during vendor fetch; no browser acceptance was inferred.
The final cached run above executed every browser and independent PDF check.

## Shared code, formats and integration

`res-views.js` now accepts optional authored wall/opening/material context, with an analytic
cut overlay and authored surface-edge candidates. Near/far clipping really clips triangles
that straddle the far plane. `wall-section-graphics.js` reuses F04 `layerPrimitives` and
cut patterns; `res-sheets.js` and the comforts consumer share cut-face item conversion.
Screen uses the existing sheet SVG, and PDF consumes the same sheet items. Placement
scale regenerates paper-spaced hatches without resizing geometry. Cropped projected views
avoid the inherited 500 mm padding; the datum stays at its actual level coordinate.

The only new persisted format is optional project pset `CadCraft_ProjectedViews`, per-key
JSON v1 `{version,detail,scale,crop}`. Keys are section GlobalIds or cardinal elevation sides;
crop uses view mm independent of IFC file units. Absent means Coarse/auto/no crop and reads
never migrate. Unknown/corrupt/duplicate records are preserved and scoped writes refused.
See [pre-implementation compatibility contract](F05-DESIGN.md). Materials, recipes,
reference identities, physical IFC layer sets and dimension formats are unchanged.
IFC2X3 continues omitting zero physical layers while retaining membrane recipes; IFC4
retains zero-width material layers. No new production dependency or networking is added.

Existing CI stages remain; F05 adds a minimum-count baseline stage, independent IFC/PDF
checks and an isolated browser workflow. PM should review shared `res-views`, `res-sheets`,
`res-ui`, `views-ui`, view metadata and the narrow automatic width-note correction together.

Remaining F05 slices: agreed curved/oblique/end/junction cuts, broader representative-house
visibility and level configurations, additional detail-overlay workflows and any later
associative section annotations. Coordinate junction work with F08, openings with F15/F17,
and drawing-set readiness with F22. Keep F04's performance follow-up open. Review this
bounded slice separately before any authorized integration; do not mark the full card complete.
