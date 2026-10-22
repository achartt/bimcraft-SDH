# SPDX-License-Identifier: Apache-2.0
"""Read actual PDF path operators with pypdf; no application geometry imports."""
import json, math, sys
from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream
PT=72/25.4
reports=[]
output=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f04')
def paths(file):
    reader=PdfReader(file);page=reader.pages[0]
    assert len(reader.pages)==1
    assert abs(float(page.mediabox.width)-420*PT)<.001
    assert not page.get('/Resources',{}).get('/XObject'), 'raster XObject unexpected'
    colors=None;polys=[];poly=[];fills=[];strokes=[];stroke=None;dash=[];stack=[]
    for args,op in ContentStream(page.get_contents(),reader).operations:
        if op==b'q': stack.append((colors,stroke,dash))
        if op==b'Q': colors,stroke,dash=stack.pop()
        if op==b'rg': colors=tuple(map(float,args))
        if op==b'RG': stroke=tuple(map(float,args))
        if op==b'g': colors=None
        if op==b'G': stroke=None
        if op==b'd': dash=list(map(float,args[0]))
        if op==b'm': poly=[tuple(map(float,args))];polys.append(poly)
        if op==b'l': poly.append(tuple(map(float,args)))
        if op in (b'f',b'f*'):
            if colors: fills.append((colors,polys))
            polys=[];poly=[]
        if op==b'S':
            strokes.extend((stroke,dash,p) for p in polys);polys=[];poly=[]
        if op==b'n': polys=[];poly=[]
    return page, fills, strokes
for filename,ratio,indices in [('fine-plan.pdf',50,range(4)),('fine-detail.pdf',5,range(4)),('fine-sheet.pdf',100,range(4)),('fine-sheet.pdf',10,range(34,38))]:
    file=output/filename;page,fills,strokes=paths(file)
    # Seven exterior walls emit four fill commands each; two partitions emit
    # three each. Cavities/membranes emit none: the second view starts at 34.
    selected=[fills[i] for i in indices]
    expected=[19.05,12.7,139.7,12.7];errors=[]
    for (_,ps),thickness in zip(selected,expected):
        for p in ps:
            ys=[y for x,y in p];actual=(max(ys)-min(ys))/PT*ratio
            errors.append(abs(actual-thickness));assert errors[-1]<.005,(filename,ratio,actual,thickness)
    # First siding rectangle is exactly the 1000 mm before the door cut.
    p=selected[0][1][0];length=(max(x for x,y in p)-min(x for x,y in p))/PT*ratio
    assert abs(length-1000)<.005
    ext=max(y for x,y in selected[0][1][0]);interior=min(y for x,y in selected[-1][1][0]);total=(ext-interior)/PT*ratio
    assert abs(total-209.55)<.005
    cavity=(min(y for x,y in selected[0][1][0])-max(y for x,y in selected[1][1][0]))/PT*ratio
    assert abs(cavity-25.4)<.005
    membranes=[p for col,dash,p in strokes if col and abs(col[0]-163/255)<1e-6 and dash]
    assert membranes, 'membrane boundary vector strokes absent'
    reports.append({'file':filename,'scale':ratio,'maxLayerWidthErrorMm':max(errors),'totalMm':total,'cavityMm':cavity,'preDoorLengthMm':length,'membranePaths':len(membranes),'rasterImages':0})
print(json.dumps(reports,indent=2))
