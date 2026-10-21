# Independent validation — 2026-10-21

This packet supersedes the prior “independent IFC/upstream unverified” status. It does not relabel historical failures as passes. Four narrow export corrections were explicitly approved by the user before applying them to PR #2.

## IFC acceptance and failure detection

Python 3.12.14 / IfcOpenShell 0.9.0 / pytest 9.1.1, test-only black boxes. The original Python 3.9 environment could not install the pinned reader. A separate Python 3.12 venv at `/private/tmp/f01-independent-validation-20261021/venv` installed it successfully. Exact installed dependencies are in `installed-python.txt`.

The inherited validator ignored lowercase `error` severity and initially reported false zero-error results. Those preliminary results are **not acceptance evidence**. `before-schema-express.jsonl` contains the real findings; `before-corrected-wrapper.jsonl` records the corrected CLI's nonzero outcome: seed 6 errors, edited 10, missing-host 9. Findings were wrong material-property Name type, duplicate type memberships, and the ADDED owner-history rule. The seed received only five Name-type repairs and its missing timestamp; derivatives were regenerated through the corrected app. Existing product/type/dimension/material identities were preserved. Original browser-saved IFC evidence elsewhere is historical and still contains the original defects.

`ifcopenshell.jsonl` validates all three committed IFCs **and three freshly generated IFCs**, with EXPRESS rules enabled, no diagnostics. It independently checks units, counts, stable identities/reference JSON, materials, cavity/membrane/core recipes, physical mesh thickness/height, opening/window geometry, actual IFC dimension curves, and missing hosts without representations. Body representations are explicitly selected because walls also carry Axis curves. Three deliberately malformed files reintroduce the approved export defects; each must fail the actual validator subprocess. Severity handling also covers lowercase, uppercase, numeric and unknown levels.

Reproduce (after vendor setup; no source apps needed):

```sh
python3.12 -m venv .cc-test/tools/bimcraft-test/venv
.cc-test/tools/bimcraft-test/venv/bin/python -m pip install -r tests/features/f01/requirements-independent.txt
node tests/features/f01/fixture.mjs --output-dir .cc-test/f01-generated
.cc-test/tools/bimcraft-test/venv/bin/python -I tests/features/f01/independent.py fixtures/f01 .cc-test/f01-generated
```

Do not reuse a failed/partial venv silently. The existing main checkout's partial Python venv still produced four genuine failures (`existing-partial-venv-*`); those logs are retained. The fresh and enriched environments below do not inherit it.

## Broader schema checks

With real readers installed, `available-before-subcontext-*` records **631 passed, 2 failed** (no local pdftotext in that first run). The corrected validator exposed malformed representation subcontexts in comforts/views2: the writer omitted four derived fields, shifting ParentContext/TargetView into incorrect positions. The user approved the tested two-line `IfcPlacer.contexts()` correction. `subcontext-fixed-*` independently validates all twelve saved IFC4/IFC2X3/unit variants with zero structural errors.

`available-final-*`: **637 passed, 0 failed, exit 0** with all three source apps' selected files, web-ifc, IfcOpenShell and Poppler. Per-stage counts: 7 precision, 8 materials, 129 model, 106 comforts, 105 views2, 218 residential, 1 fixture, 44 source-sync, 19 runner. The only availability notice is the unrelated library repository. This run used the isolated clone at `5c05e7a` plus the four approved application corrections and corrected validator, so `dirty: true` is intentional; it is not presented as a clean-head run. Clean committed-head validation is recorded in the handoff/PR.

CI now requires independent schema/geometry acceptance for both fixture sets, then reruns the named baseline after the legacy oracle installer. The standalone baseline continues to work without optional readers. Neither install errors nor schema errors are converted to passes.

## web-ifc scope and retained diagnostic

`web-ifc.log`: web-ifc 0.0.78 independently reads counts/identities and meshes all 6 / 6 / 4 products in both fixture sets (140 / 140 / 48 triangles). It emits `GetRefArgument`, invalid ExpressID 0 and `GetColor` diagnostics on exterior walls. Black-box isolation showed that removing only material associations, or assigning a temporary material to the cavity's otherwise valid null Material, eliminates those messages; geometry counts remain unchanged. Those diagnostic-only variants were temporary experiments, **not** substituted acceptance fixtures or app fixes. IfcOpenShell schema/EXPRESS acceptance confirms the original null cavity material is valid. We retain this as a web-ifc material/color interoperability limitation, not a clean appearance/rendering pass. No cavity material, layer thickness or geometry contract was changed to silence it.

```sh
npm ci --ignore-scripts --prefix .cc-test/tools/bimcraft-test
node tests/features/f01/web-ifc.mjs fixtures/f01 .cc-test/f01-generated
```

The command's success is deliberately limited to its asserted counts/mesh/identity checks. Raw reader diagnostics remain in its output. No copyleft library implementation was read or copied; only public APIs were used.

## Real upstream comparisons

Only 26 files (840,876 bytes), including transitive imports and six trade packs, were fetched to the isolated mirror. `upstream-files.json` records each immutable commit, path, Git blob ID, SHA-256 and byte count. Every byte was checked against both hashes; `upstream-verified.json` records the verification. No upstream app code or runtime dependency was added to this repository.

| Upstream | Immutable revision | Executed result |
| --- | --- | --- |
| getcadcraft/civilcraft | `b57d9a6bfb08881625c4b7361d0b7083d1bfd916` | Terrain copies/imports/translations match |
| getcadcraft/cadcraft | `93b7f5eb58b94e726a5d5333dd792cca8f1d7a14` | Electrical generator matches all 16 symbols |
| getcadcraft/takeoffcraft | `0a334c467cd3f750afd818523fd48bb7715e736f` | All 31 assembly mappings match; RC.8 15/0 |

RC.8 uses actual TakeoffCraft model/embed/bid implementations and pinned pdfjs-dist 6.3.289: reads the 3-sheet PDF attachment, loads 23 items/255 marks, compares wall/roof/hip/opening/electrical/slab quantities, computes 71 estimate rows and 21 cut-list rows. Poppler separately opens the PDF. No upstream checks skip; RC.8's schema notice says nothing was saved because this scenario produces PDF/JSON, not IFC. See `*-sync-final.log` and `real-rc8-final.log`.

Reproduce in an isolated checkout after `buildMirror()` (the explicit network fetch is never called by baseline):

```sh
node --input-type=module -e "import('./devshell/test.mjs').then(m=>m.buildMirror())"
python3 tests/features/f01/upstream.py "$PWD/.cc-test"
python3 tests/features/f01/upstream.py "$PWD/.cc-test" --verify-only
npm ci --ignore-scripts --prefix .cc-test/tools/takeoffcraft-test
node .cc-test/tools/bimcraft-test/terrain-sync.mjs --check
node .cc-test/tools/bimcraft-test/elec-sync.mjs --check
node .cc-test/tools/bimcraft-test/takeoff-sync.mjs --check
node .cc-test/bin/test-bimcraft.mjs --res --only rc8 --keep
```

Poppler must be on PATH for the additional PDF checks. The full enriched command was `node devshell/baseline.mjs --offline`, with the Python venv, web-ifc and these upstream files available. Source-sync pins remain unchanged and their immutable Git provenance checks still run. These results establish parity at the recorded revisions, not perpetual parity with floating upstream branches or full upstream application acceptance.

## Export evidence

New `edited-plan.pdf` and `edited-detail.pdf` are byte-identical to the previously rendered/inspected PDFs at `evidence/f01/` (SHA-256 `2947f6770abd2a31babbb8ddbdac61ba4dee90b2b4c3176e00c9872bbf72e3e1` and `821148648716bf3e13734f8bc23377ae1e77e13de03ad21e28e0d6ef130aeb3c`). `verification.json` retains the committed review identities and lifecycle values. Newly generated validation fixtures intentionally use new GUIDs and stay in `.cc-test`.
