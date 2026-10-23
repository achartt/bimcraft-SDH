# F28-B final review evidence

Validated source/test head: `ad5d5ddca2290bcb6188be1ef5d25e34d368873d`. Approved base: `0ccb30d735554b012cf21e02252ded4612fd2f54`.

- [Handoff and limitations](../../docs/features/f28/F28-B-HANDOFF.md)
- [Wired-command inventory](../../docs/features/f28/F28-B-COMMANDS.md)
- [42-check browser report, raw browser samples and independent-file result](browser.json)
- [Final CI geometry/export performance comparison](performance-ci.json)
- [Source/ancestry/reference record](source-evidence.json)
- [Screenshots](screenshots/)
- [Actual IFC/CSV/PDF, expected values, screenshots and raw Node samples](https://github.com/drsurfbum/bimcraft-SDH/actions/runs/40014799527/artifacts/12527699195)

All six source-head CI workflows passed: Tests, F04, F05, F06, inherited F28-A and new F28-B. Existing local baseline logs honestly retain the 194/195 residential minimum failure with optional dependencies absent. Earlier local Node samples stay in `performance-node.json`; the final CI numbers are explicitly separate.

PERF-F04-01 and PERF-F05-01 remain OPEN. No active local preview is claimed: the listener was denied and the local environment became unavailable. See the handoff for the 8034 launcher and fallback.
