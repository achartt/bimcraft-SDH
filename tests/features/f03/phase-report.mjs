/* SPDX-License-Identifier: Apache-2.0 */
// Post-process existing browser samples; this does not rerun or alter measurements.
import fs from 'node:fs';
import path from 'node:path';
import {percentile} from './report.mjs';

const dir = process.argv[2] || 'evidence/f03/reference';
const raw = JSON.parse(fs.readFileSync(path.join(dir, 'browser-raw.json')));
const groups = new Map();
for (const sample of raw.samples) {
  const key = `${sample.size}/${sample.workload}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(sample);
}
const phases = [];
for (const [key, samples] of groups) {
  const names = new Set(samples.flatMap(s => (s.spans || []).map(p => p.name)));
  for (const name of names) {
    const values = samples.map(s => (s.spans || []).filter(p => p.name === name))
      .filter(spans => spans.length)
      .map(spans => spans.reduce((total, p) => total + p.ms, 0));
    if (values.some(ms => !Number.isFinite(ms) || ms < 0)) throw new Error('Invalid phase');
    phases.push({key, phase: name, n: values.length, missing: samples.length - values.length,
      p50: percentile(values, .5), p95: percentile(values, .95)});
  }
}
if (!phases.length) throw new Error('No phase observations');
const notes = [
  'Each value sums spans of the same name within one retained sample. Missing spans are not zero.',
  'Phases overlap: load-total contains parse-worker-to-adopt and mesh-and-batch; model-edit-and-dependencies can contain ifc-serialize. Do not sum phase medians or subtract them to infer UI time.',
  'parse-worker-to-adopt includes loader close/setup, worker startup (if cold), scheduling, parsing and transfer until AdoptModel entry. It is not pure parser CPU.',
  'mesh-and-batch includes synchronous mesh extraction and its scene-batching callback. load-total also includes spatial metadata and final batch work.',
  'plan-canvas-draw measures synchronous Canvas drawing calls; plan-render-request measures only rAF scheduling, not compositor presentation. Feedback totals include scheduling, UI/3D rebuild and two rAF paint opportunities; inspect the retained timeline for uninstrumented work.',
];
fs.writeFileSync(path.join(dir, 'phases.json'), JSON.stringify({notes, phases}, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'phases.md'), [
  '# Browser phase observations', '', ...notes.map(n => '- ' + n), '',
  '| Size / operation | Phase | n | missing | p50 ms | p95 ms |',
  '|---|---|---:|---:|---:|---:|',
  ...phases.map(p => `| ${p.key} | ${p.phase} | ${p.n} | ${p.missing} | ${p.p50.toFixed(2)} | ${p.p95.toFixed(2)} |`), '',
].join('\n'));
