# Browser phase observations

- Each value sums spans of the same name within one retained sample. Missing spans are not zero.
- Phases overlap: load-total contains parse-worker-to-adopt and mesh-and-batch; model-edit-and-dependencies can contain ifc-serialize. Do not sum phase medians or subtract them to infer UI time.
- parse-worker-to-adopt includes loader close/setup, worker startup (if cold), scheduling, parsing and transfer until AdoptModel entry. It is not pure parser CPU.
- mesh-and-batch includes synchronous mesh extraction and its scene-batching callback. load-total also includes spatial metadata and final batch work.
- plan-canvas-draw measures synchronous Canvas drawing calls; plan-render-request measures only rAF scheduling, not compositor presentation. Feedback totals include scheduling, UI/3D rebuild and two rAF paint opportunities; inspect the retained timeline for uninstrumented work.

| Size / operation | Phase | n | missing | p50 ms | p95 ms |
|---|---|---:|---:|---:|---:|
| small/context-cold-open | parse-worker-to-adopt | 30 | 0 | 17.70 | 31.50 |
| small/context-cold-open | mesh-and-batch | 30 | 0 | 19.60 | 23.50 |
| small/context-cold-open | load-total | 30 | 0 | 40.00 | 53.00 |
| small/warm-open | parse-worker-to-adopt | 30 | 0 | 1.10 | 12.90 |
| small/warm-open | mesh-and-batch | 30 | 0 | 2.90 | 3.90 |
| small/warm-open | load-total | 30 | 0 | 4.50 | 16.50 |
| small/selection-properties-feedback | plan-render-request | 30 | 0 | 0.00 | 0.00 |
| small/selection-properties-feedback | plan-canvas-draw | 30 | 0 | 0.40 | 0.50 |
| small/wall-edit-feedback | model-edit-and-dependencies | 30 | 0 | 3.60 | 4.40 |
| small/wall-edit-feedback | plan-render-request | 30 | 0 | 0.00 | 0.10 |
| small/wall-edit-feedback | plan-canvas-draw | 30 | 0 | 0.70 | 0.80 |
| small/wall-edit-feedback | ifc-serialize | 30 | 0 | 2.40 | 3.00 |
| small/wall-edit-feedback | parse-worker-to-adopt | 30 | 0 | 1.00 | 2.60 |
| small/wall-edit-feedback | mesh-and-batch | 30 | 0 | 2.60 | 3.70 |
| small/wall-edit-feedback | load-total | 30 | 0 | 4.10 | 5.60 |
| small/type-edit-feedback | model-edit-and-dependencies | 30 | 0 | 14.00 | 15.70 |
| small/type-edit-feedback | plan-render-request | 30 | 0 | 0.00 | 0.10 |
| small/type-edit-feedback | plan-canvas-draw | 30 | 0 | 0.70 | 1.20 |
| small/type-edit-feedback | ifc-serialize | 30 | 0 | 2.90 | 3.80 |
| small/type-edit-feedback | parse-worker-to-adopt | 30 | 0 | 1.10 | 2.50 |
| small/type-edit-feedback | mesh-and-batch | 30 | 0 | 2.20 | 2.90 |
| small/type-edit-feedback | load-total | 30 | 0 | 4.00 | 5.80 |
| small/roof-regeneration-feedback | model-edit-and-dependencies | 30 | 0 | 3.40 | 4.20 |
| small/roof-regeneration-feedback | plan-render-request | 30 | 0 | 0.00 | 0.00 |
| small/roof-regeneration-feedback | plan-canvas-draw | 30 | 0 | 0.60 | 0.80 |
| small/roof-regeneration-feedback | ifc-serialize | 30 | 0 | 2.20 | 2.70 |
| small/roof-regeneration-feedback | parse-worker-to-adopt | 30 | 0 | 1.10 | 2.60 |
| small/roof-regeneration-feedback | mesh-and-batch | 30 | 0 | 2.30 | 2.90 |
| small/roof-regeneration-feedback | load-total | 30 | 0 | 4.10 | 5.50 |
| small/save-generation | ifc-serialize | 30 | 0 | 1.30 | 1.50 |
| medium/context-cold-open | parse-worker-to-adopt | 30 | 0 | 19.60 | 31.00 |
| medium/context-cold-open | mesh-and-batch | 30 | 0 | 29.10 | 31.10 |
| medium/context-cold-open | load-total | 30 | 0 | 52.30 | 61.10 |
| medium/warm-open | parse-worker-to-adopt | 30 | 0 | 1.90 | 12.00 |
| medium/warm-open | mesh-and-batch | 30 | 0 | 4.80 | 6.80 |
| medium/warm-open | load-total | 30 | 0 | 9.60 | 18.80 |
| medium/selection-properties-feedback | plan-render-request | 30 | 0 | 0.00 | 0.00 |
| medium/selection-properties-feedback | plan-canvas-draw | 30 | 0 | 0.50 | 0.70 |
| medium/wall-edit-feedback | model-edit-and-dependencies | 30 | 0 | 6.10 | 8.50 |
| medium/wall-edit-feedback | plan-render-request | 30 | 0 | 0.00 | 0.00 |
| medium/wall-edit-feedback | plan-canvas-draw | 30 | 0 | 1.00 | 1.20 |
| medium/wall-edit-feedback | ifc-serialize | 30 | 0 | 4.00 | 5.60 |
| medium/wall-edit-feedback | parse-worker-to-adopt | 30 | 0 | 1.90 | 2.90 |
| medium/wall-edit-feedback | mesh-and-batch | 30 | 0 | 3.80 | 4.60 |
| medium/wall-edit-feedback | load-total | 30 | 0 | 6.10 | 7.50 |
| medium/type-edit-feedback | model-edit-and-dependencies | 30 | 0 | 40.60 | 53.70 |
| medium/type-edit-feedback | plan-render-request | 30 | 0 | 0.00 | 0.10 |
| medium/type-edit-feedback | plan-canvas-draw | 30 | 0 | 1.00 | 1.20 |
| medium/type-edit-feedback | ifc-serialize | 30 | 0 | 6.30 | 7.20 |
| medium/type-edit-feedback | parse-worker-to-adopt | 30 | 0 | 1.80 | 2.30 |
| medium/type-edit-feedback | mesh-and-batch | 30 | 0 | 3.70 | 4.20 |
| medium/type-edit-feedback | load-total | 30 | 0 | 5.90 | 6.90 |
| medium/roof-regeneration-feedback | model-edit-and-dependencies | 30 | 0 | 6.50 | 7.50 |
| medium/roof-regeneration-feedback | plan-render-request | 30 | 0 | 0.00 | 0.10 |
| medium/roof-regeneration-feedback | plan-canvas-draw | 30 | 0 | 0.90 | 1.10 |
| medium/roof-regeneration-feedback | ifc-serialize | 30 | 0 | 3.90 | 5.10 |
| medium/roof-regeneration-feedback | parse-worker-to-adopt | 30 | 0 | 1.90 | 2.10 |
| medium/roof-regeneration-feedback | mesh-and-batch | 30 | 0 | 3.70 | 4.50 |
| medium/roof-regeneration-feedback | load-total | 30 | 0 | 5.90 | 6.80 |
| medium/save-generation | ifc-serialize | 30 | 0 | 3.00 | 3.20 |
| large/context-cold-open | parse-worker-to-adopt | 30 | 0 | 22.60 | 30.10 |
| large/context-cold-open | mesh-and-batch | 30 | 0 | 45.60 | 50.40 |
| large/context-cold-open | load-total | 30 | 0 | 72.30 | 82.00 |
| large/warm-open | parse-worker-to-adopt | 30 | 0 | 20.20 | 24.90 |
| large/warm-open | mesh-and-batch | 30 | 0 | 10.30 | 14.40 |
| large/warm-open | load-total | 30 | 0 | 31.60 | 37.70 |
| large/selection-properties-feedback | plan-render-request | 30 | 0 | 0.00 | 0.00 |
| large/selection-properties-feedback | plan-canvas-draw | 30 | 0 | 1.10 | 1.40 |
| large/wall-edit-feedback | model-edit-and-dependencies | 30 | 0 | 21.00 | 22.50 |
| large/wall-edit-feedback | plan-render-request | 30 | 0 | 0.00 | 0.10 |
| large/wall-edit-feedback | plan-canvas-draw | 30 | 0 | 2.00 | 2.20 |
| large/wall-edit-feedback | ifc-serialize | 30 | 0 | 8.90 | 11.30 |
| large/wall-edit-feedback | parse-worker-to-adopt | 30 | 0 | 3.50 | 3.70 |
| large/wall-edit-feedback | mesh-and-batch | 30 | 0 | 8.80 | 11.00 |
| large/wall-edit-feedback | load-total | 30 | 0 | 13.60 | 15.40 |
| large/type-edit-feedback | model-edit-and-dependencies | 30 | 0 | 189.70 | 194.00 |
| large/type-edit-feedback | plan-render-request | 30 | 0 | 0.00 | 0.10 |
| large/type-edit-feedback | plan-canvas-draw | 30 | 0 | 2.00 | 2.20 |
| large/type-edit-feedback | ifc-serialize | 30 | 0 | 13.20 | 15.70 |
| large/type-edit-feedback | parse-worker-to-adopt | 30 | 0 | 3.60 | 7.70 |
| large/type-edit-feedback | mesh-and-batch | 30 | 0 | 8.30 | 18.00 |
| large/type-edit-feedback | load-total | 30 | 0 | 12.80 | 24.30 |
| large/roof-regeneration-feedback | model-edit-and-dependencies | 30 | 0 | 29.00 | 32.20 |
| large/roof-regeneration-feedback | plan-render-request | 30 | 0 | 0.00 | 0.10 |
| large/roof-regeneration-feedback | plan-canvas-draw | 30 | 0 | 1.90 | 2.10 |
| large/roof-regeneration-feedback | ifc-serialize | 30 | 0 | 9.40 | 11.20 |
| large/roof-regeneration-feedback | parse-worker-to-adopt | 30 | 0 | 3.50 | 4.30 |
| large/roof-regeneration-feedback | mesh-and-batch | 30 | 0 | 8.50 | 11.50 |
| large/roof-regeneration-feedback | load-total | 30 | 0 | 13.90 | 16.20 |
| large/save-generation | ifc-serialize | 30 | 0 | 7.60 | 8.30 |
