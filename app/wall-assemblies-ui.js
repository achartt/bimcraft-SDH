/* SPDX-License-Identifier: Apache-2.0 */
import { el } from './ui-util.js';
import { ModelWriter } from './model-write.js';
import { wallType, typeName, typeThickness } from './model-walls.js';
import { validateAssembly, LAYER_FUNCTIONS } from './wall-assemblies.js';
import { saveWallAssembly } from './model-ops.js';
import { readMaterials, normalizeLayer, VENTILATION, materialBackground } from './project-materials.js';
import { openMaterialLibrary } from './project-materials-ui.js';
import { fmtLen, parseLen } from './model-units.js';
export function mountWallAssemblies(modelUi) {
  let A;
  const W=()=>A.ed()?new ModelWriter(A.ed().W,A.ed().api,A.ed().mid):null;
  const t=k=>A.t('assembly.'+k), L=n=>fmtLen(n,A.units());
  const button=(text,fn,props={})=>el('button',{type:'button',className:'btn-line btn-sm-cc',onClick:fn,...props},text);
  function openAssembly(key=A.S.wall.typeKey,assign=[]) {
    const editor=A.ed(), source=wallType(key,W()); if(!editor || !source) return;
    const recipe=structuredClone(source), editing=!!recipe.custom;
    let duplicate=!editing, materials=readMaterials(W(),recipe.layers);
    recipe.layers=recipe.layers.map(normalizeLayer);
    const mt=k=>A.t('materials.'+k);
    const name=el('input',{className:'bc-input',value:editing?typeName(source):typeName(source)+' copy',maxlength:100,'aria-label':t('name'),'data-assembly-name':''});
    const exterior=el('input',{type:'checkbox',checked:recipe.exterior});
    const rows=el('tbody'), total=el('p',{className:'bc-muted','aria-live':'polite'}), error=el('p',{className:'bc-error',role:'alert'});
    const preview=el('div',{'aria-label':t('preview'),style:'display:flex;height:40px;border:1px solid currentColor;margin:12px 0'});
    const orientation=el('div',{'data-assembly-orientation':'',style:'display:flex;justify-content:space-between;gap:16px;font-weight:600'},el('span',{},t('exteriorSide')),el('span',{'aria-hidden':'true'},'→'),el('span',{},t('interiorSide')));
    const dlg=el('dialog',{className:'bc-dialog bc-fam-dlg','aria-label':t('title'),'data-assembly-editor':'',style:'width:min(1050px,96vw);max-width:1050px'});
    const save=button(t('save'),()=>submit(),{'data-assembly-save':''});
    function totals() {
      const th=typeThickness(recipe), core=recipe.layers.filter(l=>l.core).reduce((s,l)=>s+l.t,0);
      total.textContent=t('total')+' '+L(th)+' · '+t('core')+' '+L(core);
      preview.replaceChildren(...recipe.layers.map(l=>el('div',{style:`flex:${Math.max(0.01,l.t)};background:${l.kind==='cavity'?'transparent':materialBackground(materials.find(m=>m.id===l.materialId))};border-right:1px solid #888;${l.core?'box-shadow:inset 0 -5px #527687;':''}`,title:(l.kind==='cavity'?mt('cavity'):materials.find(m=>m.id===l.materialId)?.name || l.mat)+' · '+L(l.t)+(l.core?' · '+t('core'):'' )})));
    }
    function selectMaterial(layer,m) {
      Object.assign(layer,{kind:'material',materialId:m.id,mat:m.legacyName,t:m.defaultThickness});
      delete layer.ventilation;
    }
    function draw() {
      rows.replaceChildren(...recipe.layers.map((layer,i)=>{
        const kind=el('select',{'aria-label':mt('kind')+' '+(i+1),className:'bc-mb-select'},...['material','cavity'].map(k=>el('option',{value:k,selected:layer.kind===k},mt(k))));
        kind.addEventListener('change',()=>{if(kind.value==='cavity'){Object.assign(layer,{kind:'cavity',materialId:null,mat:'air',ventilation:'unspecified'});}else{selectMaterial(layer,materials[0]);}draw();});
        const mat=el('select',{className:'bc-input','aria-label':t('material')+' '+(i+1)},...materials.map(m=>el('option',{value:m.id,selected:m.id===layer.materialId},m.name)),el('option',{value:'__new__'},mt('createFromPicker')));
        if(layer.kind==='material' && !materials.some(m=>m.id===layer.materialId)) mat.prepend(el('option',{value:layer.materialId,selected:true},mt('missing')+' '+layer.mat));
        mat.addEventListener('change',()=>{
          if(mat.value==='__new__') {
            mat.value=layer.materialId;
            openMaterialLibrary(A,saved=>{
              if(A.ed()!==editor || !dlg.isConnected) return;
              materials=readMaterials(W(),recipe.layers);
              if(saved) selectMaterial(layer,saved);
              draw();
            },{createNew:true});
          } else {selectMaterial(layer,materials.find(m=>m.id===mat.value));draw();}
        });
        const vent=el('select',{'aria-label':mt('ventilation')+' '+(i+1),className:'bc-input'},...VENTILATION.map(v=>el('option',{value:v,selected:layer.ventilation===v},mt(v))));
        vent.addEventListener('change',()=>{layer.ventilation=vent.value;});
        const useDefault=button(mt('useDefault'),()=>{const m=materials.find(m=>m.id===layer.materialId);if(m){layer.t=m.defaultThickness;draw();}},{disabled:layer.kind==='cavity'});
        const thickness=el('input',{className:'bc-input',value:L(layer.t),size:9,'aria-label':t('thickness')+' '+(i+1)});
        thickness.addEventListener('input',()=>{const v=parseLen(thickness.value,A.units());layer.t=v;totals();});
        const fn=el('select',{className:'bc-mb-select','aria-label':t('function')+' '+(i+1)},...LAYER_FUNCTIONS.map(f=>el('option',{value:f,selected:f===layer.function},t('function.'+f))));
        fn.addEventListener('change',()=>{layer.function=fn.value;});
        const core=el('input',{type:'checkbox',checked:layer.core,'aria-label':t('core')+' '+(i+1)});core.addEventListener('change',()=>{layer.core=core.checked;totals();});
        const move=delta=>{[recipe.layers[i],recipe.layers[i+delta]]=[recipe.layers[i+delta],recipe.layers[i]];draw();};
        return el('tr',{},el('td',{},kind,layer.kind==='cavity'?vent:mat),el('td',{},thickness,useDefault),el('td',{},fn),el('td',{},core),el('td',{},button('↑',()=>move(-1),{disabled:i===0,'aria-label':t('up')}),button('↓',()=>move(1),{disabled:i===recipe.layers.length-1,'aria-label':t('down')}),button('×',()=>{recipe.layers.splice(i,1);draw();},{'aria-label':t('remove')})));
      }));
      const boundary=label=>el('tr',{},el('th',{colSpan:5,style:'text-align:left;padding:8px 4px;background:rgba(128,128,128,.12)'},label));
      rows.prepend(boundary(t('exteriorSide')+' ↓'));
      rows.append(boundary(t('interiorSide')+' ↑'));
      totals();
    }
    const copy=button(t('duplicate'),()=>{duplicate=true;name.value+=' copy';copy.disabled=true;save.textContent=t('savecopy');});
    dlg.append(el('h2',{className:'bc-h'},t('title')),el('label',{className:'bc-dlg-field'},t('name'),name),el('label',{},exterior,' '+t('exterior')),el('p',{},t('order')),orientation,preview,total,el('div',{style:'overflow:auto'},el('table',{},el('thead',{},el('tr',{},...['material','thickness','function','core','actions'].map(k=>el('th',{},t(k))))),rows)),
      button(t('add'),()=>{const m=materials.find(m=>m.id==='material-gypsum') || materials[0];recipe.layers.push(normalizeLayer({mat:m.legacyName,materialId:m.id,t:m.defaultThickness,function:'finish',core:false}));draw();}),button(mt('addCavity'),()=>{recipe.layers.push(normalizeLayer({mat:'air',kind:'cavity',t:25.4,function:'substrate',core:false}));draw();}),button(mt('title'),()=>openMaterialLibrary(A,()=>{materials=readMaterials(W(),recipe.layers);draw();})),el('p',{className:'bc-muted'},mt('defaults')),el('p',{className:'bc-muted'},t('scope')),error,
      el('p',{className:'bc-lib-actions'},...(editing?[copy]:[]),button(t('cancel'),()=>dlg.close()),save));
    dlg.addEventListener('close',()=>dlg.remove());
    dlg.addEventListener('keydown',e=>e.stopPropagation());
    function submit() {
      try {
        if(A.ed()!==editor) throw new Error(t('changed'));
        const input=validateAssembly({...recipe,key:duplicate?'wall-'+crypto.randomUUID():recipe.key,name:name.value,exterior:exterior.checked});
        save.disabled=true;error.textContent='';
        const operation=saveWallAssembly(input,duplicate?assign:[]);
        A.commit(ed=>{if(ed!==editor) throw new Error(t('changed'));const r=operation(ed);A.S.wall.typeKey=input.key;dlg.close();return r;},{label:input.name,verb:A.t('model.verb.changed'),onError:e=>{save.disabled=false;error.textContent=e.message;}});
      }catch(e){error.textContent=e.message;}
    }
    draw();A.root.append(dlg);dlg.showModal();
  }
  A=modelUi.extend({openAssembly});
  const row=A.root.querySelector('[data-mopts="wall"]');
  row?.append(button(t('open'),()=>openAssembly(),{'data-wall-assemblies':''}));
  A.root.querySelector('[data-annot-tools]')?.before(button(A.t('materials.title'),()=>openMaterialLibrary(A),{'data-materials-menu':''}));
  // A project-wide entry point remains available when the Wall tool is not active.
  A.root.querySelector('[data-annot-tools]')?.before(button(t('open'),()=>openAssembly(),{'data-wall-assemblies-menu':''}));
}
