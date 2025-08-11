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

