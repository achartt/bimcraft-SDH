/* SPDX-License-Identifier: Apache-2.0 */
import { catalog } from './catalog.js';
import { availability } from './availability.js';
import { createDrawingTabs, isTextEntry } from './commands.js';
import { node, icon, button } from './dom.js';
import { fmtLen } from '../model-units.js';
import { scalesFor } from '../res-sheets.js';
import { mountWallWorkflow, INSTANCE_WALL_FIELDS } from './walls.js';

/** F28-A owns chrome and layout only. Editors, canvases and extension nodes retain their identity and bindings. */
export function mountWorkspace({ root, modelUi, views, commands, props, current, status }) {
  const stage = root.querySelector('.bc-stage');
  const tabs = createDrawingTabs();
  let active = false, frame = 0, tab = 'Architecture', wallContext = false, browserView = null, propertyMode = 'view';
  let documentToken = null, propsToken = null, tabSignature = '', viewPropsSignature = '', restricted = new Map();
  const cameras = new Map();
  const A = modelUi.extend({ refresh: refreshSoon, settled: refreshSoon, toolChanged: refreshSoon });
  const propsHome = document.createComment('F28 Properties home'), browserHome = document.createComment('F28 Project Browser home');
  props.before(propsHome);
  let browser = null;
  const chrome = [];
  const addChrome = e => { e.classList.add('ws-chrome'); root.append(e); chrome.push(e); return e; };

  function tool(id, compact = false) {
    const t = catalog.tools[id] || { name: id === 'fit' ? 'Zoom to Fit' : id === 'clear' ? 'Clear selection' : id, icon: id === 'fit' ? 'eye' : 'pointer' };
    return node('button', { type: 'button', className: 'ws-tool' + (compact ? ' ws-compact' : ''), 'data-ws-command': id, 'aria-label': t.name }, icon(t.icon), node('span', {}, t.name));
  }
  const title = node('span', { className: 'ws-project' }, 'No IFC open');
  const header = addChrome(node('header', { className: 'ws-titlebar' },
    node('span', { className: 'ws-brand' }, node('b', {}, 'B'), 'BimCraft'),
    node('div', { className: 'ws-quick', 'aria-label': 'Quick access' }, ['open', 'save', 'undo', 'redo'].map(id => tool(id, true))), title,
    node('span', { className: 'ws-review-badge' }, 'F28-B · Live workspace'),
    button('Tool availability', { 'data-ws-inventory': '' }), button('Established layout', { 'data-ws-fallback': '' })));
  const ribbonTabs = addChrome(node('nav', { className: 'ws-ribbon-tabs', role: 'tablist', 'aria-label': 'Ribbon' }));
  const ribbon = addChrome(node('div', { className: 'ws-ribbon', role: 'tabpanel', id: 'ws-ribbon-panel', 'aria-label': 'Architecture tools' }));
  const options = addChrome(node('div', { className: 'ws-options' }, node('strong', {}, 'Modify'), node('span', { 'data-ws-options-text': '' }, 'Open an IFC to begin.'), tool('clear', true)));
  const elementProps = node('div', { className: 'ws-element-props' }, node('p', { className: 'ws-note' }, 'Instance settings. Edit Type changes every wall using that type. Other properties are read-only.'));
  const placementProps = node('div', { className: 'ws-placement-props', 'data-ws-placement-props': '', hidden: true });
  const viewProps = node('div', { className: 'ws-view-props' });
  const propHeading = node('span', {}, 'Properties');
  const propPalette = node('section', { className: 'ws-properties', 'aria-label': 'Properties palette' },
    node('header', { className: 'ws-palette-heading' }, propHeading, button('View Properties', { 'data-ws-view-props': '' })),
    node('div', { className: 'ws-palette-scroll', 'data-ws-properties-scroll': '' }, viewProps, elementProps, placementProps), node('div', { className: 'ws-props-units', 'data-ws-units-slot': '' }));
  const browserSlot = node('div', { className: 'ws-palette-scroll', 'data-ws-browser-scroll': '' });
  const browserPalette = node('section', { className: 'ws-browser', 'aria-label': 'Project Browser palette' },
    node('header', { className: 'ws-palette-heading' }, 'Project Browser'),
    node('p', { className: 'ws-browser-hint' }, 'Select a view for Properties. Double-click or Enter to open.'), browserSlot);
  const split = node('div', { className: 'ws-hsplit', role: 'separator', tabindex: 0, 'aria-orientation': 'horizontal', 'aria-label': 'Resize Properties and Project Browser', 'aria-valuemin': 25, 'aria-valuemax': 75, 'aria-valuenow': 50 });
  const palettes = addChrome(node('aside', { className: 'ws-palettes' }, propPalette, split, browserPalette));
  const widthGrip = addChrome(node('div', { className: 'ws-vsplit', role: 'separator', tabindex: 0, 'aria-orientation': 'vertical', 'aria-label': 'Resize left palettes', 'aria-valuemin': 220, 'aria-valuemax': 480, 'aria-valuenow': 278 }));
  const drawingTabs = node('div', { className: 'ws-drawing-tabs', role: 'tablist', 'aria-label': 'Open drawings' });
  const drawingTitle = node('span', { className: 'ws-drawing-title' });
  const emptyView = node('div', { className: 'ws-empty-view' }, node('p', {}, 'No drawing is open.'), node('p', {}, 'The project and its unsaved changes remain open. Open a view from Project Browser.'), tool('three'));
  const detailSelect = settingsSelect('detail'), scaleSelect = settingsSelect('scale');
  const bottom = node('div', { className: 'ws-view-controls', 'aria-label': 'View controls' }, drawingTitle,
    node('label', {}, 'Scale ', scaleSelect), node('label', {}, 'Detail ', detailSelect), tool('range', true), tool('fit', true));
  const stageChrome = [drawingTabs, bottom, emptyView]; stage.append(...stageChrome);
  const statusBar = addChrome(node('footer', { className: 'ws-statusbar' }, node('span', { className: 'ws-layout-label' }, 'Live IFC workspace · F28-B'), node('span', { 'data-ws-selection': '' }), node('span', { className: 'ws-status-slot' })));
  const realStatus = root.querySelector('[data-status]'), statusHome = document.createComment('F28 status home'); realStatus.before(statusHome);
  const launch = button('Established layout · Try F28 workspace', { className: 'ws-launch', 'data-ws-launch': '' });
  (document.querySelector('.app-bar') || root).append(launch);
  launch.addEventListener('click', () => setActive(true));
  const tooltip = node('div', { className: 'ws-tooltip', id: 'ws-tool-explanation', role: 'tooltip', hidden: true }); root.append(tooltip);
  const walls = mountWallWorkflow({ root, A, commands, defaults: placementProps, unitsHost: propPalette.querySelector('[data-ws-units-slot]'), options, status });

  function settingsSelect(key) {
    const select = node('select', { 'data-ws-setting': key, 'aria-label': key === 'detail' ? 'Detail Level' : 'View Scale' });
    const choices = key === 'detail' ? [['coarse', 'Coarse'], ['medium', 'Medium'], ['fine', 'Fine']] : [[0, A.t('model.pv.scale.fit')], ...scalesFor(A.units()).map(x => [x.ratio, x.label])];
    for (const [value, text] of choices) select.append(node('option', { value }, text));
    if (key === 'scale') select.dataset.wsScaleUnits = A.units();
    return select;
  }
  function snapshot() {
    const c = current();
    const view = tabs.active;
    return { ...c, document: c.editor, busy: c.busy || !!A.S.busy || !!A.S.reloading,
      levels: c.editor === documentToken ? A.S.data?.levels || [] : [], view, settings: view?.kind === 'plan' ? views.workspaceSettings() : null,
      live: active, wall: walls.metadata() };
  }
  function refreshSoon() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; refresh(); }); }
  function rememberCamera() {
    const v = tabs.active, pv = A.pv();
    if (v?.kind === 'plan' && pv) cameras.set(v.id, { cx: pv.cx, cy: pv.cy, scale: pv.scale, fitted: pv.fitted });
  }
  function activate(view) {
    if (!current().editor || snapshot().busy) return;
    rememberCamera();
    tabs.open(view); browserView = view; propertyMode = 'view';
    stage.classList.remove('ws-no-view');
    A.setTool('select');
    A.activateWorkspaceView(view.kind === 'plan' ? view.levelId : null, cameras.get(view.id));
    views.render(); refresh();
  }
  function planView(level) { return { id: 'plan:' + level.guid, kind: 'plan', levelId: level.id, guid: level.guid, name: level.name }; }
  function threeView() { return { id: '3d:default', kind: '3d', name: '{3D}' }; }
  function activatePlan(levelGuid) {
    const levels = snapshot().levels;
    const level = levels.find(l => l.guid === levelGuid) || levels.find(l => l.id === A.S.level) || levels.find(l => Math.abs(l.elevation) < 1) || levels[0];
    if (level) activate(planView(level));
  }
  function opened() {
    const c = current();
    if (!active) { documentToken = null; refresh(); return; }
    documentToken = c.editor;
    tabs.reset(documentToken); cameras.clear(); browserView = null; propsToken = null;
    if (c.editor) { A.prepareWorkspace(); A.setTool('select'); views.render(); }
    if (c.editor) { tabs.open(threeView()); browserView = tabs.active; }
    propertyMode = 'view'; refresh();
  }
  function showViewProperties() { browserView = tabs.active; propertyMode = 'view'; refresh(); }
  function openRangeFor(guid) {
    views.openRange(guid);
    const dlg = root.querySelector('[data-pv-dialog]'); if (!dlg) return;
    const why = 'Not wired in this workspace slice. Use Established layout for templates, category visibility, underlays and crop tools. Existing settings are preserved.';
    dlg.querySelector('h2')?.after(node('p', { className: 'ws-note' }, 'Edit cut, top, bottom, depth, scale and detail. Other view settings remain in the established layout.'));
    for (const b of dlg.querySelectorAll('[data-pv-astpl], [data-pv-cropdraw], [data-pv-cropclear], [data-pv-hidesel], [data-pv-showall]')) {
      b.setAttribute('aria-disabled', 'true'); b.title = why;
      b.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); explain('', why); }, true);
    }
    for (const input of dlg.querySelectorAll('[data-pv-template], [data-pv-underlay], [data-pv-cat]')) {
      input.disabled = true; const label = input.closest('label') || input.parentElement;
      label.tabIndex = 0; label.dataset.wsReason = why; label.title = why;
    }
  }
  function openRange() { const v = tabs.active; if (v?.kind === 'plan') openRangeFor(v.guid); }
  function setSettings(patch) { const why = views.setWorkspaceSettings(patch); if (why) status(why, true); refreshSoon(); }
  function fit() { if (tabs.active?.kind === 'plan') A.fitPlan(); else current().viewer?.view('iso'); }

  function setActive(on) {
    const left = root.querySelector('.bc-left'), right = root.querySelector('.bc-right');
    if (on && (current().busy || A.S.busy || A.S.reloading || A.S.chain || A.S.tool !== 'select')) { status('Finish or cancel the current operation in Established layout before switching workspaces.', true); return; }
    if (on && (left?.ownerDocument !== document || right?.ownerDocument !== document || !root.contains(left) || !root.contains(right))) {
      status('Dock the established panels in this window before enabling the live workspace. Existing panel windows are preserved.', true); return;
    }
    if (active === on) return;
    active = on;
    root.classList.toggle('ws-active', on); document.body.classList.toggle('has-live-workspace', on);
    launch.hidden = on;
    if (on) {
      walls.setActive(true);
      elementProps.append(props); statusBar.querySelector('.ws-status-slot').append(realStatus);
      opened(); attachBrowser(); restrictProperties();
    } else {
      A.setTool('select'); walls.setActive(false);
      rememberCamera(); propsHome.after(props); statusHome.after(realStatus);
      if (browserHome.parentNode && browser) browserHome.after(browser);
      restoreRestrictions(); tooltip.hidden = true;
    }
    // Shared panel manager keeps its own layout and storage. CSS overrides its grid only while the new layout is active.
    const url = new URL(location.href); url.searchParams.set('workspace', on ? 'live' : 'established'); history.replaceState(null, '', url);
    requestAnimationFrame(() => { current().viewer?.resize(); A.pv()?.resize(); });
    refresh();
  }
  function attachBrowser() {
    const b = root.querySelector('[data-pb-sec]'); if (!b) return;
    if (!browser) { browser = b; b.before(browserHome); }
    if (active && b.parentNode !== browserSlot) browserSlot.append(b);
    const group = b.querySelector('[data-pb-group="3d"]');
    if (group && !group.querySelector('[data-ws-browser-3d]')) {
      const list = group.querySelector('ul') || node('ul');
      if (!list.parentNode) group.append(list);
      list.prepend(node('li', {}, button('{3D}', { className: 'bc-pb-go', 'data-ws-browser-3d': '' })));
    }
    if (group) { const summary = group.querySelector('summary'); if (summary) { if (!summary.hasAttribute('data-ws-original-summary')) summary.dataset.wsOriginalSummary = summary.textContent; summary.textContent = A.t('model.pb.views3d') + ' (' + (1 + group.querySelectorAll('[data-pb-3d]').length) + ')'; } }
    for (const btn of b.querySelectorAll('button')) {
      const supported = btn.matches('[data-pb-plan], [data-pb-range], [data-ws-browser-3d]');
      if (!supported) { if (!btn.hasAttribute('data-ws-original-title')) btn.dataset.wsOriginalTitle = btn.title; btn.setAttribute('aria-disabled', 'true'); btn.title = 'Not wired in this workspace slice. Switch to Established layout for supported documentation, RCP, saved-camera, family and linked-model actions.'; }
    }
    for (const btn of b.querySelectorAll('[data-pb-plan], [data-ws-browser-3d]')) {
      const v = btn.hasAttribute('data-ws-browser-3d') ? threeView() : snapshot().levels.map(planView).find(x => x.guid === btn.dataset.pbPlan);
      btn.classList.toggle('ws-browser-selected', !!v && browserView?.id === v.id);
      btn.setAttribute('aria-current', tabs.active?.id === v?.id ? 'page' : 'false');
    }
  }

  function renderRibbonTabs() {
    const names = Object.keys(catalog.ribbon).filter(n => n !== 'Modify | Walls' || wallContext);
    ribbonTabs.replaceChildren(button('File', { className: 'ws-file-tab', 'data-ws-file': '' }), ...names.map(name => button(name, {
      role: 'tab', id: 'ws-tab-' + name.replace(/\W/g, '-'), 'aria-selected': name === tab, 'aria-controls': 'ws-ribbon-panel',
      tabindex: name === tab ? 0 : -1, 'data-ws-tab': name, className: name === 'Modify | Walls' ? 'ws-context-tab' : '',
    })));
    renderRibbon();
  }
  function renderRibbon() {
    const groups = catalog.ribbon[tab] || [];
    ribbon.setAttribute('aria-label', tab + ' tools');
    ribbon.replaceChildren(...groups.map(([name, large, stacks]) => node('section', { className: 'ws-group', 'aria-label': name },
      large.map(id => tool(id)), stacks.map(ids => node('div', { className: 'ws-stack' }, ids.map(id => tool(id)))), node('span', { className: 'ws-group-title' }, name))));
    refreshTools();
  }
  function refreshTools() {
    const s = snapshot();
    for (const b of root.querySelectorAll('[data-ws-command]')) {
      const id = b.dataset.wsCommand, a = availability(id, commands, s);
      b.setAttribute('aria-disabled', a.enabled ? 'false' : 'true');
      b.title = (catalog.tools[id]?.name || b.getAttribute('aria-label') || id) + (a.enabled ? '' : ': ' + a.reason);
      b.dataset.wsReason = a.reason || '';
    }
    for (const s of root.querySelectorAll('[data-ws-setting]')) {
      const a = commands.describe(s.dataset.wsSetting);
      s.disabled = !a.enabled;
      s.parentElement.title = a.reason;
      // Focusable explanation next to an unavailable native select also works on touch.
      s.parentElement.setAttribute('tabindex', a.enabled ? '-1' : '0');
      s.parentElement.dataset.wsReason = a.reason;
    }
  }
  function syncSelect(select, value) {
    if (document.activeElement === select) return;
    if (select.dataset.wsSetting === 'scale' && select.dataset.wsScaleUnits !== A.units()) { const fresh = settingsSelect('scale'); select.replaceChildren(...fresh.options); select.dataset.wsScaleUnits = A.units(); }
    if (![...select.options].some(o => o.value === String(value))) select.append(node('option', { value }, '1 : ' + value));
    select.value = String(value);
  }
  function renderDrawingTabs() {
    const signature = JSON.stringify([tabs.all.map(v => [v.id, v.name]), tabs.active?.id]); if (signature === tabSignature) return;
    tabSignature = signature;
    drawingTabs.replaceChildren(...tabs.all.map(v => node('div', { className: 'ws-drawing-tab', role: 'presentation' },
      button((v.kind === '3d' ? '◇ ' : '▱ ') + v.name, { role: 'tab', 'data-ws-drawing': v.id, 'aria-selected': tabs.active?.id === v.id }),
      button('×', { 'aria-label': 'Close drawing ' + v.name, 'data-ws-close': v.id }))));
  }
  function renderViewProperties() {
    const v = browserView || tabs.active, s = snapshot();
    const setting = v?.kind === 'plan' ? views.workspaceSettings(v.levelId) : null;
    const signature = JSON.stringify([v, setting, s.document?.mid, tabs.active?.id]);
    if (signature === viewPropsSignature || viewProps.contains(document.activeElement)) return;
    viewPropsSignature = signature;
    const dl = node('dl', { className: 'ws-view-dl' });
    const row = (label, value) => dl.append(node('dt', {}, label), node('dd', {}, value));
    if (!s.document) { viewProps.replaceChildren(node('p', { className: 'ws-note' }, 'Open an existing IFC. Live geometry, names and values come from that file.'), tool('open')); return; }
    if (!v) { viewProps.replaceChildren(node('p', { className: 'ws-note' }, 'Open a drawing from Project Browser. The IFC remains open.')); return; }
    row('View name', v.name); row('View type', v.kind === 'plan' ? 'Floor Plan' : '3D View');
    row('Document', s.name);
    if (v.kind === 'plan') {
      const isActive = tabs.active?.id === v.id;
      const ds = settingsSelect('detail'), sc = settingsSelect('scale');
      syncSelect(ds, setting?.detail || 'coarse'); syncSelect(sc, setting?.scale || 0);
      row('View Scale', isActive ? sc : '1 : ' + (setting?.scale || 'Fit')); row('Detail Level', isActive ? ds : setting?.detail || 'coarse'); row('View Range', isActive ? tool('range', true) : 'Open this view to edit');
      row('Cut plane', fmtLen(setting?.cut ?? 1200, A.units()));
      row('Top', setting?.top ? fmtLen(setting.top, A.units()) : 'Level height (automatic)');
      row('Bottom', fmtLen(setting?.bottom ?? 0, A.units())); row('View depth', fmtLen(setting?.depth ?? 50, A.units()));
      if (setting?.template) row('View template', setting.template);
      if (tabs.active?.id !== v.id) {
        for (const control of dl.querySelectorAll('select, button')) { control.disabled = true; control.title = 'Open this view to edit its settings.'; }
      }
    } else row('View Range', 'Not applicable to 3D');
    viewProps.replaceChildren(node('div', { className: 'ws-prop-identity' }, icon(v.kind === 'plan' ? 'plan' : 'cube'), node('strong', {}, v.name)), dl,
      node('p', { className: 'ws-note' }, 'View settings are stored in the IFC. Scale controls paper output; canvas zoom is independent.'));
  }
  function restrictProperties() {
    if (!active) return;
    for (const element of restricted.keys()) if (!element.isConnected) restricted.delete(element);
    for (const input of props.querySelectorAll('input, select, button, textarea')) {
      const editable = input.matches(INSTANCE_WALL_FIELDS) && walls.metadata().supported;
      if (editable && input.matches('[data-mp-assembly]') && !input.hasAttribute('data-ws-wall-label')) { input.dataset.wsWallLabel = input.textContent; input.textContent = 'Edit Type…'; }
      const textCopy = input.matches('.bc-copy');
      if (!editable && !textCopy && !restricted.has(input)) {
        restricted.set(input, { disabled: input.disabled, title: input.title, ariaDisabled: input.getAttribute('aria-disabled') });
        const why = input.matches('[data-mp-assembly]') ? availability('assembly', commands, snapshot()).reason : 'Read-only in this workspace slice. Use Established layout for other supported property and type actions.';
        if (input.tagName === 'BUTTON') { input.disabled = false; input.setAttribute('aria-disabled', 'true'); input.dataset.wsReadonly = why; input.dataset.wsReason = why; }
        else input.disabled = true;
        input.title = why;
      }
      if (editable && input.matches('[data-mp-height], [data-mp-base]')) input.setAttribute('aria-label', input.matches('[data-mp-height]') ? 'Wall height' : 'Base offset');
    }
    for (const dd of props.querySelectorAll('dd')) {
      const label = dd.previousElementSibling?.textContent;
      if (label) for (const i of dd.querySelectorAll('input, select')) if (!i.hasAttribute('aria-label')) i.setAttribute('aria-label', label);
    }
  }
  function restoreRestrictions() {
    for (const b of props.querySelectorAll('[data-ws-wall-label]')) { b.textContent = b.dataset.wsWallLabel; delete b.dataset.wsWallLabel; }
    for (const [element, values] of restricted) { element.disabled = values.disabled; element.title = values.title; if (values.ariaDisabled === null) element.removeAttribute('aria-disabled'); else element.setAttribute('aria-disabled', values.ariaDisabled); delete element.dataset.wsReadonly; delete element.dataset.wsReason; }
    restricted.clear();
    for (const b of browser?.querySelectorAll('[data-ws-original-title]') || []) { b.removeAttribute('aria-disabled'); b.title = b.dataset.wsOriginalTitle; delete b.dataset.wsOriginalTitle; }
    browser?.querySelector('[data-ws-browser-3d]')?.closest('li')?.remove();
    for (const summary of browser?.querySelectorAll('[data-ws-original-summary]') || []) { summary.textContent = summary.dataset.wsOriginalSummary; delete summary.dataset.wsOriginalSummary; }
  }
  function refresh() {
    if (!active) return;
    const c = current();
    if (!['none', 'ifc'].includes(c.mode)) { setActive(false); status('This file uses the established layout. The live workspace supports IFC projects.'); return; }
    if (documentToken !== c.editor) { opened(); return; }
    // A rebuild retains the editor token and therefore retains drawing tabs and cameras.
    attachBrowser();
    const s = snapshot();
    const isWall = s.selection.length === 1 && !!props.querySelector('[data-mp-height]');
    if (isWall !== wallContext) { wallContext = isWall; if (wallContext) tab = 'Modify | Walls'; else if (tab === 'Modify | Walls') tab = 'Architecture'; renderRibbonTabs(); }
    title.textContent = (s.name || 'No IFC open') + (s.dirty ? ' *' : '');
    header.title = s.name || '';
    options.classList.toggle('ws-wall-options', wallContext);
    options.querySelector('strong').textContent = s.wall.placing ? 'Modify | Place Wall' : wallContext ? 'Modify | Walls' : 'Modify';
    options.querySelector('[data-ws-options-text]').textContent = s.busy ? 'Updating real model…' : s.wall.placing ? 'New wall placement defaults' : wallContext ? 'Selected wall · Instance settings in Properties · Edit Type for shared structure' : s.document ? 'Select an element. Open views from Project Browser.' : 'Open an IFC to begin.';
    options.classList.toggle('ws-placing', s.wall.placing);
    statusBar.querySelector('[data-ws-selection]').textContent = s.selection.length ? s.selection.length + ' element' + (s.selection.length === 1 ? '' : 's') + ' selected' : 'No element selected';
    drawingTitle.textContent = tabs.active?.name || 'No drawing';
    stage.classList.toggle('ws-no-view', !!s.document && !tabs.active);
    emptyView.hidden = !s.document || !!tabs.active;
    elementProps.hidden = s.wall.placing || propertyMode !== 'element' || !s.selection.length;
    viewProps.hidden = s.wall.placing || !elementProps.hidden;
    propHeading.textContent = s.wall.placing ? 'Properties · New wall' : viewProps.hidden ? 'Properties · Element' : 'Properties · View';
    if (!viewProps.hidden) renderViewProperties();
    syncSelect(detailSelect, s.settings?.detail || 'coarse'); syncSelect(scaleSelect, s.settings?.scale || 0);
    walls.refresh(); restrictProperties(); refreshTools(); renderDrawingTabs();
  }
  function propertiesChanged() { propsToken = props.firstChild; refreshSoon(); }
  function picked() { if (!snapshot().busy) { propertyMode = current().selection.length ? 'element' : 'view'; if (propertyMode === 'view') browserView = tabs.active; } refreshSoon(); }
  // Observe only actual property-node replacement, never resize or keystrokes; no redecorating of active fields.
  new MutationObserver(() => { if (props.firstChild !== propsToken) propertiesChanged(); }).observe(props, { childList: true });

  function explain(id, customReason) {
    const t = catalog.tools[id]; const a = availability(id, commands, snapshot());
    const dlg = node('dialog', { className: 'ws-dialog', 'aria-label': t?.name || 'Command availability' },
      node('h2', {}, t?.name || 'Command availability'), node('p', {}, customReason || a.reason || 'Wired in F28-A.'),
      a.evidence ? node('p', { className: 'ws-evidence' }, 'Evidence: ' + a.evidence) : null,
      node('p', {}, 'Use Established layout for workflows that have not yet moved to this workspace.'),
      button('Established layout', { 'data-ws-fallback': '' }), button('Close', { 'data-ws-dismiss': '' }));
    root.append(dlg); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal();
  }
  function inventory() {
    const query = node('input', { type: 'search', placeholder: 'Find a command, feature or limitation', 'aria-label': 'Search tool availability' });
    const list = node('div', { className: 'ws-inventory-list' });
    const render = () => {
      const q = query.value.toLowerCase();
      list.replaceChildren(...Object.values(catalog.tools).filter(t => (t.name + t.feature + t.scope + t.status).toLowerCase().includes(q)).map(t => {
        const a = availability(t.key, commands, snapshot());
        return node('article', {}, node('strong', {}, t.name + ' · ' + (a.enabled ? 'Wired' : commands.ids.includes(t.key) ? 'Wired · unavailable now' : t.status)), node('p', {}, a.reason || 'Enabled for the current document and view.'), node('small', {}, t.evidence));
      }));
    };
    const dlg = node('dialog', { className: 'ws-dialog ws-inventory', 'aria-label': 'Tool availability' }, node('h2', {}, 'Tool availability · F28-B'), query, list, button('Close', { 'data-ws-dismiss': '' }));
    query.addEventListener('input', render); root.append(dlg); render(); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal();
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('button, [data-ws-reason]'); if (!b) return;
    if (b.hasAttribute('data-ws-fallback')) { b.closest('dialog')?.close(); setActive(false); return; }
    if (b.hasAttribute('data-ws-dismiss')) { b.closest('dialog').close(); return; }
    if (b.hasAttribute('data-ws-inventory')) { inventory(); return; }
    if (b.hasAttribute('data-ws-file')) { const menu = node('dialog', { className: 'ws-dialog', 'aria-label': 'File' }, node('h2', {}, 'File'), tool('open', true), tool('save', true), button('Close', { 'data-ws-dismiss': '' })); root.append(menu); menu.addEventListener('close', () => menu.remove()); menu.showModal(); refreshTools(); return; }
    if (b.dataset.wsTab) { tab = b.dataset.wsTab; renderRibbonTabs(); ribbonTabs.querySelector('[aria-selected="true"]')?.focus(); return; }
    if (b.dataset.wsCommand) {
      const id = b.dataset.wsCommand, a = availability(id, commands, snapshot());
      if (!a.enabled) explain(id); else { b.closest('dialog')?.close(); commands.execute(id); }
      return;
    }
    if (b.hasAttribute('data-ws-view-props')) { if (A.S.tool === 'wall') A.setTool('select'); showViewProperties(); return; }
    if (b.dataset.wsDrawing) { const v = tabs.all.find(v => v.id === b.dataset.wsDrawing); if (v) activate(v); return; }
    if (b.dataset.wsClose) {
      rememberCamera(); const next = tabs.close(b.dataset.wsClose); if (next) activate(next); else { browserView = null; propertyMode = 'view'; refresh(); } return;
    }
    if (b.dataset.wsReason) explain('', b.dataset.wsReason);
  });
  root.addEventListener('change', e => {
    const key = e.target.dataset.wsSetting; if (!key) return;
    commands.execute(key, key === 'scale' ? Number(e.target.value) : e.target.value);
  });
  // Retain real property buttons, but make unavailable actions focusable/touch-discoverable without invoking their handlers.
  root.addEventListener('click', e => {
    if (!active || !props.contains(e.target)) return;
    const b = e.target.closest('[data-ws-readonly]'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation(); explain(b.matches('[data-mp-assembly]') ? 'assembly' : '', b.dataset.wsReadonly);
  }, true);
  // Capture existing Project Browser actions only in the live layout. Retained fallback handlers stay untouched.
  root.addEventListener('click', e => {
    if (!active || !browser?.contains(e.target)) return;
    const b = e.target.closest('button'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (b.dataset.pbPlan || b.hasAttribute('data-ws-browser-3d')) {
      browserView = b.hasAttribute('data-ws-browser-3d') ? threeView() : snapshot().levels.map(planView).find(v => v.guid === b.dataset.pbPlan);
      propertyMode = 'view'; refresh();
    } else if (b.dataset.pbRange) {
      if (!snapshot().busy) openRangeFor(b.dataset.pbRange);
    } else explain('', b.title);
  }, true);
  root.addEventListener('dblclick', e => {
    if (!active || !browser?.contains(e.target)) return;
    const b = e.target.closest('[data-pb-plan], [data-ws-browser-3d]'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    b.hasAttribute('data-ws-browser-3d') ? activate(threeView()) : activatePlan(b.dataset.pbPlan);
  }, true);
  root.addEventListener('keydown', e => {
    if (!active) return;
    const b = e.target;
    if (b.dataset.wsTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const items = [...ribbonTabs.querySelectorAll('[role="tab"]')], i = items.indexOf(b);
      const next = e.key === 'Home' ? items[0] : e.key === 'End' ? items.at(-1) : items[(i + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length];
      e.preventDefault(); tab = next.dataset.wsTab; renderRibbonTabs(); ribbonTabs.querySelector('[aria-selected="true"]').focus();
    }
    if (e.key === 'Enter' && b.matches('[data-pb-plan], [data-ws-browser-3d]')) { e.preventDefault(); e.stopImmediatePropagation(); b.hasAttribute('data-ws-browser-3d') ? activate(threeView()) : activatePlan(b.dataset.pbPlan); }
    if (e.key === 'Enter' && !isTextEntry(b) && b.dataset.wsReason && !b.matches('button')) { e.preventDefault(); explain('', b.dataset.wsReason); }
  }, true);
  function showTooltip(e) {
    if (!active) return;
    const b = e.target.closest('[data-ws-command], [aria-disabled="true"], [data-ws-reason]'); if (!b) return;
    const why = b.dataset.wsReason || b.title; if (!why) return;
    tooltip.textContent = why; tooltip.hidden = false; b.setAttribute('aria-describedby', tooltip.id);
    const r = b.getBoundingClientRect(); tooltip.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 350)) + 'px'; tooltip.style.top = Math.min(r.bottom + 5, window.innerHeight - 150) + 'px';
  }
  root.addEventListener('pointerover', showTooltip); root.addEventListener('focusin', showTooltip);
  root.addEventListener('pointerout', () => { tooltip.hidden = true; }); root.addEventListener('focusout', () => { tooltip.hidden = true; refreshSoon(); });

  // These separators resize only CSS tracks; the existing renderers' ResizeObservers retain their cameras and picking transforms.
  let width = 278, height = 50;
  function resizeWidth(value) { width = Math.round(Math.max(220, Math.min(480, window.innerWidth * .48, value))); root.style.setProperty('--ws-panel', width + 'px'); widthGrip.setAttribute('aria-valuenow', width); }
  function resizeHeight(value) { height = Math.max(25, Math.min(75, value)); palettes.style.setProperty('--ws-props', height + '%'); split.setAttribute('aria-valuenow', Math.round(height)); }
  function resizeGrip(grip, move) {
    grip.addEventListener('pointerdown', e => { if (e.button !== 0) return; e.preventDefault(); grip.setPointerCapture(e.pointerId); grip.dataset.dragging = 'true'; });
    grip.addEventListener('pointermove', e => { if (grip.hasPointerCapture(e.pointerId)) move(e); });
    grip.addEventListener('pointerup', e => { if (grip.hasPointerCapture(e.pointerId)) grip.releasePointerCapture(e.pointerId); delete grip.dataset.dragging; });
  }
  resizeGrip(widthGrip, e => resizeWidth(e.clientX - root.getBoundingClientRect().left));
  resizeGrip(split, e => { const r = palettes.getBoundingClientRect(); resizeHeight((e.clientY - r.top) / r.height * 100); });
  widthGrip.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); resizeWidth(width + (e.key === 'ArrowRight' ? 10 : -10)); } });
  split.addEventListener('keydown', e => { if (['ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); resizeHeight(height + (e.key === 'ArrowDown' ? 5 : -5)); } });
  renderRibbonTabs();
  if (new URLSearchParams(location.search).get('workspace') === 'live') setActive(true);
  return { get active() { return active; }, refresh: refreshSoon, opened, state: snapshot, propertiesChanged, picked,
    inspect: () => { const s = snapshot(); return { active, document: s.document ? s.name : null, busy: s.busy, dirty: s.dirty, selection: s.selection, view: s.view, tabs: tabs.all, settings: s.settings, propertyMode }; },
    selectTool: () => { A.setTool('select'); status('Select an element in the active view.'); },
    activatePlan, activate3d: () => activate(threeView()), openRange, setSettings, fit, established: () => setActive(false),
    startWall: () => walls.start(), editType: () => walls.editType(), editStructure: () => walls.editStructure(), cancelWall: finish => { A.workspaceCancel(finish); refreshSoon(); } };
}
