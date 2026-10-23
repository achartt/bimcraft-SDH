# F28-B wall workspace handoff

F28-B connects real straight-wall placement, supported authored-wall instance settings, and Edit Type → Structure in the approved Revit-style workspace. The authoritative editor, IFC operations, validation, units and journal remain responsible for data changes. The workspace stays opt-in; the established layout remains the default and fallback.

## Commits and checkout

- Approved base: `0ccb30d735554b012cf21e02252ded4612fd2f54`.
- Validated source/test head: `ad5d5ddca2290bcb6188be1ef5d25e34d368873d`.
- App tree: `47fa8e7f8c2fe13d20ee7a2afb5772a78cbfd373`; tests tree: `548e8b3369355aad66270c97cfac071559e0f989`.
- Isolated checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f28-b`.
- Branch: `feature/f28-b-wall-editing`; draft PR [#11](https://github.com/drsurfbum/bimcraft-SDH/pull/11), against `main`.
- Exact approved ancestry and complete-history bundle were checked before implementation. No newer baseline was substituted. Repository-local author is DrSurfBum / `80549907+drsurfbum@users.noreply.github.com`.

Final delivery packaging adds only documentation and CI-derived evidence after the validated source/test head. Its exact SHA is in the PR description. The local environment became unavailable after the source was committed; the local checkout remains at the source head and is not claimed synchronized with this final evidence commit. Other checkouts, previews, unsaved browser work and the reviewed snapshot were preserved. [Source record](../../../evidence/f28-b/source-evidence.json).

## Preview and fallback

From the isolated checkout, run:

```sh
npm start -- --host 127.0.0.1 --port 8034 --offline
```

Or launch `devshell/preview-f28-b.command`. Then open [F28-B live workspace](http://127.0.0.1:8034/?workspace=live&space=paper). The ordinary URL opens the established layout. Use **Established layout** at the top right to return from the live workspace without closing the project.

Port 8034 was free, but this session rejected the listener with `listen EPERM`. The environment then became unavailable. **No active local preview is claimed.** The launcher and URL are ready for a normal local session; CI started and exercised the actual HTTP application successfully. Offline startup needs the existing fetched vendor cache; the isolated checkout has its own ignored link to the approved cache.

## Supported workflow and command scope

| Area | Delivered behavior |
| --- | --- |
| Architecture → Wall / W | Native straight placement, type selection, all six location lines and both exterior orientations. Existing snapping, imperial/metric numeric entry, actual level-above or fixed height, chain finish and cancellation. |
| Wall Properties | Existing type assignment, location line, top/height, nonnegative base offset and exterior side on supported authored walls. Existing homogeneous multi-selection rules retained; unsupported/mixed states refused. |
| Edit Type → Structure | Type Properties shows actual type, thickness and instance count, then opens the authoritative assembly editor **without switching to the old layout**. |
| Assembly editing | Shared type edits, distinct type duplication and selected-wall assignment; real layer reorder/function/core/material/cavity/ventilation/zero-membrane editing. |
| Undo/Redo, Save and reopen | Existing shared commands and journal; actual downloaded IFC verified with a second reader and reopened in the application. |
| Established workflows | Retained fallback, including current curved-wall scope and F06 CSV/vector PDF export. |

Instance type assignment changes the selected instance(s), not the future placement default. Saving/duplicating an assembly retains established semantics: that result becomes the future placement default. The editor states this and the exact shared-instance impact. Stock starter types create an editable copy. Duplicate **type** creates a distinct key/GUID; it does not copy a wall instance.

The wrapper moves the existing bound controls using placeholders and restores them on fallback. It adds no parallel recipe store, IFC writer, material schema or independent geometry engine. Placement uses the existing location-offset contract and face-chain/miter algorithm. Routine refreshes retain the canvas and handlers; focused entry and camera survive tested resize/state updates. [Complete command inventory](F28-B-COMMANDS.md).

## Validation

The [final source browser run](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799527) passed **42 checks**, with **zero application exceptions and zero console messages**. It used a real IFC over HTTP, actual UI inputs/downloads, Chromium 141.0.7390.37, and the normal 1440 × 1000 and narrow 900 × 700 desktop sizes.

The demonstrated sequence was: open IFC → place walls → edit instance/type → change a shared type → duplicate and assign to one wall → reorder/edit layers → Undo/Redo → save → reopen the downloaded IFC. A separately opened original remained unchanged. Checks also covered 12 reference/orientation combinations, native pointer snapping/numeric continuation, cancellation, invalid dimensions, imperial inputs, shared core anchors and stable identities, persistent dimensions, cavity ventilation, zero membranes, material default/style isolation, protected view templates, real upper-level constraints, keyboard typing guards, camera/picking after palette resize, independent palette scrolling, fallback restoration, and unsupported-version refusal.

| Check | Result / evidence |
| --- | --- |
| F28 focused integration/model tests | 10/10 pass, including real IFC journals and reopen. |
| F03 harness | 4/4 pass; [log](../../../evidence/f28-b/f03.log). |
| Local baseline before/after/final | All executed assertions pass. Aggregate remains **FAIL**: residential 194 passes versus minimum 195 with optional dependencies/readers absent. Gate unchanged; no local aggregate-green claim. [Before](../../../evidence/f28-b/baseline-before.log), [after](../../../evidence/f28-b/baseline-after.log), [final](../../../evidence/f28-b/baseline-final.log). F02/F04/F05/F06: 21/13/18/23 pass. |
| Main CI Tests | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799327), including installed-reader baseline and independent exports. |
| Existing F04/F05/F06 browser regressions | [F04 PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799411), [F05 PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799417), [F06 PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799407). |
| Inherited F28-A browser | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799341). |
| New F28-B browser and independent files | [PASS](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799527); [permanent report](../../../evidence/f28-b/browser.json). |
| Independent actual downloaded IFC | IfcOpenShell: **0 schema findings**, 22 walls, 3 types, 2 persistent dimensions; type/material/layer payloads, GUID uniqueness and references checked. |
| Actual F06 exports | CSV: 17 layers with order/core/cavity widths checked. PDF: 1 vector page, 19,469 vector paths, no raster XObjects. |

[Download validation artifact](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799527/artifacts/12527699195) contains the actual saved IFC, expected values, CSV, PDF, browser report/screenshots and final raw Node samples. Artifact ZIP SHA-256: `f0dbc33f92c866e85b58c5fbd8f62778f5c4a65670b188aceb0f448304095f8c`. GitHub artifact retention currently expires 2027-01-21; screenshots and reports are also committed here. Failed intermediate attempts remain in Actions history. No tests were weakened or unsupported behavior hidden.

## Screenshots

- [Before: approved F28-A, real IFC](../../../evidence/f28-b/screenshots/before-f28-a.png)
- [After: Architecture → Wall placement](../../../evidence/f28-b/screenshots/wall-placement.png)
- [Selected wall and actual Properties](../../../evidence/f28-b/screenshots/selected-wall.png)
- [Authoritative assembly editor inside live layout](../../../evidence/f28-b/screenshots/assembly-editor.png)
- [Narrow window](../../../evidence/f28-b/screenshots/narrow.png)

These are unedited captures from the final passing browser run, inspected after capture. The selected-wall image includes the real material-style change exercised in the test.

## Performance and remaining scope

**PERF-F04-01 and PERF-F05-01 remain OPEN.** On the same final CI runner, five warmups and 30 samples per workload compared approved base with the frozen source:

| Workload | Base p50 / p95 ms | F28-B p50 / p95 ms |
| --- | --- | --- |
| F04 Fine scene | 10.882 / 14.665 | 10.159 / 19.690 |
| F04 plan PDF | 31.168 / 35.960 | 30.854 / 39.308 |
| F05 Fine section | 6.332 / 13.439 | 6.757 / 9.367 |
| F05 composition | 0.097 / 0.302 | 0.096 / 0.228 |
| F05 SVG | 0.375 / 0.631 | 0.371 / 0.647 |
| F05 PDF | 1.591 / 2.802 | 1.602 / 2.793 |
| Browser PlanView.draw CPU submission, Fine 900 × 600 | 1.400 / 2.500 | 2.000 / 4.600 |

The browser CPU samples increased in this run. These timings measure submission/geometry/serialization boundaries, not GPU completion or interaction latency. No performance improvement or representative-house responsiveness claim is made. [CI summary and boundary](../../../evidence/f28-b/performance-ci.json), raw browser samples in [browser.json](../../../evidence/f28-b/browser.json), final raw Node samples in the artifact. The existing committed local `performance-node.json` is an earlier separate comparison, not this final CI run.

Live placement is **straight walls**. Established layout retains supported curved center/finish-face placement; curved/core combinations are refused. General wall-instance Copy/Cut/Duplicate, Mirror/Align, other unverified Modify commands, attachment/profile tools, broad documentation migration and the 31 unmapped tools remain unavailable. Nine uncertain mappings remain unavailable; F09/F24 stay audit cards. Disabled reasons remain accessible through hover, focus/Enter and the touch availability dialog.

Next slices can address broader documentation, a fuller materials/library interface, reviewed curved placement, translation and docking/platform coverage. No default-layout switch, merge, deployment, shared-roadmap change or cross-chat message was performed.
