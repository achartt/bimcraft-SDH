# F05 bounded design and compatibility contract

Owner: this F05 chat `01a164f8-c26a-733e-bf5c-4aa494b5b0d3`.
Branch `feature/f05-wall-sections-elevations`, checkout `bimcraft-f05`, reserved port 8024.
Exact approved base `ff0344b46ca1c29962772528c23f62d175c6d2ea`, cloned from the verified
complete-history bundle. F02, F03 merge and F04 merge ancestry verified before edits.

Stage 1: analytic vertical cuts perpendicular to isolated, straight constant-width
authored walls. Section direction is parallel to the wall axis. Layer widths follow
the existing envelope center and exterior side; openings use actual station, width,
storey-relative sill and head. Joined/curved/oblique walls retain the mesh envelope
and an explicit diagnostic. Elevations retain existing hidden-line surface projection;
they never receive section layer bands. No new per-layer solids.

Stage 2: reuse F04 layer primitives, existing project browser, section properties,
drawing-set preview, sheet composer and vector PDF. Coarse = envelope; Medium =
material colors and boundaries; Fine = the same boundaries plus cut patterns.
Projected edges are thin, cut envelopes heavy. White cut masks keep cavities blank.
Existing level notes remain overlays, separate from model-derived cut bands.

Stage 3 supporting format extension (documented before implementation): optional
project pset `CadCraft_ProjectedViews`, one IfcText property per view key
`section:<section GlobalId>` or `elevation:north|east|south|west`, JSON
`{version:1,detail:"coarse|medium|fine",scale:0..10000,crop:null|[x0,y0,x1,y1]}`.
Crop uses existing view coordinates in mm (horizontal right, vertical Z), not IFC
file units. Scale is denominator, zero = automatic. Missing pset/key means Coarse,
automatic scale, no crop; read does not write or migrate anything. Existing section
line geometry/depth/level records are unchanged. Saving settings is one existing
IFC journal transaction. Unknown versions, malformed values, duplicate psets or
properties are diagnosed, preserved, and refused on write; no downgrade. A drawing
with invalid settings uses an explicitly warned Coarse/no-crop fallback.

This is additive metadata compatible with existing IFC4 and IFC2X3 property sets.
No material, recipe, reference, dimension, physical opening or identity contracts
change. Other readers may ignore this metadata. Existing dimensions remain plan-only;
new associative section dimensions and generalized detail tools are excluded.

All views regenerate from the current model whenever opened/exported, with no persistent
geometry cache. View scale supplies paper hatch spacing; sheet placement may override
scale and must rebuild the cut patterns at that placement scale.
PERF-F04-01 remains open. F05 measurements separate generation, drawing/frame and export.
