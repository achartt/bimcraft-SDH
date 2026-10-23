# SPDX-License-Identifier: Apache-2.0
"""Read IFC, CSV and PDF independently, without importing application code."""
import csv,json,sys,io
from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f06')
browser=(root/'saved.ifc').exists()
for name in (['saved.ifc'] if browser else ['seed.ifc','styled.ifc','edited.ifc','ifc2x3.ifc']):
 path=root/name;logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(path),logger,express_rules=True);assert not logger.statements,(name,logger.statements)
 f=ifcopenshell.open(str(path));guids=[r.GlobalId for r in f.by_type('IfcRoot')];assert len(guids)==len(set(guids))
 recipes=[]
 for t in f.by_type('IfcWallType'):
  ps=element.get_psets(t).get('CadCraft_WallType');
  if not ps or 'Recipe' not in ps:continue
  r=json.loads(ps['Recipe']);recipes.append(r);layers=t.HasAssociations[0].RelatingMaterial.MaterialLayers;physical=[l for l in r['layers'] if f.schema!='IFC2X3' or l['t']>0];assert len(layers)==len(physical)
  for raw,layer in zip(physical,layers):
   assert abs(raw['t']-layer.LayerThickness)<.000001
   if raw['kind']=='cavity':assert layer.Material is None
   if raw['t']==0:assert raw['function']=='membrane' and layer.LayerThickness==0
 assert len(recipes)==2
 if browser:
  rows=list(csv.DictReader(io.StringIO((root/'edited-assemblies.csv').read_text(encoding='utf-8-sig'),newline='')));sr=[r for r in rows if r['record_kind']=='layer'];assert len(sr)==12
  mats=json.loads(element.get_psets(f.by_type('IfcProject')[0])['CadCraft_MaterialLibrary']['Library'])['materials'];by_id={m['id']:m for m in mats}
  for r in recipes:
   actual=[x for x in sr if x['type_key']==r['key']];assert len(actual)==len(r['layers'])
   for i,(a,l) in enumerate(zip(actual,r['layers'])):
    assert int(a['layer_exterior_to_interior'])==i+1 and float(a['nominal_thickness_mm'])==l['t'] and a['core']==str(l['core']).lower()
    if l['kind']!='cavity':assert a['material_id']==l['materialId'] and a['material_name']==by_id[l['materialId']]['name']
   summary=next(x for x in rows if x['record_kind']=='assembly-summary' and x['type_key']==r['key']);assert abs(float(summary['total_thickness_mm'])-sum(l['t'] for l in r['layers']))<1e-10;assert abs(float(summary['core_thickness_mm'])-sum(l['t'] for l in r['layers'] if l['core']))<1e-10
  sheets=element.get_psets(f.by_type('IfcProject')[0])['CadCraft_Sheets'];assert any('f06-materials:1' in v for k,v in sheets.items() if isinstance(v,str))
 print(json.dumps(dict(file=name,schemaFindings=0,types=len(recipes),membranes=3,cavityWidths=[25.4,38.1],csvComparedToAuthoritativeRecords=browser)))
for path in sorted(root.glob('*.pdf')):
 reader=PdfReader(path);texts=[];min_font=100;dashed=0
 for p in reader.pages:
  assert not p.get('/Resources',{}).get('/XObject'),'Raster XObjects present'
  texts.append(p.extract_text())
  for args,op in ContentStream(p.get_contents(),reader).operations:
   if op==b'Tf':min_font=min(min_font,float(args[1]))
   if op==b'd' and args[0]:dashed+=1
 assert min_font>=6, (path,min_font)
 text=' '.join(texts)
 if path.name in ['documentation.pdf','drawing-set.pdf']:
  assert 'ventilated' in text and 'unventilated' in text and 'Membrane' in text and 'Non-core' in text and '127 mm' in text
 if path.name=='edited-assembly-sheet.pdf':assert 'Revised rainscreen' in text and '216 mm' in text and 'Air cavity' in text and 'material-f06-a' in text
 if 'legend' in path.name:assert 'material-f06-a' in text and 'material-f06-b' in text
 print(json.dumps(dict(file=path.name,pages=len(reader.pages),minFontPt=min_font,vectorOnly=True,dashedPaths=dashed)))
# Original CSV contains the duplicate names with comma, quotes, actual LF and accent.
rows=list(csv.DictReader(io.StringIO((root/'assemblies.csv').read_text(encoding='utf-8-sig'),newline='')))
ls=[r for r in rows if r['record_kind']=='layer'];assert len(ls)==12
assert len([r for r in ls if r['material_name']=='Same finish, "reviewed"\nBoard - café'])==2
assert [float(r['nominal_thickness_mm']) for r in ls if r['membrane']=='true']==[0,0,0]
print(json.dumps(dict(csvRows=len(rows),layerRows=12,escaping=True)))
