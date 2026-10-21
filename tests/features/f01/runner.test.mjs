/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assess, runStages, stages } from '../../../devshell/baseline.mjs';
test('baseline explicitly discovers the 15 prototype tests and all named modes', () => {
  assert.deepEqual(stages.slice(0, 6).map(s => [s.name, s.minimum]), [['precision',7],['materials',8],['model',122],['comforts',103],['views2',104],['res',193]]);
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
for (const kind of ['absent','partial','broken']) test(`RC.8 ${kind} dependency: only absence skips`, () => {
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
    if(kind!=='absent')fs.mkdirSync(tc,{recursive:true});
    if(kind==='broken')fs.writeFileSync(path.join(tc,'model.js'),"throw new Error('F01 deliberate dependency failure');");
    const r=spawnSync(process.execPath,[path.join(dir,'bin/test-bimcraft.mjs'),'--res','--only','rc8'],{encoding:'utf8',env:process.env});
    if(kind==='absent'){
      assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SKIP RC.8 cross-app/);assert.ok(Number(r.stdout.match(/(\d+) passed, 0 failed/)?.[1])>=2);
    } else {
      assert.notEqual(r.status,0);assert.doesNotMatch(r.stdout,/SKIP RC.8 cross-app/);
      assert.match(r.stderr,kind==='broken'?/F01 deliberate dependency failure/:/ERR_MODULE_NOT_FOUND/);
    }
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
