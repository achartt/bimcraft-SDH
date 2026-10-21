# F01 integration baseline and standalone workflow

F01 adds explicit test discovery, a synthetic residential fixture, and review evidence. It does not integrate the wall prototype into main. No application module or IFC/material/reference contract is changed.

## Checkout and branch state

- Repository: https://github.com/achartt/bimcraft-SDH
- Approved base: `72664187a1cc2694d1f8972fd2e1aa5b46106bc3`, `feature/wall-assemblies-dimensions`.
- F01 branch: `feature/f01-integration-baseline`; target that prototype branch, not main.
- Owner: F01 chat `01a15f51-58fb-74b2-a2fe-d32bfcbd3c09`.
- Checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f01`.
- Preview: http://127.0.0.1:8016/ (8015 remains reserved for the prototype).
- At initial live verification on 2026-10-21, main was `5d0e2b1cb59e3f28e72fed8c5fc6004d44564832`; PR #1 was open, draft and unmerged; remote prototype matched the approved base. No source checkout changes were copied.
- Delivery head, PR and final CI observation are in the PR handoff. To identify any checkout precisely: `git rev-parse HEAD` and `git status --short`.

## Start a fresh checkout

Use a new, unoccupied destination. Inspect `git worktree list --porcelain`, branches and port occupancy before creating another developer checkout. Never reset another chat's checkout.

```sh
git clone --branch feature/f01-integration-baseline https://github.com/achartt/bimcraft-SDH.git bimcraft-f01
cd bimcraft-f01
git rev-parse HEAD
node --version
npm run fetch-vendor
npm start -- --port 8016 --host 127.0.0.1 --offline
```

For reproducible review, check out the exact delivered head from the PR, not a later floating tip. The pinned prototype is the historical parent, not the delivered F01 head. Stop only your own server if 8016 is occupied. The browser uses **Choose a file** to open `fixtures/f01/house.ifc`; nothing is uploaded. Turn on **Draw** for the floor plan. The fixture has a 6 × 4 m enclosure, an interior partition, two custom types with explicit cores, a ventilated cavity, a zero-width membrane, a hosted fixed window and two associative dimensions.

Runtime: Node 22 is the supported F01/CI baseline; Node 26.9.0 is also exercised. The inherited package minimum remains Node 20.19; that minimum has not been separately certified here. No npm application dependencies, kernel installation, sibling repositories or prior `.cc-test` directory are required. Vendor setup downloads exactly the 110 files in `devshell/vendor.json`, with SHA-256 verification. PHP is optional for startup: this environment uses `devshell/index.html`. PHP 8.1+ remains necessary for regenerating markup and packing the browser edition.

## One baseline command

In a separate terminal in the checkout:

```sh
npm run test:baseline
# After vendor setup, with no network requests:
npm run test:baseline -- --offline
# Inspect the explicit execution plan:
npm run test:baseline -- --list
```

The command builds `.cc-test` from this checkout and runs precision (7), materials (8), model (at least 122), comforts (at least 103), views2 (at least 104), residential (at least 195), the fixture lifecycle scenario (1), source-sync contract tests (44) and runner contract tests (19). Named modes run as separate processes. `tests/unit` is invoked explicitly; `tests/bin` discovery alone does not cover it. Counts prevent an empty discovery or accidental default reader run from being reported as passing. These are minimum executed-pass guards, not a promise that optional readers add no checks.

Any failed check, child-process failure, missing summary, insufficient execution count, or invalid/missing vendor file returns nonzero. Later stages still run after a test failure. Vendor setup failure aborts before stages. Logs and `summary.json` are in `.cc-test/baseline/`; each stage has pass/fail counts, exit status and separate skip/availability notices. A notice can represent several optional checks, so its count is not a test count. Skips are never added to passes. The runner contract suite injects a deliberately failing subprocess into a temporary directory and asserts the aggregate result is 1 while a later stage still runs.

Baseline does not install optional oracle readers. `npm test -- --oracles` is the separate, inherited full test command. CI now runs both commands and uploads baseline logs even on failure. The full runner still discovers three files in `tests/bin`; its success is not proof of the named modes or of Python setup. It reports failed optional package installations as notes. A partially created Python venv may subsequently be detected as present by legacy schema checks and fail; preserve those failures in the report, rather than calling them schema validation passes.

## Optional TakeoffCraft boundary

RC.8 always runs BimCraft's `modelQuantities` and `buildTakeoff`, checking gathered quantities and the generated PDF/JSON attachment. When the app root `.cc-test/public_html/assets/apps/takeoffcraft` does not exist, RC.8 explicitly skips the cross-app reader, quantities/estimate and pack-sync checks. It does not skip the rest of residential coverage.

When the real TakeoffCraft dependency is available, place or link its complete `dev` directory at that exact mirror path **after building the mirror**, including `model.js`, `embed.js`, their dependencies and `packs/*.ccpack.json`. Do not create an empty placeholder. Then run:

```sh
node .cc-test/bin/test-bimcraft.mjs --res --only rc8 --keep
```

A present but partial directory, import-time exception, broken transitive dependency or bad pack sync is a failure. Only absence of the app root is optional; an empty root, missing `dev` directory, dangling link or access error fails. PDF attachment readback additionally needs the declared `pdfjs-dist` package under `.cc-test/tools/takeoffcraft-test/node_modules`. Only absence of the package is optional. A present package with a missing entry, broken link, import error or read error fails; broken parent directories also fail. The harness validates absence, a partial installation, and an import-time exception in isolated temporary mirrors. It does not fake a working TakeoffCraft implementation. Real cross-app success remains unverified here.

## Bundled terrain/electrical integrity and live source comparison

The residential checks now verify a committed integrity pin before considering upstream availability. `tests/tools/bimcraft-test/source-sync-pins.json` records SHA-256 hashes of `app/tin.js`, `app/raster.js` and `app/res-elec-symbols.js` from approved base `72664187a1cc2694d1f8972fd2e1aa5b46106bc3`. All three are unchanged from that revision (originally imported in `e2dff527fa6b4c651781c3d0fa1bc9bddf6cb37c`). Terrain additionally checks the three vendor import mappings and 38 required language keys inherited from that base, retaining the invalid `[object Object]` translation check. Pin validation requires the complete file and import sets, well-formed hashes and provenance. The required key list must match terrain string literals in the hash-verified files; removing a pin cannot silently remove a check. Both bundled and present-source catalogs must supply nonempty strings or plural maps with a usable `other` form and valid string values. This is evidence of bundled integrity against an immutable BimCraft revision; it does not certify equality with current CivilCraft/CadCraft sources.

When the `civilcraft` or `cadcraft` **app root** is absent under `.cc-test/public_html/assets/apps`, the corresponding script prints a named `SKIP … live source comparison` notice after the integrity check passes. These notices are recorded separately in the baseline summary. The two executed residential passes describe bundled integrity, not skipped upstream comparisons. A present app root requires the original comparison to run: absent source files, invalid JSON, broken imports, differing generated output, unreadable paths and broken symlinks fail. Library-repository asset checks still skip explicitly.

To exercise real upstream comparison, put the actual source tree (including its transitive dependencies) at the corresponding app root after mirror construction, then run:

```sh
node .cc-test/tools/bimcraft-test/terrain-sync.mjs --check
node .cc-test/tools/bimcraft-test/elec-sync.mjs --check
```

The terrain source needs `dev/tin.js`, `dev/raster.js`, `dev/manifest.json` and `dev/lang/en.json`; electrical needs `dev/addons/electrical/lib/install.js` and everything it imports. No source app is downloaded by baseline setup. Check mode never writes assets or updates pins. Write mode still requires actual upstream sources; pins are never used as a generator fallback.

A deliberate update requires review of the upstream change and provenance: use the original sync write mode against actual sources, review and copy the resulting mirror asset changes into `app/`, record their immutable source revision, update the affected pin hashes/imports/required keys explicitly, then rerun both live comparisons and baseline. Verify the initial pin independently with `git show 72664187a1cc2694d1f8972fd2e1aa5b46106bc3:app/tin.js | shasum -a 256` (and the other two files). Do not replace a hash merely to silence drift. There is no automatic pin refresh command. Baseline also verifies the pin hashes, imports and key list against Git blobs at the recorded revision, so changing a working file and its checksum cannot silently retain false provenance. CI checks out full history. A shallow/local checkout missing that revision must fetch it first (`git fetch origin 72664187a1cc2694d1f8972fd2e1aa5b46106bc3` for the initial pin); missing Git objects fail rather than skip. Standalone sync scripts verify bundle integrity; the baseline adds the independent Git-provenance test.

The 44 source-sync contract tests cover missing/corrupt local assets, maps/translations, absent/partial/malformed sources, live mismatches and source exceptions. Controlled matching fixtures exercise the original comparator/generator paths; they are not independent upstream integration evidence. Real CivilCraft/CadCraft comparisons remain unverified until actual sources are supplied.

## Repeat the fixture review

See `fixtures/f01/README.md`. The fixture and its two derivatives are synthetic and contain no client data. The committed GUIDs are the review identities. Do not regenerate a review fixture midway through comparison.

```sh
# Verify the committed fixture; export edited/reopened and missing-host cases plus PDFs.
node tests/features/f01/fixture.mjs --verify --export
# Generate a NEW synthetic seed, with new GUIDs (intentionally rewrites house.ifc).
npm run fixture:f01
```

Exports go to `.cc-test/f01-fixture/`. The lifecycle checks assert core-line anchoring, attached dimension change (209.55 → 241.30 mm), type/wall/opening/dimension/material identity, undo/redo, library-default isolation, cavity width 25.4 mm, membrane width 0, save/reopen, separate-project isolation and missing-host status with no stale IFC curve. Core-line normal position is stable; joined wall endpoints may adjust along that line when corners regenerate.

## Evidence and integration concerns

Committed evidence is in `evidence/f01/`. Initial pre-change Node 26 results: precision 7/7; materials 8/8; model 122/122; comforts 103/103; views2 104/104; residential aborted on the absent TakeoffCraft import. The first standalone residential run after gating completed with 193 passes and 2 source-sync failures. Those historical logs remain unchanged. The source-sync follow-up passes 574 local / 578 remote baseline checks with zero failures; current provenance, skips and CI links are in `F01-HANDOFF.md` and `evidence/f01/source-sync/`.

Browser evidence: opened the fixture on 8016, displayed plan and 3D, selected the custom exterior type in **Wall → Wall type**, edited siding to 50.8 mm, saved, undid (8 1/4 inches) and redid (9 1/2 inches). Reference dimension list reports 9 1/2-inch finish thickness and unchanged 5 1/2-inch core. The assembly preview shows a 1-inch ventilated cavity and zero-width house wrap. Captured browser warning/error logs were empty. Browser Save as IFC downloaded a new file; reopening that download on the clean Node 22 server retained both dimension values. The missing-host derivative visibly reports “Unresolved — wall or core reference missing” for both dimensions. Some toolbar icons/labels and annotation menu items are blank/clipped in the PHP-free preview (especially at narrow width); no UI fix is bundled.

PDF review uses the application's `planPdf`, not a reconstructed drawing. The full A4 plan shows the opening and dimension marks at 1:50; short dimension labels do not fit and are omitted by current application logic. The 1:10 detail explicitly crops to both dimension lines so their exact values can be read. PDFs were rendered using bundled Poppler, independently of the initially absent system Poppler. This is drawing inspection, not external IFC validation.

Before integrating PR #1: review its 29-file application diff and stable-ID/version handling; review the pinned source-sync boundary, optional setup reporting and PHP-free/narrow UI issues; obtain independent IFC schema and external-reader evidence; review short dimension label behavior and supported reference limits. Layer graphics, schedules, solid-material takeoffs, roofs/windows beyond this small fixture and performance remain outside F01. IFC2X3 membrane omission from physical layers and full recipe retention, IFC4 zero-width layers, all six reference modes and unknown-version preservation stay unchanged.

No merge or integrated SHA is claimed. Final head-specific validation and remaining acceptance gaps are recorded in the PR handoff; passing standalone checks do not establish optional cross-app or IFC schema acceptance.
