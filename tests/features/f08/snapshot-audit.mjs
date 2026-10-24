/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
for(const [name,path]of [['f04','layered-plans.ifc'],['f05','wall-views.ifc'],['f06','assembly-documentation.ifc']]){
 const {generate}=await import('../'+name+'/fixture.mjs'),bytes=await generate(),file='fixtures/'+name+'/'+path,original=fs.readFileSync(file);
 if(Buffer.from(bytes).equals(original))console.log('F08_SNAPSHOT_MATCH '+file);
 else console.log('F08_SNAPSHOT_UPDATE '+file+' '+Buffer.from(bytes).toString('base64'));
}
