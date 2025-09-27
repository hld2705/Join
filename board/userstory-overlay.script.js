(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('pointerup', onCardActivate, { capture: true });
    document.addEventListener('click', onCardActivate, { capture: true });

    window.debugUS = () => {
      const t = getAllTasks().find(isUserStory);
      if (t) openUserStoryOverlay(t);
    };
  });

  let lastOpenAt = 0;
  function onCardActivate(e) {
    const now = Date.now();
    if (now - lastOpenAt < 200) return; 
    lastOpenAt = now;

    const card = e.target.closest?.('.board-card');
    if (!card) return;

    const id = getCardId(card);
    const tasks = getAllTasks();

    let task = null;
    if (id != null) task = tasks.find(t => String(t?.id) === String(id));
    if (!task) task = fallbackFromCard(card, id);

    if (!isUserStory(task)) return;
    openUserStoryOverlay(task);
  }

  function ensureOverlayHost() {
    let host = document.getElementById('overlay-add-task');
    if (host) return host;

    host = document.getElementById('overlay-userstory');
    if (!host) {
      host = document.createElement('div');
      host.id = 'overlay-userstory';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }
    return host;
  }

  function openUserStoryOverlay(task) {
    const host = ensureOverlayHost();
    host.innerHTML = renderUserStoryOverlay(task);
    host.classList.remove('hidden');
    host.classList.add('active');
    host.setAttribute('aria-hidden', 'false');
    if (!host.style.display) host.style.display = 'flex';
    document.body.classList.add('no-scroll');
    attachUserStoryOverlayEvents(host, task);
  }

  function closeUserStoryOverlay() {
    const host = ensureOverlayHost();
    host.classList.add('hidden');
    host.classList.remove('active');
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = '';
    host.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }

  function renderUserStoryOverlay(task) {
    const dueText      = fmtDate(task.enddate || task.due); 
    const priorityText = fmtPrioLabel(task.priority);
    const assigneesHtml = us2BuildAssigneesListHtml(task);

    const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
    const subtasksHtml = subs.length
      ? subs.map((s, i) => `
          <label class="subtask-item">
            <input type="checkbox" data-sub-idx="${i}" ${s.status === 'done' ? 'checked' : ''} disabled>
            <span>${esc(s.title || '')}</span>
          </label>
        `).join('')
      : '<div class="muted">No subtasks</div>';

    return `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="us-title">
        <button class="modal-close" type="button" aria-label="Close">×</button>

        <div class="modal-header">
          <span class="badge badge-blue">User Story</span>
          <h2 id="us-title">${esc(task.title || 'Untitled')}</h2>
          ${task.description ? `<p class="muted">${esc(task.description)}</p>` : ''}
        </div>

        <div class="modal-body">
          <div class="meta-row">
            <div class="meta-item">
              <div class="meta-label">Due date</div>
              <div class="meta-value">${esc(dueText || '—')}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Priority</div>
              <div class="meta-value">${esc(priorityText)}</div>
            </div>
          </div>

          <div class="us-block">
            <div class="block-title">Assigned To</div>
            <div class="assignees-row">
              ${assigneesHtml}
            </div>
          </div>

          <div class="us-block">
            <div class="block-title">Subtasks</div>
            <div class="subtasks-wrap">
              ${subtasksHtml}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn ghost" type="button" data-action="delete">Delete</button>
          <button class="btn primary" type="button" data-action="edit">Edit</button>
        </div>
      </div>
    `;
  }

  function attachUserStoryOverlayEvents(root, task) {
    const close = () => closeUserStoryOverlay();
    root.querySelector('.modal-close')?.addEventListener('click', close);
    root.addEventListener('click', (e) => { if (e.target === root) close(); });

    root.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('userstory:edit', { detail: { task } }));
      close();
      if (typeof window.addTaskToBoard === 'function') window.addTaskToBoard();
    });

    root.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('userstory:delete', { detail: { task } }));
      close();
      if (typeof window.deleteTaskById === 'function') {
        try { window.deleteTaskById(task.id); } catch {}
      }
    });
  }

  function us2GetContactsBook() {
    if (Array.isArray(window.CONTACTS)) return window.CONTACTS;
    if (Array.isArray(window.users)) return window.users;
    if (window.firstdata && Array.isArray(window.firstdata.users)) return window.firstdata.users;
    if (window.join && Array.isArray(window.join.users)) return window.join.users;
    if (Array.isArray(window.contacts)) return window.contacts;
    return [];
  }

  function us2NormalizeAssignees(task) {
    const raw =
      Array.isArray(task?.assigned)   ? task.assigned   :
      Array.isArray(task?.assignees)  ? task.assignees  :
      Array.isArray(task?.assignedTo) ? task.assignedTo :
      Array.isArray(task?.team)       ? task.team       :
      Array.isArray(task?.users)      ? task.users      : [];

    const book = us2GetContactsBook();
    const byId    = new Map(book.map(u => [String(u?.id ?? ''), u]));
    const byEmail = new Map(book.map(u => [String((u?.email ?? '').toLowerCase()), u]));
    const byName  = new Map(book.map(u => [String((u?.name  ?? '').toLowerCase()), u]));

    const list = raw.map((x) => {
      if (typeof x === 'number') {
        const c = byId.get(String(x));
        const name = c?.name || `User ${x}`;
        return c ? us2ContactToAvatar(c)
                 : { name, badge:null, initials: us2Initials(name), color: us2PickColor(name) };
      }
      if (typeof x === 'string') {
        const k = x.toLowerCase();
        const c = byEmail.get(k) || byName.get(k);
        const name = c?.name || x;
        return c ? us2ContactToAvatar(c)
                 : { name, badge:null, initials: us2Initials(name), color: us2PickColor(name) };
      }
      if (x && typeof x === 'object') {
        const via =
          (x.id != null && byId.get(String(x.id))) ||
          (x.email && byEmail.get(String(x.email).toLowerCase())) ||
          (x.name  && byName.get(String(x.name).toLowerCase())) || null;

        const name =
          via?.name ||
          x.name ||
          [x.firstName ?? x.firstname, x.lastName ?? x.lastname].filter(Boolean).join(' ') ||
          x.email || x.username || (x.id != null ? `User ${x.id}` : 'User');

        return {
          name,
          badge: x.badge || x.avatar || via?.badge || via?.avatar || null,
          initials: x.initials || via?.initials || us2Initials(name),
          color: x.color || via?.color || us2PickColor(name),
        };
      }
      return null;
    }).filter(Boolean);

    const seen = new Set();
    return list.filter(a => {
      const k = String(a?.name || a?.email || a?.id || '');
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function us2ContactToAvatar(c) {
    return {
      name: c.name,
      badge: c.badge || c.avatar || null,
      initials: c.initials || us2Initials(c.name),
      color: c.color || us2PickColor(c.name),
    };
  }

  function us2Initials(n){
    return String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?';
  }
  function us2PickColor(key){
    const s=String(key||''); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%360;
    return `hsl(${h} 80% 75%)`;
  }

  // --- FIX: kein ReferenceError mehr
  function us2AvatarHtml(u) {
    const name = u.name || u.email || 'User';
    const src  = u.badge || u.avatar;
    if (src) {
      return `<img class="avatar-img" src="${esc(src)}" alt="${esc(name)}" title="${esc(name)}">`;
    }
    const init = us2Initials(name);
    const bg   = u.color || us2PickColor(name);
    return `<span class="avatar" title="${esc(name)}" style="background:${bg}">${esc(init)}</span>`;
  }

  function us2BuildAssigneesListHtml(task) {
    let list = [];

    if (typeof window.materializeAssignees === 'function') {
      try {
        const t = window.materializeAssignees(task) || {};
        const resolved = Array.isArray(t.assigneesResolved) ? t.assigneesResolved : [];
        list = resolved.map(u => ({
          name: u.name || u.email || '',
          badge: u.badge || u.avatar || null,
          initials: u.initials || us2Initials(u.name || u.email || ''),
          color: u.color
        }));
      } catch {}
    }

    if (!list.length) list = us2NormalizeAssignees(task);
    if (!list.length) list = us2AssigneesFromCard(task);
    if (!list.length) return '<div class="muted">No assignees</div>';

    return `
      <ul class="assignee-list">
        ${list.map(u => `
          <li class="assignee">
            ${us2AvatarHtml(u)}
            <span class="assignee-name">${esc(u.name)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function us2AssigneesFromCard(task) {
    const card = document.getElementById(`card${task?.id}`);
    if (!card) return [];
    const out = [];
    card.querySelectorAll('.card-assignees .avatar-img').forEach(img => {
      const name = img.getAttribute('alt') || img.getAttribute('title') || '';
      const src  = img.getAttribute('src') || '';
      if (src || name) out.push({ name, badge: src, initials: us2Initials(name), color: null });
    });
    card.querySelectorAll('.card-assignees .avatar').forEach(span => {
      const name = span.getAttribute('title') || '';
      const initials = (span.textContent || '').trim();
      const style = span.getAttribute('style') || '';
      const m = style.match(/background:\s*([^;]+)/i);
      const color = m ? m[1].trim() : null;
      if (name || initials) out.push({ name, badge: null, initials: initials || us2Initials(name), color });
    });
    const seen = new Set();
    return out.filter(p => {
      const k = (p.name || p.badge || p.initials || '').toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function fallbackFromCard(card, id) {
    // darf bleiben; wird nur genutzt, wenn kein Task via getAllTasks() gefunden wird
    return {
      id: id ?? null,
      main: 'userstory',
      title: card?.querySelector('.card-title')?.textContent || 'Untitled',
      description: card?.querySelector('.card-desc')?.textContent || '',
      enddate: '', // egal, weil wir ja aus firstdata.js kommen wollen
      priority: 'medium',
      subtasks: [],
      assigned: []
    };
  }

  /* ================= Utils ================= */

 function getAllTasks() {
  const tasks = (
    window.getTasks?.() ||
    window.tasks ||
    window.firstdata?.tasks ||
    []
  );
  if (!tasks.length) {
    console.warn('⚠️ getAllTasks(): keine Tasks gefunden. Ist firstdata.js geladen?');
  }
  return tasks;
}

  function getCardId(card) {
    const ds = card?.dataset || {};
    const fromData = ds.taskId ?? ds.taskid ?? ds.id ?? ds.cardId ?? ds.cardid ?? null;
    if (fromData != null && fromData !== '') {
      return /^\d+$/.test(String(fromData)) ? Number(fromData) : String(fromData);
    }
    const m = String(card?.id || '').match(/card(\d+)/);
    if (m) return Number(m[1]);
    return null;
  }

  function isUserStory(t) {
    const main = String(t?.main || '').toLowerCase();
    if (main) return main === 'userstory';
    const b = document.getElementById(`card${t?.id}`)?.querySelector?.('.card-badge')?.textContent?.trim()?.toLowerCase();
    return b === 'user story';
  }

  function esc(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
  function fmtDate(v){ if(!v) return ''; try{const d=new Date(String(v)); if(isNaN(d)) return String(v); return d.toLocaleDateString(undefined,{year:'numeric',month:'2-digit',day:'2-digit'});}catch{return String(v||'');}}
  function fmtPrioLabel(p){const k=String(p||'medium').toLowerCase(); if(k==='urgent')return'Urgent'; if(k==='high')return'High'; if(k==='low')return'Low'; return 'Medium';}
})();
