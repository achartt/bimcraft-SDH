# F03 handoff

Draft PR: https://github.com/achartt/bimcraft-SDH/pull/5 (target main; do not merge).

- Approved base: `656d46236ff32b444cbd5a2b4ebe5164858c3848`.
- Verified prerequisites: F01 integration `1c35f47d69af2214b4747f541703224d0a4a4742`
  and F02 reviewed head `e50de2d6516dd5c6ca649b83173c506a3e00ff1f` are ancestors.
- Supplied bundle cloned into `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f03`;
  exact initial HEAD and `git fsck --full` passed before edits.
- Branch: `feature/f03-performance-baseline`; origin `https://github.com/achartt/bimcraft-SDH.git`.
- Measured implementation: `b76e9d283e45fa4cdd138bc0d4d6328a32bc9283`. Delivery head is
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

PR implementation head `b76e9d2`: main Tests workflow run `39689960021` succeeded.
Baseline with installed readers: **646 passed / 0 failed**; F03 smoke 4/4; legacy tests
3/3 files; independent F01/F02 acceptance passed. F02 exported maxima remain point
0.0020386013 mm, dimension 0.0009286677 mm and shape 0.001456 mm, below 0.005 mm.
Selected CI lines are in `evidence/f03/validation/ci-baseline-summary.log`.
Browser evidence run `39689960063` is separate and still in progress at this checkpoint.

## Acceptance at local checkpoint

| Criterion | Result |
|---|---|
| Exact baseline / isolated branch and checkout | Pass; ancestry/fsck verified; existing checkouts/previews preserved |
| Deterministic fixtures and raw reproducible workflow | Pass; byte determinism across second boundary, seed/hashes/counts documented |
| Counts, p50/p95 and memory | Model: 810 retained samples across 27 groups, n=30 each; browser status below |
| Browser feedback/frame and phase evidence | Dedicated CI collection in progress; local sandbox blocked |
| Typical-house UX targets | Retained provisionally; model timings do not certify browser completion |
| F02 compatibility and correctness | No application changes; baseline precision/material/21 F02 tests pass; F03 undo/redo/reopen/identities/anchors and 12 independent exports pass |
| Bottleneck evidence and bounded follow-up | Type-wide edits dominate model costs; sampled repeated wall/property reads; transaction-scoped snapshot/index is the next experiment |
| CI smoke without wall-clock gates | Four tests pass locally; separate CI job executes smoke and browser collection |
| Actual PDF inspection | Three one-page A3 plans rendered and inspected; inherited short-label suppression remains |

Local baseline with Poppler: 628 passed / 0 failed. Initial without Poppler: 623 executed
passes but aggregate **failure** at residential 194/195 count guard; both retained.
Optional external/sibling checks remain separately skipped. Known timestamp-sensitive
comforts assertion was not changed or hidden; it did not fail locally. The 0.005 mm F02
fixture threshold and 0.001 mm shape gate are unchanged.

No shared application instrumentation, new schema, migration policy or new dependency
in production. Shared supporting edits are package scripts and CI steps/workflow only.
Test-only Playwright is pinned to 1.62.1. Existing Node minimum is not newly certified;
local Node 26.9.0 and CI Node 22 are recorded separately.

## PM handoff

F03 draft PR #5 adds deterministic scaling fixtures and a reproducible profiling harness.
The local M5 Pro baseline identifies assembly/type changes as the leading model cost
(large p95 131 ms; medium 25 ms), with repeated wall/property reads dominating the profile.
F02 code/fixtures and tolerances are unchanged. Baseline with Poppler: 628/0; independent
F03 IFC checks: 12 files, zero findings. Local browser execution is sandbox-blocked;
separate CI browser evidence must be reviewed before closing F03. No merge, deployment,
roadmap reconciliation, next feature, delegation or cross-chat messaging occurred.
