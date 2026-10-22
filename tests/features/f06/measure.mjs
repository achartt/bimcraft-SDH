/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';import os from 'node:os';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {model,generate,fixture} from './fixture.mjs';
import {assemblySchedules} from '../../../app/assembly-schedule.js';
import {documentPages} from '../../../app/assembly-schedule-layout.js';
import {scheduleCsv} from '../../../app/model-schedule.js';
import {buildSet,setPdf,sheetSvg} from '../../../app/res-sheets.js';
const groups=[];
for(const count of [2,35]){
 const bytes=count===2?fs.readFileSync(fixture):await generate({count}),m=await model(bytes),d=assemblySchedules(m.w());
 const pagination=()=>[...documentPages(d.assemblies,'assemblies'),...documentPages(d.materialLegend,'materials')],ps=pagination(),ss=buildSet({schedules:ps},{paper:'letter'}),raw={generation:[],pagination:[],composition:[],svg:[],csv:[],pdf:[]};
 for(let i=-5;i<30;i++)for(const [k,fn]of Object.entries({generation:()=>assemblySchedules(m.w()),pagination,composition:()=>buildSet({schedules:ps},{paper:'letter'}),svg:()=>ss.map(s=>sheetSvg(s,{paper:'letter'})),csv:()=>[scheduleCsv(d.assemblies),scheduleCsv(d.materialLegend)],pdf:()=>setPdf(ss,{paper:'letter'})})){
  const start=performance.now();fn();if(i>=0)raw[k].push(performance.now()-start);
 }
 const stats=a=>{const s=[...a].sort((a,b)=>a-b);return{n:s.length,p50Ms:s[14],p95Ms:s[28]};};
 groups.push({assemblies:count,layerRows:d.assemblies.csvRows.filter(r=>r[0]==='layer').length,pages:ss.length,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),raw,summary:Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,stats(v)])),memory:process.memoryUsage()});
}
const result={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),base:'2eb43b109f8d2a93b55796b0092815aaa6f2054a',environment:{cpu:os.cpus()[0].model,node:process.version,arch:os.arch(),platform:os.platform(),memory:os.totalmem()},methodology:'5 warmups, 30 raw samples, nearest-rank p50/p95; no removed samples. Independent operation timings, existing prepared input excluded. Whole-process memory, not peak or per-model. New workload; no claim to resolve PERF-F04-01 or PERF-F05-01.',groups};
fs.mkdirSync('evidence/f06',{recursive:true});fs.writeFileSync('evidence/f06/performance-node.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(groups.map(g=>({assemblies:g.assemblies,pages:g.pages,...g.summary})),null,2));
