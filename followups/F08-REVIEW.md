# F08-A delivery — awaiting PM review

Draft [PR #13](https://github.com/drsurfbum/bimcraft-SDH/pull/13), delivery `6aad54dafb65909f6f2585c36e8c419cbbaad4ae`, base `3e42c21e33e642d1e07bea2fc3356344f91db00e`. Unmerged; integrated baseline unchanged.

All seven exact-head workflows pass. Test logs confirm 699 standalone stage passes and 717 installed-reader stage passes; availability notices remain explicit. The F03 harness passes 4 tests. PM independently reran 17 F08 model tests from an isolated archive of the exact delivery: all pass, zero failures/skips. CI F08 browser checks pass 11/11; independent IFC and actual vector-export validation succeeded in that workflow. PM has not yet repeated a local browser or independent export review for this delivery.

Implemented scope: supported straight L/T and selected endpoint-X core-priority joins and persistent per-end allow/disallow/square-envelope controls. Full F08 remains partial: curves, continuous interior-X, unequal-height joins, near-face repair and opening finish wrapping remain separate. Established Properties has the controls; a dedicated live-workspace adapter is deferred.

MCP acceptance remains open: agent definitions and MCP registries are unchanged from the approved base. Shared geometry can benefit existing wall creation, but no semantic MCP tools expose the new end settings or join diagnostics. Require implementation and actual discovery/call/undo/save/reopen evidence, or an explicit user scope decision, before accepting the capability for merge. Full functional/code PM review and F28-C/upstream integration seams also remain outstanding.

No local preview is running. PERF-F04-01, PERF-F05-01 and TEST-F28-01 stay OPEN. No mark-ready, merge, application deployment, active branch rewrite or new PDF upload was performed.

[Exact-head Tests](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40098231652) · [F08 acceptance](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40098231647) · [Supported cases](https://github.com/drsurfbum/bimcraft-SDH/blob/6aad54dafb65909f6f2585c36e8c419cbbaad4ae/docs/features/f08/SUPPORTED-CASES.md)
