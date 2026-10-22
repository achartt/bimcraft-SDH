# F03 measured comparison

Nearest-rank percentiles; n<30 is insufficient. Memory is observed, not peak allocation. Targets are provisional. Model-only edits do not establish interactive compliance.

| Domain / size / workload | n | p50 ms | p95 ms | memory after p50 MiB | target | flags |
|---|---:|---:|---:|---:|---|---|
| model/small/process-cold-open | 30 | 1.59 | 1.67 | 65.8 | n/a |  |
| model/small/warm-parse | 30 | 0.34 | 0.42 | 87.1 | n/a |  |
| model/small/wall-edit | 30 | 1.93 | 2.69 | 147.8 | n/a |  |
| model/small/type-edit | 30 | 5.76 | 6.21 | 182.3 | n/a |  |
| model/small/roof-regeneration | 30 | 1.48 | 1.76 | 193.9 | n/a |  |
| model/small/save | 30 | 0.30 | 0.33 | 194.7 | n/a |  |
| model/small/mesh-generation | 30 | 0.49 | 0.79 | 195.0 | n/a |  |
| model/small/plan-scene | 30 | 0.21 | 0.28 | 195.0 | n/a |  |
| model/small/pdf | 30 | 0.20 | 0.22 | 195.2 | n/a |  |
| model/medium/process-cold-open | 30 | 2.37 | 2.62 | 67.5 | n/a |  |
| model/medium/warm-parse | 30 | 0.73 | 0.99 | 205.5 | n/a |  |
| model/medium/wall-edit | 30 | 3.81 | 4.35 | 205.0 | n/a |  |
| model/medium/type-edit | 30 | 24.15 | 24.92 | 250.0 | n/a |  |
| model/medium/roof-regeneration | 30 | 3.98 | 4.19 | 264.3 | n/a |  |
| model/medium/save | 30 | 0.74 | 1.08 | 261.1 | n/a |  |
| model/medium/mesh-generation | 30 | 1.09 | 1.30 | 261.2 | n/a |  |
| model/medium/plan-scene | 30 | 0.49 | 0.73 | 261.2 | n/a |  |
| model/medium/pdf | 30 | 0.53 | 0.71 | 261.3 | n/a |  |
| model/large/process-cold-open | 30 | 4.31 | 4.80 | 72.6 | n/a |  |
| model/large/warm-parse | 30 | 1.78 | 1.95 | 243.0 | n/a |  |
| model/large/wall-edit | 30 | 12.79 | 15.16 | 248.9 | n/a |  |
| model/large/type-edit | 30 | 126.87 | 131.20 | 286.5 | n/a |  |
| model/large/roof-regeneration | 30 | 17.24 | 18.61 | 282.0 | n/a |  |
| model/large/save | 30 | 2.62 | 2.86 | 316.3 | n/a |  |
| model/large/mesh-generation | 30 | 2.83 | 4.09 | 322.8 | n/a |  |
| model/large/plan-scene | 30 | 1.39 | 1.77 | 324.3 | n/a |  |
| model/large/pdf | 30 | 1.20 | 1.50 | 325.4 | n/a |  |

Unmeasured groups: 30. Missing timings and memory are unverified, never zero or passing.
Source errors: 0. Error-bearing runs cannot certify UX targets.
Raw data and environment metadata: model-raw.json
