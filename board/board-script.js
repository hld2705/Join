// board/board-script.js
import { loadData, getTasks, getLoggedInUser } from '../db.js';

const COLUMN_IDS = ['todo', 'inprogress', 'review', 'done'];
let CURRENT_QUERY = '';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadData();

  // Header-Badge setzen (Profil oben rechts)
  const user = safeCall(() => getLoggedInUser()) ?? { id: 0, name: 'Gast', badge: './assets/profilebadge/guest.svg' };
  setHeaderBadge(user);

  // Suche anbinden
  wireSearch();

  // Board initial rendern
  renderBoard(getTasks() ?? []);
}

/* ---------- Header-Badge ---------- */
function setHeaderBadge(user) {
  const badgeImg = document.querySelector('header img.profil');
  if (!badgeImg) return;
  const src = (user?.badge || '').startsWith('./')
    ? user.badge.replace('./', '/')
    : (user?.badge || '/assets/profilebadge/guest.svg');
  badgeImg.src = src;
  badgeImg.alt = `${user?.name || 'User'} Badge`;
}

/* ---------- Suche ---------- */
function wireSearch() {
  const input = document.getElementById('input-find-task');
  if (!input) return;
  input.addEventListener('input', () => {
    CURRENT_QUERY = input.value.trim().toLowerCase();
    renderBoard(getTasks() ?? []);
  });
}

/* ---------- Render ---------- */
function renderBoard(tasks) {
  // Spalten leeren
  for (const id of COLUMN_IDS) {
    const col = document.getElementById(id);
    if (col) col.innerHTML = '';
  }

  // Validieren + Suchen
  const filtered = (Array.isArray(tasks) ? tasks : [])
    .filter(isValidTask)
    .filter(t => {
      if (!CURRENT_QUERY) return true;
      const hay = `${t.title ?? ''} ${t.description ?? ''}`.toLowerCase();
      return hay.includes(CURRENT_QUERY);
    });

  // Einsortieren
  for (const task of filtered) {
    const col = document.getElementById(task.status);
    if (!col) continue;
    col.insertAdjacentHTML('beforeend', cardTemplate(task));
  }

  addPlaceholdersIfEmpty();
}

/* ---------- Karten (ohne Footer!) ---------- */
function cardTemplate(task) {
  const label = mainBadge(task.main); // 'userstory' | 'techtask'
  const desc = (task.description || '').trim();
  const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
  const done = subs.filter(s => s?.status === 'done').length;

  return `
    <article class="board-card" id="card${task.id}" draggable="true">
      ${label}
      <h4 class="card-title">${esc(task.title)}</h4>
      ${desc ? `<p class="card-desc">${esc(desc)}</p>` : ''}
      ${subs.length ? subtaskBar(done, subs.length) : ''}
    </article>
  `;
}

function mainBadge(main) {
  const map = {
    userstory: { text: 'User Story', bg: '#3B82F6' },
    techtask:  { text: 'Technical Task', bg: '#10B981' },
  };
  const cfg = map[main] ?? { text: (main || 'Task'), bg: '#6B7280' };
  return `<span class="card-badge" style="background:${cfg.bg}">${esc(cfg.text)}</span>`;
}

function subtaskBar(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `
    <div class="subtask">
      <div class="subtask-bar"><div class="subtask-fill" style="width:${pct}%"></div></div>
      <span>${done}/${total} Subtasks</span>
    </div>
  `;
}

/* ---------- Helpers ---------- */
function addPlaceholdersIfEmpty() {
  const text = {
    todo: 'No tasks To do',
    inprogress: 'No tasks In progress',
    review: 'No tasks Await feedback',
    done: 'No tasks Done',
  };
  for (const id of COLUMN_IDS) {
    const col = document.getElementById(id);
    if (col && col.children.length === 0) {
      col.innerHTML = `<div class="placeholder">${text[id]}</div>`;
    }
  }
}

function isValidTask(t) {
  return t && typeof t === 'object'
    && COLUMN_IDS.includes(t.status)
    && typeof t.title === 'string';
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeCall(fn) {
  try { return fn?.(); } catch { return undefined; }
}

/* ---------- Optional: Overlay global ---------- */
window.openOverlay = window.openOverlay || function () {
  const el = document.getElementById('overlay-add-task');
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('active');
  document.body.classList.add('no-scroll');
};
window.closeOverlay = window.closeOverlay || function () {
  const el = document.getElementById('overlay-add-task');
  if (!el) return;
  el.classList.add('hidden');
  el.classList.remove('active');
  el.innerHTML = '';
  document.body.classList.remove('no-scroll');
};


