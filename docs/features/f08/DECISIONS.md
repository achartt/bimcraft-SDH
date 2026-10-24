# F08-A — Model and integration decisions

Exact approved base: `3e42c21e33e642d1e07bea2fc3356344f91db00e`. Owner is this F08 feature chat, isolated `bimcraft-f08` / `feature/f08-wall-joins`, preview port reservation 8040. The complete-history bundle and F02 ancestry were verified before editing. Other checkouts, user changes, previews and PR #12 remain untouched.

## Audit

Existing exact orthogonal L and true T envelopes already work; generic interior X crossings intentionally keep rectangles. Four endpoints already attempt cleanup. The demonstrated reliability defect is near-end clustering: with endpoints [0,0] and [0.75,0.5], reversing inputs changes the chosen node and shifts face intersections. Existing cleanup does not see core bands or unequal heights. Ordinary T stems stop at the host face; the initial overlap hypothesis was checked against actual baseline polygons and corrected. New T ownership reaches the host core through a diagnosed, bounded seam while preserving the outer union. The CI before/after audit retains actual baseline/current polygons on identical full wall rows; the independent reader checks their outer union and current overlap area.

## Geometry

A single positive-area closed envelope remains authoritative. A node shares piecewise outer-face intersection → core-face intersection → common point inside all core strips. Each adjacent ray uses the same seam in reverse, so core bands meet before noncore bands. This is geometric core priority, not material-name matching, structural analysis, per-layer solids, quantities or wrap semantics.

Transient segmentation lets a through T host acquire its finish notch and return to one original wall/profile. Original analytic axes and stable wall/type/material/dimension identities remain unchanged by joining. Finish edits preserve each core reference line; an eligible pre-edit T is reintersected against final axes, sliding the branch endpoint along its own line. Existing opening follow-up retains world station when the start moves. Noncore layers retain order, widths and material IDs; cavities retain physical width/ventilation and zero membranes remain data/lines.

A component falls back together rather than retaining half a failed seam. Curved components use the inherited algorithm. Selected X means four ENDPOINT rays; automatic splitting/identity policy for two continuous intersecting walls is deferred. No general boolean geometry API/engine is added.

## Settings and compatibility

`CadCraft_WallJoin.Settings`: JSON `{version:1,a:{allow:true,cap:"envelope"},b:{allow:true,cap:"envelope"}}`.

- No property set means transient defaults; reads never migrate.
- A valid unversioned historical shape is accepted; explicit edit writes only that record as v1 in the journal.
- Null/string/fractional/future versions, invalid flags/caps, unknown fields, missing payloads and duplicate sets/properties remain preserved and diagnostic.
- Synchronized model operations refuse unsupported metadata atomically. Raw save/reopen remains preservation.
- `allow:false` excludes the end from joining and movement carrying. `cap:"square"` forces a square physical termination, also excluding join cleanup. `envelope` follows eligible joins and stays square when free. Both affect IFC and drawing geometry; all solids remain closed. Neither is decorative wrapping.

## PM shared-file seam

No F28-C branch adoption or owner message. Minimal shared `model-ui.js` changes: pass complete rows into its two authoritative outline calls; call the new `wall-join-ui.js` Properties helper for a single wall. PM should retain both those additions and F28-C's documentation adapters. Dedicated live-workspace join controls remain an adapter follow-up. No edits to app/workspace, bimcraft.js, res-ui.js or views-ui.js. Slab/foundation/terrain outline callers likewise retain complete metadata for agreement with the physical envelope.

F03 instrumentation stays unchanged. PERF-F04-01, PERF-F05-01 and TEST-F28-01 remain OPEN. No roadmap edit, default-layout switch, broad Join/Mirror/Align enablement, merge or deployment.

## Deliberate regression-fixture updates

F04's deterministic synthetic IFC is regenerated because joined bodies now carry core-first seams. F05/F06 fixture bytes match their approved originals after preserving the original unjoined profile start point. The existing model test's T face-to-face assertion becomes a stricter 0.005 mm check of the hand-calculated host core midlines: −9.525 mm and 4009.525 mm for its asymmetric ext-2x6 assembly. No execution-count gate or error bound is reduced.
