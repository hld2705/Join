/**
 * Hilfsfunktion zum Escapen von HTML, um XSS zu verhindern.
 * @param {string} str - Eingabetext
 * @returns {string} Escapte Version
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Erstellt ein generisches leeres Karten-Template.
 * @param {string} message - Anzuzeigende Nachricht
 */
function loadEmptyCard(message) {
  return `
    <div class="card-no-task">
      <div class="tpl-no-task">
        <p>${escapeHTML(message)}</p>
      </div>
    </div>
  `;
}

/**
 * Erstellt eine Task-Karte.
 * @param {object} task - Task-Daten
 */
function loadCard(task) {
  // Kategorie sicher ermitteln (unterstützt task.category ODER task.categories[0])
  const cat = task?.category ?? task?.categories?.[0] ?? { name: 'General', color: '#2A3647' };
  const categoryName  = typeof cat?.name  === 'string' ? cat.name  : 'General';
  const categoryColor = typeof cat?.color === 'string' ? cat.color : '#2A3647';

  const id          = task?.id ?? '';
  const title       = typeof task?.title === 'string' ? task.title : '';
  const description = typeof task?.description === 'string' ? task.description : '';

  return `
    <div draggable="true" ondragstart="startDragging(${id})" id="${id}" class="card">
      <div class="tpl-progress">
        <div class="card-category">
          <p style="background-color:${escapeHTML(categoryColor)}">
            ${escapeHTML(categoryName)}
          </p>
        </div>
        <div class="card-text">
          <p class="card-title">${escapeHTML(title)}</p>
          <p class="card-description">${escapeHTML(description)}</p>
        </div>
        <div id="progress-bar${id}" class="card-progress"></div>
        <div class="card-contact">
          <div id="card${id}-contacts" class="card-badges"></div>
          <div id="priority${id}"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Erstellt die Fortschrittsanzeige einer Task.
 * @param {object} task - Task-Objekt
 * @param {number} doneSubtasks - Anzahl abgeschlossener Subtasks
 */
function loadProgressBar(task, doneSubtasks) {
  const subtasks = Array.isArray(task?.subtasks) ? task.subtasks : [];
  const total = subtasks.length;
  const done = Math.min(Math.max(doneSubtasks || 0, 0), total);
  const percentage = total ? Math.round((done / total) * 100) : 0;

  // Wenn keine Subtasks vorhanden sind, optional leer lassen oder 0/0 anzeigen:
  if (!total) {
    return `
      <div class="progress-bar" style="width:0%"></div>
      <div class="card-subtasks">0/0 Subtasks</div>
    `;
  }

  return `
    <div class="progress-bar" style="width:${percentage}%"></div>
    <div class="card-subtasks">${done}/${total} Subtasks</div>
  `;
}

/**
 * Erstellt ein Profil-Badge für einen Kontakt.
 * @param {object} contact - Kontakt-Objekt
 */
function loadBadgeForCard(contact) {
  const id = contact?.id ?? '';
  const name = contact?.name ?? '';
  return `<img src="./assets/icons/profilebadge/${escapeHTML(String(id))}.svg" alt="${escapeHTML(String(name))}">`;
}

/**
 * Erstellt ein Prioritäts-Icon.
 * @param {string} priority - "urgent", "medium" oder "low"
 */
function loadPriorityImage(priority) {
  const p = typeof priority === 'string' ? priority : '';
  return `<img src="./assets/icons/add_task/Prio_${escapeHTML(p)}.svg" alt="Priority ${escapeHTML(p)}">`;
}

// Beispiele für leere Karten
function loadNoTodoCard() { return loadEmptyCard('No tasks To do'); }
function loadNoDoneCard() { return loadEmptyCard('No tasks Done'); }

export {
  loadCard,
  loadProgressBar,
  loadBadgeForCard,
  loadPriorityImage,
  loadNoTodoCard,
  loadNoDoneCard
};

