# SPDX-License-Identifier: Apache-2.0
"""Fetch only the reviewed upstream file closure into an isolated test mirror.

python tests/features/f01/upstream.py /absolute/path/to/isolated/.cc-test
Network access is explicit; the standalone baseline never calls this script.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import urllib.request

ROOT = Path(__file__).resolve().parents[3]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('mirror', type=Path)
parser.add_argument('--verify-only', action='store_true')
args = parser.parse_args()
manifest = json.loads((ROOT / 'evidence/f01/independent/upstream-files.json').read_text())
for row in manifest:
    repo, revision, source = row['repository'], row['revision'], PurePosixPath(row['path'])
    assert repo in ('getcadcraft/civilcraft', 'getcadcraft/cadcraft', 'getcadcraft/takeoffcraft')
    assert len(revision) == 40 and all(c in '0123456789abcdef' for c in revision)
    assert source.parts[0] == 'app' and '..' not in source.parts
    target = args.mirror / 'public_html/assets/apps' / repo.split('/')[1] / 'dev' / Path(*source.parts[1:])
    if args.verify_only or target.exists():
        data = target.read_bytes()
    else:
        url = f'https://raw.githubusercontent.com/{repo}/{revision}/{source}'
        with urllib.request.urlopen(url, timeout=60) as response:
            data = response.read()
    assert len(data) == row['bytes'], f'Length mismatch: {target}'
    assert hashlib.sha256(data).hexdigest() == row['sha256'], f'SHA-256 mismatch: {target}'
    blob = b'blob ' + str(len(data)).encode() + b'\0' + data
    assert hashlib.sha1(blob).hexdigest() == row['git_blob'], f'Git blob mismatch: {target}'
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
print(json.dumps({'files': len(manifest), 'bytes': sum(r['bytes'] for r in manifest), 'status': 'PASS', 'verify_only': args.verify_only}))
