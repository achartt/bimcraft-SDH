# Sampled CPU profiles

Separate ten-cycle type edit + plan scene + save + undo. Inspector start/stop overhead is retained and labeled; this is not an operation wall-clock measurement. Sampling is approximate; inclusive entries overlap and must not be summed. Browser profiles, if present, cover one UI type edit.

## large-browser.cpuprofile

676 samples; 799.65 ms sampled.

| Self function | ms | % |
|---|---:|---:|
| (program) — native:0 | 362.58 | 45.3 |
| lineObject — ifc/api.js:151 | 77.77 | 9.7 |
| planLoops — dev/model-rooms.js:23 | 53.20 | 6.7 |
| readPset — dev/model-write.js:249 | 27.75 | 3.5 |
| (idle) — native:0 | 25.70 | 3.2 |
| (garbage collector) — native:0 | 23.13 | 2.9 |
| toApi — ifc/api.js:440 | 18.15 | 2.3 |
| ofType — ifc/model.js:117 | 12.76 | 1.6 |
| getProgramInfoLog — native:0 | 10.88 | 1.4 |
| encode — native:0 | 8.82 | 1.1 |

| Inclusive stack | ms | % |
|---|---:|---:|
| (root) — native:0 | 799.65 | 100.0 |
| (program) — native:0 | 362.58 | 45.3 |
| submit — dev/wall-assemblies-ui.js:97 | 256.51 | 32.1 |
| button.data-assembly-save — dev/wall-assemblies-ui.js:37 | 256.51 | 32.1 |
| apply — dev/model-ui.js:942 | 256.48 | 32.1 |
| commit — dev/model-ui.js:938 | 256.48 | 32.1 |
| obj.<computed> — native:12 | 234.64 | 29.3 |
| A.commit.label — dev/wall-assemblies-ui.js:103 | 200.66 | 25.1 |
| modelChange — dev/ifc-edit.js:178 | 200.66 | 25.1 |
| (anonymous) — dev/model-ops.js:32 | 193.23 | 24.2 |
| run — dev/model-write.js:51 | 193.23 | 24.2 |
| (anonymous) — dev/model-ops.js:30 | 193.23 | 24.2 |
| (anonymous) — dev/model-ops.js:65 | 188.98 | 23.6 |
| readWalls — dev/model-walls.js:311 | 139.82 | 17.5 |
| updateWall — dev/model-walls.js:424 | 129.05 | 16.1 |

## medium-browser.cpuprofile

382 samples; 462.56 ms sampled.

| Self function | ms | % |
|---|---:|---:|
| (program) — native:0 | 300.61 | 65.0 |
| (idle) — native:0 | 30.35 | 6.6 |
| getProgramInfoLog — native:0 | 13.71 | 3.0 |
| lineObject — ifc/api.js:151 | 9.19 | 2.0 |
| ofType — ifc/model.js:117 | 8.41 | 1.8 |
| (garbage collector) — native:0 | 8.37 | 1.8 |
| close — native:0 | 6.38 | 1.4 |
| planLoops — dev/model-rooms.js:23 | 5.31 | 1.1 |
| readPset — dev/model-write.js:249 | 4.25 | 0.9 |
| replaceChildren — native:0 | 3.56 | 0.8 |

| Inclusive stack | ms | % |
|---|---:|---:|
| (root) — native:0 | 462.56 | 100.0 |
| (program) — native:0 | 300.61 | 65.0 |
| obj.<computed> — native:12 | 56.82 | 12.3 |
| apply — dev/model-ui.js:942 | 55.89 | 12.1 |
| commit — dev/model-ui.js:938 | 55.89 | 12.1 |
| submit — dev/wall-assemblies-ui.js:97 | 55.89 | 12.1 |
| button.data-assembly-save — dev/wall-assemblies-ui.js:37 | 55.89 | 12.1 |
| A.commit.label — dev/wall-assemblies-ui.js:103 | 40.00 | 8.6 |
| modelChange — dev/ifc-edit.js:178 | 40.00 | 8.6 |
| rebuildNow — dev/bimcraft.js:3801 | 36.71 | 7.9 |
| run — dev/model-write.js:51 | 33.62 | 7.3 |
| (anonymous) — dev/model-ops.js:30 | 33.62 | 7.3 |
| (anonymous) — dev/model-ops.js:65 | 32.56 | 7.0 |
| (anonymous) — dev/model-ops.js:32 | 32.56 | 7.0 |
| (idle) — native:0 | 30.35 | 6.6 |

## small-browser.cpuprofile

373 samples; 461.95 ms sampled.

| Self function | ms | % |
|---|---:|---:|
| (program) — native:0 | 346.40 | 75.0 |
| (idle) — native:0 | 26.48 | 5.7 |
| getProgramInfoLog — native:0 | 23.00 | 5.0 |
| close — native:0 | 5.31 | 1.2 |
| lineObject — ifc/api.js:151 | 5.31 | 1.1 |
| (garbage collector) — native:0 | 5.21 | 1.1 |
| replaceChildren — native:0 | 4.50 | 1.0 |
| encode — native:0 | 3.22 | 0.7 |
| ofType — ifc/model.js:117 | 3.19 | 0.7 |
| scrollIntoView — native:0 | 2.14 | 0.5 |

| Inclusive stack | ms | % |
|---|---:|---:|
| (root) — native:0 | 461.95 | 100.0 |
| (program) — native:0 | 346.40 | 75.0 |
| setProgram — 0.186.1/three.module.js:18407 | 28.11 | 6.1 |
| WebGLRenderer.renderBufferDirect — 0.186.1/three.module.js:17233 | 28.11 | 6.1 |
| renderObject — 0.186.1/three.module.js:18192 | 28.11 | 6.1 |
| renderObjects — 0.186.1/three.module.js:18165 | 28.11 | 6.1 |
| renderScene — 0.186.1/three.module.js:18015 | 28.11 | 6.1 |
| WebGLRenderer.render — 0.186.1/three.module.js:17674 | 28.11 | 6.1 |
| (anonymous) — dev/viewer3d.js:162 | 28.11 | 6.1 |
| (idle) — native:0 | 26.48 | 5.7 |
| onFirstUse — 0.186.1/three.module.js:7022 | 24.66 | 5.3 |
| getProgramInfoLog — native:0 | 23.00 | 5.0 |
| rebuildNow — dev/bimcraft.js:3801 | 22.40 | 4.8 |
| obj.<computed> — native:12 | 22.32 | 4.8 |
| apply — dev/model-ui.js:942 | 22.10 | 4.8 |
