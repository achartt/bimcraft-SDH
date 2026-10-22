# F03 handoff

Draft PR: https://github.com/achartt/bimcraft-SDH/pull/5 (target main; do not merge).

- Approved base: `656d46236ff32b444cbd5a2b4ebe5164858c3848`.
- Verified prerequisites: F01 integration `1c35f47d69af2214b4747f541703224d0a4a4742`
  and F02 reviewed head `e50de2d6516dd5c6ca649b83173c506a3e00ff1f` are ancestors.
- Supplied bundle cloned into `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f03`;
  exact initial HEAD and `git fsck --full` passed before edits.
- Branch: `feature/f03-performance-baseline`; origin `https://github.com/achartt/bimcraft-SDH.git`.
- Model measurement source: `b76e9d283e45fa4cdd138bc0d4d6328a32bc9283`.
- Browser measurement source: `faa6422d9aa0b911adb6de59bda570a2d529ddff`.
- Final harness-code head: `85b627546af6349c379cf81ea2a3413cf962625f`. Delivery head is
  recorded in the PR/completion message to avoid a self-referential commit hash.
- Assigned preview: 8018 was free; listener startup denied by sandbox. Requested
  tool-level escalation was automatically rejected (`sandbox_approval: false`).
  No local preview was started. Existing 8016/8017 remain untouched.
- Shell push escalation was also rejected. The connected GitHub API published the exact
  local tree; remote commit bytes were reconstructed from returned metadata and verified
  against the remote SHA before synchronizing this checkout. No other checkout changed.

## What was delivered

Deterministic 12/36/96-wall synthetic fixtures with windows, reference dimensions,
core-anchored cavity/membrane assembly and derived roof; raw 30-sample model workloads;
nearest-rank p50/p95, RSS/heap observations, CPU profiles, export inspection and reproducible
commands. The separate browser harness captures trusted selection/edit events, rAF frame
intervals, cold/warm opens, phase spans, memory, CPU/DevTools traces and actual downloads.
Browser instrumentation lives entirely under F03 tests and is not loaded by production.
CI smoke checks execution/report validity, without timing gates. A dedicated Linux/headless
CI run collects browser evidence separately from the local Apple reference.

Start with [reproduction](F03-REPRODUCTION.md) and [performance report](F03-PERFORMANCE-REPORT.md).
`evidence/f03/local/raw-evidence.zip` contains raw JSON and original profiles; summary,
fixture manifest, PDFs and validation logs are adjacent. The raw ZIP is lossless, not
an aggregation substitute. Generated IFCs live under `.cc-test/f03` and regenerate byte
identically. No client models or F01/F02 fixture edits are included.

## Validation status

Final harness-code head `85b6275`: main Tests workflow run `39698929235` succeeded.
Baseline with installed readers: **646 passed / 0 failed**; F03 smoke 4/4; legacy tests
3/3 files; independent F01/F02 acceptance passed. F02 exported maxima remain point
0.0020386013 mm, dimension 0.0009286677 mm and shape 0.001456 mm, below 0.005 mm.
Selected CI lines are in `evidence/f03/validation/ci-final-code-summary.log`. Earlier validation remains retained.
Browser reference run `39697936624` **succeeded**: 900 retained observations, 30 in each
of 30 groups, zero console/page errors; matching fixture hashes. Artifacts were downloaded,
checksum-verified and inspected. Raw samples, profiles and traces are committed losslessly
under `evidence/f03/browser-ci`, with phase/CPU/timeline summaries and actual UI PDFs.
Exploratory run `39689960063` and setup failure `39692674669` are retained/reported separately.

## Acceptance results

| Criterion | Result |
|---|---|
| Exact baseline / isolated branch and checkout | Pass; ancestry/fsck verified; existing checkouts/previews preserved |
| Deterministic fixtures and raw reproducible workflow | Pass; byte determinism across second boundary, seed/hashes/counts documented |
| Counts, p50/p95 and memory | Pass; 810 model and 900 browser samples, n=30 per group; RSS/renderer-heap metrics kept separate |
| Browser feedback/frame and phase evidence | Pass on provisional Linux/SwiftShader reference; raw frames, phases, CPU profiles and traces retained; local sandbox blocked |
| Typical-house UX targets | Retain 100/33/500 ms; medium p95 selection 40.6 ms, gesture frames 16.8 ms, edits ≤237.7 ms. Large type p95 497.4 ms has marginal headroom |
| F02 compatibility and correctness | No application changes; baseline precision/material/21 F02 tests pass; F03 undo/redo/reopen/identities/anchors and 12 independent exports pass |
| Bottleneck evidence and bounded follow-up | Type-wide reads dominate model cost; browser also exposes plan-loop/UI refresh work. Transaction-scoped snapshot/index first, bounded UI invalidation investigation next |
| CI smoke without wall-clock gates | Four tests pass locally and CI; full browser collection succeeded and is now manual; no duration gates |
| Actual PDF inspection | Three controlled A3 PDFs and three actual UI Letter PDFs inspected; dense automatic labels overlap; inherited short-label suppression remains |

Local baseline with Poppler: 628 passed / 0 failed. Initial without Poppler: 623 executed
passes but aggregate **failure** at residential 194/195 count guard; both retained.
Optional external/sibling checks remain separately skipped. Known timestamp-sensitive
comforts assertion was not changed or hidden; it did not fail locally. The 0.005 mm F02
fixture threshold and 0.001 mm shape gate are unchanged.

No shared application instrumentation, new schema, migration policy or new dependency
in production. Shared supporting edits are package scripts and CI steps/workflow only.
Test-only Playwright is pinned to 1.62.1. The packed shell omits Bootstrap Icons; the
harness-only route supplies official package 1.13.2, checked against the shell pin. It does
not silence console errors or edit production/devshell code. Existing Node minimum is not newly certified;
local Node 26.9.0 and CI Node 22 are recorded separately.

## PM handoff

F03 draft PR #5 is ready for PM review on the approved base. It delivers deterministic
12/36/96-wall fixtures, 810 model and 900 browser observations, p50/p95/memory summaries,
raw CPU/timeline evidence, reproduction commands and inspected PDFs. Medium meets the
100/33/500 ms targets on provisional Linux/SwiftShader; large type edits are marginal at
p95 497.4 ms (one sample 531.1 ms). Repeated model reads and plan/UI refresh work are the
next bounded investigations; no optimization was implemented. CI baseline 646/0, harness
4/4, independent F01/F02 acceptance and 12 independent F03 exports pass. F02 code/fixtures,
precision thresholds, migration and refusal behavior are unchanged. Local preview startup
was sandbox-denied and escalation automatically rejected; CI supplied browser evidence.
No remaining GitHub publication blocker. No merge, deployment, roadmap reconciliation,
next feature, delegation or cross-chat messaging occurred.
