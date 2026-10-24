# Upstream alignment and MCP priority — October 24, 2026

Immediate priorities: catch up MCP capabilities and prepare upstream compatibility. Existing F28-C/F08 work remains isolated; no automatic feature merge or branch rewrite.

## Public comparison

Fork main: `3e42c21e33e642d1e07bea2fc3356344f91db00e`. Upstream public main: `46275e4e09aa7a086836b98372f73422dec6d74d`. Common base: `5d0e2b1cb59e3f28e72fed8c5fc6004d44564832`.

There are 16 upstream-only and 62 fork-only commits (52 non-merge commits on the fork). The upstream delta changes 47 files; nine overlap the fork delta. A final-tree merge preview reports conflicts in app/model-ui.js and app/res-sheets.js. This is an estimate, not an executed/validated rebase; replaying individual commits can have additional conflicts.

Public changes include six display units, centralized unit state/events, view/split controls, language catalogs, framing/roof/symbol changes and family/plumbing work. Preserve those semantics, translation fallback and raw model/MCP units even where Git auto-merges.

The maintainer’s reintegrated docked layout could not yet be identified in this public delta: there are no app/workspace modules, and the shared shell assets match the common base. It may be implemented differently or not yet pushed. The user selected the sole published branch, main, pinned above, as the rebase target. Docked-layout equivalence is a compatibility check during preparation, not an outstanding target-confirmation requirement.

## Execution plan

Use an isolated candidate/contribution branch with exact pins and recoverable original refs. Preserve existing main, accepted baselines, feature branches/checkouts, dirty work, previews and author credit. Compare equivalent features so an adopted upstream layout is not duplicated. Resolve architecture/translation/unit differences, then rerun precision, persistence, drawing/export, workspace/recovery and MCP transport checks. Prepare upstream-focused app/test changes separately from fork-only PM plans/evidence and maintainer-generated CI/build instructions. No private model publication is implied.

A rebase, history rewrite, force push, merge, deployment or upstream PR has not been performed. Review the concrete validated candidate before any publication/history changes.

## MCP work in parallel

The MCP implementation and registries are unchanged between the assessed public tips. Upstream alignment alone will not close the parity gaps. MCP-01 is the immediate implementation slice: custom material/assembly CRUD, dynamic authored type use, wall-instance settings and exact read-back through shared model operations. It may be developed on the current approved fork base, then integrated with the approved refreshed baseline. References/views and real documentation/export follow as separate bounded slices.
