# F06 design and compatibility contract

Owner: F06 chat `01a16578-bb89-7091-8488-bc3e24a380cd`. Checkout `bimcraft-f06`,
branch `feature/f06-assembly-schedule-legend`, port 8026. Approved base
`2eb43b109f8d2a93b55796b0092815aaa6f2054a`; complete bundle and F02/F03/F04/F05
ancestry verified before editing. Shell DNS is unavailable; local listener denied EPERM.

No new persisted format. Assembly schedule and material legend are derived on demand.
Existing `CadCraft_Sheets` schedule placements use additive references
`f06-assemblies:<page>` / `f06-materials:<page>` (one-based). Other readers/older BimCraft
may list these as missing views but retain the strings. Pages are regenerated from current
records; content may flow onto additional pages after edits, which must be placed explicitly.
The drawing-set exporter includes every page automatically. Missing continuation references
remain visibly missing, never rebound to another schedule. No reading writes IFC metadata.

Include every authored custom wall type, including unused/invalid records, and every
authored starter type identified by its IFC type key. Uninstantiated tool presets are not
project-authored types. Include all available project materials, including unused library
entries and legacy definitions supplied by the existing reader. Distinct IDs never merge.
Cavity entries are explicitly air/ventilation symbols; membrane use gets a line symbol,
including when that material is also used physically elsewhere. Broken references and
unsupported/corrupt records get diagnostic rows; untrusted totals remain unavailable.

Use validated authoritative recipes and existing starter resolution/core rules. Sum raw
binary64 millimetres including cavities and zero membranes. Display normal mm rounding;
CSV exports exact JS numeric strings in explicit mm columns, not formatted labels. CSV
uses existing tableCsv escaping with separate layer/assembly-summary/diagnostic row kinds.
No quantities, areas, volumes or purchasing semantics are added.

F06 tables alone get fixed paper-mm wrapping, vector swatches, repeated headers and
continuation pages at 8 pt. Fixed page dimensions fit Letter and larger supported papers.
Existing F04/F05 drawing/table paths remain unchanged. No material/assembly identity,
schema, migration, geometry, reference or IFC2X3/IFC4 physical-layer semantics change.
