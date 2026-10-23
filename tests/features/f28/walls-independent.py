# SPDX-License-Identifier: Apache-2.0
"""Validate the browser's actual IFC/CSV/PDF bytes using independent readers."""
import csv,io,json,sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
from pypdf import PdfReader
from pypdf.generic import ContentStream
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f28-b-browser')
expected=json.loads((root/'expected.json').read_text());target=root/'saved.ifc'
logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(target),logger,express_rules=True)
assert not logger.statements,logger.statements
f=ifcopenshell.open(str(target));guids=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(guids)==len(set(guids))
near=lambda a,b:abs(a-b)<.005
for wall in expected['walls']:
 obj=f.by_guid(wall['guid']);assert obj.is_a('IfcWall')
 p=element.get_psets(obj)['CadCraft_Wall'];assert p['TypeKey']==wall['typeKey'];assert near(p['BaseOffset'],wall['baseOffset']);assert p['ExteriorSide']==wall['extSide']
 assert p.get('Justification','center')==wall['justification']
 if not wall.get('topLevel'):assert near(p['Height'],wall['height'])
 assert element.get_type(obj).GlobalId==wall['assembly']['guid']
library=json.loads(element.get_psets(f.by_type('IfcProject')[0])['CadCraft_MaterialLibrary']['Library']);by_id={m['id']:m for m in library['materials']}
for material in expected['materials']:
 assert by_id[material['id']]==material
rows=list(csv.DictReader(io.StringIO((root/'assemblies.csv').read_text(encoding='utf-8-sig'),newline='')))
for recipe in expected['assemblies']:
 ty=f.by_guid(recipe['guid']);payload=json.loads(element.get_psets(ty)['CadCraft_WallType']['Recipe'])
 assert payload['key']==recipe['key'] and payload['name']==recipe['name'];assert payload['layers']==recipe['layers']
 physical=ty.HasAssociations[0].RelatingMaterial.MaterialLayers;assert len(physical)==len(recipe['layers'])
 actual=[r for r in rows if r['record_kind']=='layer' and r['type_key']==recipe['key']];assert len(actual)==len(recipe['layers'])
 for i,(layer,ifc_layer,row) in enumerate(zip(recipe['layers'],physical,actual)):
  assert near(ifc_layer.LayerThickness,layer['t']);assert int(row['layer_exterior_to_interior'])==i+1;assert near(float(row['nominal_thickness_mm']),layer['t']);assert row['core']==str(layer['core']).lower()
  if layer['kind']=='cavity':assert ifc_layer.Material is None and row['cavity_ventilation']==layer['ventilation']
  if layer['t']==0:assert layer['function']=='membrane' and ifc_layer.LayerThickness==0
for guid,refs,resolved in expected['dims']:
 obj=f.by_guid(guid);payload=json.loads(element.get_psets(obj)['CadCraft_WallDimension']['Spec']);assert payload['refs']==refs
 for ref in refs:assert f.by_guid(ref['wall']).is_a('IfcWall')
 assert resolved['status']=='ok'
reader=PdfReader(root/'plan.pdf');assert len(reader.pages)>0;paths=0
for page in reader.pages:
 assert not page.get('/Resources',{}).get('/XObject'),'Unexpected raster XObjects'
 for args,operator in ContentStream(page.get_contents(),reader).operations:
  if operator in [b'm',b'l',b'c']:paths+=1
assert paths>50
print(json.dumps({'schemaFindings':0,'walls':len(expected['walls']),'types':len(expected['assemblies']),'persistentDimensions':len(expected['dims']),'csvLayers':len([r for r in rows if r['record_kind']=='layer']),'vectorPDFPages':len(reader.pages),'vectorPaths':paths,'actualDownload':str(target)}))
