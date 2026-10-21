# SPDX-License-Identifier: Apache-2.0
"""Validate IFC files against their schema with IfcOpenShell (0.5 track BM tests).

    <venv>/bin/python -I tools/bimcraft-test/ifc_validate.py file.ifc [file.ifc …]

Prints one JSON line per file: {"file", "schema", "errors": n, "first": [up to 8 messages]}. Exit code 1 when any file has
errors. Used by tools/bimcraft-test/model-test.mjs when a venv with ifcopenshell is on this machine (DetailCraft's).
"""
import json
import logging
import sys
import argparse

import ifcopenshell
import ifcopenshell.validate


def is_error(statement):
    # json_logger emits lowercase strings; older callers may use logging levels.
    level = statement.get('level')
    if isinstance(level, int):
        return level >= logging.ERROR
    # Unknown/missing severities must not silently turn findings into passes.
    return str(level).upper() not in ('DEBUG', 'INFO', 'WARNING')


def main(paths, rules=False):
    bad = 0
    for p in paths:
        logger = ifcopenshell.validate.json_logger()
        # Passing the path also captures parser diagnostics, unlike a pre-opened model.
        ifcopenshell.validate.validate(p, logger, express_rules=rules)
        f = ifcopenshell.open(p)
        msgs = [s.get('message', str(s)) for s in logger.statements if is_error(s)]
        if msgs:
            bad += 1
        print(json.dumps({'file': p, 'schema': f.schema, 'errors': len(msgs), 'first': [m[:300] for m in msgs[:8]]}))
    return 1 if bad else 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rules', action='store_true', help='Also validate EXPRESS rules')
    parser.add_argument('paths', nargs='+')
    args = parser.parse_args()
    sys.exit(main(args.paths, args.rules))
