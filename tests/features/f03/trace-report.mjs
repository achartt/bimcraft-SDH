/* SPDX-License-Identifier: Apache-2.0 */
// Summarize complete-duration events inside the F03 feedback marker, on its thread.
// Event categories are nested. Totals below overlap and are not an additive breakdown.
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || 'evidence/f03/reference';
const results = [];
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('-trace.json'))) {
  const events = JSON.parse(fs.readFileSync(path.join(dir, file))).traceEvents;
  const start = events.find(e => e.name === 'f03-input');
  const end = events.find(e => e.name === 'f03-feedback');
  if (!start || !end || end.ts <= start.ts) throw new Error('Missing feedback markers: ' + file);
  const groups = new Map();
  for (const e of events) {
    if (e.ph !== 'X' || e.pid !== start.pid || e.tid !== start.tid || !e.dur) continue;
    const us = Math.max(0, Math.min(e.ts + e.dur, end.ts) - Math.max(e.ts, start.ts));
    if (!us) continue;
    if (!groups.has(e.name)) groups.set(e.name, []);
    groups.get(e.name).push(us / 1000);
  }
  results.push({file, feedbackMs: (end.ts - start.ts) / 1000,
    pid: start.pid, tid: start.tid,
    events: [...groups].map(([name, durations]) => ({name, n: durations.length,
      totalMs: durations.reduce((a, b) => a + b, 0), maxMs: Math.max(...durations)}))
      .sort((a, b) => b.totalMs - a.totalMs)});
}
if (!results.length) throw new Error('No traces');
fs.writeFileSync(path.join(dir, 'trace-summary.json'), JSON.stringify(results, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'trace-summary.md'), [
  '# Representative UI type-edit timelines', '',
  'One traced edit per size, separate from percentile samples. Main-thread complete-duration events are clipped to f03-input → f03-feedback. Nested event totals overlap; never sum them. This is elapsed time inside events, not hardware CPU or GPU time. Worker and background GC events are excluded; original traces retain them.', '',
  ...results.flatMap(r => [`## ${r.file}`, '', `${r.feedbackMs.toFixed(2)} ms feedback marker interval.`, '',
    '| Event | n | total ms (overlapping) | longest ms |', '|---|---:|---:|---:|',
    ...r.events.slice(0, 15).map(e => `| ${e.name} | ${e.n} | ${e.totalMs.toFixed(2)} | ${e.maxMs.toFixed(2)} |`), '']),
].join('\n'));
