# SPDX-License-Identifier: Apache-2.0
"""F04 style/view property changes must preserve physical IFC and identities."""
import json, sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
output=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f04')
files=['fixtures/f04/layered-plans.ifc',str(output/'styled-reopened.ifc'),str(output/'fine-reopened.ifc')]
base=None
for path in files:
    log=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(path,log,express_rules=True)
    assert not log.statements,(path,log.statements)
    f=ifcopenshell.open(path);walls=f.by_type('IfcWall');assert len(walls)==9
    roots=[e.GlobalId for e in f.by_type('IfcRoot')];assert len(roots)==len(set(roots))
    assert len(f.by_type('IfcOpeningElement'))==5
    data={'walls':[(w.GlobalId,[e.to_string() for e in f.traverse(w.Representation)],[e.to_string() for e in f.traverse(w.ObjectPlacement)],element.get_psets(w)['CadCraft_Wall']) for w in walls],
          'types':[(t.GlobalId,element.get_psets(t)['CadCraft_WallType']['Recipe']) for t in f.by_type('IfcWallType')],
          'dimensions':[(d.GlobalId,element.get_psets(d)['CadCraft_WallDimension']['Spec']) for d in f.by_type('IfcAnnotation') if 'CadCraft_WallDimension' in element.get_psets(d)]}
    if base is None:base=data
    else:assert data==base,'model contract changed during style/view edits'
    for t in f.by_type('IfcWallType'):
        recipe=json.loads(element.get_psets(t)['CadCraft_WallType']['Recipe'])
        layers=t.HasAssociations[0].RelatingMaterial.MaterialLayers
        assert len(layers)==len(recipe['layers'])
        for l,r in zip(layers,recipe['layers']):
            assert abs(l.LayerThickness-r['t'])<.005
            if r['kind']=='cavity':assert l.Material is None and l.IsVentilated is True
            if r['t']==0:assert l.LayerThickness==0 and l.Material is not None
    if path.endswith('fine-reopened.ifc'):
        ps=element.get_psets(f.by_type('IfcBuildingStorey')[0]);assert ps['CadCraft_PlanView']['Detail']=='fine';assert ps['CadCraft_CeilingPlan']['Detail']=='medium'
    print(json.dumps({'file':path,'schemaFindings':0,'walls':9,'openings':5,'modelDataIdentical':True,'membranesZero':True,'cavitiesVentilatedUnfilled':True}))
