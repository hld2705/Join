const TITLES = { todo: 'To do', inprogress: 'In progress', review: 'Await feedback', done: 'Done' };

let bg = document.getElementById('task-overlay-background');

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



/* ---------- Cards ---------- */
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

function mainBadge(main) {
  const map = { userstory: { t: 'User Story', c: '#3B82F6' }, techtask: { t: 'Technical Task', c: '#10B981' } };
  const cfg = map[main] ?? { t: (main || 'Task'), c: '#6B7280' };
  return `<span class="card-badge" style="background:${cfg.c}">${esc(cfg.t)}</span>`;
}


function subtaskBar(done, total) {
  const has = total > 0;
  const pct = has ? Math.round((done / total) * 100) : 0;
  const label = has ? `${done}/${total} Subtasks` : `0 Subtasks`;
  const color =
    !has ? '#E5E7EB' :
      pct >= 100 ? '#22c55e' :
        pct >= 50 ? '#3B82F6' :
          '#f59e0b';

  return `
    <div class="status-line${has ? '' : ' is-empty'}">
      <div class="status-bar"
           role="progressbar"
           aria-label="Subtask progress"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
        <div class="status-fill" style="width:${pct}%; background:${color}"></div>
      </div>
      <span class="status-count">${label}</span>
    </div>
  `;
}

/* --- Assignee badges per card --- */
function assigneesRow(task) {
  const list = normalizeAssignees(task);
  if (!list.length) return '';
  return `
    <div class="card-assignees">
      ${list.map(a => avatarBadge(a)).join('')}
    </div>
  `;
}

/** Normalize assignees (IDs, strings, objects) */
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
      return c ? contactToAvatar(c)
        : { name: label, initials: initialsFromName(label), color: pickColor(key) };
    }
    if (typeof x === 'string') {
      const k = x.toLowerCase();
      const c = byEmail.get(k) || byName.get(k);
      const name = c?.name || x;
      const key = colorIdentityKey(x, c);
      return c ? contactToAvatar(c)
        : { name, initials: initialsFromName(name), color: pickColor(key) };
    }
    if (x && typeof x === 'object') {
      const via =
        (x.id != null && byId.get(String(x.id))) ||
        (x.email && byEmail.get(String(x.email).toLowerCase())) ||
        (x.name && byName.get(String(x.name).toLowerCase())) || null;

      const composed =
        x.name ||
        [x.firstName ?? x.firstname, x.lastName ?? x.lastname].filter(Boolean).join(' ') ||
        x.email || x.username || (x.id != null ? `User ${x.id}` : '');

      const name = via?.name || composed;
      if (!name) return null;

      const key = colorIdentityKey(x, via);
      return {
        name,
        badge: x.badge || via?.badge || null,
        initials: x.initials || via?.initials || initialsFromName(name),
        color: x.color || via?.color || pickColor(key),
      };
    }
    return null;
  })
    .filter(Boolean)
    .filter(a => a.name);

  const seen = new Set();
  return norm.filter(a => {
    const key = String(a.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
  return {
    name: c.name,
    badge: c.badge || null,
    initials: c.initials || initialsFromName(c.name),
    color: fixed || c.color || pickColor(key),
  };
}
function avatarBadge(a) {
  if (a.badge) {
    return `<img class="avatar-img" src="${esc(a.badge)}" alt="${esc(a.name)}" title="${esc(a.name)}">`;
  }
  return `<span class="avatar" title="${esc(a.name)}" style="background:${esc(a.color)}">${esc(a.initials)}</span>`;
}

/* Utils */
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

/* ---------- Add Task Overlay ---------- */
export function renderAddTaskOverlay() {
  return `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="addtask-title">
      <button class="modal-close" type="button" aria-label="Close">&times;</button>
      <div class="modal-header">
        <h2 id="addtask-title">Add Task</h2>
      </div>
      <div class="modal-body">
        <form id="addtask-form" novalidate>
          <div class="add-task-grid">
            <div>
              <div class="form-group">
                <label for="task-title">Title<span class="req">*</span></label>
                <input id="task-title" name="title" type="text" required placeholder="Enter a title">
              </div>
              <div class="form-group">
                <label for="task-desc">Description</label>
                <textarea id="task-desc" name="description" rows="4" placeholder="What needs to be done?"></textarea>
              </div>
              <div class="form-group">
                <label for="task-date">Due date</label>
                <div class="input-icon">
                  <input id="task-date" name="due" type="date">
                  <span class="icon-calendar">📅</span>
                </div>
              </div>
              <div class="form-group">
                <label for="task-prio">Priority</label>
                <div class="priority-group" id="task-prio">
                  <button type="button" class="prio-btn" data-prio="low">Low</button>
                  <button type="button" class="prio-btn" data-prio="medium">Medium</button>
                  <button type="button" class="prio-btn" data-prio="high">High</button>
                  <input type="hidden" name="priority" value="medium">
                </div>
              </div>
            </div>

            <div class="add-divider" aria-hidden="true"></div>

            <div>
              <div class="form-group">
                <label for="task-status">Status<span class="req">*</span></label>
                <select id="task-status" name="status" required>
                  <option value="todo" selected>To do</option>
                  <option value="inprogress">In progress</option>
                  <option value="review">Await feedback</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div class="form-group">
                <label for="task-subtask">Subtasks</label>
                <div class="subtask-row">
                  <input id="task-subtask" type="text" placeholder="e.g. Create draft">
                  <button type="button" class="icon-btn" id="btn-add-subtask" aria-label="Add subtask">+</button>
                </div>
                <ul class="subtask-list" id="subtask-list"></ul>
              </div>
            </div>
          </div>
        </form>
        <p class="hint">Felder mit <span class="req">*</span> sind Pflicht.</p>
      </div>

      <div class="modal-footer">
        <button class="btn ghost" type="button" id="btn-cancel">Cancel</button>
        <button id="edit-btn" class="btn primary" type="submit" form="addtask-form">Create task</button>
      </div>
    </div>
  `;
}



export function attachAddTaskOverlayEvents(root) {
  root.querySelector('.modal-close')?.addEventListener('click', () => window.closeOverlay?.());
  root.querySelector('#btn-cancel')?.addEventListener('click', () => window.closeOverlay?.());
  root.addEventListener('click', (e) => { if (e.target === root) window.closeOverlay?.(); });

  // Priority toggle
  const prioBtns = [...root.querySelectorAll('.prio-btn')];
  const prioInput = root.querySelector('input[name="priority"]');
  prioBtns.forEach(btn => btn.addEventListener('click', () => {
    prioBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    if (prioInput) prioInput.value = btn.dataset.prio || 'medium';
  }));
  (prioBtns.find(b => b.dataset.prio === (prioInput?.value || 'medium')))?.classList.add('is-active');

  // Subtasks
  const subInput = root.querySelector('#task-subtask');
  const subList = root.querySelector('#subtask-list');
  root.querySelector('#btn-add-subtask')?.addEventListener('click', () => {
    const txt = (subInput.value || '').trim();
    if (!txt) return;
    const li = document.createElement('li');
    li.innerHTML = `<span>${esc(txt)}</span><button type="button" class="icon-btn" aria-label="Remove">🗑</button>`;
    li.querySelector('button')?.addEventListener('click', () => li.remove());
    subList.appendChild(li);
    subInput.value = '';
  });

  // Submit
  const form = root.querySelector('#addtask-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = collectFormData(root);
    if (!data.title || !data.status) return;

    const tasks = (window.getTasks?.() ?? []);
    const id = Math.max(0, ...tasks.map(t => +t.id || 0)) + 1;
    const task = { id, ...data };
    tasks.push(task);
    window.location.reload();
  });
}

function collectFormData(root) {
  const title = root.querySelector('#task-title')?.value?.trim() || '';
  const description = root.querySelector('#task-desc')?.value?.trim() || '';
  const due = root.querySelector('#task-date')?.value || '';
  theStatus:
  '';
  const status = root.querySelector('#task-status')?.value || 'todo';
  const priority = root.querySelector('input[name="priority"]')?.value || 'medium';
  const subs = [...root.querySelectorAll('#subtask-list li span')].map(s => ({ title: s.textContent, status: 'open' }));
  return { title, description, due, status, priority, subtasks: subs, main: 'techtask' };
}

let bgEdit = document.getElementById('edit-overlay-background');

function openTaskOverlay() {
  document.getElementById('task-overlay').style.display = "block";
  bg?.classList.add('is-open');
}

function closeTaskOverlay() {
  bg?.classList.remove('is-open');
}

function closeEditOverlay() {
  bgEdit?.classList.remove('is-open');
}

function openEditOverlay() {
  document.getElementById('edit-overlay').style.display = "block";
  bgEdit?.classList.add('is-open');
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#bt-add-task, .btn-add')) openTaskOverlay();
  if (e.target.closest('#bt-edit-task, .btn-edit')) openEditOverlay();

  const closeIcon = e.target.closest('.addTask-close-Icon');

  if (closeIcon) {
    if (closeIcon.closest('#edit-overlay')) closeEditOverlay();
    else closeTaskOverlay();
    return;
  }
  if (e.target === bg) closeTaskOverlay();
  if (e.target === bgEdit) closeEditOverlay();
});


function test() {
  document.getElementById('edit-task-form-container').style.display = "block";
  document.getElementById('edit-overlay-background').style.display = "block";
  document.getElementById('edit-overlay').style.display = "block";
}

