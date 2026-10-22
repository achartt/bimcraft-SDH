# F04 — Layered plan graphics and vector output

Status: implemented for the supported geometry below; **draft review, not complete acceptance**.
The required real-browser workflow/screenshots and browser frame timings are blocked by
this session's execution policy. Native Canvas evidence is explicitly not browser evidence.
No merge, deployment, roadmap reconciliation, F03 changes or cross-chat messages.

## Ownership and starting point

- Repository: `https://github.com/achartt/bimcraft-SDH`; target `main`.
- Approved base: `656d46236ff32b444cbd5a2b4ebe5164858c3848`.
- Branch: `feature/f04-layered-plan-graphics`.
- Checkout: `<F04_CHECKOUT>`.
- Reserved preview: `http://127.0.0.1:8022/`; port was free, but no listener could start.
- Existing checkout was already at the approved SHA and branch. F01 `1c35f47` and
  F02 `e50de2d` ancestry verified. Existing untracked `evidence/f04/baseline-before.log`
  was preserved. No checkout reset/switched and no foreign preview stopped.
- GitHub connector verified remote main still equals the approved SHA. Shell GitHub
  DNS failed; tool-level escalation was requested and automatically rejected by the
  granular approval policy. Publication uses the authorized GitHub connector.
- Final commit and draft PR URL are recorded in the delivery/PR, avoiding a self-referential SHA.

## What changes and how to try

1. In this checkout, run `npm run fetch-vendor`, then
   `npm start -- --port 8022 --host 127.0.0.1 --offline` on a host allowing a local listener.
2. Open `fixtures/f04/layered-plans.ifc` in a separate tab, enable **Draw**.
3. Open the ground plan's existing **View range** settings through the project browser.
   Set **Plan detail** to Fine. The setting also appears in ceiling-plan settings and
   view templates. Callouts inherit their root view's detail (no new callout override).
4. Zoom into the straight wall or either curve. The cavity is blank at its real width;
   the magenta membrane is a boundary line and has no physical width. Openings cut
   both fills and boundaries. Try the straight L and T joins on the right.
5. Edit **Material library → Studs**: change color, cut pattern/color and default
   thickness. Existing layer widths, wall/core anchors and reference dimensions stay
   unchanged. Undo/redo, save IFC and reopen.
6. Export the plan PDF, and place its plan/callout on a sheet for vector PDF output.
   Print at actual size. The fixture's exterior wall is 209.55 mm total, 139.70 mm core,
   with a 25.4 mm ventilated cavity; the other assembly totals 155.575 mm.

Coarse retains envelope poché. Medium shows the same authored layer polygons and
membranes as Fine, using material base colors without hatching. Fine adds project cut
patterns. `fill:none` and cavity layers emit no paint. Old views default to Coarse;
reading them does not write. View templates carry detail, and deleting a template
preserves its effective detail on its plans. RCP detail is independently persisted.

## Acceptance and evidence

| Criterion | Result / evidence |
| --- | --- |
| 1. Deterministic fixture | PASS. Byte-reproducible IFC, two custom cores, finishes, ventilated cavities, zero membranes; 9 walls, 5 hosted openings, signed curves, reversed axes, six location-line modes, straight L/T. `tests/features/f04/fixture.mjs`. |
| 2. Authored widths/order | PASS for supported cases. Explicit offsets, exact curved vertices, chord error ≤0.002 mm, zero membrane fill area, true cavity width. Both exterior sides × six location modes tested. |
| 3. Detail behavior | PASS in model/renderer tests. Medium and Fine share identical boundaries; Coarse leaves model data unchanged. UI controls implemented; real-browser interaction pending. |
| 4. Openings/junctions | PASS for straight/isolated curved doors/windows and straight L/T. Opening height checks, no fill/boundary inside cut intervals; joined area conserved; fractional T perimeter checked independently. No wrapping/core-priority join rules. |
| 5. Material edits | PASS. Color/pattern/default changes update shared primitives without resizing or changing identities, anchors, opening parameters or reference dimensions. Undo/redo/reopen/isolation verified. |
| 6. Screen/PDF/sheets | PARTIAL acceptance. Production Canvas command parity test passes; native Canvas renders inspected. Actual vector PDF paths independently read at 1:50, 1:5, sheet 1:100 and 1:10; PDFs and enlarged/whole-plan PNGs inspected. Browser screenshots/workflow are blocked. |
| 7. Persistence/contracts | PASS in automated/independent checks. View details and material styles persist; F02 tests retained. Three IFC files pass IfcOpenShell schema/EXPRESS and physical-data comparison. No model geometry/IFC layer semantics changed. |
| 8. Impact | PARTIAL acceptance. Same fixture/machine Node scene/export timings and actual production draw() on native Skia measured before/after; browser frame timings blocked. No F03 instrumentation used or changed. |

Primary outputs under `evidence/f04/`:

- `fine-plan.pdf`, `fine-detail.pdf`, `fine-sheet.pdf`, `styled-plan.pdf` are actual
  application vector exports. Matching `fine-*.png` are Poppler renders, not screenshots.
- `native-canvas-before.png`, `native-canvas-after.png`
  execute the production Canvas painter with `@napi-rs/canvas` (Skia). These are
  renderer test artifacts, not browser screenshots or full UI acceptance.
- `independent-pdf.json`: all four scale checks retain 209.55 mm total and 25.4 mm cavity;
  maximum checked pre-door-length error is 0.000024445 mm; all below 0.005 mm.
  Membranes are vector strokes; zero raster XObjects.
- `independent-ifc.jsonl`: 3 files, zero schema findings; stable wall/type/dimension
  records and full representation/placement traversals; cavities have null IFC Material
  and ventilation; IFC4 zero membrane layers retained. IFC2X3 semantics unchanged and
  covered by the inherited material suite.
- `graphics-test.log`, `baseline-final.log`, `baseline-summary.json` retain the tests
  and explicit optional availability notices. Automated tests regenerate `.cc-test/f04` outputs. Captured review logs report
  the implementation's working tree at the approved base; this is not a claim of CI success.

## Measurements

Apple M5 Pro, arm64 macOS, 48 GiB RAM, Node 26.9.0. Five warmups, thirty samples per
operation. Same 81,715-byte fixture, SHA-256
`00425e4c58cf0351ee0984f3630952f402e2011e3f3df2bf06b8c14c0732fb8a`.
Baseline = approved implementation's coarse envelope; after = Fine layer presentation.
This intentionally measures the added feature workload, not equal-detail optimization.

| Operation | Before p50 / p95 ms | Fine p50 / p95 ms |
| --- | ---: | ---: |
| Scene assembly (Node) | 0.905 / 1.138 | 4.507 / 8.036 |
| Plan PDF | 0.271 / 0.346 | 15.731 / 16.592 |
| Sheet PDF | 0.320 / 0.439 | 15.980 / 17.424 |
| Production Canvas draw (native Skia, not browser) | 0.056 / 0.081 | 1.951 / 2.048 |

Measured vector files grew from 6,591 / 7,990 bytes to 446,185 / 445,154 bytes for plan /
sheet. Fine curves have more segments and hatches; this cost is explicit. No claim about
large models, cold startup, browser GPU paint or F03 targets. Current reproduction numbers
may differ; raw timings and exact machine/fixture metadata are in `measure-*.json`.

## Tests and reproduction

```
npm run fetch-vendor
npm run test:f04
npm run test:baseline -- --offline
node tests/features/f04/measure.mjs after
python -I tests/features/f04/independent-pdf.py
python -I tests/features/f04/independent-ifc.py
```

Pass `evidence/f04` to either Python script to validate committed review exports.
Set `F04_EVIDENCE_DIR=evidence/f04` only when deliberately refreshing review evidence.
Independent PDF requires `pypdf==6.10.0`; IFC requires the existing F01 pinned independent
requirements. CI adds both checks after the baseline and IFC-reader setup. Native
Canvas evidence is optional: `node tests/features/f04/canvas.mjs <canvas-module-path>`.
The browser-review generator is retained as a reproducible renderer-only harness for a
permitted host; it was **not** browser-verified in this session.

- Vendor integrity: **110 checked files**, 0 downloads needed, 0 failures.
- Focused F04: **13 passed / 0 failed**. Now explicitly part of baseline, minimum 13.
- Standalone baseline with bundled `pdfinfo` on PATH: **637 passed / 0 failed**.
- Inherited initial baseline log: residential had 194 passes against minimum 195 with
  no PDF reader. That was a real failed execution-count gate, not a claimed pass. Adding
  bundled `pdfinfo` enabled the executed RC.8 reader check and met 195. No minimum reduced.
- Optional skips remain: absent web-ifc oracle, local IfcOpenShell venv in this checkout,
  CadCraft/CivilCraft live source comparisons, TakeoffCraft cross-app/PDF dependency,
  library assets, and some Poppler checks requiring `pdftotext` not exposed by the bundled
  override PATH. Independent IFC checks ran separately with the already installed F02
  reader environment, read-only; no F02 files were modified.
- Comforts passed 103. No timestamp-boundary failure occurred in the final run; no model
  data was removed from any comparison.
- Poppler used a task-local fontconfig cache to avoid inaccessible default cache paths.

## Supported geometry and bounded limitations

Supported: constant-width authored straight walls; isolated signed curves (fixture bulge
±0.25); existing straight L/T envelopes, including dissimilar thicknesses; hosted radial
curve cuts and straight door/window cuts at the plan's cut height. Graphics consume
`wallOutlines` and its analytic bulged envelope. No physical join is recomputed here.

Not certified: curved-to-curved/curved-to-straight junctions, X crossings, acute complex
junctions, self-overlap, imported/variable-width wall editing, finish wrapping or core-priority
material joins. Existing overlapping physical envelopes can still produce ambiguous
material ownership in those unsupported configurations. Bounded F08 follow-up: define
physical ownership/core-priority rules and provide explicit test envelopes; then extend
F04 clipping tests to those agreed cases. Do not infer a physical join from these drawings.
Coarse uses inherited curve tessellation; Medium/Fine use ≤0.002 mm rendering chords.

Inherited clipped menu/icons and short whole-plan dimension labels remain. The detail PDF
shows both known dimensions; no general annotation layout fix is bundled. External IFC
readers may still display cavity envelopes; F04 changes drawing graphics, not 3D solids.

## Shared-code changes requiring PM awareness

- New read-only `wall-plan-graphics.js`, consumed by plan Canvas, PDF and sheet/SVG.
  `wallEdges` now may include two-point boundary segments for touching envelopes.
- F04 drawing edges avoid the existing room-union walker's fractional-node grid failure
  (reproduced on this T fixture). The room and physical-join algorithms remain untouched.
- Drawings keep six decimal places in PDF point coordinates / sheet SVG coordinates,
  instead of three PDF / two SVG, to retain the existing 0.005 mm checked drawing bound
  at tested scales. Model tolerances and IFC serialization are unchanged.
- Additive `Detail` IFC label on existing plan/RCP view psets and `detail` in template JSON.
  No recipe/library/dimension record-version changes. Existing views default to Coarse.
- Hidden door/window symbols no longer refill their physical cuts: plan layer clipping
  consumes all hosted openings, while symbol visibility remains view-controlled.
- Additive F04 baseline stage and independent CI stage; no F03 harness/fixtures/cache
  changes, no broad performance optimization and no roadmap status edits.

## Required remaining review

Automatic approval rejected the local 8022 listener escalation; shell error was `EPERM`.
Automated Chrome failed to launch. The browser tool then rejected `file://` URLs under
its HTTP/HTTPS-only policy, so no further browser workaround was attempted. Run the six
steps above on a permitted host and retain separate browser screenshots, console output,
actual Save/reopen and undo/redo interaction, and before/after browser draw timings.
Until then, F04 must remain a draft with acceptance 6/8 partially open.

Publication note: local home/workspace paths in retained logs are redacted to `<F04_CHECKOUT>`, `<WORKSPACE>` or `<USER_HOME>`. Test results, warnings and skips are unchanged.

The pre-existing `native-canvas-detail.png` is retained locally but omitted from this public PR after automatic approval rejected that exact artifact upload despite synthetic provenance checks. No alternate upload of that image is attempted.

Automatic approval also rejected publishing `styled-reopened.ifc` even after fresh test regeneration matched all records (only FILE_NAME timestamp differs). It remains local. Run `npm run test:f04` to generate all three files under `.cc-test/f04` for independent IFC validation; the committed review directory is not a complete IFC input set. Browser downloads are verified in CI but IFC binaries are excluded from published workflow artifacts.
