# Provisional browser reference

Successful [Actions run 39697936624](https://github.com/achartt/bimcraft-SDH/actions/runs/39697936624),
job `119559797628`, source `faa6422d9aa0b911adb6de59bda570a2d529ddff`, clean merge checkout
`b5c49a8599b23436507498c465f2ff283a61bb5f` against approved main. 900 retained samples;
30 per workload/size; 5 warmups for warmed operations; zero console/page errors.

Original [artifact 12392425918](https://github.com/achartt/bimcraft-SDH/actions/runs/39697936624/artifacts/12392425918)
was downloaded and verified: 1,213,562 bytes, SHA-256
`90f61c71402cdae0f3dbf483052133268f2266b011cc1773f9b020f6e10f53e6`.
Git retains these smaller lossless bundles so raw measurements do not depend on Actions
artifact retention. No samples/profile nodes/trace events were removed:

| Bundle | Content | SHA-256 |
|---|---|---|
| samples.zip | Original browser-raw.json, including environment, fixture hashes, all frames/spans and memory | `1bfa58f6d05d69e4edb89640a2b7dc2896821c5c4e2fe6270dfbc01523e9d75a` |
| profiles-traces.zip | Three original CPU profiles and three original DevTools traces | `de9847e76480050fd5c264b9f2a451f7097b542f541e76c4968174acb53f930e` |
| exports.zip | Three saved IFCs and three controlled generator PDFs | `72d3c6dcd4e1414867fe8252379733f287e4193d813eba7db9ca9a1dc94d01e5` |

Actual UI PDFs for all three sizes, GPU metadata and a representative medium screenshot
are directly committed. All three original screenshots were inspected and remain in the
Actions artifact; small/large screenshots are not duplicated in Git. `files.json` inventories
original evidence plus locally regenerated summary files; raw file hashes are unchanged.
The full run's source and the later report/trace post-processors are distinguished in the
performance report. Current generated summaries include error-bearing-run guards.

```sh
python3 -m zipfile -e evidence/f03/browser-ci/samples.zip .cc-test/f03-review
python3 -m zipfile -e evidence/f03/browser-ci/profiles-traces.zip .cc-test/f03-review
python3 -m zipfile -e evidence/f03/browser-ci/exports.zip .cc-test/f03-review
node tests/features/f03/report.mjs .cc-test/f03-review
node tests/features/f03/phase-report.mjs .cc-test/f03-review
node tests/features/f03/profile-report.mjs .cc-test/f03-review
node tests/features/f03/trace-report.mjs .cc-test/f03-review
```

Do not mix this Linux/SwiftShader run with local Apple model results or superseded attempts.
The 27 missing model groups in this browser-only summary are intentional: model timings
are in the separate platform's evidence. See the report for targets and memory limits.
