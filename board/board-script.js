// board/board-script.js
import { loadData, getTasks, getLoggedInUser } from '../db.js';
// Optional: Wenn db.js auch getUsers() exportiert – nutzen; sonst leeres Array.
import * as maybeDb from '../db.js';

const COLUMN_IDS = ['todo', 'inprogress', 'review', 'done'];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadData();

  // User nur optional – falls du user-spezifisch filtern willst
  const user = safeCall(() => getLoggedInUser()) ?? null;

  wireSearch();

  const tasks = getTasks() ?? [];
  renderBoard(tasks, { query: '', userId: user?.id ?? null });
}

function wireSearch() {
  const input = document.getElementById('input-find-task');
  if (!input) return;

  input.addEventListener('input', () => {
    const tasks = getTasks() ?? [];
    renderBoard(tasks, { query: input.value.trim().toLowerCase() });
  });
}

function renderBoard(tasks, { userId = null, query = '' } = {}) {
  // Spalten leeren
  for (const id of COLUMN_IDS) {
    const col = document.getElementById(id);
    if (col) col.innerHTML = '';
  }

  // Filtern
  const filtered = (Array.isArray(tasks) ? tasks : [])
    .filter(t => isValidTask(t))
    .filter(t => (userId == null ? true : t?.assigned?.id === userId))
    .filter(t => {
      if (!query) return true;
      const hay = `${t.title ?? ''} ${t.description ?? ''}`.toLowerCase();
      return hay.includes(query);
    });

  // Karten einsortieren
  for (const task of filtered) {
    const col = document.getElementById(task.status);
    if (!col) continue;
    col.insertAdjacentHTML('beforeend', cardTemplate(task));
    // nach dem Einfügen noch dynamische Teile laden
    renderAssigned(col, task);
    renderPriority(col, task);
  }

  addPlaceholdersIfEmpty();
}

/* ===== Karten-Template und Renderer ===== */

function cardTemplate(task) {
  const labelHtml = mainBadge(task.main);
  const desc = task.description?.trim() ?? '';
  const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
  const done = subs.filter(s => s?.status === 'done').length;

  return `
    <article class="board-card" id="card${task.id}" draggable="true">
      ${labelHtml}
      <h4 class="card-title">${esc(task.title)}</h4>
      ${desc ? `<p class="card-desc">${esc(desc)}</p>` : ''}

      ${subs.length ? subtaskBar(done, subs.length) : ''}

      <footer class="card-footer">
        <div class="card-contacts" id="card${task.id}-contacts"></div>
        <div class="card-prio" id="priority${task.id}"></div>
      </footer>
    </article>
  `;
}

function mainBadge(main) {
  // aus deinem Schema: 'userstory' | 'techtask'
  const map = {
    userstory: { text: 'User Story', bg: '#3B82F6' },
    techtask: { text: 'Technical Task', bg: '#10B981' },
  };
  const cfg = map[main] ?? { text: esc(main ?? 'Task'), bg: '#6B7280' };
  return `<span class="card-badge" style="background:${cfg.bg}">${cfg.text}</span>`;
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

function renderPriority(scopeEl, task) {
  const el = scopeEl.querySelector(`#priority${task.id}`);
  if (!el) return;
  const icon = priorityIcon(task.priority);
  el.innerHTML = icon;
}

function priorityIcon(priority) {
  const map = {
    urgent:  '⬆️',  // kannst du durch SVGs ersetzen
    medium:  '⏺️',
    low:     '⬇️',
  };
  const label = (priority ?? '').toLowerCase();
  const sym = map[label] ?? '⏺️';
  return `<span class="prio prio-${label}">${sym}</span>`;
}

function renderAssigned(scopeEl, task) {
  const el = scopeEl.querySelector(`#card${task.id}-contacts`);
  if (!el) return;

  // Versuche, User-Badge aus db.js zu bekommen (falls exportiert)
  const users = safeCall(() => maybeDb.getUsers?.()) ?? [];
  const userId = task?.assigned?.id;

  let html = '';
  const user = users.find(u => u.id === userId);

  if (user?.badge) {
    const src = user.badge.startsWith('./') ? user.badge.replace('./', '/') : user.badge;
    html = `<img class="contact-badge" src="${src}" alt="${esc(user.name)}" title="${esc(user.name)}">`;
  } else if (typeof userId === 'number') {
    // Fallback: Initialen aus Name oder ID
    const initials = initialsFromName(user?.name ?? `ID ${userId}`);
    html = `<div class="contact-initials" title="${esc(user?.name ?? `User ${userId}`)}">${initials}</div>`;
  }

  el.innerHTML = html;
}

/* ===== Utilities ===== */

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
  return t && typeof t === 'object' &&
    COLUMN_IDS.includes(t.status) &&
    typeof t.title === 'string';
}

function initialsFromName(name) {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts[1]?.[0] ?? '';
  return (first + last || first).toUpperCase();
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
