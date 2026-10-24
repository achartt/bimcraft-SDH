# SPDX-License-Identifier: Apache-2.0
"""Independent readers of the actual F28-C browser downloads; no application geometry code."""
import csv,io,json,sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
from pypdf import PdfReader
from pypdf.generic import ContentStream
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f28-c-browser')
expected=json.loads((root/'expected.json').read_text());target=root/'saved.ifc'
logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(target),logger,express_rules=True)
assert not logger.statements,logger.statements
f=ifcopenshell.open(str(target));guids=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(guids)==len(set(guids))
near=lambda a,b:abs(a-b)<.005
for wall in expected['walls']:
 obj=f.by_guid(wall['guid']);p=element.get_psets(obj)['CadCraft_Wall'];assert p['TypeKey']==wall['typeKey'];assert near(p['Height'],wall['height']);assert near(p['BaseOffset'],wall['baseOffset']);assert element.get_type(obj).GlobalId==wall['assembly']['guid']
rows=list(csv.DictReader(io.StringIO((root/'assemblies.csv').read_text(encoding='utf-8-sig'),newline='')))
for recipe in expected['assemblies']:
 ty=f.by_guid(recipe['guid']);payload=json.loads(element.get_psets(ty)['CadCraft_WallType']['Recipe']);assert payload['key']==recipe['key'];assert payload['layers']==recipe['layers']
 physical=ty.HasAssociations[0].RelatingMaterial.MaterialLayers
 actual=[r for r in rows if r['record_kind']=='layer' and r['type_key']==recipe['key']];assert len(actual)==len(recipe['layers'])==len(physical)
 for i,(layer,ifc_layer,row) in enumerate(zip(recipe['layers'],physical,actual)):
  assert near(ifc_layer.LayerThickness,layer['t']);assert int(row['layer_exterior_to_interior'])==i+1;assert near(float(row['nominal_thickness_mm']),layer['t']);assert row['core']==str(layer['core']).lower()
  if layer['kind']=='cavity':assert ifc_layer.Material is None and row['cavity_ventilation']==layer['ventilation']
  if layer['t']==0:assert layer['function']=='membrane' and ifc_layer.LayerThickness==0
for guid,refs,resolved in expected['dims']:
 assert json.loads(element.get_psets(f.by_guid(guid))['CadCraft_WallDimension']['Spec'])['refs']==refs;assert resolved['status']=='ok'
 for ref in refs:assert f.by_guid(ref['wall']).is_a('IfcWall')
for d in expected['drafting']:
 p=element.get_psets(f.by_guid(d['guid']))['CadCraft_Drafting'];assert p['View']==d['view'];assert p['Kind']==d['kind'];assert p['Pattern']==d['pattern'];assert near(p['PatternScale'],d['scale'])
project=element.get_psets(f.by_type('IfcProject')[0]);sheets=project['CadCraft_Sheets']
for s in expected['sheets']:
 stored=json.loads(sheets[s['id']]);assert stored['views']==s['views'];assert stored['number']==s['number']
 for v in s['views']:
  if v['kind']=='section':assert f.by_guid(v['ref']).is_a('IfcAnnotation')
assert any(v['ref']=='f06-assemblies:2' for s in expected['sheets'] for v in s['views'])
for guid,v in expected['projected']:assert json.loads(project['CadCraft_ProjectedViews']['section:'+guid])==v
legend=list(csv.DictReader(io.StringIO((root/'legend.csv').read_text(encoding='utf-8-sig'),newline='')));assert any(r['symbol_kind']=='cavity' for r in legend)
reports=[];PT=72/25.4
for filename in ['section.pdf','edited-section.pdf','elevation.pdf','assemblies.pdf','legend.pdf']:
 reader=PdfReader(root/filename);paths=0
 for page in reader.pages:
  assert not page.get('/Resources',{}).get('/XObject'),'Unexpected raster XObjects'
  paths+=sum(op in [b'm',b'l',b'c'] for args,op in ContentStream(page.get_contents(),reader).operations)
 assert paths>50;reports.append({'file':filename,'pages':len(reader.pages),'vectorPaths':paths,'rasterImages':0})
 # Independently measure actual section material bands and blank cavity at the persisted 1:20 scale.
 if filename in ['section.pdf','edited-section.pdf']:
  color=stroke=None;polys=[];poly=[];fills=[];membranes=[];dash=[]
  for args,op in ContentStream(reader.pages[0].get_contents(),reader).operations:
   if op==b'rg':color=tuple(map(float,args))
   if op==b'g':color=None
   if op==b'RG':stroke=tuple(map(float,args))
   if op==b'G':stroke=None
   if op==b'd':dash=list(map(float,args[0]))
   if op==b'm':poly=[tuple(map(float,args))];polys.append(poly)
   if op==b'l':poly.append(tuple(map(float,args)))
   if op in [b'f',b'f*']:
    if color:fills.extend((color,p) for p in polys)
    polys=[];poly=[]
   if op==b'S':
    if stroke and abs(stroke[0]-163/255)<1e-6 and dash:membranes.extend(polys)
    polys=[];poly=[]
   if op==b'n':polys=[];poly=[]
  first=[fills[i*2][1] for i in range(4)];widths=[25.4 if filename.startswith('edited') else 19.05,12.7,139.7,12.7]
  errors=[]
  for p,w in zip(first,widths):errors.append(abs((max(x for x,y in p)-min(x for x,y in p))/PT*20-w))
  assert max(errors)<.005,(filename,errors)
  cavity=(min(x for x,y in first[1])-max(x for x,y in first[0]))/PT*20;assert near(cavity,25.4)
  assert membranes and all(max(x for x,y in p)-min(x for x,y in p)<1e-8 for p in membranes)
  reports[-1].update(maxLayerErrorMm=max(errors),cavityMm=cavity,membranePaths=len(membranes))
report={'schemaFindings':0,'walls':len(expected['walls']),'types':len(expected['assemblies']),'persistentDimensions':len(expected['dims']),'annotations':len(expected['drafting']),'sheets':len(expected['sheets']),'csvLayers':len([r for r in rows if r['record_kind']=='layer']),'legendRows':len(legend),'pdfs':reports,'actualDownload':str(target)}
(root/'independent.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
