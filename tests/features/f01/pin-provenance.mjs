/* SPDX-License-Identifier: Apache-2.0 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { terrainLanguageKeys } from '../../tools/bimcraft-test/source-sync-pins.mjs';

// Verify the lock record against immutable Git objects, not against the mutable
// working copy it is supposed to protect. Missing history is an error, never a skip.
export function verifyPinProvenance(repo, pins) {
  const revision = pins.provenance.revision;
  assert.match(revision, /^[a-f0-9]{40}$/, 'Provenance must name a full commit SHA');
  const blob = file => {
    try {
      return execFileSync('git', ['cat-file', 'blob', `${revision}:app/${file}`], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 8 * 1024 * 1024 });
    } catch (cause) {
      throw new Error(`Cannot verify pin provenance ${revision}:app/${file}; fetch the recorded revision before running the baseline`, { cause });
    }
  };
  for (const name of ['terrain', 'electrical']) for (const [file, hash] of Object.entries(pins[name].files)) {
    assert.equal(createHash('sha256').update(blob(file)).digest('hex'), hash, `Pin provenance mismatch for ${file}`);
  }
  const manifest = JSON.parse(blob('manifest.json'));
  for (const [name, target] of Object.entries(pins.terrain.imports)) {
    assert.equal(target, manifest.imports[name], `Pin provenance mismatch for import ${name}`);
  }
  const keys = terrainLanguageKeys(['tin.js', 'raster.js'].map(file => blob(file).toString('utf8')));
  assert.deepEqual([...pins.terrain.languageKeys].sort(), keys, 'Pin provenance mismatch for language keys');
}
