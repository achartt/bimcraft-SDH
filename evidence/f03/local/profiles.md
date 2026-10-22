# Sampled CPU profiles

Separate ten-cycle type edit + plan scene + save + undo. Inspector start/stop overhead is retained and labeled; this is not an operation wall-clock measurement. Sampling is approximate; inclusive entries overlap and must not be summed. Browser profiles, if present, cover one UI type edit.

## large-model.cpuprofile

12433 samples; 1959.34 ms sampled.

| Self function | ms | % |
|---|---:|---:|
| ofType — ifc/model.js:117 | 436.17 | 22.3 |
| GetLine — ifc/api.js:146 | 249.96 | 12.8 |
| lineObject — ifc/api.js:151 | 237.66 | 12.1 |
| toApi — ifc/api.js:440 | 89.22 | 4.6 |
| (garbage collector) — native:0 | 54.35 | 2.8 |
| crc32 — ifc/schema.js:29 | 51.75 | 2.6 |
| post — node:inspector:115 | 49.65 | 2.5 |
| typedApi — ifc/api.js:469 | 41.40 | 2.1 |
| (program) — native:0 | 39.54 | 2.0 |
| typeCode — ifc/schema.js:36 | 38.26 | 2.0 |

| Inclusive stack | ms | % |
|---|---:|---:|
| (root) — native:0 | 1959.34 | 100.0 |
| (anonymous) — f03/model.mjs:0 | 1858.09 | 94.8 |
| processTicksAndRejections — process/task_queues:72 | 1858.09 | 94.8 |
| (anonymous) — app/model-ops.js:30 | 1678.14 | 85.6 |
| modelChange — app/ifc-edit.js:178 | 1678.14 | 85.6 |
| run — app/model-write.js:51 | 1677.82 | 85.6 |
| (anonymous) — app/model-ops.js:32 | 1677.52 | 85.6 |
| (anonymous) — app/model-ops.js:65 | 1649.38 | 84.2 |
| updateWall — app/model-walls.js:424 | 1193.80 | 60.9 |
| readWalls — app/model-walls.js:311 | 1106.41 | 56.5 |
| GetLine — ifc/api.js:146 | 765.10 | 39.0 |
| readPset — app/model-write.js:249 | 593.42 | 30.3 |
| lineObject — ifc/api.js:151 | 507.78 | 25.9 |
| rejoinAssemblyCorners — app/model-ops.js:80 | 483.09 | 24.7 |
| ids — app/ifc-util.js:36 | 461.09 | 23.5 |

## medium-model.cpuprofile

2414 samples; 415.97 ms sampled.

| Self function | ms | % |
|---|---:|---:|
| ofType — ifc/model.js:117 | 72.92 | 17.5 |
| post — node:inspector:115 | 45.79 | 11.0 |
| GetLine — ifc/api.js:146 | 42.57 | 10.2 |
| lineObject — ifc/api.js:151 | 39.49 | 9.5 |
| toApi — ifc/api.js:440 | 15.95 | 3.8 |
| (garbage collector) — native:0 | 11.87 | 2.9 |
| crc32 — ifc/schema.js:29 | 10.00 | 2.4 |
| typeCode — ifc/schema.js:36 | 7.60 | 1.8 |
| (program) — native:0 | 7.03 | 1.7 |
| typedApi — ifc/api.js:469 | 5.70 | 1.4 |

| Inclusive stack | ms | % |
|---|---:|---:|
| (root) — native:0 | 415.97 | 100.0 |
| (anonymous) — f03/model.mjs:0 | 395.86 | 95.2 |
| processTicksAndRejections — process/task_queues:72 | 395.86 | 95.2 |
| modelChange — app/ifc-edit.js:178 | 301.00 | 72.4 |
| (anonymous) — app/model-ops.js:30 | 300.85 | 72.3 |
| (anonymous) — app/model-ops.js:32 | 300.69 | 72.3 |
| run — app/model-write.js:51 | 300.69 | 72.3 |
| (anonymous) — app/model-ops.js:65 | 291.72 | 70.1 |
| updateWall — app/model-walls.js:424 | 181.71 | 43.7 |
| readWalls — app/model-walls.js:311 | 167.72 | 40.3 |
| GetLine — ifc/api.js:146 | 131.84 | 31.7 |
| lineObject — ifc/api.js:151 | 88.96 | 21.4 |
| readPset — app/model-write.js:249 | 84.10 | 20.2 |
| ids — app/ifc-util.js:36 | 78.12 | 18.8 |
| GetLineIDsWithType — ifc/api.js:132 | 77.97 | 18.7 |

## small-model.cpuprofile

615 samples; 152.93 ms sampled.

| Self function | ms | % |
|---|---:|---:|
| post — node:inspector:115 | 56.19 | 36.7 |
| ofType — ifc/model.js:117 | 16.59 | 10.8 |
| GetLine — ifc/api.js:146 | 8.08 | 5.3 |
| lineObject — ifc/api.js:151 | 7.35 | 4.8 |
| readWalls — app/model-walls.js:311 | 3.62 | 2.4 |
| toApi — ifc/api.js:440 | 3.37 | 2.2 |
| fromApi — ifc/api.js:215 | 2.61 | 1.7 |
| set — ifc/model.js:191 | 2.60 | 1.7 |
| (program) — native:0 | 2.58 | 1.7 |
| (garbage collector) — native:0 | 2.49 | 1.6 |

| Inclusive stack | ms | % |
|---|---:|---:|
| (root) — native:0 | 152.93 | 100.0 |
| (anonymous) — f03/model.mjs:0 | 147.54 | 96.5 |
| processTicksAndRejections — process/task_queues:72 | 147.54 | 96.5 |
| (anonymous) — app/model-ops.js:30 | 68.75 | 45.0 |
| modelChange — app/ifc-edit.js:178 | 68.75 | 45.0 |
| (anonymous) — app/model-ops.js:32 | 68.59 | 44.9 |
| run — app/model-write.js:51 | 68.59 | 44.9 |
| (anonymous) — app/model-ops.js:65 | 65.22 | 42.6 |
| post — node:inspector:115 | 56.34 | 36.8 |
| (anonymous) — f03/model.mjs:32 | 56.34 | 36.8 |
| post — f03/model.mjs:32 | 56.34 | 36.8 |
| updateWall — app/model-walls.js:424 | 30.68 | 20.1 |
| readWalls — app/model-walls.js:311 | 28.39 | 18.6 |
| GetLine — ifc/api.js:146 | 25.03 | 16.4 |
| settle — app/model-ops.js:55 | 20.04 | 13.1 |
