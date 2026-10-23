/* SPDX-License-Identifier: Apache-2.0 */
// Compare the same approved F06 and F28 geometry/export workloads on one machine. Not a browser paint benchmark.
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
import {model as openPlan,scene,fixture as planFile} from '../f04/fixture.mjs';
import {model as openSection,triangles,fixture as sectionFile} from '../f05/fixture.mjs';
import {readLevels} from '../../../app/model-levels.js';import {readMaterials} from '../../../app/project-materials.js';import {sectionModel} from '../../../app/wall-section-graphics.js';
const base=process.env.F28_COMPARE_BASE||'9667b3c48977ff772c2a4c4785238cb3c4603e0e',dir=path.resolve('.cc-test/f28-approved');fs.mkdirSync(dir,{recursive:true});
execFileSync('tar',['-xf','-','-C',dir],{input:execFileSync('git',['archive',base,'app'],{maxBuffer:64*1024*1024})});
const plan=await openPlan(),section=await openSection(),w=section.w(),lv=readLevels(w)[0],els=await triangles(section),materials=readMaterials(w),data=sectionModel(w,lv.id);
const options={dir:[1,0],cut:{o:[3200,0]},far:3000,box:{x0:-2200,y0:-200,x1:400,y1:3200},...data,materials,detail:'fine',scale:20};
const results=[];
for(const [label,root]of [['approved-baseline',dir+'/app'],['workspace-head',path.resolve('app')]]){
 const load=f=>import(pathToFileURL(root+'/'+f));const [{wallPlanGraphics},{planPdf},sheets,project]=await Promise.all(['wall-plan-graphics.js','model-pdf.js','res-sheets.js','res-views.js'].map(load));
 const sc=scene(plan,wallPlanGraphics,'fine',50),v=project.projectView(els,options),input={sections:[{ref:'s',title:'Section A',view:v}]},spec={number:'F28',title:'Comparable section workload',views:[{kind:'section',ref:'s',x:100,y:165,ratio:20}]},sh=sheets.composeSheet(spec,input,{paper:'a3',units:'mm'});
 const functions={f04FineScene:()=>scene(plan,wallPlanGraphics,'fine',50),f04PlanPdf:()=>planPdf(sc,{paper:'a3',units:'mm',title:'F28'}),f05FineSection:()=>project.projectView(els,options),f05Composition:()=>sheets.composeSheet(spec,input,{paper:'a3',units:'mm'}),f05Svg:()=>sheets.sheetSvg(sh,{paper:'a3'}),f05Pdf:()=>sheets.setPdf([sh],{paper:'a3'})},raw=Object.fromEntries(Object.keys(functions).map(k=>[k,[]]));
 for(let i=-5;i<30;i++)for(const[k,fn]of Object.entries(functions)){const t=performance.now();fn();if(i>=0)raw[k].push(performance.now()-t);}
 const stats=a=>{const s=[...a].sort((a,b)=>a-b);return {n:s.length,p50Ms:s[14],p95Ms:s[28]};};
 results.push({label,raw,summary:Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,stats(v)])),outputs:{planBytes:planPdf(sc,{paper:'a3',units:'mm',title:'F28'}).bytes.length,sectionSvgSHA256:crypto.createHash('sha256').update(sheets.sheetSvg(sh,{paper:'a3'})).digest('hex'),sheetPdfBytes:sheets.setPdf([sh],{paper:'a3'}).length}});
}
const report={base,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),environment:{cpu:os.cpus()[0].model,node:process.version,platform:os.platform(),arch:os.arch()},fixtures:[planFile,sectionFile].map(f=>({path:f.pathname,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')})),boundaries:'Same model/triangles prepared before timing; five warmups, 30 raw samples. Separate scene/projection, composition, SVG and PDF serialization. No Canvas/GPU or user latency claim. PERF-F04-01 and PERF-F05-01 remain OPEN.',results};
fs.mkdirSync('evidence/f28',{recursive:true});const output=process.env.F28_COMPARE_OUTPUT||'evidence/f28/performance-node.json';fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(results.map(r=>({label:r.label,...r.summary,outputs:r.outputs})),null,2));
