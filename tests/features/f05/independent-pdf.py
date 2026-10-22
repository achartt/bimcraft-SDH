# SPDX-License-Identifier: Apache-2.0
"""Independent vector path measurements with pypdf. No shared geometry functions."""
import json,sys
from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream
PT=72/25.4
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f05')
reports=[]
for filename,ratio in [('normal.pdf',20),('detail.pdf',5)]:
 reader=PdfReader(root/filename);assert len(reader.pages)==1
 page=reader.pages[0];assert abs(float(page.mediabox.width)-420*PT)<.001
 assert not page.get('/Resources',{}).get('/XObject'),'drawing contains raster images'
 color=stroke=None;polys=[];poly=[];fills=[];membranes=[];dash=[]
 for args,op in ContentStream(page.get_contents(),reader).operations:
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
 # Four material bands, each with lower/upper spans on normal; one lower span on detail.
 count=2 if filename=='normal.pdf' else 1
 first=[fills[i*count][1] for i in range(4)]
 expected=[19.05,12.7,139.7,12.7];errors=[]
 for p,width in zip(first,expected):
  actual=(max(x for x,y in p)-min(x for x,y in p))/PT*ratio
  errors.append(abs(actual-width));assert errors[-1]<.005,(filename,actual,width)
 siding,sheath,stud,inner=first
 total=(max(x for x,y in inner)-min(x for x,y in siding))/PT*ratio
 cavity=(min(x for x,y in sheath)-max(x for x,y in siding))/PT*ratio
 assert abs(total-209.55)<.005 and abs(cavity-25.4)<.005
 lowerHeight=(max(y for x,y in siding)-min(y for x,y in siding))/PT*ratio
 expectedHeight=850 if count==2 else 450
 assert abs(lowerHeight-expectedHeight)<.005,(filename,lowerHeight)
 assert membranes and all(max(x for x,y in p)-min(x for x,y in p)<1e-8 for p in membranes)
 reports.append(dict(file=filename,ratio=ratio,maxLayerErrorMm=max(errors),totalMm=total,cavityMm=cavity,lowerCutHeightMm=lowerHeight,membranePaths=len(membranes),rasterImages=0))
(root/'pdf-readback.json').write_text(json.dumps(reports,indent=2)+'\n');print(json.dumps(reports,indent=2))
