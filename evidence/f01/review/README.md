# PR #2 review evidence

Reviewed original head: `b2724e786a8f397037936ce6d6a38b7388fe7598`.
Fixed implementation: `40d820e15fb9d93fb2153ccbcdcf91b6534b4b31` (includes boundary fix `5e01eb2`).

- `before-fix-contracts.log`: reproductions against the original executable code, with newly added tests. 34 pass / 10 fail; failures expose false-green results for incomplete pins, unusable translations and partial/dangling TakeoffCraft paths.
- `fresh-vendor-baseline.log`: initial fresh clone at `5e01eb2`, 110 vendor files fetched and verified; 600 baseline passes before the additional three provenance tests.
- `node22-command.log`, `node22-summary.json`, `node22-source-sync-contract.log`, `node22-runner-contract.log`: reviewed implementation at `40d820e`, clean git state, 603 passes / zero failures, exit 0.
- `node26-command.log`, `node26-summary.json`: same clean implementation, Node 26.9.0, 603 passes / zero failures, exit 0.
- `github-implementation.log`: successful [CI run 39646484489](https://github.com/achartt/bimcraft-SDH/actions/runs/39646484489), job 119383294354; 607 baseline passes / zero failures, legacy oracle command 3/3 test files, artifact upload succeeds. Poppler contributes four additional checks.

Clone: `/private/tmp/bimcraft-f01-review-20261021`; created without existing vendor/test cache or sibling apps. Full per-stage logs are retained in its `.cc-test/review-provenance-node22/` directory. The final documentation-only commit and its CI result are recorded in PR #2; final local logs are retained under `.cc-test/final-review/`.

The immutable pin hashes themselves were not changed. Git-provenance tests compare hashes/imports/key lists with the recorded revision, and missing history is an error. CI fetches full history. Pin/schema validation, valid translations, app-root and package-root checks now prevent the demonstrated false skips. Actual upstream apps and independent IFC schema acceptance remain unavailable/unverified as recorded in the handoff. Controlled source/PDF fixtures are test harnesses, not real cross-app integration evidence.
