/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import {model,directory} from './fixtures.mjs';
import {readWalls} from '../../../app/model-walls.js';
import {readWallDimensions,removeWallDimensions,DIMENSION_PSET} from '../../../app/wall-dimensions.js';
import {readAssemblyRecords} from '../../../app/wall-assemblies.js';
import {readMaterials,MATERIAL_PSET} from '../../../app/project-materials.js';
import {removeElements} from '../../../app/model-ops.js';
import {ids} from '../../../app/ifc-util.js';
const load=()=>model(fs.readFileSync(new URL('mm-local.ifc',directory)));
fs.mkdirSync('.cc-test/f02-review',{recursive:true});
const bad=await load(),w=bad.w(),d=readWallDimensions(w)[0],r=readAssemblyRecords(w)[0];
w.run(w=>{
 w.upsertPset(d.id,DIMENSION_PSET,[['Spec','IFCTEXT',JSON.stringify({...d,version:99})]]);
 w.upsertPset(ids(w.api,w.mid,'IFCPROJECT')[0],MATERIAL_PSET,[['Library','IFCTEXT',JSON.stringify({version:99,materials:readMaterials(w)})]]);
 const ps=w.api.GetLine(w.mid,r.psetId,false),p=ps.HasProperties.map(h=>w.api.GetLine(w.mid,h.value,false)).find(p=>p.Name.value==='Recipe');
 const q=w.touch(p.expressID);q.NominalValue=w.T('IFCTEXT',JSON.stringify({...r,version:99}));w.write(q);
});
fs.writeFileSync('.cc-test/f02-review/unsupported.ifc',bad.ed.save());
const missing=await load();missing.change(removeWallDimensions(readWallDimensions(missing.w()).slice(1).map(d=>d.guid)));
missing.change(removeElements({walls:[readWalls(missing.w())[0].guid]}));
fs.writeFileSync('.cc-test/f02-review/missing-host.ifc',missing.ed.save());
