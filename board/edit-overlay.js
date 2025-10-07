const EDIT_FORM_URL = './add_task/form_task.html';


function ensureEditOverlay() {
  let bg = document.getElementById('edit-overlay-bg');
  if (bg) return bg;

  bg = document.createElement('div');
  bg.id = 'edit-overlay-bg';
  bg.style.cssText = `
    position: fixed; inset: 0; display: none;
    align-items: center; justify-content: center;
    background: rgba(0,0,0,.5); z-index: 999999;
  `;

  const card = document.createElement('div');
  card.id = 'edit-overlay-card';
  card.style.cssText = `
    background: #fff; width: 525px; height: 871px;
    max-height: 90vh; overflow: auto; border-radius: 12px; padding: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,.35); position: relative;
  `;

  const closeImg = document.createElement('img');
  closeImg.id = 'edit-overlay-close';
  closeImg.src = './assets/Close.png';
  closeImg.alt = 'Schließen';
  closeImg.style.cssText = `
    position: absolute; right: 12px; top: 12px;
    width: 24px; height: 24px; cursor: pointer;
  `;

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

/* 2) Overlay open + load iFrame */
function openEditOverlay() {
  const bg   = ensureEditOverlay();
  const host = document.getElementById('edit-overlay-host');

  host.innerHTML = '<div style="padding:16px;font:14px system-ui">Formular wird geladen …</div>';
  host.querySelector('#edit-form-frame')?.remove();

  const frame = document.createElement('iframe');
  frame.id = 'edit-form-frame';
  frame.src = EDIT_FORM_URL;
  frame.style.cssText = 'width:100%;height:80vh;border:0;display:block;background:#fff;border-radius:8px;';

  frame.onload = () => {
    host.querySelector('div')?.remove();
    activateIframeEditMode(frame);
  };

  host.appendChild(frame);

  bg.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/* 3) Overlay close */
function closeEditOverlay() {
  const bg = document.getElementById('edit-overlay-bg');
  if (!bg) return;
  bg.style.display = 'none';
  document.body.style.overflow = '';
}

/* 4) iFrame: Edit-Modus */
function activateIframeEditMode(frame) {
  try {
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;

    doc.documentElement.classList.add('edit-overlay');
    doc.body.classList.add('edit-overlay');

    // edit.css 
    if (!doc.getElementById('edit-overlay-external-css')) {
      const link = doc.createElement('link');
      link.id  = 'edit-overlay-external-css';
      link.rel = 'stylesheet';
      link.href = new URL('edit.css', frame.src).href;
      doc.head.appendChild(link);
    }

    if (!doc.documentElement.style.background) doc.documentElement.style.background = '#fff';
    if (!doc.body.style.background)            doc.body.style.background = '#fff';

    if (!doc.getElementById('edit-overlay-inline-css')) {
      const style = doc.createElement('style');
      style.id = 'edit-overlay-inline-css';
      style.textContent = `
        #add-task-button { display: none !important; }
        #clear-button    { display: none !important; }
        #edit-overlay-accept {
          display: inline-flex !important;
          align-items: center; justify-content: center;
          gap: .5rem;
          padding: .75rem 1rem;
          border-radius: 10px;
          border: 1px solid #2A3647;
          background: #2A3647;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: filter .15s ease;
        }
        #edit-overlay-accept:hover { filter: brightness(.95); }
      `;
      doc.head.appendChild(style);
    }

    const btnWrap =
      doc.querySelector('.createTaskBtn-svg-container') ||
      doc.querySelector('.task-button-container') ||
      doc.getElementById('tbc-wrapper-inner') ||
      doc.body;

    const createBtn = doc.getElementById('add-task-button');
    if (createBtn) createBtn.style.display = 'none';

    let okBtn = doc.getElementById('edit-overlay-accept');
    if (!okBtn) {
      okBtn = doc.createElement('button');
      okBtn.id = 'edit-overlay-accept';
      okBtn.type = 'button';
      okBtn.textContent = 'OK';
    }

    if (createBtn?.className) okBtn.className = createBtn.className;
    else okBtn.classList.add('create-task-button');

    const checkIcon = btnWrap.querySelector('.check-icon');
    if (!okBtn.parentElement || okBtn.parentElement !== btnWrap) {
      if (checkIcon) btnWrap.insertBefore(okBtn, checkIcon);
      else btnWrap.appendChild(okBtn);
    }


    okBtn.style.backgroundColor = '#2A3647';
    okBtn.style.borderColor     = '#2A3647';
    okBtn.style.color           = '#fff';
    okBtn.style.display         = 'inline-flex';

    // Click-Handler
    if (!okBtn.__bound) {
      okBtn.__bound = true;
      okBtn.addEventListener('click', () => {
        closeEditOverlay();
      });
    }
  } catch (e) {
    console.warn('[EditOverlay] Edit-Modus im iFrame konnte nicht aktiviert werden:', e);
  }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action="edit"], a[href="#edit"]');
  if (!el) return;
  e.preventDefault();
  e.stopPropagation();
  openEditOverlay();
}, { capture: true });

window.openEditOverlay  = openEditOverlay;
window.closeEditOverlay = closeEditOverlay;
