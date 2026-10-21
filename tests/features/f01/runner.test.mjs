/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assess, runStages, stages } from '../../../devshell/baseline.mjs';
test('baseline explicitly discovers the 15 prototype tests and all named modes', () => {
  assert.deepEqual(stages.slice(0, 6).map(s => [s.name, s.minimum]), [['precision',7],['materials',8],['model',122],['comforts',103],['views2',104],['res',195]]);
});
test('source-sync failure coverage is explicitly discovered', () => {
  assert.deepEqual(stages.find(s => s.name === 'source-sync-contract'), { name: 'source-sync-contract', args: ['--test', '--test-reporter=tap', 'tests/features/f01/source-sync.test.mjs'], minimum: 41, tap: true });
});
test('zero discovery, failed checks, and a nonzero exit cannot be green', () => {
  const stage = { name: 'probe', minimum: 2 };
  for (const result of [{status:0,stdout:''},{status:0,stdout:'1 passed, 0 failed'},{status:0,stdout:'2 passed, 1 failed'},{status:1,stdout:'2 passed, 0 failed'}]) assert.equal(assess(stage,result).status,'FAIL');
});
test('optional skips remain separate from executed passes', () => {
  const r=assess({name:'probe',minimum:2},{status:0,stdout:'SKIP dependency absent\n2 passed, 0 failed\n'});
  assert.equal(r.status,'PASS');assert.equal(r.passed,2);assert.equal(r.skipped.length,1);
});
test('isolated deliberate failing process propagates exit 1 and later checks still run', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'f01-runner-'));
  try {
    const r=runStages([
      {name:'intentional-failure',args:['-e',"console.log('0 passed, 1 failed');process.exit(1)"],minimum:1},
      {name:'after-failure',args:['-e',"console.log('1 passed, 0 failed')"],minimum:1},
    ],{reportDir:dir});
    assert.equal(r.exitCode,1);assert.deepEqual(r.results.map(x=>x.status),['FAIL','PASS']);
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'summary.json'))).exitCode,1);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

// Exercise the actual RC.8 entry point in disposable mirrors; never synthesize a passing cross-app reader.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
for (const kind of ['absent','partial','broken','root-only','dangling-root','dangling-dev']) test(`RC.8 ${kind} dependency: only absence skips`, () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'f01-rc8-'));
  try {
    fs.mkdirSync(path.join(dir,'bin'),{recursive:true});
    fs.copyFileSync(path.join(root,'tests/bin/test-bimcraft.mjs'),path.join(dir,'bin/test-bimcraft.mjs'));
    fs.symlinkSync(path.join(root,'.cc-test/tools'),path.join(dir,'tools'),'dir');
    fs.mkdirSync(path.join(dir,'public_html/assets/apps'),{recursive:true});
    fs.mkdirSync(path.join(dir,'tmp'));
    fs.symlinkSync(path.join(root,'.cc-test/public_html/assets/vendor'),path.join(dir,'public_html/assets/vendor'),'dir');
    fs.symlinkSync(path.join(root,'.cc-test/public_html/assets/apps/bimcraft'),path.join(dir,'public_html/assets/apps/bimcraft'),'dir');
    const tc=path.join(dir,'public_html/assets/apps/takeoffcraft/dev');
    if(['partial','broken','dangling-dev'].includes(kind))fs.mkdirSync(path.dirname(tc),{recursive:true});
    if(['partial','broken'].includes(kind))fs.mkdirSync(tc);
    if(kind==='root-only')fs.mkdirSync(path.dirname(tc));
    if(kind==='dangling-root')fs.symlinkSync(path.join(dir,'missing-source'),path.dirname(tc),'dir');
    if(kind==='dangling-dev')fs.symlinkSync(path.join(dir,'missing-source'),tc,'dir');
    if(kind==='broken')fs.writeFileSync(path.join(tc,'model.js'),"throw new Error('F01 deliberate dependency failure');");
    const r=spawnSync(process.execPath,[path.join(dir,'bin/test-bimcraft.mjs'),'--res','--only','rc8'],{encoding:'utf8',env:process.env});
    if(kind==='absent'){
      assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SKIP RC.8 cross-app/);assert.ok(Number(r.stdout.match(/(\d+) passed, 0 failed/)?.[1])>=2);
    } else {
      assert.notEqual(r.status,0);assert.doesNotMatch(r.stdout,/SKIP RC.8 cross-app/);
      assert.match(r.stderr,kind==='broken'?/F01 deliberate dependency failure/:/ERR_MODULE_NOT_FOUND|ENOENT/);
    }
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

// Exercise the same optional-package boundary used by RC.8, without supplying a fake TakeoffCraft app.
import { optionalPackageEntry } from '../../tools/bimcraft-test/optional-dependency.mjs';
import { pathToFileURL } from 'node:url';
for (const state of ['absent', 'valid', 'partial', 'dangling-package', 'dangling-parent', 'package-file', 'transitive-error', 'runtime-error']) {
  test(`optional PDF reader ${state}: only missing package skips`, async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f01-pdf-dependency-'));
    const pkg = path.join(dir, 'node_modules/pdfjs-dist'), entry = path.join(pkg, 'legacy/build/pdf.mjs');
    try {
      if (state === 'dangling-parent') fs.symlinkSync(path.join(dir, 'missing'), path.join(dir, 'node_modules'), 'dir');
      else fs.mkdirSync(path.dirname(pkg));
      if (state === 'dangling-package') fs.symlinkSync(path.join(dir, 'missing'), pkg, 'dir');
      if (state === 'package-file') fs.writeFileSync(pkg, 'not a directory');
      if (state === 'partial') fs.mkdirSync(pkg);
      if (['valid', 'transitive-error', 'runtime-error'].includes(state)) {
        fs.mkdirSync(path.dirname(entry), { recursive: true });
        fs.writeFileSync(entry, state === 'transitive-error' ? "import './missing.mjs';" : state === 'runtime-error' ? "throw new Error('F01 PDF failure');" : 'export const ready = true;');
      }
      const locate = () => optionalPackageEntry(dir, 'node_modules/pdfjs-dist', 'legacy/build/pdf.mjs');
      if (state === 'absent') assert.equal(locate(), null);
      else if (state === 'valid') assert.equal((await import(pathToFileURL(locate()).href)).ready, true);
      else if (state.endsWith('-error')) await assert.rejects(import(pathToFileURL(locate()).href), /F01 PDF failure|ERR_MODULE_NOT_FOUND|Cannot find module/);
      else assert.throws(locate, /ENOENT|not a directory/);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
}
