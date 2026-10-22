# SPDX-License-Identifier: Apache-2.0
"""Independent IFC schema/physical-layer checks. No application modules imported."""
import json,sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f05')
base=None
for name in ['seed.ifc','styled.ifc','edited.ifc','ifc2x3.ifc']:
 path=root/name
 log=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(path),log,express_rules=True)
 assert not log.statements,(name,log.statements)
 f=ifcopenshell.open(str(path));walls=[w for w in f.by_type('IfcWall') if 'CadCraft_Wall' in element.get_psets(w)]
 assert len(walls)==(1 if name=='ifc2x3.ifc' else 2)
 roots=[e.GlobalId for e in f.by_type('IfcRoot')];assert len(roots)==len(set(roots))
 physical=[(w.GlobalId,[e.to_string() for e in f.traverse(w.Representation)],[e.to_string() for e in f.traverse(w.ObjectPlacement)],element.get_psets(w)['CadCraft_Wall']) for w in walls]
 if name=='seed.ifc':base=physical
 if name=='styled.ifc':assert physical==base,'style edit resized model'
 for t in f.by_type('IfcWallType'):
  ps=element.get_psets(t)
  if 'CadCraft_WallType' not in ps:continue
  recipe=json.loads(ps['CadCraft_WallType']['Recipe']);rs=recipe['layers']
  layers=t.HasAssociations[0].RelatingMaterial.MaterialLayers
  assert any(r['t']==0 for r in rs) and any(r.get('core') for r in rs)
  exported=[r for r in rs if f.schema!='IFC2X3' or r['t']>0]
  assert len(layers)==len(exported)
  for l,r in zip(layers,exported):
   assert abs(l.LayerThickness-r['t'])<.005
   if r['kind']=='cavity':assert l.Material is None and l.IsVentilated is True
   if not r['t']:assert l.Material is not None and l.LayerThickness==0
 project=element.get_psets(f.by_type('IfcProject')[0])['CadCraft_ProjectedViews']
 for key,raw in project.items():
  if key=='id':continue
  v=json.loads(raw);assert v['version']==1 and v['detail']=='fine'
  if key.startswith('section:'):assert f.by_guid(key[8:]).is_a('IfcAnnotation')
 if name=='edited.ifc':
  ps=element.get_psets(walls[0])['CadCraft_Wall'];assert abs(ps['Height']-3150)<.005
  windows=f.by_type('IfcWindow');p=element.get_psets(windows[0])['CadCraft_Window'];assert abs(p['Width']-1600)<.005
 print(json.dumps(dict(file=name,schema=f.schema,schemaFindings=0,authoredWalls=len(walls),stableIdentities=True,cavitiesBlank=True,membranesZero=True)))
