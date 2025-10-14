const EDIT_FORM_URL = './add_task/form_task.html';

function ensureEditOverlay() {
  let bg = document.getElementById('edit-overlay-bg');
  if (bg) return bg;

  bg = document.createElement('div');
  bg.id = 'edit-overlay-bg';
  bg.className = 'overlay-bg';
  bg.style.cssText =
    'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.5);z-index:999999;';

  const card = document.createElement('div');
  card.id = 'edit-overlay-card';
  card.className = 'overlay-card';
  card.style.cssText =
    'background:#fff;max-width:92vw;max-height:90vh;border-radius:12px;position:relative;overflow:auto;';

  const closeImg = document.createElement('img');
  closeImg.id = 'edit-overlay-close';
  closeImg.className = 'overlay-close';
  closeImg.src = './assets/Close.png';
  closeImg.alt = 'Close';
  closeImg.style.cssText =
    'position:absolute;right:12px;top:12px;width:24px;height:24px;cursor:pointer;';

  const host = document.createElement('div');
  host.id = 'edit-overlay-host';

  card.append(closeImg, host);
  bg.append(card);
  document.body.append(bg);

  const close = () => closeEditOverlay();
  closeImg.addEventListener('click', close);
  bg.addEventListener('click', (e) => { if (e.target === bg) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  return bg;
}

function openEditOverlay() {
  const bg   = ensureEditOverlay();
  const host = document.getElementById('edit-overlay-host');

  host.innerHTML =
    '<div class="overlay-loading" style="padding:16px;font:14px system-ui">Formular wird geladen …</div>';
  host.querySelector('#edit-form-frame')?.remove();

  const frame = document.createElement('iframe');
  frame.id = 'edit-form-frame';
  frame.className = 'overlay-frame';
  frame.src = EDIT_FORM_URL;
  frame.style.cssText =
    'width:100%;height:80vh;border:0;display:block;background:#fff;border-radius:8px;';

  frame.onload = async () => {
    host.querySelector('.overlay-loading')?.remove();
    await activateIframeEditMode(frame);
  };

  host.appendChild(frame);

  bg.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeEditOverlay() {
  const bg = document.getElementById('edit-overlay-bg');
  if (!bg) return;
  bg.style.display = 'none';
  document.body.style.overflow = '';
}

async function injectCssIntoFrame(frame) {
  const doc = frame.contentDocument || frame.contentWindow?.document;
  if (!doc) return;

  doc.getElementById('edit-overlay-inline-css')?.remove();

  if (doc.getElementById('edit-overlay-external-css')) return;

  const href = new URL('responsive_board_overlay.css', frame.src);
  href.searchParams.set('v', String(Date.now())); 

  const link = doc.createElement('link');
  link.id  = 'edit-overlay-external-css';
  link.rel = 'stylesheet';
  link.href = href.href;

  await new Promise((resolve, reject) => {
    link.onload  = resolve;
    link.onerror = (e) => {
      console.error('[overlay css] Fehler beim Laden:', href.href, e);
      reject(e);
    };
    doc.head.appendChild(link);
  });
}

function installIframePolyfills(doc) {
  const win = doc.defaultView || window;

  if (!win.switchArrowIcon) {
    win.switchArrowIcon = function switchArrowIcon() {
      const el = doc.querySelector('[data-rotate-target]');
      if (el) el.classList.toggle('is-open');
    };
  }

  if (!win.showUserName) {
    win.showUserName = function showUserName() {
      const dd = doc.querySelector('.assigned-dropdown, [data-assignee-list]');
      if (dd) dd.classList.toggle('is-open');
    };
  }

  if (!win.openCalendar) {
    win.openCalendar = function openCalendar() {
      const input = doc.getElementById('date-input') || doc.querySelector('input[type="date"]');
      if (input && input.showPicker) {
        input.showPicker(); 
      } else if (input) {
        input.focus();
        input.click();
      }
    };
  }
}

async function activateIframeEditMode(frame) {
  const doc = frame.contentDocument || frame.contentWindow?.document;
  if (!doc) return;

  doc.documentElement.classList.add('edit-overlay');
  doc.body.classList.add('edit-overlay');

  await injectCssIntoFrame(frame);

  installIframePolyfills(doc);

  doc.getElementById('add-task-button')?.setAttribute('style', 'display:none !important');
  doc.getElementById('clear-button')?.setAttribute('style', 'display:none !important');

  const btnWrap =
    doc.querySelector('.createTaskBtn-svg-container') ||
    doc.querySelector('.task-button-container') ||
    doc.getElementById('tbc-wrapper-inner') ||
    doc.body;

  let okBtn = doc.getElementById('edit-overlay-accept');
  if (!okBtn) {
    okBtn = doc.createElement('button');
    okBtn.id = 'edit-overlay-accept';
    okBtn.type = 'button';
    okBtn.textContent = 'OK';
    okBtn.className = 'overlay-ok-btn';
  }

  if (!okBtn.parentElement || okBtn.parentElement !== btnWrap) {
    const before = btnWrap.querySelector('.check-icon');
    before ? btnWrap.insertBefore(okBtn, before) : btnWrap.appendChild(okBtn);
  }

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
