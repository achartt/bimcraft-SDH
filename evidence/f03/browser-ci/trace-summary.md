# Representative UI type-edit timelines

One traced edit per size, separate from percentile samples. Main-thread complete-duration events are clipped to f03-input → f03-feedback. Nested event totals overlap; never sum them. This is elapsed time inside events, not hardware CPU or GPU time. Worker and background GC events are excluded; original traces retain them.

## large-trace.json

559.66 ms feedback marker interval.

| Event | n | total ms (overlapping) | longest ms |
|---|---:|---:|---:|
| v8.callFunction | 83 | 420.97 | 273.27 |
| FunctionCall | 78 | 299.91 | 273.06 |
| EventDispatch | 72 | 276.35 | 273.56 |
| HandlePostMessage | 1 | 98.02 | 98.02 |
| FireAnimationFrame | 14 | 23.95 | 19.14 |
| TimerFire | 4 | 22.51 | 22.35 |
| MinorGC | 21 | 19.32 | 2.83 |
| V8.GCScavenger | 21 | 18.29 | 2.78 |
| V8.GC_SCAVENGER | 21 | 17.92 | 2.77 |
| V8.GC_SCAVENGER_SCAVENGE | 21 | 17.57 | 2.75 |
| UpdateLayoutTree | 13 | 16.32 | 6.78 |
| V8.GC_SCAVENGER_SCAVENGE_PARALLEL_PHASE | 21 | 11.89 | 2.17 |
| Paint | 48 | 11.19 | 4.31 |
| Layout | 6 | 8.12 | 2.43 |
| V8.GC_SCAVENGER_SCAVENGE_PARALLEL | 35 | 5.99 | 1.24 |

## medium-trace.json

230.07 ms feedback marker interval.

| Event | n | total ms (overlapping) | longest ms |
|---|---:|---:|---:|
| v8.callFunction | 83 | 134.32 | 58.83 |
| FunctionCall | 78 | 84.22 | 58.65 |
| EventDispatch | 72 | 61.57 | 58.99 |
| HandlePostMessage | 1 | 40.17 | 40.17 |
| FireAnimationFrame | 14 | 22.88 | 19.66 |
| UpdateLayoutTree | 13 | 10.48 | 5.18 |
| TimerFire | 4 | 9.61 | 9.19 |
| Paint | 48 | 6.35 | 2.28 |
| Layout | 6 | 5.10 | 1.37 |
| MinorGC | 3 | 3.83 | 1.43 |
| V8.GCScavenger | 3 | 3.70 | 1.38 |
| V8.GC_SCAVENGER | 3 | 3.67 | 1.37 |
| V8.GC_SCAVENGER_SCAVENGE | 3 | 3.61 | 1.35 |
| V8.GC_SCAVENGER_SCAVENGE_PARALLEL_PHASE | 3 | 2.51 | 1.00 |
| PrePaint | 8 | 2.01 | 0.98 |

## small-trace.json

230.68 ms feedback marker interval.

| Event | n | total ms (overlapping) | longest ms |
|---|---:|---:|---:|
| v8.callFunction | 82 | 87.17 | 23.26 |
| FunctionCall | 77 | 58.77 | 22.92 |
| FireAnimationFrame | 13 | 33.88 | 22.68 |
| EventDispatch | 70 | 24.75 | 23.42 |
| HandlePostMessage | 1 | 23.23 | 23.23 |
| UpdateLayoutTree | 13 | 9.53 | 4.59 |
| Paint | 48 | 5.36 | 1.87 |
| TimerFire | 4 | 5.29 | 4.42 |
| Layout | 6 | 4.61 | 1.08 |
| PrePaint | 7 | 1.73 | 0.83 |
| V8.GCIncrementalMarkingStart | 1 | 1.55 | 1.55 |
| MinorGC | 1 | 1.40 | 1.40 |
| V8.GCScavenger | 1 | 1.36 | 1.36 |
| V8.GC_SCAVENGER | 1 | 1.35 | 1.35 |
| V8.GC_SCAVENGER_SCAVENGE | 1 | 1.33 | 1.33 |
