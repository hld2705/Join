const TITLES = { todo: 'To do', inprogress: 'In progress', review: 'Await feedback', done: 'Done' };
const ADD_FORM_URL = './add_task/form_task.html';

export function boardShell() {
  return `
  <div class="display-position">
    <div class="content-board">
      <div class="title-and-search">
        <div><h1>Board</h1></div>
        <div>
          <div class="task" aria-live="polite"></div>
          <div class="board-find-task">
            <div class="input-find">
              <input id="input-find-task" type="text" placeholder="Find Task">
              <div class="input-find-icon" aria-hidden="true">
                <img src="./assets/search.svg" alt="">
              </div>
            </div>
            <button id="bt-add-task" type="button">
              <p>Add Task</p><img src="./assets/plus%20add%20task.svg" alt="">
            </button>
          </div>
        </div>
      </div>
      <div class="board">
        ${['todo', 'inprogress', 'review', 'done'].map(s => `
          <div class="columns">
            <div class="column-titles">
              <p>${TITLES[s]}</p>
              ${s !== 'done' ? `<button class="btn-add" type="button" data-add="${s}" aria-label="Add to ${TITLES[s]}">+</button>` : ''}
            </div>
            <div class="columns-content" id="${s}" data-status="${s}"></div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

export function cardTemplate(task) {
  const desc = (task.description || '').trim();
  const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
  const done = subs.filter(s => s?.status === 'done').length;
  return `
    <article class="board-card" id="card${task.id}" draggable="true">
      ${mainBadge(task.main)}
      <h4 class="card-title">${esc(task.title)}</h4>
      ${desc ? `<p class="card-desc">${esc(desc)}</p>` : ''}
      <div class="card-footer">
        <div class="card-assignees-wrap">${assigneesRow(task) || ''}</div>
        <div class="status-wrap" style="min-width:160px">${subtaskBar(done, subs.length)}</div>
      </div>
    </article>
  `;
  
}

async function loadAndRenderTasks() {
  const snapshot = await firebase.database().ref('tasks').get();
  const tasks = snapshot.exists() ? Object.values(snapshot.val()) : [];
}

function mainBadge(main) {
  const map = { userstory: { t: 'User Story', c: '#3B82F6' }, techtask: { t: 'Technical Task', c: '#10B981' } };
  const cfg = map[main] ?? { t: (main || 'Task'), c: '#6B7280' };
  return `<span class="card-badge" style="background:${cfg.c}">${esc(cfg.t)}</span>`;
}

function subtaskBar(done, total) {
  const has = total > 0;
  const pct = has ? Math.round((done / total) * 100) : 0;
  const label = has ? `${done}/${total} Subtasks` : `0 Subtasks`;
  const color = !has ? '#E5E7EB' : pct >= 100 ? '#22c55e' : pct >= 50 ? '#3B82F6' : '#f59e0b';
  return `
    <div class="status-line${has ? '' : ' is-empty'}">
      <div class="status-bar" role="progressbar" aria-label="Subtask progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
        <div class="status-fill" style="width:${pct}%; background:${color}"></div>
      </div>
      <span class="status-count">${label}</span>
    </div>
  `;
}

function assigneesRow(task) {
  const list = normalizeAssignees(task);
  if (!list.length) return '';
  return `<div class="card-assignees">${list.map(a => avatarBadge(a)).join('')}</div>`;
}

function normalizeAssignees(task) {
  const raw =
    Array.isArray(task?.assigned) ? task.assigned :
    (task?.assigned && typeof task.assigned === 'object') ? [task.assigned] :
    Array.isArray(task?.assignees) ? task.assignees :
    Array.isArray(task?.assignedTo) ? task.assignedTo :
    Array.isArray(task?.assigned_to) ? task.assigned_to :
    Array.isArray(task?.team) ? task.team :
    Array.isArray(task?.users) ? task.users :
    Array.isArray(task?.participants) ? task.participants : [];

  const book = getContactsBook();
  const byId = new Map(book.map(u => [String(u?.id ?? ''), u]));
  const byEmail = new Map(book.map(u => [String(u?.email ?? '').toLowerCase(), u]));
  const byName = new Map(book.map(u => [String(u?.name ?? '').toLowerCase(), u]));

  const norm = (Array.isArray(raw) ? raw : []).map((x) => {
    if (typeof x === 'number') {
      const c = byId.get(String(x));
      const label = c?.name || `User ${x}`;
      const key = colorIdentityKey(x, c);
      return c ? contactToAvatar(c) : { name: label, initials: initialsFromName(label), color: pickColor(key) };
    }
    if (typeof x === 'string') {
      const k = x.toLowerCase();
      const c = byEmail.get(k) || byName.get(k);
      const name = c?.name || x;
      const key = colorIdentityKey(x, c);
      return c ? contactToAvatar(c) : { name, initials: initialsFromName(name), color: pickColor(key) };
    }
    if (x && typeof x === 'object') {
      const via =
        (x.id != null && byId.get(String(x.id))) ||
        (x.email && byEmail.get(String(x.email).toLowerCase())) ||
        (x.name && byName.get(String(x.name).toLowerCase())) || null;

      const composed = x.name || [x.firstName ?? x.firstname, x.lastName ?? x.lastname].filter(Boolean).join(' ') || x.email || x.username || (x.id != null ? `User ${x.id}` : '');
      const name = via?.name || composed;
      if (!name) return null;
      const key = colorIdentityKey(x, via);
      return { name, badge: x.badge || via?.badge || null, initials: x.initials || via?.initials || initialsFromName(name), color: x.color || via?.color || pickColor(key) };
    }
    return null;
  }).filter(Boolean).filter(a => a.name);

  const seen = new Set();
  return norm.filter(a => { const key = String(a.name); if (seen.has(key)) return false; seen.add(key); return true; });
}

function getContactsBook() {
  return (Array.isArray(window?.CONTACTS) && window.CONTACTS)
    || (window?.join && Array.isArray(window.join.users) && window.join.users)
    || (Array.isArray(window?.contacts) && window.contacts)
    || [];
}
function contactToAvatar(c) {
  const fixed = colorFromUser(c);
  const key = colorIdentityKey(c, c);
  return { name: c.name, badge: c.badge || null, initials: c.initials || initialsFromName(c.name), color: fixed || c.color || pickColor(key) };
}
function avatarBadge(a) {
  if (a.badge) return `<img class="avatar-img" src="${esc(a.badge)}" alt="${esc(a.name)}" title="${esc(a.name)}">`;
  return `<span class="avatar" title="${esc(a.name)}" style="background:${esc(a.color)}">${esc(a.initials)}</span>`;
}
function initialsFromName(n) { return String(n).trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join(''); }
function pickColor(key) { const s = String(key ?? ''); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return `hsl(${h} 80% 75%)`; }
function esc(s) { return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
function parseColor(v) { if (!v) return null; if (typeof v === 'string') return v.trim(); if (Array.isArray(v)) { const [r, g, b, a] = v; return a == null ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${a})`; } if (typeof v === 'object' && 'r' in v) { const { r, g, b, a } = v; return a == null ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${a})`; } return null; }
function colorFromUser(u) { return parseColor(u?.badgeColor || u?.color || u?.rgb || u?.hex); }
function colorIdentityKey(input, via) {
  if (via && via.id != null) return `id:${via.id}`;
  if (typeof input === 'number') return `id:${input}`;
  if (input && typeof input === 'object') {
    if (input.id != null) return `id:${input.id}`;
    const s = (input.email || input.name || input.username || '').toLowerCase().trim();
    return s || 'unknown';
  }
  return String(input ?? '').toLowerCase().trim() || 'unknown';
}

async function openTaskOverlay() {
  const bg = document.getElementById('task-overlay-background');
  const mount = document.getElementById('task-form-container');
  window.closeEditOverlay?.();
  mount.innerHTML = '<div class="overlay-loading">Form wird geladen …</div>';
  bg?.classList.add('is-open');
  document.body.classList.add('no-scroll');
  try {
    const res = await fetch(ADD_FORM_URL, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    mount.replaceChildren(tpl.content);
    mount.querySelector('#addTask-close-Img')?.addEventListener('click', closeTaskOverlay);
    const onBgClick = (e) => { if (e.target === bg) closeTaskOverlay(); };
    bg.addEventListener('click', onBgClick, { once: true });
    const onEsc = (e) => { if (e.key === 'Escape') { closeTaskOverlay(); document.removeEventListener('keydown', onEsc); } };
    document.addEventListener('keydown', onEsc);
  } catch {
    mount.innerHTML = '<div class="overlay-error">Formular konnte nicht geladen werden.</div>';
  }
}

function closeTaskOverlay() {
  const bg = document.getElementById('task-overlay-background');
  const mount = document.getElementById('task-form-container');
  bg?.classList.remove('is-open');
  mount.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

function openEditOverlay() { window.openEditOverlay?.(); }
function closeEditOverlay() { window.closeEditOverlay?.(); }

document.addEventListener('click', (e) => {
  if (e.target.closest('#bt-add-task, .btn-add')) openTaskOverlay();
  if (e.target.closest('#bt-edit-task, .btn-edit')) openEditOverlay();
  const closeIcon = e.target.closest('.addTask-close-Icon');
  if (closeIcon && closeIcon.closest('#task-overlay')) closeTaskOverlay();
});

window.loadAndRenderTasks = loadAndRenderTasks()
window.closeOverlay = closeTaskOverlay;
export function attachAddTaskOverlayEvents() {}