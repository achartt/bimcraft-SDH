/* SPDX-License-Identifier: Apache-2.0 */
// Semantic references are authoritative. Coordinates and IFC curves are derived, never a saved measurement.
import { ids, val } from './ifc-util.js';
import { readWalls, locationOffset } from './model-walls.js';
import { wallGeom } from './model-arcs.js';
import { ModelWriter } from './model-write.js';
export const DIMENSION_PSET = 'CadCraft_WallDimension';
export const WALL_REFERENCES = ['exterior', 'interior', 'center', 'coreExterior', 'coreInterior', 'coreCenter'];
export function referencePoint(ref, walls, level = null) {
  const wall = walls.find(w => w.guid === ref.wall);
  if (!wall || (level !== null && wall.storey !== level)) return null;
  if (!WALL_REFERENCES.includes(ref.reference) || !Number.isFinite(ref.station) || ref.station < 0 || ref.station > 1) return null;
  const off = locationOffset(ref.reference, wall.t, wall.extSide, wall.assembly);
  return off === null ? null : wallGeom(wall).at(wallGeom(wall).L * ref.station, off);
}
export function resolveDimension(d, walls) {
  const a = referencePoint(d.refs[0], walls, d.storey), end = referencePoint(d.refs[1], walls, d.storey);
  if (!a || !end) return { ...d, status: 'missing' };
  const b = d.axis === 'x' ? [end[0], a[1]] : d.axis === 'y' ? [a[0], end[1]] : end;
  const value = Math.hypot(b[0]-a[0], b[1]-a[1]);
  return { ...d, a, b, witnesses: [a, end], value, status: value < 0.001 ? 'coincident' : 'ok', off: d.offset };
}
export function readWallDimensions(w) {
  const out = [];
  for (const id of ids(w.api,w.mid,'IFCANNOTATION')) {
    const ps = w.readPset(id,DIMENSION_PSET);
    if (!ps?.Spec) continue;
    try {
      const d = JSON.parse(ps.Spec); validateSpec(d);
      out.push({...d, id, guid:w.guidOf(id), storey:w.storeyOfId(id), geometry:ps.Geometry || ''});
    } catch { /* Preserve unsupported annotations without inventing references. */ }
  }
  return out;
}
function validateSpec(d) {
  if (!d || !['x','y','aligned'].includes(d.axis) || !Number.isFinite(d.offset) || Math.abs(d.offset)>1e7 || !/^(plan:|rcp:|callout:).+/.test(d.view || '')) throw new Error('Invalid dimension settings.');
  if (!Array.isArray(d.refs) || d.refs.length!==2 || d.refs.some(r=>!r.wall || !WALL_REFERENCES.includes(r.reference) || !Number.isFinite(r.station) || r.station<0 || r.station>1)) throw new Error('Pick two valid wall references.');
}
// Update exported IFC curves in the same journal as the wall edit. Broken references lose their curves.
export function syncWallDimensions(w) {
  const dims=readWallDimensions(w);
  if (!dims.length) return;
  const walls=readWalls(w);
  for (const d of dims) {
    const r=resolveDimension(d,walls), signature=JSON.stringify(r.status==='ok'?[r.a,r.b,r.witnesses,r.off]:[r.status]);
    if(signature===d.geometry) continue;
    if(r.status==='ok') {
      const n=[-(r.b[1]-r.a[1])/r.value,(r.b[0]-r.a[0])/r.value];
      const a=r.a.map((v,i)=>v+n[i]*r.off), b=r.b.map((v,i)=>v+n[i]*r.off);
      w.setShape(d.id,[w.rep('foot','FootPrint','GeometricCurveSet',[w.make('IFCGEOMETRICCURVESET',[[a,b],[r.witnesses[0],a],[r.witnesses[1],b]].map(p=>w.H(w.polyline2(p))))])]);
    } else {
      const line=w.touch(d.id), old=line.Representation?.value; line.Representation=null; w.write(line); if(old) w.dropTree(old);
    }
    w.upsertPset(d.id,DIMENSION_PSET,[['Geometry','IFCTEXT',signature],['Status','IFCLABEL',r.status]]);
  }
}
const operation = fn => ed => new ModelWriter(ed.W,ed.api,ed.mid).run(w=>{ const result=fn(w);syncWallDimensions(w);return result; });
export function saveWallDimension(input) {
  const spec=structuredClone(input); let guid=spec.guid || null;
  return operation(w=>{
    const d={refs:spec.refs,axis:spec.axis || 'aligned',offset:spec.offset ?? 300,view:spec.view}; validateSpec(d);
    const st=w.byGuid(spec.level); if(!st) throw new Error('Dimension level is missing.');
    const r=resolveDimension({...d,storey:st},readWalls(w));
    if(r.status!=='ok') throw new Error('The references are missing or coincide in the selected direction.');
    let id=guid && w.byGuid(guid);
    if(spec.guid && !readWallDimensions(w).some(d=>d.guid===spec.guid && d.storey===st)) throw new Error('Dimension is no longer available.');
    if(!id) {
      guid ||= val(w.guid()); const sl=w.api.GetLine(w.mid,st,false);
      id=w.make('IFCANNOTATION',guid,w.ownerHistory(),w.L('Wall reference dimension'),null,w.L('CadCraft_WallDimension'),w.H(w.placeAt(sl.ObjectPlacement.value,0,0,0,0)),null,...(/^IFC4X3/i.test(w.schema||'')?['USERDEFINED']:[]));
      w.noteGuid(guid,id);w.contain(id,st);
    }
    w.upsertPset(id,DIMENSION_PSET,[['Spec','IFCTEXT',JSON.stringify(d)]]);
    return {id,ids:[id],guid,made:new Map([[guid,id]])};
  });
}
export const removeWallDimensions = guids => operation(w=>{
  const list=readWallDimensions(w).filter(d=>guids.includes(d.guid));
  if(list.length) w.dropProduct(list.map(d=>d.id));
  return {id:null,ids:[]};
});
