# F28-B migrated commands

The reviewed 116-tool mapping evidence remains in `COMMANDS.md` and `app/workspace/catalog.js`. This slice changes only verified wall workflows. The 31 unmapped and nine uncertain tools remain unavailable. F09/F24 remain audits, not promises.

| Entry | Wiring and valid scope |
| --- | --- |
| Architecture → Wall / W | Existing floor-plan straight-wall tool; IFC/storey/type validity and busy guards. Six location lines and both exterior orientations. |
| Placement Properties → Type | Native `data-model-walltype` selector; sets future placement default only. |
| Contextual options | Existing reference, exterior side, fixed height / level-above, numeric input and unit parser. No level-above option when none exists. |
| Escape / Cancel placement | End an unfinished chain; repeat Escape to return to Modify. No implicit model deletion or rollback of already placed segments. |
| Enter outside a field | Finish the chain while keeping Wall active. Enter inside numeric fields retains their native behavior. |
| Properties → Type | Existing `changeWall` / homogeneous `changeWalls` assignment; no future-default change. |
| Properties → Location line, Top/Height | Existing single/homogeneous-wall bindings, with established mixed-value/validation rules. |
| Properties → Base offset / Exterior side | Existing single authored-wall transactions. Nonnegative base offset. |
| Edit Type | Shared command from contextual ribbon or native Properties entry; Type Properties reports actual name, width and instance count. |
| Structure → Edit | Calls `openAssembly` on the existing extension and retains the live shell. |
| Assembly → Save type | Existing `saveWallAssembly` transaction; all instances using that type update, with explicit impact text. |
| Assembly → Duplicate type | Existing distinct key/GUID creation and assignment to selected walls; original type/other instances retained. This does not copy a wall instance. |
| Assembly layers/materials | Existing material picker/styles/defaults, layer order/function/core, ventilation and zero membranes. Material definitions remain separate from layer widths. |
| Open / Save IFC / Undo / Redo | Retained F28-A shared operations and shortcuts. |
| Wall Copy/Cut/Duplicate, Mirror/Align, other unverified Modify | Unavailable with explanations; no scope expansion. |

Evidence: `app/model-ui.js` native fields and placement; `model-tools.js` existing face-chain calculation; `model-walls.js` location offsets and persistent justifications; `model-ops.js` journal operations; `wall-assemblies-ui.js` authoritative dialog; F02/F04/F05/F06 contracts and regression checks. The wrapper contains no independent recipe store, IFC writer or material schema.
