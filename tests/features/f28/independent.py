# SPDX-License-Identifier: Apache-2.0
"""Read the actual browser download with IfcOpenShell, independently of app modules."""
import json,sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f28-browser')
expected=json.loads((root/'expected.json').read_text());target=root/'saved.ifc'
logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(target),logger,express_rules=True)
assert not logger.statements,logger.statements
f=ifcopenshell.open(str(target));ids=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(ids)==len(set(ids))
for wall in expected['walls']:
    obj=f.by_guid(wall['guid']);assert obj.is_a('IfcWall')
    p=element.get_psets(obj)['CadCraft_Wall'];assert p['TypeKey']==wall['typeKey']
    assert abs(p['BaseOffset']-wall['baseOffset'])<.005
    if not wall.get('topLevel'):assert abs(p['Height']-wall['height'])<.005
for guid,refs,resolved in expected['stable']['dims']:
    d=f.by_guid(guid);assert d.is_a('IfcAnnotation')
    payload=json.loads(element.get_psets(d)['CadCraft_WallDimension']['Spec'])
    assert payload['refs']==refs
    for ref in refs:assert f.by_guid(ref['wall']).is_a('IfcWall')
print(json.dumps({'schemaFindings':len(logger.statements),'walls':len(expected['walls']),'persistentDimensions':len(expected['stable']['dims']),'actualDownload':str(target)}))
