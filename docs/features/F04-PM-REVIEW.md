# F04 PM review prompt

Review F04 layered plan graphics for supported-scope acceptance and integration readiness.
Do not merge, deploy, update the shared roadmap, or broaden the feature during this review.

## Review target

- Repository: https://github.com/achartt/bimcraft-SDH
- Draft PR: https://github.com/achartt/bimcraft-SDH/pull/6
- Branch: `feature/f04-layered-plan-graphics`
- Assigned base: `656d46236ff32b444cbd5a2b4ebe5164858c3848`
- Browser-verified application revision: `81c81f620d20cda31be770842b7cf189608ad0ab`.
- Follow-up `4844411392c6044ee0d5bf924cf90f1cd8e7367a` fixes the CI Python environment only.
- Resolve and record the current PR head before review; subsequent documentation changes
  do not change application behavior. Check both workflows on that exact head.
- Read `docs/features/F04-HANDOFF.md`, `docs/WALL-PRECISION.md`, the F01/F02 contracts,
  and the diff against the assigned base. Locate contract files in this checkout rather
  than assuming a similarly named document is authoritative.

## Verified behavior and evidence

The feature adds Coarse/Medium/Fine plan detail, shared layer graphics for Canvas/vector
PDF/sheets, real-width blank cavities, zero-width membrane lines, hosted opening cuts,
project material styling, and persisted view detail. Existing layer widths, wall/type
identities, location/core anchors, openings and reference dimensions remain unchanged.

Actual Chromium UI checks cover fixture open, coarse default, medium/fine boundaries,
material color/pattern/default-thickness edits, Undo/Redo, plan and sheet downloads,
actual saved IFC reopen, and second-project isolation. Browser testing found and fixed
a live-material reader mismatch (IfcPlacer versus ModelWriter); layers now render live.

Evidence:

- Browser run: https://github.com/achartt/bimcraft-SDH/actions/runs/39808621154
  Its browser step passed. Its PDF step failed only because isolated Python could not
  import user-installed pypdf; do not describe the overall run as green.
- Artifact from that run: `f04-browser`, ID 12439911638. Includes actual screenshots,
  three browser-downloaded PDFs and report.json. Screenshots and Poppler-rendered PDFs
  were visually inspected. Downloaded PDFs subsequently passed independent local
  readback: 209.55 mm total, 25.4 mm cavity, 1000 mm checked segment, all errors <0.005 mm;
  14 membrane paths and no raster images per PDF.
- CI environment fix runs: browser https://github.com/achartt/bimcraft-SDH/actions/runs/39823791776
  and full tests https://github.com/achartt/bimcraft-SDH/actions/runs/39823792030.
  Check their conclusions, then check the final PR-head runs as well.
- Previous full test workflow passed: https://github.com/achartt/bimcraft-SDH/actions/runs/39808621029
- Local focused F04: 13 passed; local baseline: 637 passed; independent IFC checks:
  three files with zero schema findings. Optional reader/source availability skips are
  recorded explicitly in the handoff and logs; these are not universal coverage claims.
- Durable text evidence: `evidence/f04/browser-report.json`, `browser-pdf-readback.json`,
  existing independent PDF/IFC reports and baseline logs. Existing enlarged exports are
  checked at plan 1:5 and sheet 1:10, in addition to normal scales.

## Review steps

1. Confirm head/base, draft status, exact-head CI results and reproducible fixture hash.
2. Open `fixtures/f04/layered-plans.ifc` on the F04 preview (port 8022 on a permitted host).
   Enable Draw, choose Plan, and use project browser View range to select detail.
3. Compare Coarse, Medium and Fine on straight walls, both signed curves, doors/windows,
   reversed axes and straight L/T junctions. Medium/Fine boundaries must match. Check
   blank 25.4 mm cavity, 209.55 mm overall wall, 139.7 mm core and line-only membranes.
4. In Material library select Wood framing (`material-studs`). Change display color,
   cut pattern/color and default thickness. Existing layers must not resize. Verify
   live graphics, Undo/Redo, Save IFC/reopen and isolation from a second project.
5. Compare plan, sheet preview and exported vector PDFs. Inspect enlarged layers and
   normal-scale composition separately. Confirm no fill over openings or cavities,
   no fake membrane width, and preserved independent scale measurements.
6. Assess the measured performance cost. On the recorded small fixture, browser paint
   CPU p50/p95 goes from 0.50/0.70 ms (approved coarse) to 2.50/6.60 ms (Fine);
   PDF generation from 1.60/2.40 to 54.60/73.70 ms. Fine frame-interval p95 is 183.40 ms.
   These are same-machine samples, not a responsiveness SLA or large-model benchmark.
7. Separate F04 findings from inherited menu/icon CSS issues and crowded short dimension
   labels. DOM menu-reveal helpers mean this is not a complete accessibility review.

## Integration and scope constraints

Main advanced to `91b907f4ba1edf7fe781eab44135f22ebc65fa0c` through F03 PR #5. PR #6
has conflicts in `.github/workflows/test.yml` and `package.json`. Feature-head checks
are intentionally available on push because conflict prevents merge-event checks.
A separate approved integration step must preserve both F03/F04 test stages and rerun
all required gates on the integrated commit. This review does not authorize that merge.

Supported: constant-width straight walls, isolated signed curves, existing straight
L/T envelopes, and hosted cuts at the view's cut height. Not certified: curved junctions,
X/acute complex junctions, self-overlap, variable-width/imported wall editing, wrapping,
or core-priority material joins. Physical joins and F03 instrumentation are unchanged.

Two prior artifact uploads were rejected by automatic approval: native-canvas-detail.png
and styled-reopened.ifc remain local and are intentionally omitted. Regenerate IFC
validation files with `npm run test:f04`; browser IFC downloads are verified but excluded
from CI artifacts. Do not treat either omission as a lost test or re-upload instruction.

## Requested PM response

Return:

- Verdict: accept supported scope, accept with follow-ups, or request changes.
- Findings ordered by severity, with reproducible steps, expected/actual behavior,
  file/line references where useful, and the evidence supporting each finding.
- An acceptance table for fixture/precision, detail, openings/joins, materials,
  Canvas/PDF/sheets, persistence/contracts and measured performance.
- Separate product blockers, inherited issues, bounded follow-ups and integration work.
- A clear statement of whether the feature is ready for an integration review; do not
  equate a feature-head pass with a merge/deployment approval.
