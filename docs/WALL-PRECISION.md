# Residential wall precision prototype

Project-owned wall assemblies and associative plan dimensions, using the existing JavaScript/IFC application. Node 20.19 or newer is sufficient; Rust, Docker and a separate CAD service are not required.

## Run

```sh
npm run fetch-vendor
npm start -- --port 8015 --host 127.0.0.1 --offline
```

Open http://127.0.0.1:8015/. Dependencies are pinned and checksum-verified. PHP is optional; the PHP-free shell uses the packaged page with the current English catalog. Refresh after source edits.

## Wall assemblies

Start a building, or open a BimCraft IFC and turn on **Draw**. Choose a starter in **Wall → Wall type**, then **Wall assemblies…**. Name the new type; edit material names, thicknesses and functions; mark a contiguous core. Layers run exterior to interior. Thickness accepts feet/inches, millimetres or explicit units. Add, remove or reorder layers. The preview shows the core in blue and reports total/core thickness.

Saved types appear in the Wall tool and selected walls' Properties. Edit or duplicate from Properties. Saving an existing type updates all instances; duplicating from Properties assigns the new type only to selected walls. Each save is one undo step, including walls, hosted openings and dimension curves.

In wall Properties, set **Location line** to a core face or core centerline to hold that reference when finishes change. The default is wall centerline; finishes added to a center-anchored wall can move the core. Straight L corners are rejoined after all participating walls receive their new offsets.

Example assemblies: exterior 2×6 with 3/4-inch siding, 1/2-inch OSB, a 5-1/2-inch stud core and 1/2-inch gypsum; interior 2×4 with 1/2-inch gypsum each side of a 3-1/2-inch stud core. These are examples, not code-compliance specifications.

## Persistent dimensions

Choose **Annotate → Reference dimension**. Select horizontal, vertical or aligned measurement and a reference: exterior/interior finish face, exterior/interior core face, wall centerline or core centerline. Pick the first wall, optionally change reference mode, pick the second, then place the dimension line. The hovered reference is highlighted. Two references on the same wall can measure total or core thickness.

The existing **Length** field also accepts absolute plan coordinates. For example: `10',0`, `10',12'`, then `22',0` places a vertical dimension outside two parallel walls.

Select a dimension line to see its Properties and edit its offset. **Annotate → Reference dimensions…** lists the view's dimensions, including unresolved ones, with Properties, rebind and delete actions. Deleting a host produces an explicit unresolved status and removes its numeric label. Undo restores the association. Rebind selects replacement hosts.

Dimensions belong to a floor plan, ceiling plan or callout. They appear in plan PDF and sheet exports independently of the older automatic-dimension toggle. Fit includes offset lines. Display rounding follows existing unit formatting; calculations do not use rounded labels.

## Storage and current limits

- `IfcWallType` stores `CadCraft_WallType.Recipe` plus real IFC material layers and instance layer-set usages. Recipe thickness is in millimetres, converted to the IFC file's units for geometry/material entities.
- `IfcAnnotation` stores `CadCraft_WallDimension.Spec`: wall GlobalIds, named references, normalized stations, axis, view key and offset. Coordinates are resolved from analytic wall geometry. Exported curves are regenerated in the same journal as building-tool edits.
- Assemblies and references survive IFC save/reopen and undo/redo. Recipes are isolated between open models.
- Supported scope is BimCraft-authored constant-thickness walls. Arbitrary imported walls, variable layers, wrapping, core-priority cleanup at complex junctions, driving constraints, chain dimensions, section/elevation references and family-face references remain future work.
- Curved-wall reference points are supported. Aligned dimensions measure straight distances, not arc lengths. References address analytic faces, not joined mesh vertices or opening jambs.
- Other IFC readers can read layers and annotation curves, but need these property sets to preserve editable associations. Exported IFC curves do not include a portable dimension text/style object.

## Verification

```sh
npm run test:precision
node --input-type=module -e "import('./devshell/test.mjs').then(m=>m.buildMirror())"
node .cc-test/bin/test-bimcraft.mjs --model
node .cc-test/bin/test-bimcraft.mjs --comforts
node .cc-test/bin/test-bimcraft.mjs --views2
```

The precision suite covers validation, duplication, bulk edits, anchoring, corners, hosted openings, six reference modes, type swaps, flips, curved walls, deletion/rebinding, undo/redo, isolation, metre-unit files, sub-millimetre references, picking, print bounds and save/reopen. Existing suites passed 122, 103 and 104 checks respectively. Optional external IFC schema validators were unavailable.

The broader `--res` suite stops at a cross-application test requiring `takeoffcraft/dev/model.js`, absent from this standalone checkout.

## Project materials and cavities

In **Draw**, open **Material library…** to edit, create or duplicate a material. Each material has a stable ID, name, category, default thickness, display color, cut fill pattern/color and notes. Thirteen generic residential materials are supplied, using the existing wall recipes as starting thicknesses. These are editable examples, not manufacturer specifications or engineering properties. No external catalog or account is required.

The assembly editor has a material picker. Selecting a material applies its saved default thickness to that layer; the thickness remains manually editable. **Use default** restores the selected material's saved thickness after a manual override. **+ New material…** opens a new-material draft directly from the picker; saving selects the new material and applies its thickness, while cancelling preserves the previous selection and thickness. Exterior/interior labels mark both ends of the horizontal preview and the top/bottom of the layer table. Later library edits never resize existing walls. Core flags, wall/type GlobalIds and dimension references remain independent of material names.

**Add cavity** creates a separate air layer. It has thickness and an unspecified/unventilated/ventilated setting. It contributes to total assembly thickness and face locations, but its IFC material layer has a null Material reference. The proportional preview leaves cavities unfilled and underlines core layers in blue. Existing recipes with `mat: "air"` are read as cavities at exactly their original thickness; other historical free-text materials get stable library entries. Reading a file does not rewrite it. Saving an assembly migrates that recipe in the same undo transaction.

The project stores a versioned `CadCraft_MaterialLibrary.Library` property containing the definitions. Authored solid IFC materials carry a `CadCraft_Material.Id` property so renaming cannot break their identity. New IFC4 and IFC2X3 material layers include cavity ventilation. Existing type entities are retained, and unsupported library versions are rejected rather than overwritten. Definitions, custom material IDs, notes, colors and fill patterns survive IFC save/reopen and undo/redo.

Current scope: colors and fills appear in the assembly preview. Per-layer plan/section fills, 3D layer solids, thermal properties, material mass/takeoffs and a reusable cross-project catalog are not implemented. Existing gross/net wall quantities still describe the wall envelope, including its cavities; they are not solid-material quantities. Built-in types already present in older files keep their original IFC layer sets until explicitly saved as custom assemblies. Deleting library definitions is intentionally unavailable while layers may reference them.

Run `npm run test:materials` in addition to the precision suite. It covers the checked-in pre-library IFC fixture, default-edit isolation, all six dimension reference modes, cavity exports, custom material migration, undo/redo, rollback, project isolation, and IFC4/IFC2X3 round trips.

### Membranes, swatches and assembly dimensions

**Add membrane** inserts a material layer with the Membrane function and zero nominal thickness. Alternatively, create a material with default thickness `0` (for example house wrap or polyethylene film), then select it in the assembly. Selecting a zero-thickness default, or entering zero for a material layer, sets its function to Membrane. The material, order, function and core flag remain in the recipe for future scheduling; the layer adds no width to the wall or core. Cavities require positive thickness, and the assembly/core must still contain physical thickness. Existing nonzero membrane layers are preserved.

Each row includes a numbered color/fill swatch matching the slice preview. The slice uses exact proportional boundaries; zero-width membranes appear as dashed lines without widening the slice. Below it, architectural ticks and extension lines dimension each numbered layer, the core and the entire assembly. Crowded labels use additional rows. A `*` identifies zero nominal thickness. Invalid intermediate thickness input does not produce misleading dimensions.

IFC4 exports zero-width membranes as zero-thickness material layers. IFC2X3 requires positive material-layer thickness, so its physical layer set omits these membranes while retaining their complete records in the assembly recipe and project library. BimCraft restores them on reopening; other readers must read the recipe to recover these IFC2X3 membrane records. No artificial thickness is inserted. A wall-assembly schedule is still future work.

Additional tests verify membrane insertion leaves all six reference modes unchanged, zero-width data and material defaults survive round trips, undo/redo restores the layers, IFC2X3 physical layers remain positive, and coincident preview labels occupy separate rows.
