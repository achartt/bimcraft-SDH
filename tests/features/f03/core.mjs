/* SPDX-License-Identifier: Apache-2.0 */
// Shared model workload/checks; never imported by production. No DOM or Node dependencies.
import * as W from '../../../app/ifc/api.js';
import {IfcEditor} from '../../../app/ifc-edit.js';
import {ModelWriter} from '../../../app/model-write.js';
import {readWalls,locationLine,wallOutlines} from '../../../app/model-walls.js';
import {readLevels} from '../../../app/model-levels.js';
import {readOpenings,openingSymbol} from '../../../app/model-openings.js';
import {readAssemblies} from '../../../app/wall-assemblies.js';
import {readMaterials} from '../../../app/project-materials.js';
import {readWallDimensions,resolveDimension} from '../../../app/wall-dimensions.js';
import {readDerived} from '../../../app/model-slabs.js';
import {changeWall,saveWallAssembly,changeDerived} from '../../../app/model-ops.js';
import {wallPieces} from '../../../app/model-plan.js';
import {planPdf} from '../../../app/model-pdf.js';
export {W,IfcEditor,ModelWriter};
export const recipe={version:1,key:'wall-f03',name:'F03 cavity exterior',exterior:true,layers:[
 {mat:'siding',t:19.123456,function:'finish',core:false},
 {mat:'air',t:25.4,kind:'cavity',ventilation:'ventilated',function:'substrate',core:false},
 {mat:'membrane',t:0,function:'membrane',core:false},
 {mat:'studs',t:139.7,function:'structure',core:true},
 {mat:'gypsum',t:12.7,function:'finish',core:false}]};
export const sizes={small:3,medium:9,large:24};
export const writer=ed=>new ModelWriter(ed.W,ed.api,ed.mid);
export async function openModel(bytes){const api=new W.IfcAPI();await api.Init({manifold:false});return new IfcEditor(W,{api,modelID:api.OpenModel(bytes)});}
export function snapshot(ed){const w=writer(ed),walls=readWalls(w),dims=readWallDimensions(w);return {
 walls: walls.map(x=>({guid:x.guid,type:x.typeKey,a:x.a,b:x.b,height:x.height,t:x.t,anchor:locationLine(x)})),
 types:readAssemblies(w).map(x=>({guid:x.guid,key:x.key,layers:x.layers})),
 openings:readOpenings(w).map(x=>({guid:x.guid,wall:x.wall,width:x.width,height:x.height})),
 dimensions:dims.map(x=>({guid:x.guid,refs:x.refs,status:resolveDimension(x,walls).status,value:resolveDimension(x,walls).value})),
 materials:readMaterials(w),roofs:readDerived(w).roofs.map(x=>({guid:x.guid,pitch:x.pitch})),levels:readLevels(w).map(x=>x.guid)};}
const check=(ok,msg)=>{if(!ok)throw new Error('F03 correctness: '+msg);};
const near=(a,b)=>check(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<.005,`${a} != ${b}`);
export function equivalent(a,b){for(const k of ['walls','types','openings','dimensions','materials','roofs','levels'])check(JSON.stringify(a[k])===JSON.stringify(b[k]),k+' changed across undo/reopen');}
export function validate(s,n){check(s.walls.length===n*4,'wall count');check(s.openings.length===n,'opening count');check(s.dimensions.length===n,'dimension count');check(s.roofs.length===1,'roof count');
 for(const k of ['walls','types','openings','dimensions','roofs'])check(new Set(s[k].map(x=>x.guid)).size===s[k].length,k+' duplicate IDs');
 const type=s.types[0];check(type.layers[1].t===25.4&&type.layers[1].kind==='cavity','cavity');check(type.layers[2].t===0&&type.layers[2].function==='membrane','membrane');
 for(const d of s.dimensions){check(d.status==='ok','reference unresolved');near(d.value,s.walls.find(w=>w.guid===d.refs[0].wall).t);}
 for(const w of s.walls){check([...w.a,...w.b,w.height,w.t].every(Number.isFinite),'nonfinite geometry');}
}
export function operation(ed,kind){const w=writer(ed);if(kind==='wall-edit')return changeWall(readWalls(w)[0].guid,{height:2800.123456});
 if(kind==='type-edit'){const t=readAssemblies(w)[0];return saveWallAssembly({...t,layers:t.layers.map((l,i)=>i===0?{...l,t:l.t+.12345}:l)});}
 if(kind==='roof-regeneration')return changeDerived(readDerived(w).roofs[0].guid,{pitch:30});throw new Error('Unknown operation '+kind);}
export function validateEdit(before,after,kind,n){validate(after,n);for(const k of ['walls','types','openings','dimensions','roofs'])check(JSON.stringify(before[k].map(x=>x.guid))===JSON.stringify(after[k].map(x=>x.guid)),k+' identity');
 check(JSON.stringify(before.dimensions.map(x=>x.refs))===JSON.stringify(after.dimensions.map(x=>x.refs)),'reference identities');check(JSON.stringify(before.materials)===JSON.stringify(after.materials),'material isolation');
 if(kind==='wall-edit')near(after.walls[0].height,2800.123456);
 if(kind==='type-edit')for(let i=0;i<after.walls.length;i++){near(after.walls[i].t,before.walls[i].t+.12345); // corners may extend along axis; core line's perpendicular coordinate must remain fixed
 const a=before.walls[i],b=after.walls[i],dx=a.b[0]-a.a[0],dy=a.b[1]-a.a[1],len=Math.hypot(dx,dy);
 near(((b.anchor.a[0]-a.anchor.a[0])*dy-(b.anchor.a[1]-a.anchor.a[1])*dx)/len,0);}
 if(kind==='roof-regeneration')near(after.roofs[0].pitch,30);
}
export function scene(ed){const w=writer(ed),walls=readWalls(w),openings=readOpenings(w),outlines=wallOutlines(walls.map(x=>({...x,key:x.guid})));
 return {walls:walls.map(x=>({key:x.id,poly:outlines.get(x.guid),pieces:wallPieces(x,outlines.get(x.guid),openings.filter(o=>o.wall===x.id),1200)})),symbols:openings.map(o=>openingSymbol(o,walls.find(x=>x.id===o.wall))),dims:readWallDimensions(w).map(d=>resolveDimension(d,walls)).map(d=>({...d,key:d.guid,text:d.value.toFixed(2)+' mm'})),cut:[],below:[],rooms:[]};}
export function pdf(s){return planPdf(s,{title:'F03 synthetic residential baseline',units:'mm',paper:'a3'}).bytes;}

// Geometry extraction is separate from STEP indexing and from plan/PDF generation.
// Node Init(manifold:false) measures the built-in envelope tessellator; browser load
// additionally includes its configured CSG path, batches and GPU upload.
export function mesh(ed){let products=0,triangles=0;const vertices=[],indices=[];ed.api.StreamAllMeshes(ed.mid,m=>{products++;for(let i=0;i<m.geometries.size();i++){const g=ed.api.GetGeometry(ed.mid,m.geometries.get(i).geometryExpressID);vertices.push(ed.api.GetVertexArray(g.GetVertexData(),g.GetVertexDataSize()));const ix=ed.api.GetIndexArray(g.GetIndexData(),g.GetIndexDataSize());indices.push(ix);triangles+=ix.length/3;g.delete();}});return {products,triangles,vertices,indices};}
export function validateMesh(m){check(m.products>0&&m.triangles>0,'empty mesh');for(const v of m.vertices)check(v.length>0&&v.every(Number.isFinite),'mesh coordinates');for(const ix of m.indices)check(ix.length%3===0,'triangle indices');}
