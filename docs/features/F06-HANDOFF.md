# F06 — Assembly schedule and material legend

Implemented; draft PR [#8](https://github.com/achartt/bimcraft-SDH/pull/8) against main.
Browser/export validation and final evidence are recorded below.
No merge, deployment, shared-roadmap change, delegation or cross-chat message.

## Ownership and exact baseline

- Owner: F06 chat `01a16578-bb89-7091-8488-bc3e24a380cd`.
- Checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f06`.
- Branch: `feature/f06-assembly-schedule-legend`.
- Approved base: `2eb43b109f8d2a93b55796b0092815aaa6f2054a`.
- Validated application/test head: `dab93a5e8ea68653c75554a6731d71add72713d6`.
  Delivery application/test/fixture trees are unchanged. Delivery removes the temporary encoded-log evidence transport step; the ordinary CI artifact stage remains. The final delivery SHA
  is recorded on the PR and in the completion message, avoiding a self-referential hash.
- Reserved preview: `http://127.0.0.1:8026/`. Port was free; shell listener startup
  returned EPERM. No local preview is running. Existing previews/checkouts were preserved.
- Supplied complete-history bundle verified before cloning. F02 `656d462`, F03 merge
  `91b907f`, F04 merge `ff0344b` and F05 `d281e25` ancestry verified at the pinned base.
  No newer main substituted. PM roadmap/template copies read without edits.
- Shell GitHub DNS was unavailable. Connector publication reproduced the local Git tree;
  returned commit metadata was reconstructed and SHA-verified before updating this branch.
  No working files were reset and no other checkout was changed.

## User-visible behavior and reproduction

1. In this checkout, verify port 8026 is free and run `npm run fetch-vendor`, then
   `npm start -- --port 8026 --host 127.0.0.1 --offline` on a host allowing listeners.
2. In a separate browser context open `fixtures/f06/assembly-documentation.ifc`.
   Enable Draw. The fixture has one core-anchored wall and two authored types (one unused),
   long names, repeated material use, duplicate material display names with distinct IDs,
   25.4/38.1 mm cavities, and three zero-thickness membrane records.
3. In Project browser → Schedules, choose **Wall assembly schedule** or
   **Project material legend**. The schedule selector also offers both. Rows wrap and
   the inclusion/unit note appears above the table. **Download CSV** exports that output.
4. The existing **F06-01** sheet places assembly page 1. Open it to inspect the source,
   title, units and explicit continuation warning. Create another sheet through **New sheet**,
   choose Letter or larger paper, and add any **Wall assembly schedule - page N of M** or
   **Project material legend - page N of M** source. F06 sources start centered on paper.
   Drag/remove them using the existing sheet controls. Save the sheet and download PDF.
5. Place every desired continuation page on the appropriate sheets. A placed page warns
   if other pages of its output are not on that sheet. The automatic **Drawing sheets**
   set includes every assembly and legend page automatically, one page per sheet.
6. Select the wall → Edit assembly. Change first layer from 19.05 to 25.4 mm, move it
   inward after the cavity and rename the assembly. Save. Reopen schedules and the sheet:
   layer order and nominal total update. Undo/Redo restores/reapplies the same data.
7. Material library → `material-f06-a`: rename it, change color/pattern, and set its default
   to 333 mm. Every referenced name/swatch updates by ID; the layer remains 25.4 mm.
   The distinct `material-f06-b` does not merge with it or change geometry.
8. Download IFC, reload and reopen the actual downloaded file. Reopen its sheets and
   schedules. Open the original fixture separately to confirm it remains unchanged.

## Inclusion, units and export structure

Every project-authored custom type is included, even when unused. Authored starter types
are included through their actual IFC type key; tool presets with no authored type are
excluded. Type key and GlobalId identify rows independently of the name. Used/Unused means
referenced by authored wall instances, not a count or a quantity. Imported wall types with
no BimCraft assembly metadata are outside the authored-type schedule.

The legend includes every definition returned by the existing project-material reader,
including unused library entries and legacy/default definitions when that reader supplies
them. It resolves names and styles by material ID, never by name. Repeated use deduplicates
by ID; duplicate names remain separate. The same material used physically and as a membrane
has separate explanatory symbols. Cavities have no solid-material ID and are grouped by
ventilation designation. Blank symbols indicate cavities; dashed lines indicate membranes;
solid materials retain their color, cut pattern and fill color. Unused materials remain
clearly labeled rather than being silently dropped.

Layer order is exterior to interior, including for interior partitions. Core/non-core
comes from the existing assembly definition. Total and core thickness sum raw binary64
millimetres, including cavity widths and zero membrane widths. The fixture totals are
209.55 / 139.7 mm and 155.575 / 127 mm (total / core). The second core intentionally
contains the 38.1 mm cavity plus 88.9 mm framing. No new core rule is introduced.
Display follows the existing mm formatter: whole mm, 0.1 mm below 10 mm. Headers/notes
state mm. No display strings are used to compute totals. This is nominal construction
information, not area, coverage, volume, pricing or purchasing quantities.

CSV uses existing `tableCsv` escaping (quoted commas/newlines, doubled quotes, CRLF records,
existing spreadsheet-formula prefix protection). UI downloads add UTF-8 BOM. Raw numeric
fields use JavaScript number strings, with full binary64 precision, so a sum may appear
as `209.54999999999998`. They are not rounded display labels.

Assembly CSV columns:
`record_kind,type_key,type_guid,assembly_name,usage,layer_exterior_to_interior,material_id,material_name,function,core,nominal_thickness_mm,cavity_ventilation,membrane,total_thickness_mm,core_thickness_mm,status,raw_record`.
Each valid layer is a `layer` row; one `assembly-summary` follows each valid type. Summary
fields are blank on layer rows. Diagnostic records use `diagnostic` plus one
`diagnostic-layer` per parseable raw layer, retaining raw JSON without trusted numeric
thicknesses or totals. Boolean fields are `true`/`false`; ordering follows stable type
key/GlobalId and original layer order.

Legend CSV columns:
`material_id,material_name,symbol_kind,usage,color,pattern,pattern_color,status`.
Material IDs are ordered lexically, followed by missing references and sorted ventilation
symbols. Symbol kinds distinguish physical material, membrane, cavity and missing records.

## Compatibility and shared code

[Pre-implementation contract](F06-DESIGN.md) documents the additive reference vocabulary.
No new persisted schedule format or geometry cache: all content is derived on demand.
Existing `CadCraft_Sheets` placements use `kind:schedule` and references
`f06-assemblies:<one-based page>` / `f06-materials:<one-based page>`. Existing sheet journal
and IFC save/reopen preserve them. Older readers may show these sources as missing while
retaining the strings. Unknown/removed page references keep the inherited missing-view
feedback. Edits can add/remove continuation pages; titles show page counts and omitted-page
warnings prevent silent overflow. Placement pages are collection pages, not individual
assembly identities, and can reflow as source content changes.

Missing material references keep ID/status rows and no guessed styles. Unknown/corrupt
recipes retain diagnostic layers and unavailable totals; unsupported libraries remain
explicitly unavailable. Ambiguous custom/starter type identities are diagnosed, never
merged into plausible totals. Reading never rewrites/migrates those records.

Shared changes: `model-ui.js` adds the two schedule sources, presentation and CSV labels;
`model-schedule.js` accepts a separate numeric CSV shape through the existing writer;
`res-ui.js` adds derived source pages; `res-sheets.js` consumes F06 vector table items and
omitted-page warnings; `views-ui.js` centers these fixed-size sources. Ordinary drawing,
legacy table, F04/F05 graphics and export paths retain their existing behavior.
New modules are `assembly-schedule.js` and `assembly-schedule-layout.js`. F06 CI adds a
minimum-count baseline stage, independent IFC/PDF/CSV checks and a disposable browser job.
Existing stages/thresholds are retained. No production dependency or network service added.

Materials, assembly recipes, reference identities, migration contracts, core anchors,
persistent dimensions and physical IFC layers are unchanged. IFC4 retains zero physical
material layers; IFC2X3 omits those zero layers while preserving complete recipe records.
The inherited IFC2X3 steel seed's invalid placement is explicitly completed in the F06-owned
test input, as F05 does; no user-file repair or validation suppression is introduced.

## Acceptance and validation

| Criterion | Result / evidence |
| --- | --- |
| 1. Deterministic fixture | PASS. Byte regeneration, two orders/cores, two cavities, three zero membranes, repeated/duplicate-name materials and long labels. |
| 2. Order/totals/core | PASS. Independent expected numeric widths/functions/core flags; exact sums and raw CSV. |
| 3. Stable IDs/style/default isolation | PASS. Names/symbols resolve by ID; duplicate names preserved; default edits do not resize walls or core anchors. |
| 4. Live revisions | PASS. Real UI layer edit/reorder, rename and current placed-sheet data verified. Layer edit/reorder, assembly rename, material rename/style and placed-source regeneration. |
| 5. Membrane/cavity semantics | PASS. Visible zero rows, cavity widths/ventilation, blank cavity and line-only membrane symbols. |
| 6. Screen/sheets/PDF/layout | PASS. Screen/expanded view, sheet SVG and inspected actual downloaded vector PDFs. Fixed 8 pt F06 text, wrapping, repeated headers and complete continuation. |
| 7. CSV | PASS. All rows, explicit mm/raw precision, duplicate names, commas/quotes/LF/accent escaping; independent Python reader. |
| 8. Lifecycle/isolation | PASS. Node IFC4/IFC2X3 plus actual browser-downloaded IFC reopen, references and isolation. |
| 9. Invalid data | PASS. Missing material, unsupported library/recipe, corrupt null width and duplicate identities remain identifiable; read-only byte checks. |
| 10. Regression/performance | PASS local baseline, F03/F04/F05 and independent exports; separate small/large measurements below. |

Exact implementation head local installed-reader baseline: **700 passed, 0 failed**,
including **23 F06**, 18 F05, 13 F04 and 21 F02. F03 harness **4/4**. Offline legacy
runner **3/3 files**, with absent package/sample notices explicitly retained.
Independent IfcOpenShell 0.9.0 validates four F06 IFC4/IFC2X3 exports with zero schema/EXPRESS
findings. Independent pypdf checks generated 4-page documentation, 20-page stress PDF and
placed legend, all vector-only. Python CSV readback confirms all 12 fixture layers and
three zero rows with comma/quote/LF/accent preservation. F04/F05 independent IFC and
vector PDF checks also pass. Reports/logs are in `evidence/f06/`.
Exact validated code-head CI: [Tests 39873571066](https://github.com/achartt/bimcraft-SDH/actions/runs/39873571066)
passes **682 standalone / 700 installed-reader checks**, F03 **4/4**, legacy **3/3**,
and independent F01/F02/F04/F05/F06 validation. [F04 browser 39873571124](https://github.com/achartt/bimcraft-SDH/actions/runs/39873571124)
passes. Latest [F05 browser 39873571052](https://github.com/achartt/bimcraft-SDH/actions/runs/39873571052)
was still installing browser dependencies at the last observation; this is pending,
not a pass. The earlier [896f891 F05 browser 39868674243](https://github.com/achartt/bimcraft-SDH/actions/runs/39868674243)
passed. Subsequent application changes only add the F06 expanded schedule view;
current 18 F05 Node tests and independent IFC/vector checks pass. Delivery-head CI must
be distinguished from these exact code-head observations.

Local optional absences: CivilCraft/CadCraft live source comparisons, TakeoffCraft cross-app
reader and library-repository assets. These are not passes. The initial baseline lacked
Poppler on PATH and reported optional PDF-reader skips; the final run
used the real bundled Poppler and an isolated writable font cache. The initial renderer
without that font configuration was stopped after font-cache errors. First focused tests
caught exact-equality assumptions about binary64 sums and incorrect test setup; corrected
assertions retain strict numeric bounds. No thresholds or counts were weakened.

Browser attempts 1/2 retained actual partial successes but failed test selectors/readiness;
neither is a complete browser pass. Local listener and artifact-download restrictions
are separate availability limits, not feature correctness passes. A stalled artifact tool
was abandoned; final CI review transport preserves actual exports for local inspection.

## Real browser and inspected downloaded exports

Final code-head run [39873571093](https://github.com/achartt/bimcraft-SDH/actions/runs/39873571093)
passes all **22 workflow observations** and independent downloaded IFC/PDF/CSV acceptance.
Chromium 141.0.7390.37, AMD EPYC 7763, Linux/SwiftShader, Node 22, 1680×1100, DPR 1.
The actual UI expands both schedules, reorders and edits a layer, renames the assembly,
changes material name/default/color/pattern, places/saves a legend sheet, and exercises
Undo/Redo. It downloads IFC, reloads and reopens that exact file, checks sheet references,
then verifies isolation against a second opened original project and a 35-type fixture.
No unexpected browser errors; the inherited missing icon stylesheet error is retained.

Actual downloaded `edited-assembly-sheet.pdf` was independently read and rendered at 140 dpi,
then visually inspected. It contains the revised assembly with cavity first, 25.4 mm
cladding second (displayed 25 mm), all membrane records, and total 215.9 mm (displayed
216 mm). The core remains 139.7 mm (displayed 140 mm). The unused partition remains
155.575/127 mm. All 12 rows appear after the shorter name reduces the assembly output
to one page. The actual original legend PDF shows both same-name IDs, correct swatches,
a dashed membrane and explicit continuation warning. Its remaining cavity entries appear
on the next page of the complete six-sheet downloaded drawing set. The independent CSV
reader compares every edited layer/name/core/thickness and summary against the actual
saved IFC recipe/material records, not application-derived expected text.

Inspected `schedule-expanded.png` shows all seven columns and both assemblies without
truncation. Actual sheet screenshots agree with their vector PDFs. The PDF reader reports
no raster XObjects. F06 body text is 8 pt; inherited title block text can be 7 pt and
existing plan/elevation notes in the full set can be 6 pt. Actual downloads, screenshots, lossless ZIP and matching PDF renders remain locally in
`.cc-test/f06-reviewed-exports/`. The PR keeps the raw timing report in
`evidence/f06/browser-ci/report.json`, independent validation logs and CI evidence links.
Automatic approval review rejected committing a generated PDF payload because artifact
publication authorization was not recognized; generated export payloads were excluded
from the commit. The temporary encoded-log review transport is removed from the delivered
workflow after inspection. Ordinary CI artifact retention is unchanged.

## Performance

Apple M5 Pro / arm64 / Node 26.9.0. Five warmups, 30 retained raw samples per operation,
nearest-rank p50/p95, no outlier removal. Timings separate record generation, pagination,
composition, SVG serialization, CSV and PDF. Prepared input is excluded from later phases.
RSS is whole-process memory, not peak/per-project allocation. Large fixture stresses
35 authored types / 210 layers with one wall; it does not certify a large-house viewport.
See `evidence/f06/performance-node.json` for environment, hashes and every raw sample.

| Workload | Generation p50/p95 ms | PDF p50/p95 ms |
| --- | ---: | ---: |
| 2 assemblies / 12 layers / 4 pages | 0.073 / 0.131 | 1.220 / 1.323 |
| 35 assemblies / 210 layers / 20 pages | 0.399 / 0.550 | 6.495 / 6.772 |

Browser record-generation p50/p95: small **0.200/0.200 ms**, large **0.800/1.300 ms**.
Browser complete F06 PDF serialization: small **1.800/3.000 ms**, large **10.900/18.200 ms**.
Browser costs are recorded separately in its report; no Node/browser/hardware pooling.
PERF-F04-01 and PERF-F05-01 remain open. These measurements do not resolve either concern
or constitute a general optimization or production-capacity claim.

## Known limitations and integration concerns

- Sheet pages have fixed 240 mm width and up to 138 mm content height, at 8 pt. Users
  arrange them with existing controls; arbitrary manual dragging can put content off paper
  or overlap other views. Default F06 placement fits Letter/larger sheets.
- Complete automatic sets include all continuations. Custom sheets need explicit placement
  of new continuation pages after source expansion; the source page counts/warnings explain it.
- Existing PDF uses Helvetica/WinAnsi. CSV retains arbitrary Unicode; printable PDF glyph
  coverage remains the inherited WinAnsi limit. The tested accented labels render correctly.
- Nominal dimensions use mm even when modeling in feet/inches; this explicit unit is shared
  across screen/sheet/PDF/CSV. F06 introduces no separate stored unit/filter preference.
- Imported types lacking authored assembly records are outside inclusion. No new library
  transfer/editor, quantities, price/estimate, manufacturer verification or per-layer solids.
- Recheck shared schedule/UI/sheet files during integration. PM review/merge authorization
  remain separate; the shared roadmap was not changed.
