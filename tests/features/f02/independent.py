# SPDX-License-Identifier: Apache-2.0
"""Black-box IFC unit, geometry, reference and identity checks; no app code imported."""
import json, math
from pathlib import Path
import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.validate
import ifcopenshell.util.element as element
import ifcopenshell.util.unit as unit
import ifcopenshell.util.placement as placement
cases=json.loads(Path('fixtures/f02/cases.json').read_text())
reports=[]
def near(a,b):
    error=abs(a-b)
    assert error < .005, (a,b,error)
    return error
def point(c,i,ref,station,delta):
    x,y=c['origin']; y+=i*10000
    total=19.123456+25.4+139.7+12.7; outer=19.123456+25.4
    off={'exterior':total/2,'interior':-total/2,'center':0,'coreExterior':total/2-outer,'coreInterior':total/2-outer-139.7,'coreCenter':total/2-outer-139.7/2}[ref]
    off+=delta if ref=='exterior' else delta/2 if ref=='center' else 0
    bg=[0,.25,-.25][i]
    if not bg: return [x+5000*station,y+off]
    theta=4*math.atan(bg); radius=5000*(1+bg*bg)/(4*abs(bg)); cx=x+2500;cy=y+5000*(1-bg*bg)/(4*bg)
    angle=math.atan2(y-cy,x-cx)+theta*station
    radius-=off*(1 if bg>0 else -1)
    return [cx+radius*math.cos(angle),cy+radius*math.sin(angle)]
def check(c,folder,delta):
    p=Path(folder)/(c['name']+'.ifc'); log=ifcopenshell.validate.json_logger()
    ifcopenshell.validate.validate(str(p),log,express_rules=True)
    assert not log.statements,(str(p),log.statements)
    f=ifcopenshell.open(str(p)); scale=unit.calculate_unit_scale(f)*1000
    assert abs(scale-c['unitMm'])<1e-9
    walls=f.by_type('IfcWall'); dims=f.by_type('IfcAnnotation'); assert len(walls)==3 and len(dims)==18
    guids=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(guids)==len(set(guids))
    library=json.loads(element.get_psets(f.by_type('IfcProject')[0])['CadCraft_MaterialLibrary']['Library'])
    ty=f.by_type('IfcWallType')[0]; recipe=json.loads(element.get_psets(ty)['CadCraft_WallType']['Recipe'])
    layers=recipe['layers'];assert layers[1]['t']==25.4 and layers[1]['ventilation']=='ventilated' and layers[2]['t']==0
    physical=ty.HasAssociations[0].RelatingMaterial.MaterialLayers
    assert len(physical)==5 and physical[1].Material is None and physical[1].IsVentilated is True and physical[2].LayerThickness==0
    for a,b in zip(physical,layers):near(a.LayerThickness*scale,b['t'])
    max_point=max_dim=max_shape=0
    for i,w in enumerate(walls):
        ps=element.get_psets(w)['CadCraft_Wall'];near(ps['Thickness']*scale,196.923456+delta)
        body=next(r for r in w.Representation.Representations if r.RepresentationIdentifier=='Body')
        shape=ifcopenshell.geom.create_shape(ifcopenshell.geom.settings(),w,body)
        verts=list(shape.geometry.verts);assert verts and all(math.isfinite(v) for v in verts)
        max_shape=max(max_shape,near((max(verts[2::3])-min(verts[2::3]))*1000,2700.123456))
        if i==0:max_shape=max(max_shape,near((max(verts[1::3])-min(verts[1::3]))*1000,196.923456+delta))
        matrix=placement.get_local_placement(w.ObjectPlacement)
        expected=point(c,i,'center',0,delta)
        for j in range(2):max_point=max(max_point,near(matrix[j,3]*scale,expected[j]+c['project'][j]))
        axis=next(r for r in w.Representation.Representations if r.RepresentationIdentifier=='Axis').Items[0]
        if i:
            max_shape=max(max_shape,near(axis.BasisCurve.Radius*scale,5312.5-([0,1,-1][i])*delta/2))
    for d in dims:
        spec=json.loads(element.get_psets(d)['CadCraft_WallDimension']['Spec']);refs=spec['refs'];i=next(i for i,w in enumerate(walls) if w.GlobalId==refs[0]['wall'])
        a,b=[point(c,i,r['reference'],r['station'],delta) for r in refs]
        expected=math.dist(a,b);curves=d.Representation.Representations[0].Items[0].Elements
        pts=[[v*scale for v in p.Coordinates] for p in curves[0].Points]
        max_dim=max(max_dim,near(math.dist(*pts),expected))
        for curve,expected_point in zip(curves[1:],[a,b]):
            pt=[v*scale for v in curve.Points[0].Coordinates]
            max_point=max(max_point,math.dist(pt,expected_point));assert math.dist(pt,expected_point)<.005
    report={'file':str(p),'schemaFindings':0,'walls':3,'dimensions':18,'maxPointMm':max_point,'maxDimensionMm':max_dim,'maxShapeMm':max_shape}
    print(json.dumps(report)); reports.append(report)
    return {'walls':[w.GlobalId for w in walls],'types':[ty.GlobalId],'dimensions':[d.GlobalId for d in dims],'materials':[m['id'] for m in library['materials']]}
for c in cases:
    assert check(c,'fixtures/f02',0)==check(c,'.cc-test/f02',.12345)
print(json.dumps({'files':len(reports),'maxPointMm':max(r['maxPointMm'] for r in reports),'maxDimensionMm':max(r['maxDimensionMm'] for r in reports),'maxShapeMm':max(r['maxShapeMm'] for r in reports)}))
