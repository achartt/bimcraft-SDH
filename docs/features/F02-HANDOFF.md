# F02 — Precision, references and migration contract

State: implemented; draft review only. Exact delivered head, PR and head-specific CI
result are recorded in the PR and completion message (avoids a self-referential SHA).

## Ownership

- Repository / target: `achartt/bimcraft-SDH`, `main`.
- Pinned base: `1c35f47d69af2214b4747f541703224d0a4a4742`.
- F01 ancestry verified at `6c77bceaa24d244a659b619221725bf8aee07844`; base tree equals
  reviewed F01 tree `b9c980aae0fe953545361ace7c6a4dd96816d4d1`. Remote main matched at setup.
- Branch: `feature/f02-precision-contract`.
- Checkout: `/Users/austinhartt/Documents/ChatGPT/BimCraft Test/bimcraft-f02` (independent
  clone of committed objects, not a copy of another checkout's working files).
- Preview: `http://127.0.0.1:8017/`; owner chat `01a16005-080a-7ce2-b3be-7a541297b9fb`.
- No existing checkout switched/reset, no other preview stopped. Both 8015 and 8016 were
  running at setup; 8016 still listened at final observation, 8015 had independently
  ceased listening. No restart/takeover was attempted. No delegation or cross-chat messages.

## User-visible changes and how to try

Open `fixtures/f02/mm-local.ifc` on 8017, turn on Draw, then Annotate → Reference
dimensions. Edit a dimension's offset or rebind it: exactly one annotation keeps its
GlobalId through undo/redo and reopen. Small finish edits now regenerate IFC wall shapes
at a 0.001 mm comparison gate instead of leaving up to 0.01 mm of stale geometry.
Nonfinite wall coordinates/settings are rejected before writing.

Run `node tests/features/f02/review-fixtures.mjs`, then open either file under
`.cc-test/f02-review/`. `unsupported.ifc` shows actionable version feedback in Material
library, Wall assemblies and Reference dimensions, with editing unavailable and no
valid numeric reference labels. `missing-host.ifc` shows Undo/Rebind recovery. Rebind to
the surviving positive-bulge wall using Wall centerline, Aligned, typed points
`0mm,10000mm`, `5000mm,10000mm`, then `2500mm,11000mm`. The result displays
`16'-4 7/8"`; Undo returns to unresolved and Redo restores it.

The inherited narrow PHP-free Annotate menu is clipped (INT-01). Browser verification
used the actual existing button through the DOM locator with forced click to reach it;
this does not certify normal pointer accessibility. No preview/icon/layout fix is bundled.

## Acceptance

| Criterion | Result and evidence |
| --- | --- |
| 1. Units, coordinates, tolerances, rounding, failures | [F02-CONTRACT.md](F02-CONTRACT.md), operation table and roof/component inventory. Bounds are fixture claims, not universal kernel accuracy. |
| 2. At least ten persistence cycles | Eight cases × ten edit/undo/redo/save/reopen cycles; 24 walls, 144 dimensions; mm/m/in/ft, local/project translations, positive/negative curves. Stable wall/type/material/dimension IDs and core anchors asserted. |
| 3. Safe invalid references and atomic failure | Rebind duplication regression, missing/replaced/duplicate/degenerate hosts, coincident/invalid references, versions 99/null/string/fractional/missing and malformed JSON. Failed writes compare whole IFC bytes. UI screenshots and actual browser-saved/reopened IFC in `evidence/f02`. |
| 4. Material and IFC semantics | Existing eight material tests plus F02 lifecycle and independent checks. Default changes do not resize layers; cavity remains 25.4 mm/ventilated; zero membrane stays ordered. IFC2X3 existing tests retain metadata and omit zero physical layers; IFC4 independent checks retain zero physical layers. No artificial thickness. |
| 5. Journal and project isolation | Legacy reads leave bytes untouched; explicit recipe/spec save adds v1 and Undo restores original bytes. Each cycle verifies a separately opened seed is unchanged. Unsupported data cannot be overwritten by scoped operations. |

## Measured errors (mm)

The Node suite compares against a separate analytic expectation, not its own saved
measurement. All maxima include checks before/after edits, undo, redo and reopen.

| Case | Reference point | Dimension | Core anchor |
| --- | ---: | ---: | ---: |
| mm-local | 0.000004372 | 0.000003838 | 0.000004372 |
| mm-translated | 0.000004373 | 0.000003838 | 0.000004373 |
| m-local | 0.001895306 | 0.000780543 | 0.001893436 |
| m-translated | 0.001895305 | 0.000780543 | 0.001893435 |
| inch-local | 0.000149012 | 0.000031751 | 0.000149012 |
| inch-translated | 0.000143375 | 0.000031752 | 0.000143375 |
| foot-local | 0.000918209 | 0.000419984 | 0.000918209 |
| foot-translated | 0.000923584 | 0.000419984 | 0.000923584 |

Independent IfcOpenShell readback (16 seed/final files): maximum exported witness/project
point error **0.002038602 mm**, curve dimension error **0.000928668 mm**, Body/Axis/height
error **0.001456 mm**. All are below **0.005 mm**. The old 0.01 mm shape gate reproducibly
fails two metre cases (`old-shape-gate-regression.log`); the initial independent experiment
found 0.006725 mm radius drift. The final gate passes both in-app and independent checks.

## Validation commands and actual results

Node **22.23.3**; Python **3.12.14**, IfcOpenShell **0.9.0**. All output directories are
F02-owned; committed F01 fixtures are unchanged.

- `npm run fetch-vendor`: 110 checksum-pinned files fetched, no failures.
- `npm start -- --port 8017 --host 127.0.0.1 --offline`: live isolated preview.
- `npm run test:baseline -- --offline`: **619 passed / 0 failed** before optional readers;
  **637 passed / 0 failed** with installed readers. F02's **16 tests** are an explicit
  stage with a minimum execution count, also run by CI. These are current runs, not F01 counts.
- `npm test -- --oracles`: **3/3 files passed**. First setup used system Python 3.9 for
  three optional sibling tools; unavailable wheels left partial environments, causing
  four real schema-wrapper failures in the first enriched baseline. Those failures are
  retained in evidence. The partial environments were moved aside, rebuilt with Python
  3.12, and their pinned dependencies installed. Final oracle run has no installation-failure
  notices; the enriched baseline then passes. No failure was relabeled as a skip.
- `node tests/features/f01/fixture.mjs --output-dir .cc-test/f02-f01-generated`, followed
  by `python -I tests/features/f01/independent.py fixtures/f01 .cc-test/f02-f01-generated`:
  **six IFC files pass schema/EXPRESS, geometry and identities; three malformed controls
  correctly rejected**.
- `python -I tests/features/f02/independent.py`: **16 IFC files pass**, zero schema/EXPRESS
  findings; independent Body/Axis/dimension/layer/unit/translation/identity checks. Added
  to mandatory CI immediately after the F01 independent acceptance stage.
- Remaining optional skips: absent CivilCraft/CadCraft live source comparisons,
  TakeoffCraft cross-app/PDF reader and library-repository assets. Baseline Poppler checks
  skip because it is not on the shell PATH. Separately, bundled Poppler rendered the
  freshly generated application plan/detail PDFs with an isolated font cache; inspected
  PNGs show 241.30 mm total and 139.70 mm core. Whole-plan short-label suppression is the
  unchanged INT-02 limitation. No drawing-layout change is claimed.
- Separate browser tab: unsupported library/recipe/reference refusal, missing-host
  feedback, typed rebind, Undo/Redo, Save as IFC and reopening the actual download all
  verified. Reopened value remains `16'-4 7/8"`, one annotation. Captured warning/error
  console entries: none. `browser-rebound.ifc` retains the actual downloaded result.

Local JSON reports honestly identify a dirty tree at the pinned base during development.
Final committed-head validation and remote CI are reported on the draft PR; they are not
inferred from these historical working-tree reports.

## Compatibility, migrations and shared contracts

Recipes/specifications explicitly saved by F02 use **version 1**, with their existing
keys and fields. The previous unversioned shape is accepted only after validation;
reading does not write. Saving upgrades only the edited record in the reversible journal.
Material libraries remain v1; a missing library has transient starters, while a present
unversioned or unsupported library is refused. GlobalIds/material IDs/named references
remain unchanged. STEP entity numbers and meshes are not durable identities.

INT-04 is addressed by preserved diagnostic records, localized recovery instructions,
disabled incompatible editing and exclusion of unresolved reference dimensions from
application plan rendering. Unsupported records and their original IFC representations
are preserved byte-for-byte at the data level; raw save/reopen is preservation, not a
certified regenerated export for external readers. Use a compatible version or a known-good
copy. Unknown/corrupt records are not automatically downgraded, deleted, or repaired.
Missing hosts in otherwise supported records recover with Undo or explicit Rebind.

Conservative refusal applies to model operations that run the common wall/dependency
synchronization transaction when an unsupported assembly/library/reference exists.
Per-element partial editing of such a project is a future bounded policy decision.
Generic low-level IFC property editing/import repair is outside this contract.

## Limits and recommended next action

Review the draft PR and CI against the pinned base. Do not merge without separate approval.
F10/F16 inventory identifies roof point serialization at three file-unit decimals,
whole-mm edge keys, component parameter keys at 0.001 mm and absent stable topology IDs;
PM should coordinate those contracts before their workflows are implemented. No F03,
roof/component implementation, new kernel, roadmap reconciliation or deployment was done.
INT-01 icons/menu access, INT-02 short labels, INT-03 external-reader cavity appearance,
complex joins and generalized imported-IFC repair remain separate follow-ups.
