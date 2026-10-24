# F28-C implementation handoff

Work in progress; browser and independent downloaded-file validation are pending.

Automatic approval review rejected committing the synthetic IFC fixture, stating that publication of model contents was not specifically authorized. The binary remains local and ignored. Tests generate the fixture from the existing F05 fixture through authoritative operations into `.cc-test/f28-c-fixture/`. The C workflow validates actual downloaded IFC bytes but excludes all IFC files from published artifacts. No alternate upload of the rejected model is attempted.

Approved base: `3e42c21e33e642d1e07bea2fc3356344f91db00e`, parents `0ccb30d735554b012cf21e02252ded4612fd2f54` and `138df9f6bf593bfc677d3d468426a03beb727e59`. Complete-history bundle and missing-object traversal verified; no newer baseline substituted. Owner checkout `bimcraft-f28-c`, branch `feature/f28-c-documentation`, repository-local DrSurfBum / `80549907+drsurfbum@users.noreply.github.com`.

The reviewed Revit-style arrangement, command adapter, authoritative model operations and default/fallback remain. Real source keys bind plan/RCP/callout, projected section/elevation, schedule and saved-sheet tabs to the current editor. Native controls and canvases are retained. Documentation uses existing `sheetInput`, vector composition, annotation journals and F06 table/CSV data; it introduces no persisted view/recipe store or renderer.

Run `devshell/preview-f28-c.command`, then open `http://127.0.0.1:8039/?workspace=live&space=paper`. Port 8039 was free, but the session denied startup with `listen EPERM`. No active local preview is claimed. Other previews and unsaved browser work are preserved.

Thirteen focused F28 tests, F03 4/4, legacy runner 3/3 and the offline baseline with bundled Poppler pass (678 checks, zero failures). Optional dependencies are separately skipped. The first baseline without Poppler retains its historical 194/195 residential count failure; no gate was lowered. Logs and same-machine F04/F05 raw Node comparisons are in `evidence/f28-c/`.

TEST-F28-01 remains OPEN pending complete reproducible browser evidence, including local execution and genuine recovery. Independent B fixtures now use clean contexts; the new C browser suite retains normal autosave and separately recovers a real dirty project. No product autosave was disabled and refusal assertions remain.

PERF-F04-01 and PERF-F05-01 remain OPEN. Full browser/IFC/CSV/vector-PDF results, inspected screenshots/exported pages, exact validated source/delivery heads and draft PR will be recorded before final delivery. Current edits preserve the bounded F04/F05/F06 geometry/continuation limitations. No merge, deployment, shared-roadmap update, default switch or cross-chat message.
