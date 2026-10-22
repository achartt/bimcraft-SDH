# SPDX-License-Identifier: Apache-2.0
"""Independent readback of PDFs downloaded through the real browser UI."""
import json
from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream
root=Path('.cc-test/f04-browser'); reports=[]; PT=72/25.4
for filename in ['browser-fine-plan.pdf','browser-styled-plan.pdf','browser-sheet.pdf']:
    reader=PdfReader(root/filename); assert len(reader.pages)==1
    page=reader.pages[0]; assert not page.get('/Resources',{}).get('/XObject')
    color=None; stroke=None; polys=[]; poly=[]; fills=[]; membranes=0
    for args,op in ContentStream(page.get_contents(),reader).operations:
        if op==b'rg': color=tuple(map(float,args))
        if op==b'g': color=None
        if op==b'RG': stroke=tuple(map(float,args))
        if op==b'G': stroke=None
        if op==b'm': poly=[tuple(map(float,args))];polys.append(poly)
        if op==b'l': poly.append(tuple(map(float,args)))
        if op in (b'f',b'f*'):
            if color: fills.append((color,polys))
            polys=[];poly=[]
        if op==b'S':
            if stroke and abs(stroke[0]-163/255)<1e-6:membranes+=len(polys)
            polys=[];poly=[]
        if op==b'n':polys=[];poly=[]
    assert len(fills)==34,(filename,len(fills))
    scale=100; errors=[]
    for (_,ps),expected in zip(fills[:4],[19.05,12.7,139.7,12.7]):
        for p in ps:
            width=(max(y for x,y in p)-min(y for x,y in p))/PT*scale
            errors.append(abs(width-expected));assert errors[-1]<.005,(filename,width,expected)
    siding=fills[0][1][0];sheathing=fills[1][1][0];inner=fills[3][1][0]
    total=(max(y for x,y in siding)-min(y for x,y in inner))/PT*scale
    cavity=(min(y for x,y in siding)-max(y for x,y in sheathing))/PT*scale
    door=(max(x for x,y in siding)-min(x for x,y in siding))/PT*scale
    assert abs(total-209.55)<.005 and abs(cavity-25.4)<.005 and abs(door-1000)<.005
    assert membranes>0
    if filename!='browser-fine-plan.pdf':assert all(abs(a-b/255)<1e-6 for a,b in zip(fills[2][0],[23,79,146]))
    reports.append(dict(file=filename,scale=scale,totalMm=total,cavityMm=cavity,preDoorLengthMm=door,maxLayerErrorMm=max(errors),membranePaths=membranes,rasterImages=0))
(root/'pdf-readback.json').write_text(json.dumps(reports,indent=2)+'\n')
print(json.dumps(reports,indent=2))
