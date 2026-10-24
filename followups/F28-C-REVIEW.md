# F28-C fix re-review — October 24, 2026

**F28C-PM-01 CLOSED** at `f956fac00adf1d4d51ddc2e4253fe215a2c50acd`. [PR #12](https://github.com/drsurfbum/bimcraft-SDH/pull/12) remains draft and unmerged. Integrated main remains `3e42c21e33e642d1e07bea2fc3356344f91db00e`.

PM reviewed the application/test delta from the previously reviewed delivery and ran a fresh isolated Mac browser: **47/47**, zero application exceptions. Focused F28 tests: **14/14**. Properties now checks both displayed source ID and owning editor at availability and execution. The original sheet-edit and CSV scenarios refuse actions on an unopened displayed source; opening it enables the correct edit/export. Duplicate names, pointer/keyboard/touch explanations and active-drawing toolbar/File routing pass. Full targeting-test CSV contents match the authoritative schedule output. First-open schedule selector synchronization also passes. Fresh screenshots were inspected. Headless WebGL performance warnings remain recorded, not relabeled as a clean console.

All seven exact-head CI workflows pass, including B **42/42** and independent actual IFC/CSV/vector-PDF validation. PM did not rerun the complete B suite or independent reader locally for this UI-only fix; the prior complete PM B run and current CI results retain their own revision/environment. Actual local downloaded models/PDFs were not uploaded by PM. Existing previews, unsaved browser work, feature ownership and branches were preserved.

This accepts the source-targeting correction. It does not establish MCP parity: agent registries remain unchanged, and documentation/view/annotation/sheet/export operations need explicit catch-up and actual transport validation under the user's agentic-core requirement. No scope exception is implied. Coordinate with the bounded MCP-01 materials/walls slice and the selected upstream-main alignment candidate; no automatic rebase or merge.

PERF-F04-01, PERF-F05-01 and TEST-F28-01 stay **OPEN**. Fresh C isolation/recovery checks pass; test-isolation closure still awaits integrated-build confirmation and explicit tracking. Established layout remains default/fallback. F28-D platform, translation/theme, picker and library-service limitations remain documented; full F28 is partial.

No user-only testing is needed to close F28C-PM-01. Optional usability feedback: plan → section → sheet, shared wall-type update, save/reopen a copy and normal Mac open/link picker. No readiness transition, feature merge, application deployment or cross-chat message was performed.

[Fix handoff](https://github.com/drsurfbum/bimcraft-SDH/blob/f956fac00adf1d4d51ddc2e4253fe215a2c50acd/docs/features/f28/F28-C-PM-01.md) · [Exact-head acceptance](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40097875943)
