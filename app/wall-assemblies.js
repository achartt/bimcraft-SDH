/* SPDX-License-Identifier: Apache-2.0 */
// Project-scoped wall recipes. The IFC type and material layer set are authoritative;
// no global registry (two open documents may use the same key differently).
import { ids, val } from './ifc-util.js';
import { normalizeLayer, VENTILATION, writeMaterialLayers } from './project-materials.js';
export const ASSEMBLY_PSET = 'CadCraft_WallType';
export const LAYER_FUNCTIONS = ['finish', 'substrate', 'structure', 'insulation', 'membrane'];
const fail = (message) => { throw new Error(message); };
export function validateAssembly(input) {
  if (!/^wall-[a-zA-Z0-9_-]{1,80}$/.test(input?.key || '')) fail('Invalid wall type key.');
  const name = String(input.name || '').trim();
  if (!name || name.length > 100) fail('Enter a wall type name (up to 100 characters).');
  if (!Array.isArray(input.layers) || !input.layers.length || input.layers.length > 32) fail('An assembly needs 1–32 layers.');
  const layers = input.layers.map(l => {
    const mat = String(l.mat || '').trim(), t = Number(l.t);
    if (!mat || mat.length > 100) fail('Each layer needs a material name (up to 100 characters).');
    if (!Number.isFinite(t) || t <= 0 || t > 2000) fail('Layer thickness must be greater than zero and at most 2000 mm.');
    if (!LAYER_FUNCTIONS.includes(l.function)) fail('Choose a function for each layer.');
    if(l.kind!=null && !['material','cavity'].includes(l.kind)) fail('Choose a valid layer kind.');
    const layer=normalizeLayer({ ...l, mat, t, function: l.function, core: l.core === true });
    if(layer.kind==='cavity' && !VENTILATION.includes(layer.ventilation)) fail('Choose a valid cavity ventilation setting.');
    return {mat,t,function:layer.function,core:layer.core,kind:layer.kind,materialId:layer.materialId,...(layer.kind==='cavity'?{ventilation:layer.ventilation}:{})};
  });
  if (layers.reduce((s,l)=>s+l.t,0)>2000) fail('Total wall thickness must not exceed 2000 mm.');
  const core = layers.map((l,i)=>l.core?i:-1).filter(i=>i>=0);
  if (!core.length || core.at(-1)-core[0]+1!==core.length) fail('Mark one contiguous group of layers as the core.');
  return { key: input.key, name, exterior: input.exterior === true, layers, custom: true };
}
export function readAssemblies(w) {
  if (!w) return [];
  const out=[];
  for (const id of ids(w.api,w.mid,'IFCWALLTYPE')) {
    const line=w.api.GetLine(w.mid,id,false);
    for (const h of line.HasPropertySets || []) {
      const ps=w.api.GetLine(w.mid,h.value,false);
      if(val(ps?.Name)!==ASSEMBLY_PSET) continue;
      const props=Object.fromEntries((ps.HasProperties || []).map(h=>{const p=w.api.GetLine(w.mid,h.value,false);return [val(p.Name),val(p.NominalValue)];}));
      if (!props.Recipe) continue;
      try { out.push({...validateAssembly(JSON.parse(props.Recipe)),id,guid:val(line.GlobalId),psetId:h.value}); } catch { /* Unknown/corrupt recipes are never silently guessed. */ }
    }
  }
  return out;
}
export function writeAssembly(w,input,guid=null) {
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
