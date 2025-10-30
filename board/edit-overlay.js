const EDIT_PAGE_URL = './add_task/form_task.html';
const ADD_TASK_CSS = [
  'task_style.css',
  'add_task_inputs.css',
  'responsive.css',
  'add_task_components.css',
  'responsive_board_overlay.css'
];
const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
const FIREBASE_BASE_URL = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app';

const ADD_TASK_JS = [
  'add_task_templates.js',
  'add_task.js',
  'add_task_interactions.js'
];

const FIREBASE_JS = [
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js'
];

function ensureEditOverlay() {
  let bg = document.getElementById('edit-overlay-bg');
  if (bg) return bg;
  bg = document.createElement('div');
  bg.id = 'edit-overlay-bg';
  bg.className = 'overlay-bg';
  const card = document.createElement('div');
  card.id = 'edit-overlay-card';
  card.className = 'overlay-card overlay-card--flex';
  const closeImg = document.createElement('img');
  closeImg.id = 'edit-overlay-close';
  closeImg.className = 'overlay-close';
  closeImg.src = './assets/Close.png';
  closeImg.alt = 'Close';
  const host = document.createElement('div');
  host.id = 'edit-overlay-host';
  host.className = 'overlay-host';
  const footer = document.createElement('div');
  footer.id = 'edit-overlay-footer';
  footer.className = 'overlay-footer';
  card.append(closeImg, host, footer);
  bg.append(card);
  document.body.append(bg);
  const close = () => closeEditOverlay();
  closeImg.addEventListener('click', close);
  bg.addEventListener('click', (e) => { if (e.target === bg) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  return bg;
}

function injectCss(doc) {
  const base = new URL('./add_task/', document.baseURI);
  const head = doc.head || doc.getElementsByTagName('head')[0];
  const links = [];
  const g = doc.createElement('link');
  g.rel = 'stylesheet';
  g.href = GOOGLE_FONTS;
  head.appendChild(g);
  links.push(g);
  ADD_TASK_CSS.forEach(file => {
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(file, base).href;
    head.appendChild(link);
    links.push(link);
  });
  const s = doc.createElement('style');
  s.textContent = `
    body{background:transparent!important}
    .left-side,header,footer,.navbar,.join-logo{display:none!important}
    .content{padding:0!important}
  `;
  head.appendChild(s);
  return Promise.all(links.map(l => new Promise(res => { l.onload = l.onerror = res; })));
}

function loadScriptsSequential(doc, urls) {
  return urls.reduce((p, src) => p.then(() => new Promise((res, rej) => {
    const s = doc.createElement('script');
    s.src = src;
    s.onload = () => res();
    s.onerror = rej;
    doc.body.appendChild(s);
  })), Promise.resolve());
}

function injectJs(doc) {
  const base = new URL('./add_task/', document.baseURI);
  const ordered = [...FIREBASE_JS, ...ADD_TASK_JS.map(f => new URL(f, base).href)];
  return loadScriptsSequential(doc, ordered);
}

function afterFrameReady(doc) {
  const addBtn = doc.getElementById('add-task-button');
  const clearBtn = doc.getElementById('clear-button');
  if (addBtn) addBtn.style.display = 'none';
  if (clearBtn) clearBtn.style.display = 'none';
  // Prevent any accidental activation of add-task inside edit iframe
  try {
    doc.addEventListener('click', (ev) => {
      const t = ev.target;
      if (t && (t.id === 'add-task-button' || t.closest?.('#add-task-button'))) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation?.();
      }
    }, true);
  } catch {}

  // Prefill form fields with the task being edited (logic-only, no UI changes)
  try {
    const w = doc.defaultView || doc.parentWindow;
    const task = w?.__EDIT_TASK__ || window.__editTaskPending || null;
    if (task) {
      const byId = (id) => doc.getElementById(id);
      const setVal = (id, v) => { const el = byId(id); if (el) el.value = String(v ?? ''); };
      setVal('title-input', task.title ?? '');
      setVal('description-input', task.description ?? '');
      const d = task.enddate || task.due || task.date || '';
      setVal('date-input', d);
      const cat = (String(task.main||'').toLowerCase()==='techtask') ? 'Technical Task' : 'User Story';
      const catInput = byId('category-input'); if (catInput) catInput.placeholder = cat;
      const prio = String(task.priority||'').toLowerCase();
      // Best-effort set priority CSS like the form expects
      const urgent = byId('urgent');
      const med = byId('medium-input');
      const low = byId('low-input');
      if (urgent && med && low) {
        urgent.classList.remove('bg-red');
        med.classList.remove('bg-orange');
        low.classList.remove('bg-green');
        if (prio==='urgent') urgent.classList.add('bg-red');
        else if (prio==='low') low.classList.add('bg-green');
        else med.classList.add('bg-orange');
      }
    }
  } catch {}
}

function openEditOverlay() {
  window.__editTaskOpen = true;
  const bg = ensureEditOverlay();
  const host = document.getElementById('edit-overlay-host');
  const footer = document.getElementById('edit-overlay-footer');
  host.innerHTML = '';
  footer.innerHTML = '';

  const frame = document.createElement('iframe');
  frame.src = new URL(EDIT_PAGE_URL, document.baseURI).href;
  frame.title = 'Edit Task';
  frame.style.cssText = 'width:100%;height:100%;border:0;display:block;visibility:hidden';
  host.appendChild(frame);

  frame.addEventListener('load', async () => {
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;
    try { await injectCss(doc); } catch {}
    try { await injectJs(doc); } catch {}
    // Pass edit context into iframe (for scripts that can use it)
    try {
      const w = frame.contentWindow;
      w.__EDIT_MODE__ = true;
      if (window.__editTaskPending) w.__EDIT_TASK__ = window.__editTaskPending;
    } catch {}
    afterFrameReady(doc);
    frame.style.visibility = 'visible';
  });

  const okBtn = document.createElement('button');
  okBtn.id = 'edit-overlay-accept';
  okBtn.type = 'button';
  okBtn.textContent = 'OK';
  okBtn.className = 'create-task-button';
  okBtn.addEventListener('click', async () => {
    try {
      const frameDoc = document.getElementById('edit-overlay-host')?.querySelector('iframe')?.contentDocument;
      const src = (window.__editTaskPending || {});
      if (!src || src.id == null) { closeEditOverlay(); return; }
      const getVal = (id) => frameDoc?.getElementById(id)?.value ?? '';
      const getCat = () => {
        const ci = frameDoc?.getElementById('category-input');
        const p = (ci?.placeholder || '').toLowerCase();
        if (p.includes('tech')) return 'techtask';
        if (p.includes('user')) return 'userstory';
        return src.main || 'userstory';
      };
      const getPrio = () => {
        const u = frameDoc?.getElementById('urgent');
        const m = frameDoc?.getElementById('medium-input');
        const l = frameDoc?.getElementById('low-input');
        if (u?.classList.contains('bg-red')) return 'urgent';
        if (l?.classList.contains('bg-green')) return 'low';
        if (m?.classList.contains('bg-orange')) return 'medium';
        return src.priority || 'medium';
      };
      const updated = {
        ...src,
        title: getVal('title-input'),
        description: getVal('description-input'),
        enddate: getVal('date-input'),
        main: getCat(),
        priority: getPrio()
      };
      document.dispatchEvent(new CustomEvent('task:update', { detail: { task: updated } }));
      // Direct save fallback in case listeners are not active
      try {
        const BASE = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app';
        await fetch(`${BASE}/tasks/${updated.id}.json`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
        });
        try { window.dispatchEvent(new CustomEvent('tasks:changed')); } catch {}
      } catch {}
    } catch {}
    closeEditOverlay();
  });
  footer.appendChild(okBtn);

  bg.classList.add('is-open');
  document.body.classList.add('no-scroll');
}

function closeEditOverlay() {
  window.__editTaskOpen = false;
  const bg = document.getElementById('edit-overlay-bg');
  if (!bg) return;
  bg.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action="edit"], .btn-edit, a[href="#edit"]');
  if (!el) return;
  e.preventDefault();
  e.stopPropagation();
  openEditOverlay();
}, { capture: true });

window.openEditOverlay = openEditOverlay;
window.closeEditOverlay = closeEditOverlay;
