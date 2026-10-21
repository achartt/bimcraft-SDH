# Source-sync follow-up evidence

Tested implementation: `e5da3321cd52150530d00b3123c7f5234dedccd3`.
Fresh clone: `/private/tmp/bimcraft-f01-sync-20261021`, no copied vendor or test cache, no source apps. Both summaries report a clean git state.

- `node22-command.log`: first baseline invocation, including download/checksum verification of all 110 pinned vendor files; 574 passes, zero failures.
- `node22/`: full per-stage logs and machine-readable summary.
- `node26-command.log`, `node26-summary.json`: offline baseline on the same clone under Node 26.9.0; 574 passes, zero failures.
- `github-implementation.log`: successful [run 39644245908](https://github.com/achartt/bimcraft-SDH/actions/runs/39644245908), job 119375516557; 578 baseline passes, zero failures; legacy oracle command passes 3/3 discovered files; evidence upload succeeds. Actions tests the PR merge checkout. Poppler adds the four remote passes.

Bundled integrity passes do not establish live upstream parity. CivilCraft, CadCraft and TakeoffCraft checks report absent dependencies explicitly. IFC schema and external-reader checks are unavailable in the clean baseline; the later legacy oracle command does not rerun every named mode. Prior failed source-sync and local partial-venv/schema evidence elsewhere in `evidence/f01/` is historical and remains unchanged.

The final evidence/handoff commit changes no executable code. Its exact head and subsequent CI result are recorded in draft PR #2; final local verification is retained in that clone's ignored `.cc-test/final-delivery/` directory.
