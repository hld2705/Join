const EDIT_FORM_URL = './add_task/form_task.html';

const ABS_FORM_URL  = new URL(EDIT_FORM_URL, location.href);
const EDIT_FORM_DIR = new URL('.', ABS_FORM_URL);
const EDIT_FORM_CSS = new URL('edit.css', EDIT_FORM_DIR).href;

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

async function openEditOverlay() {
  const bg     = ensureEditOverlay();
  const host   = document.getElementById('edit-overlay-host');
  const footer = document.getElementById('edit-overlay-footer');

  ensureExternalCss(EDIT_FORM_CSS);

  host.innerHTML = '<div class="overlay-loading">Formular wird geladen …</div>';
  footer.innerHTML = '';

  try {
    const res = await fetch(ABS_FORM_URL, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    host.replaceChildren(tpl.content);
    activateEmbeddedEditMode({ host, footer });
  } catch (err) {
    console.error('[overlay] Fehler beim Laden der Form:', err);
    host.innerHTML = '<div class="overlay-error">Fehler beim Laden des Formulars.</div>';
  }

  bg.classList.add('is-open');
  document.body.classList.add('no-scroll');
}

function closeEditOverlay() {
  const bg = document.getElementById('edit-overlay-bg');
  if (!bg) return;
  bg.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}

function ensureExternalCss(href) {
  if (!href) return;
  const id = 'edit-overlay-external-css';
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';

 
  const url = new URL(href);
  url.searchParams.set('v', String(Date.now()));
  link.href = url.href;

  document.head.appendChild(link);
}

function installPolyfills(root) {
  if (!window.switchArrowIcon) {
    window.switchArrowIcon = function switchArrowIcon() {
      const el = root.querySelector('[data-rotate-target]');
      if (el) el.classList.toggle('is-open');
    };
  }
  if (!window.showUserName) {
    window.showUserName = function showUserName() {
      const dd = root.querySelector('.assigned-dropdown, [data-assignee-list], #dropdownList');
      if (dd) dd.classList.toggle('is-open');
    };
  }
  if (!window.openCalendar) {
    window.openCalendar = function openCalendar() {
      const input = root.querySelector('#date-input, input[type="date"]');
      if (!input) return;
      if (input.showPicker) input.showPicker();
      else { input.focus(); input.click(); }
    };
  }
}

function activateEmbeddedEditMode({ host, footer }) {
  host.classList.add('edit-overlay', 'task-content-scroll');

  installPolyfills(host);

  host.querySelector('#add-task-button')?.classList.add('is-hidden');
  host.querySelector('#clear-button')?.classList.add('is-hidden');

  let okBtn = host.querySelector('#edit-overlay-accept');
  if (okBtn) {
    okBtn.remove();
  } else {
    okBtn = document.createElement('button');
    okBtn.id = 'edit-overlay-accept';
    okBtn.type = 'button';
    okBtn.textContent = 'OK';
    okBtn.className = 'create-task-button';
  }

  footer.appendChild(okBtn);

  if (!okBtn.__bound) {
    okBtn.__bound = true;
    okBtn.addEventListener('click', () => {
      try { window.dispatchEvent(new CustomEvent('tasks:changed')); } catch {}
      closeEditOverlay();
    });
  }
}

document.addEventListener(
  'click',
  (e) => {
    const el = e.target.closest('[data-action="edit"], a[href="#edit"]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    openEditOverlay();
  },
  { capture: true }
);

window.openEditOverlay  = openEditOverlay;
window.closeEditOverlay = closeEditOverlay;
