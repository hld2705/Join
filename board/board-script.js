import { loadData, getTasks } from '../db.js';
import { boardShell, cardTemplate } from './board-templates.js';

const COLS = ['todo', 'inprogress', 'review', 'done'];
let QUERY = '';



document.addEventListener('DOMContentLoaded', init);

async function init() {
  document.getElementById('board-root').innerHTML = boardShell();
  document.getElementById('bt-add-task')?.addEventListener('click', openOverlay);
  document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', openOverlay));
  document.getElementById('input-find-task')?.addEventListener('input', e => {
    QUERY = e.target.value.trim().toLowerCase();
    renderBoard(getTasks() ?? []);
  });
  await loadData();
  renderBoard(getTasks() ?? []);
}

function renderBoard(tasks) {
  COLS.forEach(id => { const c = document.getElementById(id); if (c) c.innerHTML = ''; });

  const filtered = (Array.isArray(tasks) ? tasks : [])
    .filter(t => t && typeof t === 'object' && COLS.includes(t.status))
    .filter(t => !QUERY || (`${t.title ?? ''} ${t.description ?? ''}`).toLowerCase().includes(QUERY));

  for (const t of filtered) {
    const col = document.getElementById(t.status);
    if (col) col.insertAdjacentHTML('beforeend', cardTemplate(t));
  }
  addPlaceholdersIfEmpty();
}

function addPlaceholdersIfEmpty() {
  const txt = { todo: 'No tasks To do', inprogress: 'No tasks In progress', review: 'No tasks Await feedback', done: 'No tasks Done' };
  COLS.forEach(id => {
    const col = document.getElementById(id);
    if (col && col.children.length === 0) col.innerHTML = `<div class="placeholder">${txt[id]}</div>`;
  });
}

window.openOverlay = window.openOverlay || function () {
  const el = document.getElementById('overlay-add-task'); if (!el) return;
  el.classList.remove('hidden'); el.classList.add('active'); document.body.classList.add('no-scroll');
};
window.closeOverlay = window.closeOverlay || function () {
  const el = document.getElementById('overlay-add-task'); if (!el) return;
  el.classList.add('hidden'); el.classList.remove('active'); el.innerHTML = ''; document.body.classList.remove('no-scroll');
};

window.addTaskToBoard = function () {
  document.getElementById('task-overlay').style.display = "block";
}
