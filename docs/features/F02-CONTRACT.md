# F02 precision, references and migration contract

## Change proposal recorded before implementation

Base: `1c35f47d69af2214b4747f541703224d0a4a4742` (main, F01 tree verified).
Owner chat: `01a16005-080a-7ce2-b3be-7a541297b9fb`.
Branch `feature/f02-precision-contract`; isolated checkout `bimcraft-f02`; port 8017.
Remote main still equals the pinned base; existing checkouts and ports 8015/8016 remain untouched.

Keep the current IFC records and journal. Add version 1 to explicitly saved wall recipes
and reference specifications. An absent version is the historical version-0 shape and
is accepted only after full validation. Reading never migrates. Explicit edits upgrade
that individual record to v1 in the existing reversible transaction. Material libraries
already require v1; an absent library supplies transient starter defaults, but a present
unversioned library is refused. Null, strings, fractional and unknown versions are refused.
No downgrade or generic imported-IFC repair is introduced.

Unsupported/corrupt records remain in IFC unchanged. Expose diagnostic rows rather than
silently dropping them; exclude their cached dimension geometry from the application's
owned annotation rendering. Refuse scoped model operations which cannot safely update
unknown dependencies, atomically. Recovery is opening the original in a compatible app,
restoring a known-good file, or explicitly rebinding a supported dimension whose hosts
are missing/invalid. Never infer a replacement host from its name, position or STEP ID.

Demonstrated defect: annotations are missing from the writer's GUID index, so an existing
dimension edit can create a duplicate GlobalId. Add annotations to that index and reject
ambiguous identities. Add validation at reference resolution so NaN/degenerate hosts and
coincident points have no numeric measurement. Unknown recipes cannot overwrite existing
records by reusing their keys. Preserve physical layer semantics and material defaults.

## Numeric contract and evidence plan

All model lengths, recipe thicknesses, reference offsets and resolved points use mm,
JavaScript binary64. IFC geometry/property lengths use the project's length unit;
`unitMm` converts millimetres/metres/conversion-based inches or feet. Reference station
is dimensionless [0,1], measured along the analytic wall axis; aligned dimensions are
chords between resolved points, never arc length. Plan points use storey-local XY;
placements compose into project coordinates. Viewer coordination transforms are excluded.
Angles in editing/UI are degrees, trigonometry uses radians, wall bulge is tan(theta/4).
IFC direction ratios are dimensionless; curve trims follow the file's angle unit.

| Operation | Bound / failure behavior | Required measured fixture |
| --- | --- | --- |
| Straight/curved authored wall finish edits, core anchor, six named references | absolute error <0.005 mm, no relaxed threshold | mm/m/in/ft; local and translated XY; ten edit/undo/redo/save/reopen cycles per case |
| Supported coordinate envelope | fixture claims only: local ±1,000,000 mm and project translation ±10,000,000 mm; spans 5–6 m; bulge ±0.25 | deterministic analytic expected points and independent export readback |
| Small offsets | 0.002 mm valid; projected separation <0.001 mm is coincident, no value | positive and negative boundary tests |
| Layer widths | 0–2000 mm each, total ≤2000 mm, positive physical core; only material membranes may be zero | cavity 25.4 mm ventilated, ordered zero membrane across cycles |
| References | wall GlobalId + named face + station, dimension GlobalId; project-local lookup; unique IDs | missing/replaced/duplicate host, rebind, invalid station and nonfinite geometry |
| Persistence | existing writer rounds most IFC coordinates/lengths to 6 file-unit decimals; directions 12 decimals and bulge 9 | measure cumulative errors before deciding any precision correction |
| Display | mm rounds whole mm (0.1 below 10); feet/inches to 1/16 inch; angles 0.1 degree | never feed formatted values into unchanged numeric inputs |
| Joins | 1 mm node matching; 1 mm minimum edited wall length; 1e-6 mm change gate; not precision guarantees | existing corner regression; complex joins excluded |

These are bounded regression guarantees, not universal CAD-kernel accuracy, imported
IFC repair, mesh accuracy, or certified geospatial behavior. Each measured result and
actual command/skip will be recorded in the handoff. F01 fixture identities remain frozen.

## Roof/component interfaces for F10/F16 (inventory only)

- `res-roofplane.js`: manual plane points serialize at **3 file-unit decimals** (1 mm
  in metre files), base/thickness at 6; pitch is degrees at 4 decimals. Plane GlobalId,
  level GlobalId and generated part relations exist; persistent ridge/edge references do not.
- `model-roof.js`: edge matching keys round XY to whole mm; generated geometry uses
  six-decimal rounding. This must not inherit the wall 0.005 mm claim.
- `family-model.js`: `cadcraft-family` v1 validates the family recipe; mm parameters,
  degrees and internal radians; parameter size keys round to 0.001 mm. Generated profiles
  use file-unit conversion and six decimals; revolutions convert radians to IFC angle units.
- `family-ifc.js` / `ifc-place.js`: type identity uses uuid@version or content SHA;
  placed products retain GlobalIds, library metadata and hosted opening relations.
  Rotation readback rounds to 0.001 degree. Mesh vertices are not stable topology IDs.
- PM decisions for F10/F16: define roof edge/seam identity and unit-independent rounding;
  decide component parameter-key collision policy and persistent face identity before
  enabling associative dimensions there. No roof or component workflows are changed here.

### Demonstrated export correction

Independent IfcOpenShell readback of ten small finish edits found a metre-file curved
Axis radius error of 0.006725 mm while analytic reference errors stayed below 0.002 mm.
`regenWalls` skipped updates when shape points, length and height differed by less than
0.01 mm. Change that operation-specific regeneration gate to 0.001 mm (including polygon
comparison). This is above metre-file serialization noise and below the 0.005 mm fixture
bound; it does not change the 1 mm join matching tolerance or any roof/component gate.
