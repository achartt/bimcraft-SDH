# SPDX-License-Identifier: Apache-2.0
"""Black-box IFC4 fixture acceptance; no BimCraft reader or geometry code is imported.

python -I tests/features/f01/independent.py fixtures/f01 [.cc-test/f01-generated]
Requires requirements-independent.txt. Any unavailable dependency or failed assertion fails.
"""
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.element
import ifcopenshell.util.unit
import ifcopenshell.validate

ROOT = Path(__file__).resolve().parents[3]
WRAPPER = ROOT / 'tests/tools/bimcraft-test/ifc_validate.py'
spec = importlib.util.spec_from_file_location('schema_wrapper', WRAPPER)
wrapper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wrapper)


def near(actual, expected):
    assert math.isclose(actual, expected, abs_tol=1e-6), (actual, expected)


def psets(entity):
    return ifcopenshell.util.element.get_psets(entity)


def validate(path):
    logger = ifcopenshell.validate.json_logger()
    ifcopenshell.validate.validate(str(path), logger, express_rules=True)
    # Keep *all* diagnostics in the output. Acceptance is stricter than error counting.
    print(json.dumps({'file': str(path), 'schema_findings': logger.statements}, default=str))
    assert not logger.statements, f'{path}: schema/EXPRESS diagnostics'
    return ifcopenshell.open(str(path))


def check_set(directory):
    models, reports, specs, materials, core_lines = {}, {}, {}, {}, {}
    for name, thickness, wall_count, window_count in [
        ('house', 209.55, 5, 1), ('edited-reopened', 241.3, 5, 1), ('missing-host', 241.3, 4, 0)
    ]:
        path = directory / (name + '.ifc')
        f = models[name] = validate(path)
        assert f.schema == 'IFC4'
        near(ifcopenshell.util.unit.calculate_unit_scale(f), .001)
        walls, windows = f.by_type('IfcWall'), f.by_type('IfcWindow')
        assert len(walls) == wall_count
        assert len(windows) == window_count
        assert len(f.by_type('IfcOpeningElement')) == window_count
        assert len(f.by_type('IfcWallType')) == 2
        recipes = {}
        for entity in f.by_type('IfcWallType'):
            props = psets(entity)['CadCraft_WallType']
            recipe = json.loads(props['Recipe'])
            recipes[props['Key']] = recipe
            near(sum(layer['t'] for layer in recipe['layers']), props['Thickness'])
            associations = [r.RelatingMaterial for r in entity.HasAssociations if r.is_a('IfcRelAssociatesMaterial')]
            assert len(associations) == 1 and associations[0].is_a('IfcMaterialLayerSet')
            physical = associations[0].MaterialLayers
            assert len(physical) == len(recipe['layers'])
            for layer, record in zip(physical, recipe['layers']):
                near(layer.LayerThickness, record['t'])
                if record['kind'] == 'cavity':
                    assert layer.Material is None and layer.IsVentilated is True
                else:
                    assert layer.Material is not None
        ext, interior = recipes['wall-f01-exterior']['layers'], recipes['wall-f01-interior']['layers']
        near(sum(l['t'] for l in ext), thickness)
        near(sum(l['t'] for l in ext if l['core']), 139.7)
        near(sum(l['t'] for l in interior), 114.3)
        near(sum(l['t'] for l in interior if l['core']), 88.9)
        assert ext[1]['kind'] == 'cavity' and ext[1]['ventilation'] == 'ventilated'
        near(ext[1]['t'], 25.4)
        assert ext[2]['function'] == 'membrane' and ext[2]['t'] == 0
        library = json.loads(psets(f.by_type('IfcProject')[0])['CadCraft_MaterialLibrary']['Library'])
        materials[name] = {m['id'] for m in library['materials']}
        studs = next(m for m in library['materials'] if m['id'] == 'material-studs')
        near(studs['defaultThickness'], 139.7 if name == 'house' else 200)
        for relation in f.by_type('IfcRelDefinesByType'):
            ids = [obj.id() for obj in relation.RelatedObjects]
            assert len(ids) == len(set(ids)), 'duplicate type membership'
        for wall in walls:
            assert len(wall.IsTypedBy) == 1
        dimensions = f.by_type('IfcAnnotation')
        assert len(dimensions) == 2
        specs[name] = {}
        for dim in dimensions:
            props = psets(dim)['CadCraft_WallDimension']
            reference = json.loads(props['Spec'])
            specs[name][dim.GlobalId] = reference
            if name == 'missing-host':
                assert props['Status'] == 'missing' and dim.Representation is None
                assert any(r['wall'] not in {w.GlobalId for w in walls} for r in reference['refs'])
            else:
                assert props['Status'] == 'ok'
                geometry = json.loads(props['Geometry'])
                expected = thickness if reference['refs'][0]['reference'] == 'exterior' else 139.7
                near(math.dist(geometry[0], geometry[1]), expected)
                sets = [item for rep in dim.Representation.Representations for item in rep.Items]
                assert len(sets) == 1 and sets[0].is_a('IfcGeometricCurveSet')
                curves = sets[0].Elements
                assert len(curves) == 3 and all(c.is_a('IfcPolyline') for c in curves)
                # The rendered dimension line itself, independently read from standard IFC.
                measured = [c for c in curves if c.Points[0].Coordinates[0] == c.Points[1].Coordinates[0]]
                assert len(measured) == 1
                near(math.dist(measured[0].Points[0].Coordinates, measured[0].Points[1].Coordinates), expected)
                if reference['refs'][0]['reference'] == 'coreExterior':
                    # The joined endpoint/station may slide along X; core faces stay at the same Y.
                    core_lines[name] = [p.Coordinates[1] for p in measured[0].Points]
        settings = ifcopenshell.geom.settings()
        settings.set('use-world-coords', True)
        meshes = []
        for obj in walls + windows:
            # Walls also have an Axis representation; request the Body explicitly.
            body = next(r for r in obj.Representation.Representations if r.RepresentationIdentifier == 'Body')
            shape = ifcopenshell.geom.create_shape(settings, obj, body)
            coords, faces = shape.geometry.verts, shape.geometry.faces
            assert coords and faces and len(coords) % 3 == len(faces) % 3 == 0
            assert all(math.isfinite(v) for v in coords)
            assert all(0 <= i < len(coords) // 3 for i in faces)
            bounds = [[min(coords[i::3]), max(coords[i::3])] for i in range(3)]
            assert all(b > a for a, b in bounds)
            near(bounds[2][1] - bounds[2][0], 2.7 if obj.is_a('IfcWall') else 1.2)
            if obj.is_a('IfcWindow'):
                near(bounds[0][1] - bounds[0][0], .9)
                near(bounds[2][0], .9)
                assert len(obj.FillsVoids) == 1
            else:
                props = psets(obj)['CadCraft_Wall']
                expected_width = thickness if props['TypeKey'] == 'wall-f01-exterior' else 114.3
                near(min(b-a for a,b in bounds[:2]), expected_width / 1000)
                if obj.HasOpenings:
                    assert len(obj.HasOpenings) == 1 and len(faces) // 3 > 12
            meshes.append({'guid': obj.GlobalId, 'class': obj.is_a(), 'triangles': len(faces)//3, 'bounds_m': bounds})
        reports[name] = {'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'walls': wall_count, 'windows': window_count, 'dimensions': 2, 'meshes': meshes}
    for cls in ['IfcWall', 'IfcWallType', 'IfcWindow', 'IfcAnnotation', 'IfcOpeningElement']:
        ids = lambda name: {x.GlobalId for x in models[name].by_type(cls)}
        assert ids('house') == ids('edited-reopened'), (cls, 'identity changed')
        assert ids('missing-host') <= ids('house'), (cls, 'replacement identity')
    assert specs['house'] == specs['edited-reopened'] == specs['missing-host']
    assert materials['house'] == materials['edited-reopened'] == materials['missing-host']
    for original, edited in zip(core_lines['house'], core_lines['edited-reopened']):
        near(original, edited)
    print(json.dumps({'directory': str(directory), 'status': 'PASS', 'fixtures': reports}))


def check_failure_detection(seed):
    for level in ['error', 'ERROR', 'critical', 40, 50, None, 'unknown']:
        assert wrapper.is_error({'level': level}), level
    for level in ['warning', 'WARNING', 'info', 'debug', 10, 20, 30]:
        assert not wrapper.is_error({'level': level}), level
    with tempfile.TemporaryDirectory(prefix='f01-invalid-') as temporary:
        # Real malformed exports, not mocked validator responses. Each must fail the CLI.
        source = seed.read_text()
        invalid_type = source.replace("IFCMATERIALPROPERTIES('CadCraft_Material'", "IFCMATERIALPROPERTIES(IFCLABEL('CadCraft_Material')")
        assert invalid_type != source
        variants = {'material-name-type': invalid_type}
        f = ifcopenshell.open(str(seed))
        f.by_type('IfcOwnerHistory')[0].LastModifiedDate = None
        variants['owner-history-rule'] = f.to_string()
        f = ifcopenshell.open(str(seed))
        relation = f.by_type('IfcRelDefinesByType')[0]
        relation.RelatedObjects = (*relation.RelatedObjects, relation.RelatedObjects[0])
        variants['duplicate-type-membership'] = f.to_string()
        for name, content in variants.items():
            path = Path(temporary) / (name + '.ifc')
            path.write_text(content)
            result = subprocess.run([sys.executable, '-I', str(WRAPPER), '--rules', str(path)], capture_output=True, text=True)
            assert result.returncode == 1, (name, result.stdout, result.stderr)
            report = json.loads(result.stdout)
            assert report['errors'] > 0
            print(json.dumps({'negative_control': name, 'exit_code': result.returncode, 'errors': report['errors'], 'status': 'PASS'}))


if __name__ == '__main__':
    directories = [Path(p) for p in sys.argv[1:]] or [ROOT / 'fixtures/f01']
    print(json.dumps({'python': sys.version.split()[0], 'ifcopenshell': ifcopenshell.version, 'express_rules': True}))
    for directory in directories:
        check_set(directory)
    check_failure_detection(directories[0] / 'house.ifc')
    print(json.dumps({'status': 'PASS', 'fixture_sets': len(directories), 'negative_controls': 3}))
