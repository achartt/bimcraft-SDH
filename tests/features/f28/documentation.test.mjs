/* SPDX-License-Identifier: Apache-2.0 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {model} from '../f05/fixture.mjs';
import {fixture} from './documentation-fixture.mjs';
import {createCommands,createDrawingTabs,shortcutCommand} from '../../../app/workspace/commands.js';
import {browserSource} from '../../../app/workspace/documentation.js';
import {readWalls,locationLine} from '../../../app/model-walls.js';
import {readAssemblies} from '../../../app/wall-assemblies.js';
import {readLevels} from '../../../app/model-levels.js';
import {readWallDimensions,resolveDimension} from '../../../app/wall-dimensions.js';
import {saveWallAssembly} from '../../../app/model-ops.js';
import {saveSheet,readSheets,readPlanViews} from '../../../app/views-model.js';
import {assemblySchedules} from '../../../app/assembly-schedule.js';
import {documentPages} from '../../../app/assembly-schedule-layout.js';
import {composeSheet} from '../../../app/res-sheets.js';
import {addDrafting,readDrafting,changeDrafting} from '../../../app/drafting.js';
test('documentation selection uses source IDs and resets editor ownership despite duplicate names',()=>{
 const sources=[{id:'sheet:a',kind:'sheet',ref:'a',name:'Same'},{id:'sheet:b',kind:'sheet',ref:'b',name:'Same'}];
 assert.equal(browserSource({dataset:{pbSheet:'b'}},sources),sources[1]);assert.equal(browserSource({dataset:{pbSheet:'gone'}},sources),null);
 const tabs=createDrawingTabs(),editorA={},editorB={};tabs.reset(editorA);tabs.open(sources[0]);tabs.open(sources[1]);assert.equal(tabs.all.length,2);tabs.close('sheet:a');assert.equal(tabs.active.id,'sheet:b');tabs.close('sheet:b');assert.equal(tabs.active,null);tabs.open(sources[1]);assert.equal(tabs.reset(editorA),false);tabs.reset(editorB);assert.equal(tabs.all.length,0);
});
test('shared documentation commands distinguish plan/RCP/projected/template/corrupt and typing state',()=>{
 const s={document:{},busy:false,levels:[{}],selection:[],view:{kind:'section'},settings:{detail:'fine'},tool:'select'};
 const actions=Object.fromEntries(['section','dimension','detailline','filledregion','range','detail','scale','csv','pdf','placeview','sheet','tools'].map(k=>[k,()=>true]));const c=createCommands({state:()=>s,actions});
 assert.equal(c.describe('section').enabled,false);assert.equal(c.describe('detail').enabled,true);assert.equal(c.describe('range').enabled,false);s.settings.issue='Unsupported record';assert.equal(c.describe('detail').reason,'Unsupported record');
 s.settings={};s.view.kind='rcp';assert.equal(c.describe('dimension').enabled,true);assert.equal(c.describe('range').enabled,true);s.settings.template='Protected';assert.match(c.describe('detail').reason,/Protected/);
 s.view.kind='schedule';assert.equal(c.describe('csv').enabled,true);assert.equal(c.describe('detail').enabled,false);s.view.kind='sheet';assert.equal(c.describe('placeview').enabled,true);s.busy=true;assert.equal(c.describe('sheet').enabled,false);assert.equal(c.describe('tools').enabled,true);
 const e={key:'Escape',target:{closest:()=>null}};assert.equal(shortcutCommand(e,{live:true,tool:'dhatch'}),'cancel');assert.equal(shortcutCommand({...e,key:'Enter'},{live:true,tool:'dhatch'}),'finish');assert.equal(shortcutCommand({...e,target:{closest:()=>true}},{live:true,tool:'dhatch'}),null);
});
test('real documentation, continuation references and annotations survive shared type edits, journals and IFC reopen',async()=>{
 const bytes=fs.readFileSync(fixture),m=await model(bytes),original=await model(bytes),lv=readLevels(m.w())[0],initial=readWalls(m.w()),type=readAssemblies(m.w()).find(t=>t.key===initial[0].typeKey);
 const dims=()=>readWallDimensions(m.w()).map(d=>[d.guid,d.refs,resolveDimension(d,readWalls(m.w())).status]);const before=dims(),anchors=initial.map(w=>[w.guid,locationLine(w).a,locationLine(w).b]);
 assert.ok(initial.filter(w=>w.typeKey===type.key).length>=2);
 const pages=documentPages(assemblySchedules(m.w()).assemblies,'assemblies');assert.ok(pages.length>1);
 m.change(saveSheet({number:'C-01',title:'Same display title',paper:'a3',views:[{kind:'section',ref:'missing-section',x:80,y:100,ratio:20},{kind:'schedule',ref:pages[1].ref,x:210,y:160,ratio:0}]}));
 const custom=readSheets(m.w()).find(s=>s.number==='C-01'),composed=composeSheet(custom,{schedules:pages,sections:[]},{paper:'a3',units:'mm'});assert.deepEqual(composed.missing,[0]);assert.equal(custom.views[1].ref,'f06-assemblies:2');
 m.change(addDrafting({level:lv.guid,view:'plan:'+lv.guid,kind:'hatch',pts:[[500,500],[1500,500],[1500,1500],[500,1500]],pattern:'diagonal',scale:1}));
 const annotation=readDrafting(m.w()).at(-1);m.change(changeDrafting([annotation.guid],{pattern:'cross',scale:2}));assert.equal(readDrafting(m.w()).at(-1).scale,2);
 m.change(saveWallAssembly({...type,layers:type.layers.map((l,i)=>({...l,t:l.t+(i===0?6.35:0)}))}));
 for(const w of readWalls(m.w()).filter(w=>w.typeKey===type.key))assert.ok(Math.abs(w.t-initial[0].t-6.35)<.005);
 assert.deepEqual(dims(),before);
 for (const [i,w] of readWalls(m.w()).entries()) { const line=locationLine(w);assert.equal(w.guid,anchors[i][0]);for (const [j,p] of [line.a,line.b].entries()) for(let n=0;n<2;n++)assert.ok(Math.abs(p[n]-anchors[i][j+1][n])<.005); }
 const changed=assemblySchedules(m.w());m.ed.undo();assert.notDeepEqual(assemblySchedules(m.w()),changed);m.ed.redo();assert.deepEqual(assemblySchedules(m.w()),changed);
 const reopen=await model(m.ed.save());assert.deepEqual(readSheets(reopen.w()),readSheets(m.w()));assert.deepEqual(readDrafting(reopen.w()),readDrafting(m.w()));assert.deepEqual([...readPlanViews(reopen.w(),'rcp')],[...readPlanViews(m.w(),'rcp')]);assert.deepEqual(assemblySchedules(reopen.w()),changed);assert.deepEqual(readWalls(original.w()),initial);
});
