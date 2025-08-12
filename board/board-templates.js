const TITLES = { todo:'To do', inprogress:'In progress', review:'Await feedback', done:'Done' };

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
              <div class="input-find-icon"><div id="separator"></div><div aria-hidden="true"></div></div>
            </div>
            <button id="bt-add-task" type="button">
              <p>Add Task</p><img src="/assets/plus add task.svg" alt="">
            </button>
          </div>
        </div>
      </div>

      <div class="board">
        ${['todo','inprogress','review','done'].map(s => `
          <div class="columns">
            <div class="column-titles">
              <p>${TITLES[s]}</p>
              ${s!=='done' ? `<button class="btn-add" type="button" data-add="${s}" aria-label="Add to ${TITLES[s]}">+</button>` : ''}
            </div>
            <div class="columns-content" id="${s}" data-status="${s}"></div>
          </div>
        `).join('')}
      </div>

    </div>
  </div>`;
}

/* cards */
export function cardTemplate(task) {
  const desc = (task.description || '').trim();
  const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
  const done = subs.filter(s => s?.status === 'done').length;
  return `
    <article class="board-card" id="card${task.id}" draggable="true">
      ${mainBadge(task.main)}
      <h4 class="card-title">${esc(task.title)}</h4>
      ${desc ? `<p class="card-desc">${esc(desc)}</p>` : ''}
      ${subs.length ? subtaskBar(done, subs.length) : ''}
    </article>
  `;
}

function mainBadge(main) {
  const map = { userstory:{t:'User Story', c:'#3B82F6'}, techtask:{t:'Technical Task', c:'#10B981'} };
  const cfg = map[main] ?? { t:(main||'Task'), c:'#6B7280' };
  return `<span class="card-badge" style="background:${cfg.c}">${esc(cfg.t)}</span>`;
}
function subtaskBar(done, total) {
  const pct = total ? Math.round((done/total)*100) : 0;
  return `
    <div class="subtask">
      <div class="subtask-bar"><div class="subtask-fill" style="width:${pct}%"></div></div>
      <span>${done}/${total} Subtasks</span>
    </div>`;
}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}

/*add task button*/


export function renderAddTaskOverlay() {
  return `
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="addTaskTitle">
    <button class="modal-close" aria-label="Close">×</button>

    <header class="modal-header">
      <h2 id="addTaskTitle">Add Task</h2>
    </header>

    <div class="modal-body add-task-grid">

      <!-- LEFT -->
      <div class="add-left">
        <div class="form-group">
          <label>Title<span class="req">*</span></label>
          <input id="task-title" type="text" placeholder="Enter a title" />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea id="task-desc" rows="5" placeholder="Enter a Description"></textarea>
        </div>

        <div class="form-group">
          <label>Due date<span class="req">*</span></label>
          <div class="input-icon">
            <input id="task-date" type="date" placeholder="dd/mm/yyyy" />
            <span class="icon-calendar" aria-hidden="true">📅</span>
          </div>
        </div>

        <p class="hint"><span class="req">*</span> This field is required</p>
      </div>

      <!-- DIVIDER -->
      <div class="add-divider" aria-hidden="true"></div>

      <!-- RIGHT -->
      <div class="add-right">
        <div class="form-group">
          <label>Priority</label>
          <div class="priority-group" data-prio="medium">
            <button type="button" class="prio-btn" data-value="urgent">Urgent <span>🔼</span></button>
            <button type="button" class="prio-btn is-active" data-value="medium">Medium <span>〰️</span></button>
            <button type="button" class="prio-btn" data-value="low">Low <span>🔽</span></button>
          </div>
        </div>

        <div class="form-group">
          <label>Assigned to</label>
          <button type="button" id="assigned-to" class="select">Select contacts to assign</button>
        </div>

        <div class="form-group">
          <label>Category<span class="req">*</span></label>
          <select id="task-category">
            <option value="">Select task category</option>
            <option value="userstory">User Story</option>
            <option value="techtask">Technical Task</option>
          </select>
        </div>

        <div class="form-group">
          <label>Subtasks</label>
          <div class="subtask-row">
            <input id="subtask-input" type="text" placeholder="Add new subtask" />
            <button type="button" id="subtask-add" class="icon-btn" aria-label="Add subtask">＋</button>
          </div>
          <ul id="subtask-list" class="subtask-list"></ul>
        </div>
      </div>

    </div>

    <footer class="modal-footer">
      <button type="button" class="btn ghost" data-action="cancel">Cancel</button>
      <button type="button" class="btn primary" data-action="create">Create Task ▾</button>
    </footer>
  </div>`;
}

export function attachAddTaskOverlayEvents(root) {
  // Close
  root.querySelector('.modal-close')?.addEventListener('click', () => window.closeOverlay());
  root.querySelector('[data-action="cancel"]')?.addEventListener('click', () => window.closeOverlay());

  // Backdrop click: nur schließen, wenn direkt auf den Backdrop geklickt wurde
  root.addEventListener('click', (e) => {
    if (e.target === root) window.closeOverlay();
  });

  // ESC schließt
  const onKey = (e) => { if (e.key === 'Escape') window.closeOverlay(); };
  document.addEventListener('keydown', onKey, { once: true });

  // Priority toggle
  const group = root.querySelector('.priority-group');
  group?.addEventListener('click', (e) => {
    const btn = e.target.closest('.prio-btn'); if (!btn) return;
    group.querySelectorAll('.prio-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    group.dataset.prio = btn.dataset.value;
  });

  // Subtasks
  const addBtn = root.querySelector('#subtask-add');
  const input  = root.querySelector('#subtask-input');
  const list   = root.querySelector('#subtask-list');

  addBtn?.addEventListener('click', () => {
    const text = (input.value || '').trim(); if (!text) return;
    const li = document.createElement('li');
    li.innerHTML = `<span>${escapeHtml(text)}</span><button type="button" class="icon-btn rm" aria-label="remove">✕</button>`;
    list.appendChild(li);
    input.value = '';
  });
  list?.addEventListener('click', (e) => {
    if (e.target.closest('.rm')) e.target.closest('li')?.remove();
  });

  // Create
  root.querySelector('[data-action="create"]')?.addEventListener('click', () => {
    const data = collectFormData(root);
    console.log('Create task →', data);
    window.closeOverlay();
  });
}


function collectFormData(root){
  const subs = [...root.querySelectorAll('#subtask-list li span')].map(s => ({ title: s.textContent, status:'open' }));
  const prio = root.querySelector('.priority-group')?.dataset.prio || 'medium';
  return {
    title: root.querySelector('#task-title')?.value?.trim() || '',
    description: root.querySelector('#task-desc')?.value?.trim() || '',
    enddate: root.querySelector('#task-date')?.value || '',
    category: root.querySelector('#task-category')?.value || '',
    priority: prio,
    subtasks: subs,
  };
}
function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}


