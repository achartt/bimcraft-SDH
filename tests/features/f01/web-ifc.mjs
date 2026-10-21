#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Independent, mandatory black-box reader. Missing packages and reader errors fail.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const require=createRequire(path.join(root,'.cc-test/tools/bimcraft-test/package.json'));
const W=require('web-ifc');
const api=new W.IfcAPI();await api.Init();
const reports=[];
for(const dir of process.argv.slice(2).length ? process.argv.slice(2) : ['fixtures/f01']) {
  const identities=[];
  for(const [name,walls,windows] of [['house',5,1],['edited-reopened',5,1],['missing-host',4,0]]) {
    const file=path.join(dir,name+'.ifc'), id=api.OpenModel(fs.readFileSync(file));
    assert.ok(id>=0,`Could not open ${file}`);
    const ids=type=>{const vector=api.GetLineIDsWithType(id,type);return Array.from({length:vector.size()},(_,i)=>vector.get(i));};
    const wallIds=ids(W.IFCWALL),windowIds=ids(W.IFCWINDOW),dimIds=ids(W.IFCANNOTATION);
    assert.equal(wallIds.length,walls);assert.equal(windowIds.length,windows);
    assert.equal(ids(W.IFCOPENINGELEMENT).length,windows);assert.equal(dimIds.length,2);
    const products=new Set([...wallIds,...windowIds]), meshed=new Set();let triangles=0;
    api.StreamAllMeshes(id,mesh=>{
      if(!products.has(mesh.expressID))return;
      let count=0;
      for(let i=0;i<mesh.geometries.size();i++) {
        const g=api.GetGeometry(id,mesh.geometries.get(i).geometryExpressID);
        const vertices=api.GetVertexArray(g.GetVertexData(),g.GetVertexDataSize());
        const indices=api.GetIndexArray(g.GetIndexData(),g.GetIndexDataSize());
        // Axis curves are returned alongside Body solids but contain no triangles.
        if(vertices.length===0 && indices.length===0) {
          assert.equal(api.GetLine(id,mesh.geometries.get(i).geometryExpressID).type,W.IFCPOLYLINE);
          g.delete();continue;
        }
        assert.ok(vertices.length>0 && vertices.length%6===0 && vertices.every(Number.isFinite));
        assert.ok(indices.length>0 && indices.length%3===0 && indices.every(x=>x<vertices.length/6));
        count+=indices.length/3;g.delete();
      }
      assert.ok(count>0);triangles+=count;meshed.add(mesh.expressID);
    });
    assert.deepEqual(meshed,products);
    const guids=[...products,...dimIds,...ids(W.IFCWALLTYPE)].map(i=>api.GetLine(id,i).GlobalId.value).sort();
    identities.push(guids);
    for(const i of dimIds)if(name==='missing-host')assert.equal(api.GetLine(id,i).Representation,null);
    reports.push({file,walls,windows,dimensions:dimIds.length,meshed:meshed.size,triangles,status:'PASS'});
    api.CloseModel(id);
  }
  assert.deepEqual(identities[0],identities[1]);
  assert.ok(identities[2].every(guid=>identities[0].includes(guid)));
}
console.log(JSON.stringify({reader:'web-ifc',version:JSON.parse(fs.readFileSync(path.join(root,'.cc-test/tools/bimcraft-test/node_modules/web-ifc/package.json'))).version,files:reports,status:'geometry-and-identity-pass',scope:'Counts, triangulation and IDs only. Reader diagnostics above remain visible; this is not material/color acceptance.'},null,2));
