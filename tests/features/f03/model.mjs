/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import inspector from 'node:inspector';
import {init} from '../../../app/i18n.js';
import {W,IfcEditor,sizes,openModel,snapshot,validate,validateEdit,equivalent,operation,scene,pdf,mesh,validateMesh} from './core.mjs';
import {environment} from './environment.mjs';import {report} from './report.mjs';
init({strings:JSON.parse(fs.readFileSync('app/lang/en.json'))});
const args=process.argv.slice(2),arg=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const count=Number(arg('--reps','30')),warmups=Number(arg('--warmups','5')),dir=arg('--out','evidence/f03/reference');
if(!Number.isInteger(count)||count<1||!Number.isInteger(warmups)||warmups<0)throw new Error('Invalid sample counts');
const memory=()=>process.memoryUsage();
const samples=[];
function timed(size,workload,fn){const before=memory(),t=performance.now(),value=fn(),ms=performance.now()-t,after=memory();return {value,row:{domain:'model',size,workload,ms,memory:{metric:'process RSS bytes (whole Node process)',before:before.rss,after:after.rss,heapBefore:before.heapUsed,heapAfter:after.heapUsed,externalAfter:after.external,arrayBuffersAfter:after.arrayBuffers}}};}
if(args.includes('--cold-child')){const size=arg('--cold-child'),bytes=fs.readFileSync('.cc-test/f03/fixtures/'+size+'.ifc'),before=memory(),t=performance.now(),ed=await openModel(bytes),ms=performance.now()-t,after=memory();validate(snapshot(ed),sizes[size]);console.log(JSON.stringify({domain:'model',size,workload:'process-cold-open',ms,memory:{metric:'process RSS bytes (whole Node process)',before:before.rss,after:after.rss,heapBefore:before.heapUsed,heapAfter:after.heapUsed}}));process.exit(0);}
fs.mkdirSync(dir,{recursive:true});const env=environment();
for(const [size,n] of Object.entries(sizes)){
 const bytes=fs.readFileSync('.cc-test/f03/fixtures/'+size+'.ifc');
 for(let i=0;i<count;i++){const r=spawnSync(process.execPath,[...process.execArgv.filter(x=>!x.startsWith('--cpu-prof')),'tests/features/f03/model.mjs','--cold-child',size],{encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr);samples.push({...JSON.parse(r.stdout),iteration:i});}
 const api=new W.IfcAPI();await api.Init({manifold:false});
 for(let i=-warmups;i<count;i++){const r=timed(size,'warm-parse',()=>api.OpenModel(bytes));validate(snapshot(new IfcEditor(W,{api,modelID:r.value})),n);api.CloseModel(r.value);if(i>=0)samples.push({...r.row,iteration:i});}
 for(const kind of ['wall-edit','type-edit','roof-regeneration','save','mesh-generation','plan-scene','pdf']){
  for(let i=-warmups;i<count;i++){
   const ed=await openModel(bytes),before=snapshot(ed),s=kind==='pdf'?scene(ed):null,op=['wall-edit','type-edit','roof-regeneration'].includes(kind)?operation(ed,kind):null;
   const r=timed(size,kind,()=>op?ed.modelChange(op):kind==='save'?ed.save():kind==='plan-scene'?scene(ed):kind==='mesh-generation'?mesh(ed):pdf(s));
   if(op){if(i===0){fs.mkdirSync('.cc-test/f03/exports',{recursive:true});fs.writeFileSync('.cc-test/f03/exports/'+size+'-'+kind+'.ifc',ed.save());}const after=snapshot(ed);validateEdit(before,after,kind,n);ed.undo();equivalent(snapshot(ed),before);ed.redo();equivalent(snapshot(ed),after);const re=await openModel(ed.save());equivalent(snapshot(re),after);re.api.CloseModel(re.mid);}
   else if(kind==='mesh-generation'){validateMesh(r.value);}
   else if(kind==='save'){const re=await openModel(r.value);equivalent(snapshot(re),before);re.api.CloseModel(re.mid);}
   else if(kind==='pdf'){if(new TextDecoder().decode(r.value.slice(0,5))!=='%PDF-')throw new Error('Invalid PDF');if(i===0)fs.writeFileSync(path.join(dir,size+'-plan.pdf'),r.value);}
   ed.api.CloseModel(ed.mid);if(i>=0)samples.push({...r.row,iteration:i});
  }
 }
 // Separate representative CPU profile; never mix profiling overhead into raw timings.
 const ed=await openModel(bytes),session=new inspector.Session();session.connect();const post=(m,p={})=>new Promise((ok,no)=>session.post(m,p,(e,r)=>e?no(e):ok(r)));
 await post('Profiler.enable');await post('Profiler.setSamplingInterval',{interval:100});await post('Profiler.start');
 for(let i=0;i<10;i++){ed.modelChange(operation(ed,'type-edit'));scene(ed);ed.save();ed.undo();}
 const {profile}=await post('Profiler.stop');session.disconnect();fs.writeFileSync(path.join(dir,size+'-model.cpuprofile'),JSON.stringify(profile));ed.api.CloseModel(ed.mid);
 fs.writeFileSync(path.join(dir,'model-raw.json'),JSON.stringify({schema:1,environment:env,config:{count,warmups,cold:'fresh Node process; imports and fixture disk read excluded; OS disk cache uncontrolled',warm:'same initialized API; fresh parsed document each sample; no forced GC',boundaries:'synchronous operation only; setup, correctness, undo/redo and reopen outside timed interval',pdf:'planPdf only; plan scene preparation separate; no disk write in timing'},fixtures:JSON.parse(fs.readFileSync('.cc-test/f03/fixtures/manifest.json')),samples},null,2)+'\n');console.log('Measured model '+size);
}
report(dir);
