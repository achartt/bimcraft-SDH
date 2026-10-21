/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {init} from '../../../app/i18n.js';
import {newBuilding,stackLevels} from '../../../app/new-model.js';
import {readLevels} from '../../../app/model-levels.js';
import {readWalls} from '../../../app/model-walls.js';
import {drawWalls,saveWallAssembly,placeOpening,placeRoof} from '../../../app/model-ops.js';
import {saveWallDimension} from '../../../app/wall-dimensions.js';
import {recipe,sizes,openModel,writer,snapshot,validate} from './core.mjs';
init({strings:JSON.parse(fs.readFileSync(new URL('../../../app/lang/en.json',import.meta.url)))});
export const output='.cc-test/f03/fixtures';
export async function generate(size){const n=sizes[size];if(!n)throw new Error('Unknown fixture '+size);
 let sequence=0;const guid=()=> '0F03'+String(n).padStart(2,'0')+String(sequence++).padStart(16,'0');
 const ed=await openModel(new TextEncoder().encode(newBuilding({guid,name:'F03 '+size,levels:stackLevels(1,3000,()=> 'Ground'),now:new Date('2026-10-21T12:00:00Z')})));
 const originalGuid=ed.api.CreateIFCGloballyUniqueId.bind(ed.api);
 ed.api.CreateIFCGloballyUniqueId=()=>({...originalGuid(),value:guid()});
 const level=readLevels(writer(ed))[0];ed.modelChange(saveWallAssembly(recipe));
 const segs=[];
 for(let i=0;i<n;i++){const x=(i%6)*9000,y=Math.floor(i/6)*7000,ps=[[x,y],[x+6000,y],[x+6000,y+4000],[x,y+4000]];for(let j=0;j<4;j++)segs.push({a:ps[j],b:ps[(j+1)%4],justification:'coreCenter',extSide:'right'});}
 ed.modelChange(drawWalls({storey:level.guid,typeKey:recipe.key,segs,height:2700.123456}));
 const walls=readWalls(writer(ed));
 for(let i=0;i<n;i++){const wall=walls[i*4];ed.modelChange(placeOpening({wall:wall.guid,typeKey:'win-fixed',offset:1200,width:900,height:1200,sill:900}));ed.modelChange(saveWallDimension({level:level.guid,view:'plan:'+level.guid,axis:'y',offset:-500,refs:['exterior','interior'].map(reference=>({wall:wall.guid,reference,station:.75}))}));}
 ed.modelChange(placeRoof({storey:level.guid,seed:[3000,2000],pitch:26.565,overhang:300}));
 validate(snapshot(ed),n);
 let text=new TextDecoder().decode(ed.api.file(ed.mid).save({timeStamp:'2026-10-21T12:00:00'}));
 ed.api.CloseModel(ed.mid);return Buffer.from(text);
}
export async function generateAll(dir=output){fs.mkdirSync(dir,{recursive:true});const manifest={seed:'F03-grid-v1 (no PRNG); row-major 6x4m bays, 9x7m spacing',fixtures:{}};
 for(const [size,n] of Object.entries(sizes)){const bytes=await generate(size);fs.writeFileSync(path.join(dir,size+'.ifc'),bytes);manifest.fixtures[size]={bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),entities:[...bytes.toString().matchAll(/^#\d+=/gm)].length,walls:n*4,openings:n,dimensions:n,roofs:1,bays:n,bayAreaM2:n*24};console.log(size,manifest.fixtures[size]);}
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generateAll();
