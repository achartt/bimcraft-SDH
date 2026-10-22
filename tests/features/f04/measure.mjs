/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {model,scene,fixture} from './fixture.mjs';
import {planPdf} from '../../../app/model-pdf.js';
import {planSheet,setPdf} from '../../../app/res-sheets.js';
const label=process.argv[2]||'after',before=label==='before';
const graphics=before?null:(await import('../../../app/wall-plan-graphics.js')).wallPlanGraphics;
const m=await model(),times={scene:[],planPdf:[],sheetPdf:[]};let sc,pdf,sheet;
for(let i=0;i<35;i++) {
 let t=performance.now();sc=scene(m,graphics);const a=performance.now();pdf=planPdf(sc,{paper:'a3',units:'mm',title:'F04 '+label});const b=performance.now();sheet=setPdf([planSheet('F04','Layered plan',sc,{paper:'a3',units:'mm',project:'F04',date:'2026-10-21'})],{paper:'a3'});const c=performance.now();
 if(i>=5){times.scene.push(a-t);times.planPdf.push(b-a);times.sheetPdf.push(c-b);}
}
const stats=a=>{a.sort((a,b)=>a-b);return {n:a.length,p50Ms:a[Math.floor(a.length*.5)],p95Ms:a[Math.ceil(a.length*.95)-1]};};
const report={label,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),node:process.version,platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0].model,memory:os.totalmem(),fixtureSha256:crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex'),warmup:5,metrics:Object.fromEntries(Object.entries(times).map(([k,v])=>[k,stats(v)])),planBytes:pdf.bytes.length,sheetBytes:sheet.length,note:'F04-only Node scene assembly and vector generation; no F03 instrumentation. Native Canvas paint measured separately; browser timing unavailable.'};
fs.writeFileSync('evidence/f04/measure-'+label+'.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('evidence/f04/'+label+'-plan.pdf',pdf.bytes);fs.writeFileSync('evidence/f04/'+label+'-sheet.pdf',sheet);console.log(report);
