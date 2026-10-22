/* SPDX-License-Identifier: Apache-2.0 */
// Equivalent fixture/environment, five warmups + thirty raw samples, no timing gates.
import fs from 'node:fs';import os from 'node:os';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {model,fixture,triangles} from './fixture.mjs';
import {sectionModel} from '../../../app/wall-section-graphics.js';
import {readLevels} from '../../../app/model-levels.js';
import {readMaterials} from '../../../app/project-materials.js';
const base=path.resolve(process.env.F05_BASELINE_ROOT||'.cc-test/f05-approved');
const before=await import(pathToFileURL(base+'/app/res-views.js')),beforeSheets=await import(pathToFileURL(base+'/app/res-sheets.js'));
const after=await import('../../../app/res-views.js'),afterSheets=await import('../../../app/res-sheets.js');
const m=await model(),w=m.w(),lv=readLevels(w)[0],els=await triangles(m),data=sectionModel(w,lv.id),materials=readMaterials(w);
const groups=[];const stats=a=>{const s=[...a].sort((a,b)=>a-b);return {n:s.length,p50Ms:s[Math.ceil(s.length*.5)-1],p95Ms:s[Math.ceil(s.length*.95)-1]};};
for(const [name,project,sh,detail]of [['approved-coarse',before,beforeSheets,'coarse'],['f05-coarse',after,afterSheets,'coarse'],['f05-medium',after,afterSheets,'medium'],['f05-fine',after,afterSheets,'fine']]){
 const options={dir:[1,0],cut:{o:[3200,0]},far:3000,box:{x0:-2200,y0:-200,x1:400,y1:3200},...data,materials,detail,scale:20};
 const view=project.projectView(els,options),spec={number:'F05',title:'Performance fixture',views:[{kind:'section',ref:'s',x:100,y:165,ratio:20}]},input={sections:[{ref:'s',title:'Section A',view}]};
 const sheet=sh.composeSheet(spec,input,{paper:'a3',units:'mm'}),raw={generation:[],composition:[],svg:[],pdf:[]};
 for(let i=-5;i<30;i++)for(const [kind,fn]of Object.entries({generation:()=>project.projectView(els,options),composition:()=>sh.composeSheet(spec,input,{paper:'a3',units:'mm'}),svg:()=>sh.sheetSvg(sheet,{paper:'a3'}),pdf:()=>sh.setPdf([sheet],{paper:'a3'})})){
  const t=performance.now();fn();const ms=performance.now()-t;if(i>=0)raw[kind].push(ms);
 }
 groups.push({name,raw,summary:Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,stats(v)])),memory:process.memoryUsage(),pdfBytes:sh.setPdf([sheet],{paper:'a3'}).length});
}
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),base:'ff0344b46ca1c29962772528c23f62d175c6d2ea',environment:{cpu:os.cpus()[0].model,platform:os.platform(),arch:os.arch(),memory:os.totalmem(),node:process.version},fixtureSha256:crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex'),boundaries:'Geometry projection only; triangles and model reads prepared outside timer. Composition, SVG serialization and PDF serialization separate. SVG serialization is not browser paint. RSS is whole process, not per-model peak. Approved coarse vs new fine measures added presentation workload, not optimization. No samples removed.',groups};
fs.mkdirSync('evidence/f05',{recursive:true});fs.writeFileSync('evidence/f05/performance-node.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(groups.map(g=>({name:g.name,...g.summary})),null,2));
