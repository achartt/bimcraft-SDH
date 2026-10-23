#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-bimcraft-connectors.mjs — connectors on families: the recipe reads and refuses them (family-model.js), the editor's
 * changes keep them right (family-edit.js), and every placed element gets them as IfcDistributionPort (family-ops.js) that
 * follow its size, its family and its deletion, one undo step each. On a new building made here (IFC4, mm); no other files.
 *   node bin/test-bimcraft-connectors.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
const VERBOSE = process.argv.includes('--verbose');
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) {
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);
const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')).href);
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const WebIFC = await imp('ifc/api.js');
const { IfcModel } = await imp('ifc-model.js');
const { IfcEditor } = await imp('ifc-edit.js');
const { ModelWriter } = await imp('model-write.js');
const OPS = await imp('model-ops.js');
const N = await imp('new-model.js');
const FM = await imp('family-model.js');
const FE = await imp('family-edit.js');
const FO = await imp('family-ops.js');

let pass = 0, fail = 0;
const ok = (c, m, detail = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (detail ? ' (' + detail + ')' : '')); } };
const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
const quiet = (fn) => async (...a) => { const l = console.log, w = console.warn; console.log = console.warn = () => {}; try { return await fn(...a); } finally { console.log = l; console.warn = w; } };
const dec = (b) => new TextDecoder().decode(b);
const count = (txt, re) => (txt.match(re) || []).length;
const danglingRefs = (txt) => {
  const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set();
  for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
  return [...out];
};
async function building() {
  const text = N.newBuilding({ name: 'Connectors', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-10-23T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  return { ed, levels: OPS.snapshotModel(ed).levels, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
}

// a basin on a stand: water in at the back, the drain out of its bottom
const basin = () => ({
  format: 'cadcraft-family', version: 1, key: 'fam-testbasin', name: 'Test basin', kind: 'fixture', host: 'none', ifc: { class: 'IfcSanitaryTerminal' },
  params: [{ key: 'Width', kind: 'length', value: 500 }, { key: 'Depth', kind: 'length', value: 400 }, { key: 'Height', kind: 'length', value: 850 }],
  solids: [{ id: 's1', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'stone' }], booleans: [],
  connectors: [
    { id: 'c1', name: 'Cold water', domain: 'pipe', system: 'cw', x: '(Width / 4)', y: 'Depth', z: '550', dir: '+y', size: '20', flow: 'in' },
    { id: 'c2', name: 'Drain', domain: 'pipe', system: 'san', x: '0', y: '(Depth / 2)', z: '0', dir: '-z', size: '40', flow: 'out' },
  ],
});

// ============================================================================================ the recipe
console.log('== connectors in a recipe (family-model.js)');
let r = FM.readFamily(basin());
ok(r.ok && r.family.connectors.length === 2 && r.family.connectors[1].dir === '-z' && r.family.connectors[1].flow === 'out', 'a family with two connectors reads', JSON.stringify(r.errors));
const plain = FM.readFamily({ ...basin(), connectors: undefined });
ok(plain.ok && !('connectors' in plain.family), 'a family without connectors keeps no "connectors" field (its stored recipe is as before)');
const refused = (patch) => FM.readFamily({ ...basin(), connectors: [{ ...basin().connectors[0], ...patch }] });
ok(refused({ dir: 'up' }).errors[0]?.key === 'fam.err.connfield' && refused({ dir: 'up' }).errors[0].fill.field === 'dir', 'a way out that is not one of the six: refused, naming the field');
ok(refused({ domain: 'wire' }).errors[0]?.key === 'fam.err.connector', 'a domain other than pipe or duct: refused');
ok(refused({ system: 'Cold Water!' }).errors[0]?.key === 'fam.err.connfield', 'a system key that is not a key: refused');
ok(refused({ x: 'Widht / 2' }).errors[0]?.key === 'fam.err.unknown', 'an expression naming an unknown parameter: refused');
const doorRecipe = { format: 'cadcraft-family', version: 1, key: 'fam-d', name: 'D', kind: 'door', host: 'wall', base: 'door-single',
  params: [{ key: 'Width', kind: 'length', value: 900 }, { key: 'Height', kind: 'length', value: 2100 }], solids: basin().solids, booleans: [] };
const door = FM.readFamily({ ...doorRecipe, connectors: basin().connectors });
ok(!door.ok && door.errors.some((e) => e.key === 'fam.err.connhosted'), 'connectors on a door or window family: refused (fam.err.connhosted)');
const tooMany = FM.readFamily({ ...basin(), connectors: Array.from({ length: 25 }, (_, i) => ({ ...basin().connectors[0], id: 'c' + (i + 1) })) });
ok(tooMany.errors.some((e) => e.key === 'fam.err.toomany' && e.fill.what === 'connectors'), 'more than 24 connectors: refused');
const fam = r.family;
let ev = FM.evaluateFamily(fam, { Width: 800, Depth: 500 });
ok(ev.ok && near(ev.connectors[0].p[0], 200) && near(ev.connectors[0].p[1], 500) && near(ev.connectors[0].p[2], 550) && ev.connectors[0].dir.join() === '0,1,0' && ev.connectors[1].size === 40,
  'evaluated at 800 × 500: cold water at (200, 500, 550) out along +y; the drain 40 mm', JSON.stringify(ev.connectors?.[0]));
ok(FM.evaluateFamily({ ...fam, connectors: [{ ...fam.connectors[0], size: '(Width - Width)' }] }).error?.key === 'fam.err.connsize', 'a connector whose size comes out 0: refused (fam.err.connsize)');

// ============================================================================================ editing
console.log('== editing connectors (family-edit.js)');
let e = FE.addConnector(fam, { domain: 'duct', system: 'exhaust' });
ok(e.ok && e.id === 'c3' && e.fam.connectors[2].domain === 'duct' && e.fam.connectors[2].system === 'exhaust' && fam.connectors.length === 2, 'add a duct connector: c3, the recipe passed in unchanged');
e = FE.setConnector(e.fam, 'c3', { z: 'Height', dir: '+z', size: 125, name: 'Hood' });
ok(e.ok && e.fam.connectors[2].z === 'Height' && e.fam.connectors[2].size === '125' && e.fam.connectors[2].name === 'Hood', 'set its height to a parameter, its size to a number, its name');
ok(FE.setConnector(e.fam, 'c3', { z: 'Nope' }).error?.key === 'fam.err.unknown' && FE.setConnector(e.fam, 'c3', { dir: 'sideways' }).error?.key === 'fam.err.connfield', 'an unknown name or way out: refused');
ok(FE.removeParam(e.fam, 'Height').error?.key === 'fam.err.paramused' && /Hood z/.test(FE.removeParam(e.fam, 'Height').error.fill.where), 'a parameter a connector uses cannot be removed (the connector is named)');
const ren = FE.renameParam(e.fam, 'Depth', 'D');
ok(ren.ok && ren.fam.connectors[0].y === 'D' && ren.fam.connectors[1].y === '(D / 2)', 'renaming a parameter rewrites the connectors that use it');
e = FE.removeConnector(e.fam, 'c3');
ok(e.ok && e.fam.connectors.length === 2, 'remove a connector');
const two = FE.removeConnector(FE.removeConnector(fam, 'c1').fam, 'c2');
ok(two.ok && !('connectors' in two.fam), 'removing the last one leaves no "connectors" field');
ok(FE.addConnector(doorRecipe).error?.key === 'fam.err.connhosted', 'no connector can be added to a hosted family');

// ============================================================================================ ports on placed elements
console.log('== ports on placed elements (family-ops.js, IFC4 mm)');
const B = await building();
const { ed, levels } = B;
const L1 = levels[0].guid;
ed.modelChange(FO.importFamily(basin()), { label: 'Import' });
const n0 = ed.changes.length;
ed.modelChange(FO.placeFamily({ storey: L1, family: 'fam-testbasin', x: 1000, y: 2000, rot: 90, guid: 'basin0000000000000001' }), { label: 'Place' });
ok(ed.changes.length === n0 + 1, 'placed: one undo step');
let w = B.w();
FO.familyWriter(w);
const el = w.byGuidAny('basin0000000000000001');
let ports = FO.elementPorts(w, el);
ok(ports.length === 2, 'the element has its two ports', String(ports.length));
const st = w.api.GetLine(w.mid, levels[0].id, false).ObjectPlacement.value;
const at = (pid) => { const M = w.relMatrix(st, w.api.GetLine(w.mid, pid, false).ObjectPlacement.value); return { p: [M[12], M[13], M[14]], z: [M[8], M[9], M[10]] }; };
const byKey = (k) => ports.find((p) => w.readPset(p, FM.CONNECTOR_PSET)?.Key === k);
let cw = at(byKey('c1')), dr = at(byKey('c2'));
// turned 90°: the family's +x is the level's +y, its +y the level's −x
ok(near(cw.p[0], 1000 - 400) && near(cw.p[1], 2000 + 125) && near(cw.p[2], 550) && near(cw.z[0], -1, 1e-9), 'cold water at (600, 2125, 550) in the level, its Z (the way out) along the level\'s −x (the element is turned 90°)', JSON.stringify(cw));
ok(near(dr.p[0], 1000 - 200) && near(dr.p[1], 2000) && near(dr.z[2], -1, 1e-9), 'the drain at (800, 2000, 0), pointing down');
let txt = dec(ed.save());
ok(count(txt, /IFCDISTRIBUTIONPORT\(/g) === 2 && /IFCDISTRIBUTIONPORT\([^;]*\.SINK\.,\.PIPE\.,\.DOMESTICCOLDWATER\.\)/.test(txt) && /IFCDISTRIBUTIONPORT\([^;]*\.SOURCE\.,\.PIPE\.,\.SEWAGE\.\)/.test(txt),
  'IfcDistributionPort: SINK / PIPE / DOMESTICCOLDWATER for the tap, SOURCE / PIPE / SEWAGE for the drain');
ok(/IFCRELNESTS\('[^']*',#\d+,\$,\$,#\d+,\(#\d+,#\d+\)\)/.test(txt) && count(txt, /'CadCraft_Connector'/g) === 2 && /IFCPOSITIVELENGTHMEASURE\(40\.\)/.test(txt), 'nested on the element; each with CadCraft_Connector (its key, system, size 40)');
ok(danglingRefs(txt).length === 0, 'no reference to a missing line', danglingRefs(txt).join(' '));

// another size: the ports follow
ed.modelChange(FO.newSize('fam-testbasin', { name: 'Wide', values: { Width: 900, Depth: 400, Height: 850 } }), { label: 'Size' });
w = B.w(); FO.familyWriter(w);
const wide = FO.readFamilies(w).find((f) => f.key === 'fam-testbasin').sizes.find((s) => s.name === 'Wide');
ed.modelChange(FO.setFamilySize(['basin0000000000000001'], wide.guid), { label: 'Resize' });
w = B.w(); FO.familyWriter(w);
ports = FO.elementPorts(w, w.byGuidAny('basin0000000000000001'));
cw = at(ports.find((p) => w.readPset(p, FM.CONNECTOR_PSET)?.Key === 'c1'));
txt = dec(ed.save());
ok(ports.length === 2 && near(cw.p[1], 2000 + 225) && count(txt, /IFCDISTRIBUTIONPORT\(/g) === 2, 'another size (900 wide): still two ports, the tap now 225 off the middle; the old ports are gone');

// the family saved with a connector moved: every element's ports follow
const edited = FE.setConnector(FM.familyFor(w, 'fam-testbasin'), 'c2', { z: '100' });
ed.modelChange(FO.saveFamily(edited.fam), { label: 'Save family' });
w = B.w(); FO.familyWriter(w);
ports = FO.elementPorts(w, w.byGuidAny('basin0000000000000001'));
ok(near(at(ports.find((p) => w.readPset(p, FM.CONNECTOR_PSET)?.Key === 'c2')).p[2], 100) && count(dec(ed.save()), /IFCDISTRIBUTIONPORT\(/g) === 2, 'the family saved with its drain 100 up: the element\'s drain port moved with it');

// undo and redo
ed.undo();
w = B.w(); FO.familyWriter(w);
ports = FO.elementPorts(w, w.byGuidAny('basin0000000000000001'));
ok(near(at(ports.find((p) => w.readPset(p, FM.CONNECTOR_PSET)?.Key === 'c2')).p[2], 0), 'undo: the drain port is back at 0');
ed.redo();

// deleted: its ports go with it
ed.modelChange(FO.removeFamilyElements(['basin0000000000000001']), { label: 'Delete' });
txt = dec(ed.save());
ok(count(txt, /IFCDISTRIBUTIONPORT\(/g) === 0 && count(txt, /'CadCraft_Connector'/g) === 0 && danglingRefs(txt).length === 0, 'the element deleted: its ports and their sets go too, nothing left dangling');

// the file opens again
const eng2 = await quiet(IfcModel.create)(WebIFC, null);
ed.undo();
const m2 = await quiet((b) => eng2.load(b))(ed.save());
ok(m2.elements >= 1, 'the file with ports opens again (' + m2.elements + ' elements)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
