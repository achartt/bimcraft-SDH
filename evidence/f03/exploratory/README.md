# Superseded exploratory browser run

Run [39689960063](https://github.com/achartt/bimcraft-SDH/actions/runs/39689960063),
source `b76e9d283e45fa4cdd138bc0d4d6328a32bc9283`, Actions merge
`8bcee448ec44cb1852c8cb41ae708e45bad92ee2`.

The original artifact ZIP is retained byte-for-byte (1,181,110 bytes; SHA-256
`1c80795d376ee808d734715d8fd4ab9aa2d3328c83e5397309126fe8bcff3f0e`).
All 900 samples and correctness checks completed, followed by a **failed** console-error
gate: 93 occurrences of the same missing Bootstrap Icons stylesheet error (one per
context). No model error was reported. The packed dev shell lacks that shell asset;
`fetch-vendor` verifies the app libraries but does not supply the omitted icon font.

Review additionally found that the plan `render()` span measured rAF scheduling, not
`draw()`, and cumulative pan gestures could move the drawing offscreen. These data are
**exploratory and superseded**, not the accepted browser target results. No sample was
silently edited, filtered or relabeled. The corrected harness measures both scheduling
and draw, fits before each gesture, verifies the selected wall and actual pan/zoom changes,
and serves the shell-pinned official icon font through a harness-only route.

The ZIP includes original raw JSON/errors, profiles, traces, screenshots, saved IFCs,
generator PDFs, actual UI PDFs and the server log. Extract with Python's zipfile module.

Attempt 2, run `39692674669` at source `763ff8a873f6ec11384d39561d8d1cbb9dc841ab`,
failed before smoke or measurements: the vendor host failed all 110 downloads. There is
no measurement artifact for that attempt. The normal CI suite at that same source passed
using its existing cache. Attempt 3 adds the same manifest-keyed cache to the F03 workflow
and still executes checksum verification before running anything.
