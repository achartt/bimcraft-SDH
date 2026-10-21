/* SPDX-License-Identifier: Apache-2.0 */
// Installed explicitly by the Playwright harness only, in its own tab. No production hook.
export async function install(){
 const base='/assets/apps/bimcraft/dev/';
 const core=await import('/__f03/core.mjs');
 const {IfcModel}=await import(base+'ifc-model.js');
 const {PlanView}=await import(base+'model-planview.js');
 const {readDerived}=await import(base+'model-slabs.js');
 const {readWalls}=await import(base+'model-walls.js');
 const {ifcWorkerState}=await import(base+'ifc/open-async.js');
 const spans=[];let loadStart=null;
 function wrap(obj,key,name){const original=obj[key];obj[key]=function(...args){const start=performance.now();try{return original.apply(this,args);}finally{spans.push({name,start,ms:performance.now()-start});}};}
 const original=IfcModel.prototype.load;
 IfcModel.prototype.load=async function(...args){const start=performance.now();loadStart=start;try{return await original.apply(this,args);}finally{spans.push({name:'load-total',start,ms:performance.now()-start});loadStart=null;}};
 const adopt=core.W.IfcAPI.prototype.AdoptModel;
 core.W.IfcAPI.prototype.AdoptModel=function(...a){if(loadStart!==null)spans.push({name:'parse-worker-to-adopt',start:loadStart,ms:performance.now()-loadStart});return adopt.apply(this,a);};
 wrap(core.W.IfcAPI.prototype,'StreamAllMeshes','mesh-and-batch');wrap(core.W.IfcAPI.prototype,'SaveModel','ifc-serialize');wrap(core.IfcEditor.prototype,'modelChange','model-edit-and-dependencies');wrap(PlanView.prototype,'render','plan-canvas-render');
 const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const paint=async()=>{await frame();await frame();};
 const idle=async()=>{const deadline=performance.now()+120000;while(window.bimcraftPlan?.state.busy||window.bimcraftPlan?.state.reloading){if(performance.now()>deadline)throw new Error('Rebuild timeout');await frame();}await paint();};
 const ed=()=>window.bimcraftLive.editor;
 let pending=null;
 // Capture trusted user-event onset, before application handlers. Ending after two rAFs
 // gives a paint opportunity; compositor presentation / hardware input latency is not measured.
 function arm(event,selector,condition='idle'){if(pending)throw new Error('Existing measurement');spans.length=0;
  pending=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{document.removeEventListener(event,handler,true);reject(new Error('Event/feedback timeout '+event+' '+selector));},120000);
   async function handler(e){if(!e.target.closest?.(selector))return;document.removeEventListener(event,handler,true);const start=performance.now();performance.mark('f03-input');
    try{await frame();if(condition==='props'){while(!document.querySelector('[data-mp-height]')){if(performance.now()-start>10000)throw new Error('Properties missing');await frame();}}await idle();const end=performance.now();performance.mark('f03-feedback');performance.measure('F03 '+event,'f03-input','f03-feedback');clearTimeout(timeout);resolve({ms:end-start,spans:[...spans]});}catch(e){clearTimeout(timeout);reject(e);}}
   document.addEventListener(event,handler,true);
  });}
 window.f03={core,spans,arm,async take(){const p=pending;if(!p)throw new Error('Measurement not armed');try{return await p;}finally{pending=null;}},paint,idle,
 async open(bytes,name){spans.length=0;const t=performance.now();await window.bimcraftLive.open(new Uint8Array(bytes),name);await paint();if(!ed()||window.bimcraftLive.name!==name)throw new Error('Open failed');return {ms:performance.now()-t,spans:[...spans],worker:ifcWorkerState()};},
 snapshot:()=>core.snapshot(ed()),validate:n=>core.validate(core.snapshot(ed()),n),
 async verifyEdit(before,kind,n){const after=core.snapshot(ed());core.validateEdit(before,after,kind,n); // raw journal correctness without UI rebuild, outside timing
 ed().undo();core.equivalent(core.snapshot(ed()),before);ed().redo();core.equivalent(core.snapshot(ed()),after);
 const reopened=await core.openModel(ed().save());core.equivalent(core.snapshot(reopened),after);reopened.api.CloseModel(reopened.mid);return after;},
 wallPoint(index=0){const wall=readWalls(core.writer(ed()))[index],pv=window.bimcraftPlan.view,p=pv.toScreen([(wall.a[0]+wall.b[0])/2,(wall.a[1]+wall.b[1])/2]),r=pv.canvas.getBoundingClientRect();return {x:r.left+p.x,y:r.top+p.y,key:wall.id};},
 selectWall:()=>window.bimcraftVis.pick([readWalls(core.writer(ed()))[0].id]),
 selectRoof:()=>window.bimcraftVis.pick([readDerived(core.writer(ed())).roofs[0].parts[0]]),
 async save(){spans.length=0;const t=performance.now(),bytes=ed().save(),ms=performance.now()-t;const re=await core.openModel(bytes);core.equivalent(core.snapshot(re),core.snapshot(ed()));re.api.CloseModel(re.mid);return {ms,spans:[...spans],bytes:Array.from(bytes)};},
 async pdf(){const s=core.scene(ed());spans.length=0;const t=performance.now(),bytes=core.pdf(s),ms=performance.now()-t;return {ms,spans:[...spans],bytes:Array.from(bytes)};}
 };
}
