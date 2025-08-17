// board-script.js
import { loadData, getTasks, getUsers, initializeDefaultData } from '../db.js';
import {
  boardShell,
  cardTemplate,
  renderAddTaskOverlay,
  attachAddTaskOverlayEvents,
} from './board-templates.js';

const COLS = ['todo', 'inprogress', 'review', 'done'];
let QUERY = '';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  document.getElementById('board-root').innerHTML = boardShell();

  // Buttons
  document.getElementById('bt-add-task')?.addEventListener('click', openOverlay);
  document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', openOverlay));

  // Suche
  document.getElementById('input-find-task')?.addEventListener('input', (e) => {
    QUERY = e.target.value.trim().toLowerCase();
    renderBoard(getTasks() ?? []);
  });

  if (typeof initializeDefaultData === 'function') {
    await initializeDefaultData();
  }
  await loadData();

  // Kontakte global bereitstellen (für Karten-Badges)
  const users = (typeof getUsers === 'function') ? getUsers() : [];
  if (Array.isArray(users)) window.CONTACTS = users;

  renderBoard(getTasks() ?? []);
}

/* -------------------- Render -------------------- */
function renderBoard(tasks) {
  COLS.forEach(id => { const c = document.getElementById(id); if (c) c.innerHTML = ''; });

  const safe = Array.isArray(tasks) ? tasks : [];

  const filtered = safe
    .filter(t => t && typeof t === 'object' && COLS.includes(t.status))
    .filter(t => !QUERY || (`${t.title ?? ''} ${t.description ?? ''}`).toLowerCase().includes(QUERY));

  for (const t of filtered) {
    const col = document.getElementById(t.status);
    if (col) col.insertAdjacentHTML('beforeend', cardTemplate(t));
  }

  addPlaceholdersIfEmpty();
}

function addPlaceholdersIfEmpty() {
  const txt = {
    todo: 'No tasks To do',
    inprogress: 'No tasks In progress',
    review: 'No tasks Await feedback',
    done: 'No tasks Done'
  };
  COLS.forEach(id => {
    const col = document.getElementById(id);
    if (col && col.children.length === 0) col.innerHTML = `<div class="placeholder">${txt[id]}</div>`;
  });
}

/* -------------------- Overlay -------------------- */
function openOverlay() {
  const host = document.getElementById('overlay-add-task');
  if (!host) return;
  host.innerHTML = renderAddTaskOverlay();
  host.classList.remove('hidden');
  host.classList.add('active');
  host.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
  attachAddTaskOverlayEvents(host);
}
function closeOverlay() {
  const host = document.getElementById('overlay-add-task');
  if (!host) return;
  host.classList.add('hidden');
  host.classList.remove('active');
  host.setAttribute('aria-hidden','true');
  host.innerHTML = '';
  document.body.classList.remove('no-scroll');
}
window.openOverlay = openOverlay;
window.closeOverlay = closeOverlay;




window.addTaskToBoard = function () {
  document.getElementById('task-overlay').style.display = "block"}
