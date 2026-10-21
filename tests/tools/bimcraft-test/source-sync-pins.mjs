/* SPDX-License-Identifier: Apache-2.0 */
// A standalone integrity contract, not a claim of live upstream source equality.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export function checkBundledAssets(root, kind, sourceApp) {
  const pins = JSON.parse(fs.readFileSync(new URL('./source-sync-pins.json', import.meta.url), 'utf8'));
  if (pins.schema !== 1 || !pins[kind]) throw new Error('Unsupported source-sync pin schema or group');
  const pin = pins[kind], app = path.join(root, 'public_html/assets/apps/bimcraft/dev');
  for (const [file, expected] of Object.entries(pin.files)) {
    const hash = createHash('sha256').update(fs.readFileSync(path.join(app, file))).digest('hex');
    if (hash !== expected) throw new Error(`Bundled ${file} differs from pinned revision ${pins.provenance.revision}; review source provenance before updating the pin`);
  }
  if (pin.imports) {
    const manifest = JSON.parse(fs.readFileSync(path.join(app, 'manifest.json'), 'utf8'));
    for (const [lib, expected] of Object.entries(pin.imports)) {
      if (manifest.imports?.[lib] !== expected) throw new Error(`Bundled manifest mapping differs for ${lib}`);
    }
    const lang = JSON.parse(fs.readFileSync(path.join(app, 'lang/en.json'), 'utf8'));
    for (const key of pin.languageKeys) {
      if (!Object.hasOwn(lang, key)) throw new Error(`Bundled terrain language key missing: ${key}`);
    }
    for (const [key, value] of Object.entries(lang)) {
      if (value === '[object Object]') throw new Error(`Bundled language key ${key} is "[object Object]"`);
    }
  }
  console.log(`${kind}: bundled integrity verified against ${pins.provenance.revision}`);
  // Inspect the app root, not an individual required file. Partial installs, unreadable
  // paths and dangling symlinks must fail; only a genuinely absent app is optional.
  const source = path.join(root, 'public_html/assets/apps', sourceApp);
  try { fs.lstatSync(source); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log(`SKIP ${kind} live source comparison: ${sourceApp} app absent at ${source}; bundled integrity checked separately`);
    return true;
  }
  if (!fs.statSync(source).isDirectory()) throw new Error(`Source app is not a directory: ${source}`);
  return false;
}
