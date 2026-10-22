/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {sizes} from './core.mjs';import {environment} from './environment.mjs';import {report} from './report.mjs';
const args=process.argv.slice(2),arg=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const count=Number(arg('--reps','30')),warmups=Number(arg('--warmups','5')),dir=arg('--out','evidence/f03/reference'),url=arg('--url','http://127.0.0.1:8018');
if(!Number.isInteger(count)||count<1||!Number.isInteger(warmups)||warmups<0)throw new Error('Invalid sample counts');
// Resolve an explicitly supplied existing installation, or the project's test dependency.
const pw=process.env.F03_PLAYWRIGHT?await import(pathToFileURL(path.resolve(process.env.F03_PLAYWRIGHT,'index.mjs')).href):await import('playwright');
// The packed dev shell omits its Bootstrap icon font. Serve the official pinned
// test dependency in this harness only; never edit the application or swallow errors.
const iconPackage=path.resolve(process.env.F03_ICON_PACKAGE||'.cc-test/f03-browser/node_modules/bootstrap-icons');
const iconVersion=JSON.parse(fs.readFileSync(path.join(iconPackage,'package.json'))).version;
if(iconVersion!==JSON.parse(fs.readFileSync('devshell/edition/kit.json')).shell['bootstrap-icons'].version)throw new Error('Icon font version differs from packed shell');
fs.mkdirSync(dir,{recursive:true});
const browser=await pw.chromium.launch({headless:!args.includes('--headed'),...(process.env.F03_CHROMIUM?{executablePath:process.env.F03_CHROMIUM}:{})});
const samples=[],errors=[],env={...environment(),browser:browser.version(),viewport:{width:1440,height:1000},deviceScaleFactor:1,headless:!args.includes('--headed'),renderer:'See gpu.json; no GPU equivalence inferred',iconFont:{version:iconVersion,source:'Official npm bootstrap-icons package; harness-only route for omitted devshell asset'}};
let active;
async function context(){const ctx=await browser.newContext({viewport:env.viewport,deviceScaleFactor:1,acceptDownloads:true});const page=await ctx.newPage();active=ctx;
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/__f03/core.mjs',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('tests/features/f03/core.mjs','utf8').replaceAll('../../../app/','/assets/apps/bimcraft/dev/')}));
 await page.route('**/assets/vendor/bootstrap-icons/current/**',route=>{
  const relative=new URL(route.request().url()).pathname.split('/current/')[1];
  if(!['bootstrap-icons.min.css','fonts/bootstrap-icons.woff2','fonts/bootstrap-icons.woff'].includes(relative))throw new Error('Unexpected icon asset '+relative);
  return route.fulfill({path:path.join(iconPackage,'font',relative),contentType:relative.endsWith('.css')?'text/css':relative.endsWith('.woff2')?'font/woff2':'font/woff'});
 });
 const cdp=await ctx.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Performance.enable');
 await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.bimcraftLive&&!!window.bimcraftVis);await page.evaluate(()=>document.fonts.ready);
 const install=fs.readFileSync('tests/features/f03/browser-page.mjs','utf8').replace('export async function install','async function install');await page.evaluate(install+'\ninstall()');
 return {ctx,page,cdp};}
const heap=async cdp=>(await cdp.send('Runtime.getHeapUsage')).usedSize;
function add(size,workload,i,r,before,after,targetMs){if(i<0)return;samples.push({domain:'browser',size,workload,iteration:i,ms:r.ms,memory:{metric:'CDP renderer JS used heap bytes (not RSS/GPU/worker)',before,after},...(targetMs?{targetMs}:{}),spans:r.spans||[],...(r.worker?{worker:r.worker}:{})});}
const load=async(page,bytes,size)=>{await page.evaluate(({bytes,size})=>f03.open(bytes,size+'.ifc'),{bytes,size});await page.locator('[data-model-toggle]').click();await page.evaluate(()=>f03.idle());};
const select=async page=>{await page.evaluate(()=>f03.selectWall());await page.waitForSelector('[data-mp-height]');await page.evaluate(()=>f03.paint());};
async function prepareEdit(page,kind){if(kind==='roof-regeneration'){await page.evaluate(()=>f03.selectRoof());await page.waitForSelector('[data-mp-rfpitch]');await page.locator('[data-mp-rfpitch]').fill('30°');}
 else {await select(page);if(kind==='type-edit'){await page.locator('[data-mp-assembly]').click();const field=page.locator('[data-assembly-editor] input[aria-label="Thickness 1"]');await field.fill('19.246906mm');}else await page.locator('[data-mp-height]').fill('2800.123456mm');}}
async function edit(page,kind){if(kind==='type-edit'){await page.evaluate(()=>f03.arm('click','[data-assembly-save]'));await page.locator('[data-assembly-save]').click();}
 else {const selector=kind==='wall-edit'?'[data-mp-height]':'[data-mp-rfpitch]';await page.evaluate(s=>f03.arm('change',s),selector);await page.locator(selector).press('Enter');}return page.evaluate(()=>f03.take());}
try{
 const bc=await browser.newBrowserCDPSession();fs.writeFileSync(path.join(dir,'gpu.json'),JSON.stringify(await bc.send('SystemInfo.getInfo'),null,2));
 for(const [size,n] of Object.entries(sizes)){
  const bytes=Array.from(fs.readFileSync('.cc-test/f03/fixtures/'+size+'.ifc'));
  for(let i=0;i<count;i++){const {ctx,page,cdp}=await context(),before=await heap(cdp),r=await page.evaluate(({bytes,size})=>f03.open(bytes,size+'.ifc'),{bytes,size}),after=await heap(cdp);await page.evaluate(n=>f03.validate(n),n);add(size,'context-cold-open',i,r,before,after);await ctx.close();}
  const {ctx,page,cdp}=await context();
  for(let i=-warmups;i<count;i++){const before=await heap(cdp),r=await page.evaluate(({bytes,size})=>f03.open(bytes,size+'.ifc'),{bytes,size}),after=await heap(cdp);await page.evaluate(n=>f03.validate(n),n);add(size,'warm-open',i,r,before,after);}
  await page.locator('[data-model-toggle]').click();await page.evaluate(()=>f03.idle());
  for(let i=-warmups;i<count;i++){await page.evaluate(()=>bimcraftVis.pick([]));const p=await page.evaluate(()=>f03.wallPoint());const before=await heap(cdp);await page.evaluate(()=>f03.arm('pointerup','[data-plan-canvas]','props'));await page.mouse.click(p.x,p.y);const r=await page.evaluate(()=>f03.take()),after=await heap(cdp);await page.waitForSelector('[data-mp-height]');if(!await page.evaluate(key=>bimcraftPlan.view.selection.has(key),p.key))throw new Error('Clicked wall not selected');add(size,'selection-properties-feedback',i,r,before,after,100);}
  for(const kind of ['pan','zoom'])for(let i=-warmups;i<count;i++){
   // Fit outside the timer so repeated pans do not move the fixture offscreen.
   await page.evaluate(async()=>{bimcraftPlan.view.fit();await f03.paint();});
   const viewBefore=await page.evaluate(()=>({cx:bimcraftPlan.view.cx,cy:bimcraftPlan.view.cy,scale:bimcraftPlan.view.scale}));
   // A short trusted-input gesture per sample; collect every rAF interval during the gesture.
   const before=await heap(cdp);await page.evaluate(()=>{f03.frames=[];f03.running=true;let last=performance.now();function tick(t){if(!f03.running)return;f03.frames.push(t-last);last=t;requestAnimationFrame(tick);}requestAnimationFrame(tick);});
   const box=await page.locator('[data-plan-canvas]').boundingBox(),x=box.x+box.width*.6,y=box.y+box.height*.6;await page.mouse.move(x,y);
   if(kind==='pan'){await page.mouse.down({button:'middle'});await page.mouse.move(x+40,y+20,{steps:12});await page.mouse.up({button:'middle'});}else for(let j=0;j<12;j++){await page.mouse.wheel(0,j%2?30:-30);await page.evaluate(()=>new Promise(requestAnimationFrame));if(j===0&&await page.evaluate(()=>bimcraftPlan.view.scale)===viewBefore.scale)throw new Error('Zoom did not change view');}
   await page.evaluate(()=>f03.paint());const frames=await page.evaluate(()=>{f03.running=false;return f03.frames.slice(1);}),after=await heap(cdp);if(!frames.length)throw new Error('No animation frames');if(kind==='pan'&&await page.evaluate(({cx,cy})=>bimcraftPlan.view.cx===cx&&bimcraftPlan.view.cy===cy,viewBefore))throw new Error('Pan did not change view');
   // One observation = maximum frame interval in a gesture. Raw per-frame values retained.
   add(size,kind+'-gesture-max-frame',i,{ms:Math.max(...frames)},before,after,33);if(i>=0)samples.at(-1).frames=frames;
  }
  for(const kind of ['wall-edit','type-edit','roof-regeneration'])for(let i=-warmups;i<count;i++){await load(page,bytes,size);const snapshot=await page.evaluate(()=>f03.snapshot());await prepareEdit(page,kind);const before=await heap(cdp),r=await edit(page,kind),after=await heap(cdp);add(size,kind+'-feedback',i,r,before,after,500);await page.evaluate(({snapshot,kind,n})=>f03.verifyEdit(snapshot,kind,n),{snapshot,kind,n});}
  await load(page,bytes,size);
  for(const kind of ['save','pdf'])for(let i=-warmups;i<count;i++){const before=await heap(cdp),r=await page.evaluate(kind=>f03[kind](),kind),after=await heap(cdp);add(size,kind+'-generation',i,r,before,after);if(i===0)fs.writeFileSync(path.join(dir,size+'-browser.'+(kind==='save'?'ifc':'pdf')),Buffer.from(r.bytes));}
  // Actual UI plan PDF download, separate from repeatable generator cost.
  const download=page.waitForEvent('download');await page.locator('[data-model-print]').click();await (await download).saveAs(path.join(dir,size+'-ui-plan.pdf'));
  await select(page);await page.screenshot({path:path.join(dir,size+'-browser.png')});
  await load(page,bytes,size);await prepareEdit(page,'type-edit');
  await cdp.send('Profiler.enable');await cdp.send('Profiler.start');await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing',transferMode:'ReturnAsStream'});await edit(page,'type-edit');
  fs.writeFileSync(path.join(dir,size+'-browser.cpuprofile'),JSON.stringify((await cdp.send('Profiler.stop')).profile));const complete=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const {stream}=await complete;let trace='';for(;;){const r=await cdp.send('IO.read',{handle:stream});trace+=r.data;if(r.eof)break;}await cdp.send('IO.close',{handle:stream});fs.writeFileSync(path.join(dir,size+'-trace.json'),trace);
  await ctx.close();console.log('Measured browser '+size);
  fs.writeFileSync(path.join(dir,'browser-raw.json'),JSON.stringify({schema:1,environment:env,config:{count,warmups,cold:'fresh context/page, HTTP cache disabled; app imports loaded before open; browser process and OS caches shared',warm:'same initialized page and IFC worker; new file open each sample',feedback:'trusted event capture through completed rebuild/Properties and double rAF paint opportunity; not hardware presentation',frames:'max rAF interval per 12-step gesture; per-frame samples retained; no GC forcing'},fixtures:JSON.parse(fs.readFileSync('.cc-test/f03/fixtures/manifest.json')),samples,errors},null,2)+'\n');
 }
 report(dir);if(errors.length)throw new Error('Browser errors: '+[...new Set(errors)].join('\n'));
}finally{await active?.close().catch(()=>{});await browser.close();}
