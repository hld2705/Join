const EDIT_PAGE_URL = './add_task/form_task.html';
const ADD_TASK_CSS = [
  'task_style.css',
  'add_task_inputs.css',
  
  'responsive.css',
  'add_task_inputs.css',
  'add_task_components.css'
];
const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';

const ADD_TASK_JS = [
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
  const g = doc.createElement('link');
  g.rel = 'stylesheet';
  g.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  head.appendChild(g);
  ADD_TASK_CSS.forEach(file => {
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(file, base).href;
    head.appendChild(link);
  });
  const s = doc.createElement('style');
  s.textContent = `
    body{background:transparent!important}
    .left-side,header,footer,.navbar,.join-logo{display:none!important}
    .content{padding:0!important}
  `;
  head.appendChild(s);
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
  frame.style.cssText = 'width:100%;height:100%;border:0;display:block';
  host.appendChild(frame);

  frame.addEventListener('load', async () => {
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;
    injectCss(doc);
    try { await injectJs(doc); } catch {}
    afterFrameReady(doc);
  });

  const okBtn = document.createElement('button');
  okBtn.id = 'edit-overlay-accept';
  okBtn.type = 'button';
  okBtn.textContent = 'OK';
  okBtn.className = 'create-task-button';
  okBtn.addEventListener('click', () => {
    try { window.dispatchEvent(new CustomEvent('tasks:changed')); } catch {}
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