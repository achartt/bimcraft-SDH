#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Synthetic review fixture, generated solely through BimCraft's public model operations.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import * as W from '../../../app/ifc/api.js';
import { init } from '../../../app/i18n.js';
import { newBuilding, stackLevels } from '../../../app/new-model.js';
import { IfcEditor } from '../../../app/ifc-edit.js';
import { ModelWriter } from '../../../app/model-write.js';
import { readLevels } from '../../../app/model-levels.js';
import { readWalls, locationLine, wallOutlines } from '../../../app/model-walls.js';
import { readOpenings, openingSymbol } from '../../../app/model-openings.js';
import { saveWallAssembly, drawWalls, placeOpening, removeElements, op } from '../../../app/model-ops.js';
import { readAssemblies } from '../../../app/wall-assemblies.js';
import { saveWallDimension, readWallDimensions, resolveDimension } from '../../../app/wall-dimensions.js';
import { readMaterials, saveMaterial } from '../../../app/project-materials.js';
import { wallPieces } from '../../../app/model-plan.js';
import { planPdf } from '../../../app/model-pdf.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
init({strings:JSON.parse(fs.readFileSync(path.join(ROOT,'app/lang/en.json')))});
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.005,`${a} ~= ${b}`);
async function model(bytes) {
  const api=new W.IfcAPI();await api.Init({manifold:false});
  const modelID=api.OpenModel(bytes || new TextEncoder().encode(newBuilding({name:'F01 synthetic residential',levels:stackLevels(1,3000,()=> 'Ground floor'),fileName:'f01-house.ifc',now:new Date('2026-10-21T12:00:00Z')})));
  const ed=new IfcEditor(W,{api,modelID});return {ed,w:()=>new ModelWriter(W,api,modelID),change:f=>ed.modelChange(f)};
}
const exterior={key:'wall-f01-exterior',name:'F01 exterior cavity wall',exterior:true,layers:[
  {mat:'siding',t:19.05,function:'finish',core:false},
  {mat:'air',t:25.4,kind:'cavity',ventilation:'ventilated',function:'substrate',core:false},
  {mat:'F01 house wrap',t:0,function:'membrane',core:false},
  {mat:'osb',t:12.7,function:'substrate',core:false},
  {mat:'studs',t:139.7,function:'structure',core:true},
  {mat:'gypsum',t:12.7,function:'finish',core:false},
]};
const interior={key:'wall-f01-interior',name:'F01 interior partition',exterior:false,layers:[
  {mat:'gypsum',t:12.7,function:'finish',core:false},
  {mat:'studs',t:88.9,function:'structure',core:true},
  {mat:'gypsum',t:12.7,function:'finish',core:false},
]};
const snapshot=m=>({types:readAssemblies(m.w()),walls:readWalls(m.w()),dims:readWallDimensions(m.w()),materials:readMaterials(m.w()),openings:readOpenings(m.w())});
function plan(m,title,detail=false) {
  const s=snapshot(m), outlines=wallOutlines(s.walls.map(w=>({...w,key:w.guid})));
  const walls=s.walls.map(w=>({key:w.id,poly:outlines.get(w.guid),pieces:wallPieces(w,outlines.get(w.guid),s.openings.filter(o=>o.wall===w.id),1200)}));
  const dims=s.dims.map(d=>resolveDimension(d,s.walls)).filter(d=>d.status==='ok').map(d=>({...d,key:d.guid,text:d.value.toFixed(2)+' mm'}));
  return planPdf({walls,symbols:s.openings.map(o=>openingSymbol(o,s.walls.find(w=>w.id===o.wall))),dims,cut:[],below:[],rooms:[],...(detail?{crop:[4400,-450,5800,350]}:{})},{title,units:'mm',paper:'a4',...(detail?{scale:10}:{})}).bytes;
}
export async function verifyFixture(bytes, outDir) {
  const m=await model(bytes), before=snapshot(m), first=before.walls.find(w=>w.typeKey===exterior.key);
  assert.equal(before.types.length,2);assert.equal(before.walls.length,5);assert.equal(before.openings.length,1);assert.equal(before.dims.length,2);
  const dim=before.dims.find(d=>d.refs[0].reference==='exterior' && d.refs[1].reference==='interior');
  const measure=m=>resolveDimension(readWallDimensions(m.w()).find(d=>d.guid===dim.guid),readWalls(m.w())).value;
  near(measure(m),209.55);const anchor=locationLine(first).a;
  const type=before.types.find(t=>t.key===exterior.key);
  m.change(saveWallAssembly({...type,layers:type.layers.map((l,i)=>i===0?{...l,t:50.8}:l)}));
  const edited=snapshot(m);near(measure(m),241.3);
  const wall=edited.walls.find(w=>w.guid===first.guid);near(locationLine(wall).a[1],anchor[1]);
  assert.equal(edited.openings[0].guid,before.openings[0].guid);
  assert.deepEqual(edited.types.map(t=>t.guid),before.types.map(t=>t.guid));
  assert.deepEqual(edited.walls.map(w=>w.guid),before.walls.map(w=>w.guid));
  assert.deepEqual(edited.dims.map(d=>[d.guid,d.refs]),before.dims.map(d=>[d.guid,d.refs]));
  m.ed.undo();near(measure(m),209.55);m.ed.redo();near(measure(m),241.3);
  const beforeMaterial=readWalls(m.w());
  const studs=readMaterials(m.w()).find(x=>x.id==='material-studs');
  m.change(op(w=>{saveMaterial(w,{...studs,defaultThickness:200});return [];}));
  assert.deepEqual(readWalls(m.w()),beforeMaterial);near(measure(m),241.3);
  const reopened=await model(m.ed.save());near(measure(reopened),241.3);
  assert.deepEqual(readMaterials(reopened.w()).map(x=>x.id),before.materials.map(x=>x.id));
  assert.equal(readMaterials(reopened.w()).find(x=>x.id===studs.id).defaultThickness,200);
  const rt=readAssemblies(reopened.w()).find(t=>t.key===exterior.key);
  assert.equal(rt.layers[1].kind,'cavity');assert.equal(rt.layers[1].t,25.4);assert.equal(rt.layers[1].ventilation,'ventilated');assert.equal(rt.layers[2].t,0);assert.equal(rt.layers[2].function,'membrane');
  const isolated=await model(bytes);near(measure(isolated),209.55);assert.equal(readMaterials(isolated.w()).find(x=>x.id===studs.id).defaultThickness,139.7);
  if(outDir){fs.writeFileSync(path.join(outDir,'edited-reopened.ifc'),reopened.ed.save());fs.writeFileSync(path.join(outDir,'edited-plan.pdf'),plan(reopened,'F01 edited: 241.30 mm assembly'));fs.writeFileSync(path.join(outDir,'edited-detail.pdf'),plan(reopened,'F01 detail: assembly and core dimensions',true));}
  reopened.change(removeElements({walls:[first.guid]}));
  const missing=readWallDimensions(reopened.w()).find(d=>d.guid===dim.guid);
  assert.equal(resolveDimension(missing,readWalls(reopened.w())).status,'missing');assert.equal(reopened.w().api.GetLine(reopened.w().mid,missing.id,false).Representation,null);
  if(outDir)fs.writeFileSync(path.join(outDir,'missing-host.ifc'),reopened.ed.save());
  reopened.ed.undo();near(measure(reopened),241.3);
  const evidence={beforeThickness:209.55,afterThickness:241.3,coreAnchor:anchor,wall:first.guid,dimension:dim.guid,type:type.guid,opening:before.openings[0].guid,material:studs.id,cavity:25.4,membrane:0,missingHostStatus:'missing',checks:['core anchor','dimension update','stable IDs and references','hosted opening retained','undo/redo','material-default isolation','cavity/membrane','save/reopen','project isolation','missing host has no curve']};
  if(outDir)fs.writeFileSync(path.join(outDir,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence));console.log('1 passed, 0 failed');
}
// A separate destination lets CI validate new producer output without replacing review identities.
const outputIndex=process.argv.indexOf('--output-dir');
if(outputIndex!==-1 && (!process.argv[outputIndex+1] || process.argv[outputIndex+1].startsWith('--')))throw new Error('--output-dir requires a directory');
const generatedDir=outputIndex===-1?null:path.resolve(process.argv[outputIndex+1]);
if(generatedDir && process.argv.includes('--verify'))throw new Error('--output-dir is for generating a new fixture set');
const fixture=path.join(generatedDir || path.join(ROOT,'fixtures/f01'),'house.ifc');
if(process.argv.includes('--verify')) {const out=process.argv.includes('--export')?path.join(ROOT,'.cc-test/f01-fixture'):null;if(out)fs.mkdirSync(out,{recursive:true});await verifyFixture(fs.readFileSync(fixture),out);}
else {
  const m=await model(),level=readLevels(m.w())[0];m.change(saveWallAssembly(exterior));m.change(saveWallAssembly(interior));
  const corners=[[0,0],[6000,0],[6000,4000],[0,4000]];
  m.change(drawWalls({storey:level.guid,typeKey:exterior.key,segs:corners.map((a,i)=>({a,b:corners[(i+1)%4],justification:'coreCenter'})),height:2700,extSide:'right'}));
  m.change(drawWalls({storey:level.guid,typeKey:interior.key,segs:[{a:[3000,0],b:[3000,4000],justification:'coreCenter'}],height:2700}));
  const first=readWalls(m.w())[0];m.change(placeOpening({wall:first.guid,typeKey:'win-fixed',offset:1200,width:900,height:1200,sill:900}));
  for(const [i,refs] of [['exterior','interior'],['coreExterior','coreInterior']].entries())m.change(saveWallDimension({level:level.guid,view:'plan:'+level.guid,axis:'y',offset:-650-i*650,refs:refs.map(reference=>({wall:first.guid,reference,station:0.7}))}));
  const out=generatedDir || path.join(ROOT,'.cc-test/f01-fixture');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.dirname(fixture),{recursive:true});
  fs.writeFileSync(fixture,m.ed.save());fs.writeFileSync(path.join(out,'baseline-plan.pdf'),plan(m,'F01 baseline: 209.55 mm assembly'));
  await verifyFixture(m.ed.save(),out);
  console.log('Fixture: '+fixture+'; exports: '+out);
}
