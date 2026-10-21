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
marks all 30 browser size/workload groups unverified.

Memory: fresh-process open RSS medians are 65.8 / 67.5 / 72.6 MiB. In the long-lived warmed
runner, type-edit RSS medians are 182.3 / 250.0 / 286.5 MiB; final large PDF median is
325.4 MiB. These include previous samples, correctness reopens, garbage collection and
allocator retention. They are **not** independent per-document sizes, peak memory or leak
evidence. Raw records also retain JS heap/external/ArrayBuffer observations. Browser CDP
heap excludes worker/native/GPU memory; missing metrics remain unverified, never zero.

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

The browser's existing commit path serializes/reloads the full model, rebuilds geometry
and refreshes panels (`bimcraft.js:rebuildNow`, `model-ui.js:apply`). This is a code-inspection
hypothesis until browser phase evidence quantifies it. If dominant, test the smallest
safe incremental rebuild boundary. The local data does not justify a parser rewrite,
Rust/WASM migration or PDF optimization.

## Provisional UX targets

Retain 100 ms selection/Properties, 33 ms interactive frames and 500 ms committed edit
p95 as investigation targets. Medium model-only edits are below 500 ms, but the target
covers visible completion. **No local browser target pass is claimed.** A slow browser
result is a finding, not permission to relax precision or silently revise targets.
Revisit budgets after a representative house and agreed hardware/browser are measured.
Headless software rendering is not a direct prediction of this Mac's frame rate.

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
- PR implementation-head CI Tests succeeded: enriched baseline 646/0, legacy tests
  3/3 files, F03 smoke 4/4, independent F01/F02 acceptance passed. F02 maxima remain
  point 0.0020386013 mm, dimension 0.0009286677 mm, shape 0.001456 mm.
- F02's 0.005 mm bound / 0.001 mm shape gate, migration/refusal and isolation are unchanged.
- Known timestamp-sensitive comforts assertion is preserved. It did not fail in these
  local runs; zero rewritten walls with header-only time drift remains a known issue.
- Poppler inspection of all three one-page A3 PDFs: wall/window layouts, page bounds,
  footer and scale are intact. Short thickness labels retain INT-02 suppression. No new
  per-layer fill or external-reader appearance claim.

Browser CI evidence/status is separate in the handoff. Smoke execution and model
correctness must not be confused with completed browser acceptance.
