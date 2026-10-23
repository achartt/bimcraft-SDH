# F28-A review handoff

Approved base: `9667b3c48977ff772c2a4c4785238cb3c4603e0e` (integrated F06). Implementation head: `832309805b556cbd50255f7e55f8a946d300b31a`; subsequent commits package verification/evidence. Draft PR: [#9](https://github.com/drsurfbum/bimcraft-SDH/pull/9). Branch: `feature/f28-a-live-workspace`. Isolated checkout: `bimcraft-f28`. No newer main was adopted. F02 `656d462`, F04 `ff0344b`, and F05 `2eb43b1` ancestry was verified. No merge, deployment, roadmap edit or sibling-checkout modification is part of this change.

## Review and startup

`npm start -- --port 8032 --offline` then `http://127.0.0.1:8032/?workspace=live&space=paper`. Port 8032 was available, but this session's sandbox rejected opening the listener (`listen EPERM`). This is a startup instruction, **not a claim of an active preview**. The old 8030 preview also could not be reached from Safari. Existing windows and checkouts are preserved.

Default startup stays on the **Established layout** during review. Its top bar offers **Try F28-A workspace**. The live title/status bars explicitly identify **F28-A · Live workspace**; **Established layout** returns immediately without reopening/discarding the IFC. `?workspace=established` also selects the fallback. Creation, assemblies/materials, documentation, library, federation, recovery/settings and other un-migrated workflows remain in that layout. Panels popped out or moved outside the root must be docked before live activation; the mount does not steal or close panel windows or reset shared panel storage.

Reviewed visual source remains untouched at `reviews/F28-draft-2026-10-23/` in the parent project folder. `PM-REVIEW.md` was read completely. Ribbon groups, terms, line icons and dense visual tokens come from that snapshot. Its illustrative drawing and sample workflows are absent from production. `catalog.js` retains reviewed scope/evidence; `availability.js` and `commands.js` are the single enablement/explanation sources. The 31 unmapped and nine uncertain tools remain unavailable; draft Add/Cut recommendations were not adopted.

## Supported live workflows

- Existing IFC: actual reader and existing renderer, no sample geometry or model names. Browser Open uses the retained native file input, desktop Open uses the host's IFC picker.
- Real Project Browser: select a floor-plan/default 3D row to inspect its Properties; double-click or Enter to activate it. Browser selection, active drawing and model element selection are separate. Drawing tabs use storey GlobalIds and the editor session as owner. Closing the final drawing keeps the project/edits and offers reopening a view.
- Native plan/3D wall picking and clear selection. Actual Properties are moved, not copied. For one supported authored wall, **height** (including existing top-offset semantics when constrained) and **nonnegative base offset** use existing inputs, units, validation and transactions. Other instance/type fields are read-only here. Imported or unsupported records keep existing diagnostics.
- View Range cut/top/bottom/depth, detail Coarse/Medium/Fine and paper scale use existing stored view operations. Bottom controls and View Properties read the same effective values. Templates continue to control their fields; the new controls refuse overrides. Other range-dialog tools remain unavailable in this slice.
- Save IFC, Undo/Redo, fit view and keyboard commands use the small adapter and the same named existing actions as established controls. Save remains a new IFC download/save-as; the original is untouched. Shortcuts defer to text fields, contenteditable and dialogs.

Existing `917a90b` visible View Range labels and `a1a3782` licensed offline Bootstrap Icons were deliberately applied without committing/rebasing their separate checkout. The vendor cache is ignored even when it is a local symlink.

## Architecture and limitations

The shared mount runs after all model/extensions are installed, from both PHP and PHP-free startup. Styles are registered in the manifest and static devshell. Existing canvas nodes, renderers, property bindings, browser section and status node retain identity. Routine refreshes update chrome; they do not redecorate active property fields or recreate canvases. Palette resizing updates CSS tracks and uses existing ResizeObservers. Per-plan cameras survive drawing switches; 3D is the retained renderer/camera. Fallback restores moved nodes and temporary availability restrictions.

F28-A does not migrate wall creation/type editing, RCP, saved-camera views, sheets, schedules, annotations, exports beyond IFC, linked-model management or broad Modify commands. **Wall Copy/Cut/Duplicate remain unsupported** in authored-wall paths; general clipboard code is insufficient. F09/F24 are scope audits, not delivery promises. No new modeling capability or delivery date was invented. English chrome is the review slice; complete translation belongs to later usability work.

## Verification status

- `npm run test:f28`: 7/7 focused command/state, typing-guard, tab ownership, real wall-edit preservation, view-setting merge, Undo/Redo and saved-byte reopen checks pass.
- Existing F02/F04/F05/F06, precision/material/model/comforts/views and source/runner/fixture checks execute without failed assertions. **The aggregate baseline is not green**: both before and after, residential mode reports 194 executed passes against its minimum of 195, with optional reader dependencies absent. The minimum was not weakened. Logs are in `evidence/f28/`.
- `npm run test:f03`: 4/4 harness checks pass.
- Same-machine, five-warmup/30-sample F04 Fine scene/vector export and F05 Fine section/composition/SVG/PDF comparisons: `evidence/f28/performance-node.json`. Same approved geometry/export modules and fixtures, no model-open time inside generation timers. These are Node workloads, not browser/GPU latency. Both PERF-F04-01 and PERF-F05-01 remain **OPEN**.
- HTTP acceptance passed at evidence/test head `bc221d6c3865f7169457e5ff8934c9e75920bb4f` (production code remains `8323098`): [run 39975724289](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/39975724289), 32 browser checks and independent IfcOpenShell validation with zero schema findings (9 walls, 2 persistent dimensions). Browser acceptance is defined in `tests/features/f28/browser.mjs`, using HTTP devshell and real disk IFCs/downloads. It covers real clicks/edit/validation/range/Undo/Redo/save/reopen, reference preservation, project isolation, normal/narrow screenshots, retained canvases, plan/3D cameras and picking after resize, keyboard/touch-style explanations, and fallback assembly access. Independent IfcOpenShell validation reads its downloaded IFC. Normal/narrow, before/after and wall-selection PNGs are retained in the `f28-browser` Actions artifact and packaged below. The established-layout frame was recaptured after a real Fit and explicit canvas paint readiness. This includes keyboard/read-only explanations, browser selection distinct from activation, immediate View Properties availability and unfinished field entry across resize. The frames were visually inspected at 1440×1000 and 900×700; camera preservation intentionally keeps model zoom as the window narrows.
- GitHub main Tests, F04, F05 and F06 workflows passed on the implementation head. Canonical repository ownership now resolves to `drsurfbum/bimcraft-SDH` (same repository ID 1428509177 and PR #9).
- Local Safari rendered the shell and exposed an initial no-document bug, which was fixed. Native file selection was unreliable in this automation session. In-app browser rejected a file URL by protocol policy; that route was stopped. A temporary file-preview experiment is not a supported delivery path. The subsequent successful HTTP workflow supplies real-browser evidence; the local startup restriction remains.

## Next slice / review gates

Review the HTTP browser report, screenshots and independent IFC result before integration; resolve any reported failures. F28-B should migrate creation/options/type editor through existing authoritative operations. F28-C should migrate real documentation and other existing tools. F28-D completes usability, translations, panel/docking coverage and broader viewport checks. No Add/Cut decision is needed to review this bounded shell; the unavailable inventory is separate from approved scope.

## Review captures

Actual `fixtures/f04/layered-plans.ifc`, not the illustrative mockup house:

- [Default live workspace](../../../evidence/f28/screenshots/after-workspace.png)
- [Selected wall, real height/base offset](../../../evidence/f28/screenshots/selected-wall.png)
- [Narrow 900×700 workspace](../../../evidence/f28/screenshots/narrow.png)
- [Established layout before](../../../evidence/f28/screenshots/before-established.png)

The local Node comparison produced F04 Fine scene p50/p95 4.55/6.44 ms before and 4.36/6.66 ms after; F05 Fine section 3.18/4.16 ms before and 3.22/4.12 ms after. These small synthetic workloads and timing variation do not resolve either performance issue. The earlier browser report timed queued `render()` calls and returned zero durations; those samples are explicitly inconclusive. The local harness correction calls the existing synchronous `PlanView.draw()` with identical detail, canvas dimensions, camera and cleared hover/selection. This correction passed syntax checking but its new timing run is pending publication; no corrected browser timing result is claimed. It measures CPU submission only, excluding GPU completion and user latency. It does not resolve either performance issue.

## Final publication block

Remote draft head: `bc221d6c3865f7169457e5ff8934c9e75920bb4f`. The final local evidence commit adds the verified established-layout screenshot, complete 32-check browser report and the test-only timing correction. Application source is unchanged from `8323098`. Automatic approval review rejected uploading the final model-derived screenshot to the redirected `drsurfbum/bimcraft-SDH` destination because the user named `achartt/bimcraft-SDH`. Repository ID `1428509177`, PR #9 and branch ancestry were verified as unchanged, but the review still requires explicit approval of the redirected destination. No workaround or alternate upload route was attempted after that rejection. The final evidence update stays local pending that approval.
