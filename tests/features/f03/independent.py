# SPDX-License-Identifier: Apache-2.0
"""Optional black-box acceptance of F03 fixture and timed edit exports. No app imports."""
import json, math
from pathlib import Path
import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.validate
import ifcopenshell.util.element as element
import ifcopenshell.util.unit as unit
manifest=json.loads(Path('.cc-test/f03/fixtures/manifest.json').read_text())
for size,info in manifest['fixtures'].items():
    seed=None
    for kind in ['seed','wall-edit','type-edit','roof-regeneration']:
        path=Path('.cc-test/f03/fixtures' if kind=='seed' else '.cc-test/f03/exports')/(size+('' if kind=='seed' else '-'+kind)+'.ifc')
        log=ifcopenshell.validate.json_logger()
        ifcopenshell.validate.validate(str(path),log,express_rules=True)
        assert not log.statements,(str(path),log.statements)
        f=ifcopenshell.open(str(path));scale=unit.calculate_unit_scale(f)*1000
        walls=f.by_type('IfcWall');dims=f.by_type('IfcAnnotation');roofs=f.by_type('IfcRoof');windows=f.by_type('IfcWindow')
        assert (len(walls),len(dims),len(roofs),len(windows))==(info['walls'],info['dimensions'],1,info['openings'])
        roots=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(roots)==len(set(roots))
        identities={k:[x.GlobalId for x in v] for k,v in [('walls',walls),('dimensions',dims),('roofs',roofs),('windows',windows)]}
        if seed is None:seed=identities
        else:assert identities==seed
        ty=f.by_type('IfcWallType')[0];recipe=json.loads(element.get_psets(ty)['CadCraft_WallType']['Recipe']);layers=recipe['layers'];physical=ty.HasAssociations[0].RelatingMaterial.MaterialLayers
        assert layers[1]['t']==25.4 and layers[2]['t']==0 and physical[1].Material is None and physical[2].LayerThickness==0
        thickness=sum(x['t'] for x in layers);expected=196.923456+(.12345 if kind=='type-edit' else 0)
        assert abs(thickness-expected)<.005
        max_error=0
        for i,w in enumerate(walls):
            body=next(r for r in w.Representation.Representations if r.RepresentationIdentifier=='Body')
            shape=ifcopenshell.geom.create_shape(ifcopenshell.geom.settings(),w,body)
            verts=shape.geometry.verts;assert verts and all(math.isfinite(v) for v in verts)
            height=(max(verts[2::3])-min(verts[2::3]))*1000
            error=abs(height-(2800.123456 if kind=='wall-edit' and i==0 else 2700.123456));max_error=max(max_error,error);assert error<.005
            for a,b in zip(physical,layers):assert abs(a.LayerThickness*scale-b['t'])<.005
        for d in dims:
            spec=json.loads(element.get_psets(d)['CadCraft_WallDimension']['Spec']);assert all(r['wall'] in identities['walls'] for r in spec['refs'])
            curves=d.Representation.Representations[0].Items[0].Elements
            pts=[[v*scale for v in p.Coordinates] for p in curves[0].Points];error=abs(math.dist(*pts)-thickness);max_error=max(max_error,error);assert error<.005
        print(json.dumps({'file':str(path),'schemaFindings':0,'walls':len(walls),'dimensions':len(dims),'maxHeightOrDimensionErrorMm':max_error}))
