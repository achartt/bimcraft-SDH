# F05 follow-ups

PM accepted the bounded straight-wall slice of draft PR #7 on 2026-10-22 at delivery
`2eecde15e2b0e503ae1b55b0ae05137308027126`, against approved main
`ff0344b46ca1c29962772528c23f62d175c6d2ea`. No supported-scope correctness blocker was
found. Integration review and merge authorization remain separate; the full F05 roadmap
card is not complete. This record schedules no work and makes no production performance claim.

## PERF-F05-01 — Synchronous drawing-set generation

Status: open. Priority: medium, nonblocking for the accepted slice. Owner: unassigned;
PM to schedule a bounded profiling/performance slice. Keep this separate from
[PERF-F04-01](F04-FOLLOWUPS.md), which concerns Fine view frame responsiveness.

Expected: responsive regeneration on representative residential models. Observed:
complete drawing-set generation adds synchronous work even in Coarse on the two-wall
fixture. Representative-house responsiveness has not been certified.

| Environment | Approved Coarse generation p95 ms | F05 Coarse p95 ms | F05 Fine p95 ms |
| --- | ---: | ---: | ---: |
| Delivered Linux CI, AMD EPYC 9V74, Chromium 141 | 179.6 | 236.0 | 209.5 |
| Separate PM Mac run, Chromium 151 | 60.6 | 65.7 | 66.9 |

The delivered measurements are retained under `evidence/f05/browser-ci/` and
[run 39847466052](https://github.com/achartt/bimcraft-SDH/actions/runs/39847466052).
PM's fresh evidence is in `reviews/F05-PM-2026-10-22/` in the PM workspace, as reported
in this owner chat. Do not pool environments, discard Coarse's slower tail or infer
representative-house capacity from this fixture.

Reproduce with `tests/features/f05/browser.mjs` on the approved and feature heads, using
the same fixture and environment. Its `measure` function (reviewed delivery lines 24–35)
times complete `sheetInput` generation separately from SVG serialization, DOM/layout,
animation-frame intervals and PDF generation, using five warmups and retaining 30 samples.
The existing browser workflow configures the approved baseline and dependencies.

At reviewed delivery, `app/res-ui.js` lines 976–991 repeatedly builds authored wall
context with `sectionModel` for elevations and sections. Profile that path before choosing
an optimization. This observation alone does not establish the cause of the timing change.

Completion criteria:

- Record exact revisions, fixture, browser, hardware, viewport and raw samples on equivalent
  runs; include representative residential models and Coarse/Medium/Fine comparisons.
- Profile model-context construction, projection, drawing/layout and frame behavior
  separately before selecting a fix. Retain demonstrated slow cases and historical results.
- Agree responsiveness targets and preserve authored layer widths, explicit cores and
  anchors, blank cavities, zero-thickness membranes, hosted openings, identities, persistent
  references, project isolation and unsupported-record preservation/refusal behavior.
- Rerun the baseline, F03 harness, F04 and F05 checks after any change, including actual
  browser persistence and independent IFC/vector-PDF validation where affected. Do not lower
  correctness gates or expand geometry claims to obtain a performance pass.

## Integration and remaining scope

The delivery-head F04 rerun
[39850333751](https://github.com/achartt/bimcraft-SDH/actions/runs/39850333751) completed
successfully; the pending gate from PM review is cleared for that delivery. Revalidate
the eventual integrated commit. No merge or deployment is authorized by the PM acceptance.

Curved/oblique/end/junction cuts, finish wrapping, roof attachment, generalized detail
overlays and new associative section dimensions remain outside this slice. Inherited
icon/menu workarounds and crowded short plan labels remain separate limitations. Do not
close PERF-F04-01 or mark the entire F05 roadmap card complete on this evidence.
