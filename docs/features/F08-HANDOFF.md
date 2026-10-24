# F08-A — Straight-wall joins and ends

Draft implementation in active verification. Exact approved base: `3e42c21e33e642d1e07bea2fc3356344f91db00e`. Owner: this F08 feature chat; isolated `bimcraft-f08`, branch `feature/f08-wall-joins`; canonical repository `drsurfbum/bimcraft-SDH`. Repository-local author was set to DrSurfBum / 80549907+drsurfbum@users.noreply.github.com before environment loss. No global Git configuration changed.

The local execution environment disconnected during the retained audit. The current source is published via the connected GitHub API and validated in CI; the local checkout is not claimed synchronized. Port 8040 was free but its listener was denied with EPERM. No active local preview is claimed. Run `devshell/preview-f08.command` after vendor setup on a normal host and open `fixtures/f08/straight-joins.ifc`.

Geometry: one closed envelope per wall, core-face-first seams, transient through-T segments stitched into the original wall identity. Supported: L 30°–150°, true T within 1 mm of axis, four-end X; 2–4 rays, equal bases/tops within 0.005 mm, intersecting core strips, ≤2000 mm physical width, bounded seam extent and valid positive-area profiles. Generic preview rows and components involving curves retain inherited cleanup. Interior/interior crossings, collinear two-wall splices, near-face T repair, unequal heights and short/invalid seams retain safe geometry and diagnostic feedback. Full F08 remains partial.

End settings: separate `CadCraft_WallJoin` / `Settings` version-1 JSON. Per end `allow` and `cap` (`envelope` or `square`) affect physical IFC and plan/vector cleanup. Closed envelope caps are not decorative wrapping. Absent records are transient defaults; valid legacy unversioned records migrate only on explicit edit. Unsupported/corrupt/duplicate/missing records refuse synchronized edits and remain preserved.

PM seam: F28-C draft #12 remains untouched and is not the base. Narrow shared `model-ui.js` changes retain complete wall rows and call the separate established-Properties helper. Other derived outline consumers retain full metadata. No workspace files, bimcraft.js, res-ui.js or views-ui.js changed. A dedicated live-workspace join adapter is deferred. Keep both F28-C and F08 additions during integration.

Current validation is pending; no implementation-complete, browser-pass, exported-file-pass or CI-green claim is made until exact-head evidence is retained. PERF-F04-01, PERF-F05-01 and TEST-F28-01 stay OPEN. No readiness change, merge, deployment, roadmap edit, default-layout switch, owner message or delegation.

## October 24 continuation

Recovered published source `2b43e92040750ec8766b130e0d54fb16a667eb5f` and verified all eight exact commit hashes and its complete source tree `e44a44554f76940db0d30800ed2016df1e38c26b`. Local checkout now preserves that history. An independent local spike is retained on `archive/f08-local-spike-20261024` and is not proposed for integration.

At recovered source: F08, Tests, F04/F05/F06 and F28-A workflows passed; F28-B failed at the known autosave dialog intercept during independent fixture opening. Narrow follow-up gives every F28-B independent page a fresh browser context, retaining real autosave and every assertion. TEST-F28-01 remains OPEN pending its separate local/CI recovery criteria. Fixture plan scale is now 1:200 so the complete synthetic matrix fits the actual A4 UI export; enlarged T detail remains 1:10.

The continuation's local baseline passes all 14 stages, including F08's 17 tests. Browser/export evidence from the recovered source is retained separately from final-head evidence. A fresh exact-head CI run is required after these changes.

Automatic approval review rejected a PDF upload to GitHub, citing potentially sensitive content and an unverified destination. Generated/exported PDFs stay local or ephemeral in CI; this continuation removes raw PDF retention and PDF log embedding from the F08 workflow. Independent checks still read the actual bytes. No PDF upload workaround is used.
