/* SPDX-License-Identifier: Apache-2.0 */
// Project-scoped wall recipes. The IFC type and material layer set are authoritative;
// no global registry (two open documents may use the same key differently).
import { ids, val } from './ifc-util.js';
import { normalizeLayer, VENTILATION, writeMaterialLayers } from './project-materials.js';
import { checkRecordVersion, parseRecord, recordError, recordProperties } from './record-contract.js';
export const ASSEMBLY_PSET = 'CadCraft_WallType';
export const LAYER_FUNCTIONS = ['finish', 'substrate', 'structure', 'insulation', 'membrane'];
const fail = (message) => { throw new Error(message); };
export function validateAssembly(input) {
  checkRecordVersion(input, 'assembly');
  if (!/^wall-[a-zA-Z0-9_-]{1,80}$/.test(input?.key || '')) fail('Invalid wall type key.');
  const name = String(input.name || '').trim();
  if (!name || name.length > 100) fail('Enter a wall type name (up to 100 characters).');
  if (!Array.isArray(input.layers) || !input.layers.length || input.layers.length > 32) fail('An assembly needs 1–32 layers.');
  const layers = input.layers.map(l => {
    const mat = String(l.mat || '').trim(), t = l.t;
    if (!mat || mat.length > 100) fail('Each layer needs a material name (up to 100 characters).');
    if (!Number.isFinite(t) || t < 0 || t > 2000) fail('Layer thickness must be between 0 and 2000 mm.');
    if (!LAYER_FUNCTIONS.includes(l.function)) fail('Choose a function for each layer.');
    if(l.kind!=null && !['material','cavity'].includes(l.kind)) fail('Choose a valid layer kind.');
    const layer=normalizeLayer({ ...l, mat, t, function: l.function, core: l.core === true });
    if(t===0 && (layer.kind!=='material' || layer.function!=='membrane')) fail('Only a material layer with the Membrane function can have zero thickness.');
    if(layer.kind==='cavity' && !VENTILATION.includes(layer.ventilation)) fail('Choose a valid cavity ventilation setting.');
    return {mat,t,function:layer.function,core:layer.core,kind:layer.kind,materialId:layer.materialId,...(layer.kind==='cavity'?{ventilation:layer.ventilation}:{})};
  });
  if (layers.reduce((s,l)=>s+l.t,0)>2000) fail('Total wall thickness must not exceed 2000 mm.');
  if(!layers.some(l=>l.t>0)) fail('An assembly needs at least one layer with physical thickness.');
  if(!layers.some(l=>l.core && l.t>0)) fail('The core needs physical thickness.');
  const core = layers.map((l,i)=>l.core?i:-1).filter(i=>i>=0);
  if (!core.length || core.at(-1)-core[0]+1!==core.length) fail('Mark one contiguous group of layers as the core.');
  return { version: 1, key: input.key, name, exterior: input.exterior === true, layers, custom: true };
}
export function readAssemblyRecords(w) {
  if (!w) return [];
  const out=[];
  for (const id of ids(w.api,w.mid,'IFCWALLTYPE')) {
    const line=w.api.GetLine(w.mid,id,false);
    const sets=(line.HasPropertySets || []).filter(h=>val(w.api.GetLine(w.mid,h.value,false)?.Name)===ASSEMBLY_PSET);
    for (const h of sets) {
      const ps=w.api.GetLine(w.mid,h.value,false);
      const props=Object.fromEntries((ps.HasProperties || []).map(h=>{const p=w.api.GetLine(w.mid,h.value,false);return [val(p?.Name),val(p?.NominalValue)];}));
      const identity={id,guid:val(line.GlobalId),psetId:h.value,key:props.Key,raw:props.Recipe};
      try { if(sets.length!==1) throw recordError('assembly','corrupt');
        recordProperties(w,ps,'assembly');
        // Legacy starter types have no Recipe. Custom wall-* types require it.
        if (!Object.hasOwn(props, 'Recipe') && typeof props.Key==='string' && !props.Key.startsWith('wall-')) continue;
        const raw=parseRecord(props.Recipe,'assembly'); const recipe=validateAssembly(raw);
        if (recipe.key !== props.Key) throw recordError('assembly','corrupt');
        out.push({...recipe,...identity});
      } catch(e) { out.push({...identity,issue:e.recordIssue || 'corrupt',message:recordError('assembly',e.recordIssue || 'corrupt').message}); }
    }
  }
  return out.map(r=>out.filter(x=>x.key===r.key || x.guid===r.guid).length>1?{...r,issue:'corrupt',message:recordError('assembly','corrupt').message}:r);
}
export const readAssemblies = w => readAssemblyRecords(w).filter(r=>!r.issue);
export function assertAssembliesEditable(w) {
  const records=readAssemblyRecords(w), bad=records.find(r=>r.issue);
  if(bad) throw recordError('assembly',bad.issue);
  if(new Set(records.map(r=>r.key)).size!==records.length) throw recordError('assembly','corrupt');
}
export function writeAssembly(w,input,guid=null) {
  assertAssembliesEditable(w);
  const recipe=validateAssembly(input), previous=readAssemblies(w).find(x=>x.key===recipe.key);
  if(readAssemblies(w).some(x=>x.key!==recipe.key && x.name.toLowerCase()===recipe.name.toLowerCase())) fail('A wall type with this name already exists.');
  const layers=writeMaterialLayers(w,recipe.layers);
  const set=w.make('IFCMATERIALLAYERSET',layers.map(id=>w.H(id)),w.L(recipe.name),...(w.v4?[null]:[]));
  const ps=w.pset(ASSEMBLY_PSET,[['Key','IFCIDENTIFIER',recipe.key],['Thickness','IFCPOSITIVELENGTHMEASURE',w.u(recipe.layers.reduce((s,l)=>s+l.t,0))],['Recipe','IFCTEXT',JSON.stringify(recipe)]]);
  let id=previous?.id;
  if(id){
    const line=w.touch(id); line.Name=w.L(recipe.name);line.ElementType=w.L(recipe.name);
    line.HasPropertySets=[...(line.HasPropertySets||[]).filter(h=>h.value!==previous.psetId),w.H(ps)];w.write(line);
    const rel=w.materialRel(id);
    if(rel){const r=w.touch(rel.rel);r.RelatingMaterial=w.H(set);w.write(r);}else w.associateMaterial(id,set);
  }else{
    id=w.make('IFCWALLTYPE',guid || w.guid(),w.ownerHistory(),w.L(recipe.name),null,null,[w.H(ps)],null,null,w.L(recipe.name),'STANDARD');
    w.noteGuid(w.guidOf(id),id);
    w.associateMaterial(id,set);
  }
  return {id,set,type:recipe};
}
