# F03 performance baseline

This establishes a provisional synthetic scaling baseline, not residential release
certification. Application code and immutable F01/F02 fixtures are unchanged. No
optimization, tolerance change, modeling feature or INT-01–03 fix is included.

## Reference platform and workload

Local model measurements: Apple M5 Pro, 18 logical CPUs, 48 GiB RAM, arm64 Darwin 27.0.0,
Node 26.9.0, AC power, charged battery, low-power mode off. Shared desktop background load
is uncontrolled; thermal telemetry was unavailable. Exact kernel/power output, commit,
branch, dirty state and timestamps are embedded in raw JSON. Local browser measurements
are unavailable: sandbox listener denial, rejected tool-level escalation and Chromium
SIGABRT. Existing previews on 8016/8017 remain running and untouched.

Measured implementation: `b76e9d283e45fa4cdd138bc0d4d6328a32bc9283`, tree
`e8f7b187db2b65e5d4fcb20d93a2b9a390db2828`. Only F03 evidence/documentation was untracked
during the retained run; production and harness code matched that commit. A prior run
overlapped a failing font-cache renderer and was replaced by a full run after stopping
that renderer. No individual sample or outlier was removed from the retained run.

| Fixture | Walls | Windows | Reference dimensions | Roofs | STEP entities | Bytes | Sum of bay areas |
|---|---:|---:|---:|---:|---:|---:|---:|
| Small | 12 | 3 | 3 | 1 | 1,504 | 90,139 | 72 m² / 775 ft² |
| Medium | 36 | 9 | 9 | 1 | 3,682 | 219,188 | 216 m² / 2,325 ft² |
| Large | 96 | 24 | 24 | 1 | 9,127 | 542,426 | 576 m² / 6,200 ft² |

Each size uses detached rectangular residential bays on one level, a shared custom
assembly, a hosted window and dimension per bay, and one derived hip roof over the first
bay. Medium approximates ordinary-house wall/object scale; large approximates a substantial
custom-house wall count. **Bay-area sums are not finished house area.** No client plan,
complex roof intersection, dense furnishings, imported families, multi-storey coordination
or full drawing set is represented. Roof complexity stays fixed; its scaling includes
scanning a larger surrounding model. Validate against a real-house fixture before making
product capacity claims.

## Local results

30 retained samples per cell, five warmups for warmed operations; cold samples each use
a new Node process. Values are **p50 / p95 milliseconds**. Full distributions and memory
observations are in `model-raw.json` inside `evidence/f03/local/raw-evidence.zip`
and its generated comparison.
See [reproduction](F03-REPRODUCTION.md) for exact timing/cache definitions.

| Model operation | Small | Medium | Large |
|---|---:|---:|---:|
| Process-cold API open | 1.59 / 1.67 | 2.37 / 2.62 | 4.31 / 4.80 |
| Warm STEP indexing | 0.34 / 0.42 | 0.73 / 0.99 | 1.78 / 1.95 |
| Wall-instance commit | 1.93 / 2.69 | 3.81 / 4.35 | 12.79 / 15.16 |
| Assembly/type commit | 5.76 / 6.21 | 24.15 / 24.92 | 126.87 / 131.20 |
| Roof pitch regeneration | 1.48 / 1.76 | 3.98 / 4.19 | 17.24 / 18.61 |
| IFC serialization | 0.30 / 0.33 | 0.74 / 1.08 | 2.62 / 2.86 |
| Envelope mesh extraction | 0.49 / 0.79 | 1.09 / 1.30 | 2.83 / 4.09 |
| Plan scene preparation | 0.21 / 0.28 | 0.49 / 0.73 | 1.39 / 1.77 |
| Vector plan PDF generation | 0.20 / 0.22 | 0.53 / 0.71 | 1.20 / 1.50 |

Nearest-rank p95 is sample 29 of 30, not an interpolated percentile or a confidence bound.
No retained local group meets the p95 > 2×median noise flag; this does not prove low
variance across machines, thermal states or house shapes. The local report explicitly
marks all 30 browser size/workload groups unverified on the Mac; they are measured
separately on Linux below.

Memory: fresh-process open RSS medians are 65.8 / 67.5 / 72.6 MiB. In the long-lived warmed
runner, type-edit RSS medians are 182.3 / 250.0 / 286.5 MiB; final large PDF median is
325.4 MiB. These include previous samples, correctness reopens, garbage collection and
allocator retention. They are **not** independent per-document sizes, peak memory or leak
evidence. Raw records also retain JS heap/external/ArrayBuffer observations. Browser CDP
heap excludes worker/native/GPU memory; missing metrics remain unverified, never zero.

## Browser reference results

Successful [run 39697936624](https://github.com/achartt/bimcraft-SDH/actions/runs/39697936624),
measured browser source `faa6422d9aa0b911adb6de59bda570a2d529ddff`; clean Actions merge
`b5c49a8599b23436507498c465f2ff283a61bb5f` into the approved base. The later harness-code
head `85b627546af6349c379cf81ea2a3413cf962625f` adds trace post-processing, error-bearing
report guards and manual collection triggers; measured browser/model code is unchanged.

AMD EPYC 9V45 (4 allocated logical CPUs), 15.6 GiB RAM, x64 Linux 7.0.0-1017-azure,
Node 22.23.3, headless Chromium 151.0.7922.34 / Playwright 1.62.1, 1440 × 1000 at DPR 1.
ANGLE uses SwiftShader 5.0.0 software rendering. Power/thermal conditions are unverified;
the shared hosted runner is not equivalent to the local Apple platform. The final run's
CPU/kernel differ from the exploratory run, so differences are not an optimization claim.
Fixture bytes/hashes exactly match the local manifest.

**900 retained observations: 30 per size/workload, five warmups for warmed operations,
zero console/page errors.** No group is insufficient or flagged p95 > 2×median. Values
below are p50 / p95 milliseconds; no outliers were removed. All phase values, per-gesture
frame intervals, worker state and memory observations remain in the raw archive.

| Browser operation | Small | Medium | Large |
|---|---:|---:|---:|
| Context-cold open | 232.60 / 271.10 | 258.40 / 289.10 | 312.60 / 345.20 |
| Warm open | 123.00 / 160.10 | 131.60 / 145.90 | 174.80 / 212.40 |
| Selection / Properties feedback | 56.80 / 57.90 | 40.10 / 40.60 | 39.10 / 39.80 |
| Pan gesture maximum frame | 16.80 / 16.80 | 16.70 / 16.80 | 16.70 / 16.80 |
| Zoom gesture maximum frame | 16.80 / 16.80 | 16.80 / 16.80 | 16.80 / 16.80 |
| Wall-instance feedback | 208.20 / 215.30 | 161.10 / 191.00 | 293.20 / 322.80 |
| Assembly/type feedback | 213.00 / 245.50 | 212.50 / 215.20 | 478.30 / 497.40 |
| Roof regeneration feedback | 210.40 / 229.40 | 226.80 / 237.70 | 323.30 / 359.00 |
| IFC serialization | 1.30 / 1.50 | 3.00 / 3.20 | 7.70 / 8.30 |
| Controlled A3 plan PDF generation | 0.40 / 0.50 | 0.70 / 0.80 | 1.80 / 2.70 |

Renderer JS heap after-operation medians for context-cold open are 13.9 / 19.7 / 20.8 MiB;
type-edit medians are 38.6 / 51.6 / 80.6 MiB. Large roof-edit median is 91.4 MiB; largest
observed large-fixture heap value across workloads is 159.3 MiB. Every workload's memory
median and observed maximum are in `browser-ci/summary.json`. This is renderer JS heap,
not total browser, worker, native or GPU memory, not a measured peak and not leak evidence.
Save observations include untimed reopen checks; PDF observations include scene preparation.

The icon font omitted by the packed shell is supplied through a harness-only route from
the official shell-pinned Bootstrap Icons 1.13.2 package. This workaround is recorded in
raw metadata. Selection uses actual pointer events with selected-wall checks; edits use
Properties controls; each pan/zoom starts fitted and verifies a view change. The existing
open/pick hooks are used only as documented setup adapters. These do not certify the
clipped Annotate menu or fix inherited UI accessibility issues.

Raw samples, CPU profiles, timeline traces, saved IFCs, controlled PDFs and actual UI
Letter PDFs are retained under `evidence/f03/browser-ci`; see its README and file hashes.
All three screenshots and UI PDFs were inspected. The plans have correct page bounds,
footer/scale and wall/window/roof content. Medium/large automatic dimensions overlap in
these tightly packed synthetic layouts; short reference labels retain INT-02 suppression.
Saved IFCs differ from their seeds only at the FILE_NAME timestamp, with every DATA record
unchanged. Full-file differences were inspected, not silently stripped from a test.
The exploratory missing-icon run and the subsequent vendor-host setup failure are reported
separately; neither is used to certify targets.

## Dominant costs and justified follow-ups

The large type edit is about 22× the small median for 8× the walls. Its separate
12,433-sample CPU capture spends 85.6% inclusive in the model transaction; `updateWall`
60.9%, `readWalls` 56.5%, `GetLine` 39.0%, `readPset` 30.3%. Inclusive entries overlap.
Leading self costs: `ofType` 22.3%, `GetLine` 12.8%, `lineObject` 12.1%. Inspector overhead
remains visible (2.5% self); profile durations are not timing samples. See raw profiles
and `profiles.md` for exact function/line evidence.

Code inspection supports this: type saves call `updateWall` per affected instance; it
reconstructs `readWalls`, assemblies, levels and property/relationship views repeatedly.
Corner rejoining performs another round. The smallest justified experiment is a
**transaction-scoped read snapshot/index**, with explicit invalidation after mutations
and unchanged F02 checks. Compare identical fixture hashes and add a real-house sample.
Do not globally cache mutable records, skip contract checks or suppress dependencies.

Browser phases confirm that raw parsing and mesh extraction are not the leading large
edit costs. For a type edit, per-sample phase sums have these medians (ms):

| Phase (overlapping; do not add) | Medium | Large |
|---|---:|---:|
| Model transaction/dependencies | 40.6 | 189.7 |
| IFC serialization | 6.3 | 13.2 |
| Worker open until adoption | 1.8 | 3.6 |
| Mesh extraction and batch callback | 3.7 | 8.3 |
| Full IfcModel.load | 5.9 | 12.8 |
| Actual plan Canvas draw calls | 1.0 | 2.0 |
| End-to-end feedback | 212.5 | 478.3 |

`load-total` includes worker/mesh spans; transaction spans can include serialization.
Their medians cannot be summed or subtracted to infer UI time. Medium context-cold load
has worker/mesh medians 19.6/29.1 ms versus warm 1.9/4.8 ms; full open also includes kernel,
viewer/UI setup and paint opportunities beyond those phases.

The representative large trace's feedback marker is 559.66 ms with profiling enabled,
separate from percentile samples. Its main-thread click dispatch lasts 273.56 ms and
post-message handling 98.02 ms; nested event totals overlap. Style recalculation totals
16.32 ms, layout 8.12 ms, paint 11.19 ms and rAF callbacks 23.95 ms within that marker.
The large browser CPU profile identifies `lineObject` (77.8 ms self), `planLoops`
(53.2 ms self), and `readPset` (27.7 ms self), with `modelChange` 200.7 ms inclusive.
The full capture includes substantial unattributed `(program)` and automation/setup time;
that bucket is not attributed to an app function. See `phases.md`, `profiles.md` and
`trace-summary.md`, with the original profiles/traces for inspection.

After the transaction-scoped read experiment, isolate the repeated plan-loop/panel-refresh
work around `model-ui.js:apply` and `bimcraft.js:rebuildNow`. Test a bounded invalidation
change only if a follow-up retains identical correctness/identity/refusal checks. The
present data does not justify replacing the parser, broad incremental-rebuild changes,
a Rust/WASM migration, or prioritizing the sub-3 ms controlled PDF generator.

## Provisional UX targets

Retain 100 ms selection/Properties, 33 ms interactive frames and 500 ms committed edit
p95 as provisional investigation targets. On the synthetic medium fixture, the browser
reference meets them: selection p95 40.6 ms, pan/zoom gesture-maximum p95 16.8 ms and
wall/type/roof edit p95 191.0 / 215.2 / 237.7 ms. Small also meets all three categories.

Large meets the numeric p95 thresholds in this run, but type-edit p95 is **497.4 ms**:
only 2.6 ms below budget. One of 30 samples took 531.1 ms; the separate profiled edit took
559.66 ms. The latter is not pooled into unprofiled percentiles. This is marginal headroom,
not a robust release pass. Retain the target and investigate the observed model/UI costs;
do not raise the budget or relax precision to call the result comfortable.

A real-house fixture and agreed user hardware/browser are still needed for capacity or
release claims. No local Apple browser pass is claimed. Headless software rendering,
synthetic geometry, instrumentation and transport/frame scheduling limit generalization.

## Validation and limits

- All 110 vendor files verified from the local cache; no replacement downloads needed.
- Four harness tests pass: byte regeneration across a second boundary, all 27 model
  size/workload groups, invalid evidence and insufficient-sample behavior.
- Initial pristine-base baseline without Poppler: 623 executed passes, zero individual
  failures, **aggregate failure** because residential had 194 against minimum 195.
  Retained in `validation/base-baseline.*`, not relabeled a pass.
- With real bundled Poppler on PATH: **628 passed, zero failed**; F02's 21 behavior tests
  and original precision/material suites pass. Skips: absent optional web-ifc/IfcOpenShell
  baseline wrappers, sibling apps and library-repository data.
- Independent IfcOpenShell: 12 F03 seed/edit files, zero schema/EXPRESS findings; maximum
  exported height/dimension error 3.1833e-12 mm. Counts, persistent identities, cavity
  material/width, zero membrane, units and reference host links checked.
- Final harness-code `85b6275` CI Tests run `39698929235` succeeded: enriched baseline 646/0, legacy tests
  3/3 files, F03 smoke 4/4, independent F01/F02 acceptance passed. F02 maxima remain
  point 0.0020386013 mm, dimension 0.0009286677 mm, shape 0.001456 mm.
  CI retains four residential availability notices; absent library/sibling inputs and
  optional Revit/RFA sample exports are not counted as passes.
- F02's 0.005 mm bound / 0.001 mm shape gate, migration/refusal and isolation are unchanged.
- Known timestamp-sensitive comforts assertion is preserved. It did not fail in these
  local runs; zero rewritten walls with header-only time drift remains a known issue.
- Poppler inspection of all three one-page A3 PDFs: wall/window layouts, page bounds,
  footer and scale are intact. Short thickness labels retain INT-02 suppression. No new
  per-layer fill or external-reader appearance claim.

Browser collection and correctness succeeded for the provisional reference; production
capacity, real-house acceptance, physical presentation latency and local Mac browser
performance remain unverified. No optimization is included.
