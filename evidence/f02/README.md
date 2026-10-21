# F02 evidence

See `docs/features/F02-HANDOFF.md` for scope, commands and limitations. Reports contain
actual working-tree results and distinguish failures and optional skips. `contract.log`
and per-case JSON describe 80 deterministic persistence cycles. `independent-ifc.jsonl`
is black-box IfcOpenShell validation of sixteen files; `f01-independent-ifc.jsonl` retains
six additional IFC files and three malformed controls. `old-shape-gate-regression.log`
reproduces two failures with the inherited 0.01 mm regeneration gate temporarily restored.

Screenshots show real UI: material/assembly/reference refusal, missing host, successful
rebind and reopen. `browser-rebound.ifc` is the actual browser download. The Annotate menu
required DOM access because of the inherited clipped-menu issue (INT-01). Plan/detail PNGs
are renders of the application's newly generated F01 compatibility PDFs, not redrawn
illustrations. Their short-label limitation remains INT-02.

The first oracle log and enriched-baseline JSON retain Python 3.9 environment failures.
Final logs follow a Python 3.12 environment repair; failed environment directories were
kept outside Git. No proprietary models or other checkouts' working changes are included.

PR review evidence: `review-before.log` retains the four missing-record failures before
correction. `review-focused.log`, `review-baseline.log` and `review-baseline.json` are
fresh checks of the corrected working tree (642 baseline checks, no failures).
`review-independent-ifc.jsonl` and `review-f01-independent-ifc.jsonl` retain fresh
independent readback. `review-missing-*.png` shows missing-payload refusal in the actual
browser; regenerate its synthetic fixture with `tests/features/f02/review-fixtures.mjs`.
Final committed-head CI results are linked from draft PR #4.
