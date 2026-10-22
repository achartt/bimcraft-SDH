# F03 measured comparison

Nearest-rank percentiles; n<30 is insufficient. Memory is observed, not peak allocation. Targets are provisional. Model-only edits do not establish interactive compliance.

| Domain / size / workload | n | p50 ms | p95 ms | memory after p50 MiB | target | flags |
|---|---:|---:|---:|---:|---|---|
| browser/small/context-cold-open | 30 | 232.60 | 271.10 | 13.9 | n/a |  |
| browser/small/warm-open | 30 | 123.00 | 160.10 | 25.8 | n/a |  |
| browser/small/selection-properties-feedback | 30 | 56.80 | 57.90 | 34.8 | within |  |
| browser/small/pan-gesture-max-frame | 30 | 16.80 | 16.80 | 25.5 | within |  |
| browser/small/zoom-gesture-max-frame | 30 | 16.80 | 16.80 | 15.7 | within |  |
| browser/small/wall-edit-feedback | 30 | 208.20 | 215.30 | 22.6 | within |  |
| browser/small/type-edit-feedback | 30 | 213.00 | 245.50 | 38.6 | within |  |
| browser/small/roof-regeneration-feedback | 30 | 210.40 | 229.40 | 38.0 | within |  |
| browser/small/save-generation | 30 | 1.30 | 1.50 | 41.4 | n/a |  |
| browser/small/pdf-generation | 30 | 0.40 | 0.50 | 41.9 | n/a |  |
| browser/medium/context-cold-open | 30 | 258.40 | 289.10 | 19.7 | n/a |  |
| browser/medium/warm-open | 30 | 131.60 | 145.90 | 34.7 | n/a |  |
| browser/medium/selection-properties-feedback | 30 | 40.10 | 40.60 | 29.6 | within |  |
| browser/medium/pan-gesture-max-frame | 30 | 16.70 | 16.80 | 28.7 | within |  |
| browser/medium/zoom-gesture-max-frame | 30 | 16.80 | 16.80 | 27.2 | within |  |
| browser/medium/wall-edit-feedback | 30 | 161.10 | 191.00 | 43.6 | within |  |
| browser/medium/type-edit-feedback | 30 | 212.50 | 215.20 | 51.6 | within |  |
| browser/medium/roof-regeneration-feedback | 30 | 226.80 | 237.70 | 47.3 | within |  |
| browser/medium/save-generation | 30 | 3.00 | 3.20 | 46.3 | n/a |  |
| browser/medium/pdf-generation | 30 | 0.70 | 0.80 | 38.2 | n/a |  |
| browser/large/context-cold-open | 30 | 312.60 | 345.20 | 20.8 | n/a |  |
| browser/large/warm-open | 30 | 174.80 | 212.40 | 28.4 | n/a |  |
| browser/large/selection-properties-feedback | 30 | 39.10 | 39.80 | 44.8 | within |  |
| browser/large/pan-gesture-max-frame | 30 | 16.70 | 16.80 | 32.8 | within |  |
| browser/large/zoom-gesture-max-frame | 30 | 16.80 | 16.80 | 32.4 | within |  |
| browser/large/wall-edit-feedback | 30 | 293.20 | 322.80 | 61.8 | within |  |
| browser/large/type-edit-feedback | 30 | 478.30 | 497.40 | 80.6 | within |  |
| browser/large/roof-regeneration-feedback | 30 | 323.30 | 359.00 | 91.4 | within |  |
| browser/large/save-generation | 30 | 7.70 | 8.30 | 66.5 | n/a |  |
| browser/large/pdf-generation | 30 | 1.80 | 2.70 | 54.9 | n/a |  |

Unmeasured groups: 27. Missing timings and memory are unverified, never zero or passing.
Source errors: 0. Error-bearing runs cannot certify UX targets.
Raw data and environment metadata: browser-raw.json
