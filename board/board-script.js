import { loadData, getTasks } from '../db.js';
import {
  loadCard,
  // loadProgressBar,      // aktuell ungenutzt – ggf. entfernen
  // loadBadgeForCard,     // aktuell ungenutzt – ggf. entfernen
  // loadPriorityImage     // aktuell ungenutzt – ggf. entfernen
} from './board-templates.js';

async function renderBoard() {
  await loadData();
  const tasks = getTasks();

  // Spalten leeren
  ['todo', 'inprogress', 'review', 'done'].forEach(id => {
    const col = document.getElementById(id);
    if (col) col.innerHTML = '';
  });
// Debug: Finde Tasks ohne Kategorie oder ohne category.color
const bad = tasks.filter(t => !t.category || !t.category.color);
if (bad.length) {
  console.warn('Tasks ohne category/color:', bad);
}

  // Karten einfügen
  tasks.forEach(task => {
    const columnId = normalizeStatus(task.status);
    const column = document.getElementById(columnId);
    if (column) {
      column.insertAdjacentHTML('beforeend', loadCard(task));
    }
  });
}

function normalizeStatus(status) {
  switch (status) {
    case 'to-do': return 'todo';
    case 'in-progress': return 'inprogress';
    case 'await-feedback': return 'review';
    case 'done': return 'done';
    default: return status;
  }
}

// Nur EINMAL registrieren – und richtig geschrieben :)
document.addEventListener('DOMContentLoaded', () => {
  renderBoard();

  // Overlay-Setup erst nach DOM-Ready
  const addTaskButton = document.getElementById('bt-add-task');
  if (addTaskButton) {
    const overlay = addTaskButton.querySelector('.check-overlay');

    const toggleCheckOverlay = () => {
      if (overlay) overlay.classList.toggle('hidden');
    };

    addTaskButton.addEventListener('click', () => {
      toggleCheckOverlay();

      // Falls du zusätzlich ein Modal öffnen willst und die Funktion existiert:
      if (typeof window.openOverlay === 'function') {
        window.openOverlay();
      }
    });
  }
});

