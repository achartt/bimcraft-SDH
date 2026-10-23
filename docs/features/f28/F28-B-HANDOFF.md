# F28-B wall workspace handoff

Approved base: `0ccb30d735554b012cf21e02252ded4612fd2f54` (integrated F28-A). Both approved parents `9667b3c` and `3669144` were verified locally against the complete-history bundle and the canonical GitHub commit/tree. No newer baseline was adopted. Owner: this F28-B implementation chat. Isolated checkout: `bimcraft-f28-b`; branch: `feature/f28-b-wall-editing`. Repository-local author: DrSurfBum / `80549907+drsurfbum@users.noreply.github.com`.

## Review

The reviewed Revit-style shell and shared command adapter remain in place. The workspace is opt-in; established layout is the default and explicit fallback. Architecture → Wall now uses native bound placement controls; type selection lives in Properties and reference/side/top/height/numeric entry in the contextual options bar. Selecting an instance shows existing type, six supported reference modes, top/height, nonnegative base offset and orientation bindings. Edit Type → Structure opens the authoritative assembly editor without changing layouts. The editor explains shared-instance effects and distinct type duplication/assignment. General wall Copy/Cut/Duplicate and other unverified Modify commands remain unavailable.

The actual `model-ui` controls, existing snapping/numeric parsing, transactions and dialogs are retained. Location-line placement uses the existing `locationOffset` and face-chain/miter algorithm, adding an optional offset parameter rather than another geometry implementation. Legacy established center/face placement remains unchanged; core straight paths use the same contract. Unsupported core/curved placement is refused. Instance type assignment does not change future placement defaults. Saving/duplicating an assembly retains established semantics: its result becomes the future placement default, explicitly stated in the editor.

## Startup and boundaries

From the checkout, run `npm start -- --port 8034 --offline`, then open `http://127.0.0.1:8034/?workspace=live&space=paper`. Port 8034 was free. This session rejected the listener with `listen EPERM`; this is a startup instruction, not a claim of an active local preview. Existing previews/checkouts were preserved. The browser workflow runs the real app over HTTP in an isolated runner.

Straight placement is the live scope. Curved placement remains an established-layout route for its existing center/finish-face support. Legacy left/right justifications may be read from existing files; no new wall-instance duplication, Mirror/Align, profile, attachment, materials schema or broad documentation migration is enabled. Full material-library work, documentation migration, translation and docking/platform work remain later slices. The existing material editor is available from the authoritative assembly dialog.

## Verification in progress

- Focused F28 tests: 10 pass, including six lines × two sides, actual IFC transactions/Undo/Redo/reopen, shared and duplicated types, core anchors, cavities/membranes/material defaults and project isolation.
- Baseline before implementation: all executed assertions pass, but residential mode has 194 passes versus its 195 minimum with optional dependencies unavailable. The gate is unchanged and the local aggregate is not claimed green.
- F03 harness and same-environment F04/F05 geometry/export samples are recorded in `evidence/f28-b/`.
- Real-browser wall acceptance, independent actual downloaded IFC/CSV/PDF checks and normal/narrow screenshots are defined in the new F28-B workflow. Results remain pending until that workflow completes.

PERF-F04-01 and PERF-F05-01 remain **OPEN**. Node geometry/export timings and browser CPU submissions have separate boundaries, raw samples and environments. No GPU-completion, gesture-latency or representative-house performance claim is made.

## Delivery

Draft PR, exact tested head, final captures and validation results will be recorded after browser verification. No merge, deployment, roadmap edit or default-layout switch is authorized by this handoff.
