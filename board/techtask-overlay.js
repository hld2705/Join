(function () {
  document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('click', (e) => {
      const card = e.target.closest('.board-card');
      if (!card) return;

      const id = Number(String(card.id || '').replace(/^card/, '')) || null;

      const tasks = (window.getTasks?.() || []);
      const task  = tasks.find(t => Number(t.id) === id);

      const isTechTask =
        (task && String(task.main) === 'techtask') ||
        (!task && (card.querySelector('.card-badge')?.textContent || '').trim() === 'Technical Task');

      if (!isTechTask) return;

      openTechTaskOverlay(task || fallbackFromCard(card, id));
    });
  });

  function ensureOverlayHost() {
    let host = document.getElementById('overlay-techtask');
    if (!host) {
      host = document.createElement('div');
      host.id = 'overlay-techtask';
      host.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.4);display:none;z-index:1000;' +
        'align-items:center;justify-content:center;padding:16px;';
      document.body.appendChild(host);
    }
    return host;
  }

  function openTechTaskOverlay(task) {
    const host = ensureOverlayHost();
    host.innerHTML = renderTechTaskOverlay(task);
    host.style.display = 'flex';
    document.body.classList.add('no-scroll');
    attachTechTaskOverlayEvents(host, task);
  }

  function closeTechTaskOverlay() {
    const host = document.getElementById('overlay-techtask');
    if (!host) return;
    host.innerHTML = '';
    host.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }

  function renderTechTaskOverlay(task) {
    const due  = formatDate(task.enddate || task.due);
    const prio = formatPriority(task.priority);

    const assignees = resolveAssignees(task);
    const assigneesHtml = assignees.length
      ? assignees.map(avatarBadge).join('')
      : '<div class="muted" style="color:#6b7280">No assignees</div>';

    const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
    const subtasksHtml = subs.length
      ? subs.map((s, i) => `
          <label class="subtask-item" style="display:flex;gap:8px;align-items:center;margin:.25rem 0;">
            <input type="checkbox" data-sub-idx="${i}" ${s.status === 'done' ? 'checked' : ''} disabled>
            <span>${esc(s.title || '')}</span>
          </label>
        `).join('')
      : `<div class="muted" style="color:#6b7280">No subtasks</div>`;

    return `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="tt-title"
           style="background:#fff;border-radius:16px;max-width:420px;width:100%;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.15);position:relative;">
        <button class="modal-close" type="button" aria-label="Close"
                style="position:absolute;top:10px;right:12px;font-size:22px;background:transparent;border:0;cursor:pointer;">×</button>

        <div class="modal-header" style="margin-bottom:12px;">
          <span style="display:inline-block;background:#10B981;color:#fff;border-radius:9999px;
                       padding:4px 10px;font-size:12px;font-weight:600;">Technical Task</span>
          <h2 id="tt-title" style="margin:.5rem 0 0;font-size:24px;line-height:1.2">${esc(task.title || 'Untitled')}</h2>
          ${task.description ? `<p class="muted" style="margin:.5rem 0 0;color:#4b5563">${esc(task.description)}</p>` : ''}
        </div>

        <div class="modal-body">
          <div class="meta-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:8px 0 16px;">
            <div class="meta-item">
              <div class="meta-label" style="font-size:12px;color:#6b7280;">Due date</div>
              <div class="meta-value" style="font-weight:600;">${esc(due || '—')}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label" style="font-size:12px;color:#6b7280;">Priority</div>
              <div class="meta-value" style="font-weight:600;display:flex;align-items:center;gap:8px;">
                <span class="prio-dot" style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:${prio.color}"></span>
                ${esc(prio.label)}
              </div>
            </div>
          </div>

          <div class="tt-block" style="margin:14px 0;">
            <div class="block-title" style="font-size:12px;color:#6b7280;">Assigned To</div>
            <div class="assignees-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">${assigneesHtml}</div>
          </div>

          <div class="tt-block" style="margin:14px 0;">
            <div class="block-title" style="font-size:12px;color:#6b7280;">Subtasks</div>
            <div class="subtasks-wrap" style="margin-top:6px;">${subtasksHtml}</div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
          <button class="btn ghost" type="button" data-action="delete"
                  style="border:1px solid #e5e7eb;padding:6px 12px;border-radius:8px;background:#fff;cursor:pointer;">Delete</button>
          <button class="btn primary" type="button" data-action="edit"
                  style="background:#10B981;color:#fff;padding:6px 12px;border-radius:8px;border:0;cursor:pointer;">Edit</button>
        </div>
      </div>
    `;
  }

  function attachTechTaskOverlayEvents(root, task) {
    const close = () => closeTechTaskOverlay();

    root.querySelector('.modal-close')?.addEventListener('click', close);
    root.addEventListener('click', (e) => { if (e.target === root) close(); });

    root.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('techtask:edit', { detail: { task } }));
      close();
      if (typeof window.addTaskToBoard === 'function') window.addTaskToBoard();
    });

    root.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('techtask:delete', { detail: { task } }));
      close();
      if (typeof window.deleteTaskById === 'function') {
        try { window.deleteTaskById(task.id); } catch {}
      }
    });
  }

  function fallbackFromCard(card, id) {
    return {
      id,
      main: 'techtask',
      title: card.querySelector('.card-title')?.textContent || 'Untitled',
      description: card.querySelector('.card-desc')?.textContent || '',
      enddate: '',
      priority: 'medium',
      subtasks: [],
      assigned: []
    };
  }

  function resolveAssignees(task) {
    const raw = Array.isArray(task.assigned) ? task.assigned : [];
    const contacts = Array.isArray(window.CONTACTS) ? window.CONTACTS : [];

    const byId    = new Map(contacts.map(u => [String(u.id), u]));
    const byEmail = new Map(contacts.map(u => [String((u.email||'').toLowerCase()), u]));
    const byName  = new Map(contacts.map(u => [String((u.name||'').toLowerCase()), u]));

    return raw.map(x => {
      if (typeof x === 'number') return byId.get(String(x)) || { id:x, name:`User ${x}` };
      if (typeof x === 'string') return byEmail.get(x.toLowerCase()) || byName.get(x.toLowerCase()) || { name:x };
      if (x && typeof x === 'object') {
        return byId.get(String(x.id)) || byEmail.get(String(x.email||'').toLowerCase()) || byName.get(String(x.name||'').toLowerCase()) || x;
      }
      return null;
    }).filter(Boolean);
  }

  function avatarBadge(user) {
    const name = user.name || user.email || 'User';
    const avatar = user.avatar || user.badge;
    if (avatar) {
      return `<img class="avatar-img" src="${esc(avatar)}" alt="${esc(name)}" title="${esc(name)}"
                  style="width:32px;height:32px;border-radius:9999px;object-fit:cover;">`;
    }
    const initials = initialsFromName(name);
    const color = pickColor(name);
    return `<span class="avatar" title="${esc(name)}"
                  style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:${color};font-size:12px;font-weight:700;">
              ${esc(initials)}
            </span>`;
  }

  function esc(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
  function initialsFromName(n){return String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?';}
  function pickColor(key){const s=String(key||'');let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return `hsl(${h} 80% 75%)`;}
  function formatDate(v){ if(!v) return ''; try{const d=new Date(String(v)); if(isNaN(d)) return String(v); return d.toLocaleDateString(undefined,{year:'numeric',month:'2-digit',day:'2-digit'});}catch{return String(v||'');}}
  function formatPriority(p){
    const k=String(p||'medium').toLowerCase();
    if (k==='urgent') return { label:'Urgent', color:'#ef4444' };
    if (k==='high')   return { label:'High',   color:'#ef4444' };
    if (k==='medium') return { label:'Medium', color:'#f59e0b' };
    return { label:'Low',    color:'#10b981' };
  }
})();
