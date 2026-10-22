# F04 follow-ups

PM accepted the supported drawing scope of PR #6 with the following open work.
These follow-ups do not certify production responsiveness or extend supported geometry.

## PERF-F04-01 — Fine view responsiveness

Status: open. Priority: medium. Owner: unassigned; PM to schedule a bounded performance slice.
Coarse remains the default. Do not change physical geometry or precision contracts to improve drawing speed.

At reviewed head `71def0d4fe40b801eaaf0efe1f9ffc05f085a6ee`, the nine-wall fixture produced:

| Environment | Fine frame interval p50 / p95 ms | Fine synchronous paint p95 ms | Fine PDF p95 ms |
| --- | ---: | ---: | ---: |
| Linux CI, Chromium 141, AMD EPYC 7763 | 33.3 / 250.0 | 9.1 | 98.6 |
| PM Mac headless Chromium 151, Apple M5 Pro | 316.6 / 317.1 | 0.9 | 15.3 |

[Exact-head Linux evidence](https://github.com/achartt/bimcraft-SDH/actions/runs/39824414647).
Mac Coarse frame interval p50/p95 was 16.7/25.0 ms. The earlier handoff's 183.4 ms
Fine frame p95 is historical evidence on a different runner. Do not pool environments
or present historical numbers as the latest result.

Reproduce using `tests/features/f04/browser.mjs` with the approved baseline and the same
fixture. Its repeated-draw measurement separates synchronous paint from animation-frame
intervals; neither is a real gesture-latency or GPU-time measurement. Small paint times
do not resolve the observed frame delays.

Completion criteria:

- Test visible-browser pan/zoom and editing on representative residential models,
  including larger Fine views and Coarse/Medium comparisons.
- Record exact revisions, browser, hardware, viewport, raw samples and rendering traces.
- Separate JavaScript, rendering/compositing and scheduler costs before choosing a fix;
  investigate hatch/curve workload without assuming it is the cause.
- Agree responsiveness targets and address demonstrated bottlenecks while preserving
  authored widths, cavities, membrane semantics, identities and references.
- Rerun F01/F02/F03/F04 correctness checks for any optimization. Retain historical
  evidence and add clearly dated results for the new revision.

## Other bounded follow-ups

- Inherited crowded short dimension labels and menu/icon accessibility remain open;
  browser menu-reveal helpers are not an accessibility certification.
- Curved junctions, X/acute complex joins, self-overlap, variable-width/imported wall
  editing, wrapping and core-priority ownership remain outside F04 acceptance. Extend
  drawing tests only after physical ownership rules and supported envelopes are defined.

GitHub Issues was disabled when this follow-up record was created. This file is the
durable tracking location; the current integration does not implement these follow-ups.
