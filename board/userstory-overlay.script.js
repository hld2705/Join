(function () {
  if (window.__SIMPLE_OVERLAY_EDIT_BOUND__) return;
  window.__SIMPLE_OVERLAY_EDIT_BOUND__ = true;

  const norm = (x) => String(x || '').trim().toLowerCase().replace(/\s|-/g, '');
  const esc = (s) => String(s ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function allTasks() {
    const list =
      (typeof window.getTasks === 'function' && window.getTasks()) ||
      window.tasks ||
      window.firstdata?.tasks ||
      window.firstData?.tasks ||
      window.join?.tasks ||
      window.db?.tasks ||
      window.data?.tasks ||
      [];
    return Array.isArray(list) ? list : [];
  }

  function parseDateValue(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'number' || (/^\d+$/.test(String(v)))) {
      const n  = Number(v);
      const ms = n < 1e12 ? n * 1000 : n;
      const d  = new Date(ms);
      return isNaN(d) ? null : d;
    }
    if (typeof v === 'object') {
      if (typeof v.toDate === 'function') { const d = v.toDate(); return isNaN(d) ? null : d; }
      if (typeof v.seconds === 'number')  { const d = new Date(v.seconds*1000); return isNaN(d) ? null : d; }
      const nested = v.date || v.due || v.dueDate || v.enddate || v.datetime || v.dateTime;
      if (nested != null) return parseDateValue(nested);
    }
    const s = String(v).trim();
    let m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
    if (m) {
      let [, dd, mm, yyyy] = m; dd = +dd; mm = +mm - 1; yyyy = +yyyy;
      if (yyyy < 100) yyyy += (yyyy >= 70 ? 1900 : 2000);
      const d = new Date(yyyy, mm, dd);
      return isNaN(d) ? null : d;
    }
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const yyyy = +m[1], mm = +m[2] - 1, dd = +m[3];
      const d = new Date(yyyy, mm, dd);
      return isNaN(d) ? null : d;
    }
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  function fmtDate(v) {
    const d = parseDateValue(v);
    if (!d) return String(v ?? '');
    try {
      return d.toLocaleDateString(undefined, { year:'numeric', month:'2-digit', day:'2-digit' });
    } catch {
      return d.toDateString();
    }
  }

  function fmtPrioLabel(p) {
    const k = String(p || 'medium').toLowerCase();
    if (k === 'urgent') return 'Urgent';
    if (k === 'high')   return 'High';
    if (k === 'low')    return 'Low';
    return 'Medium';
  }

  function getDueRaw(task) {
    if (!task || typeof task !== 'object') return null;
    const keysInOrder = [
      'due','dueDate','due_date','duedate',
      'deadline',
      'enddate','end_date','enddatum',
      'date',
      'dueAt','due_at','datetime','dateTime'
    ];
    for (const k of keysInOrder) {
      const val = task[k];
      if (val != null && String(val).trim?.() !== '') return val;
    }
    for (const k of Object.keys(task)) {
      if (/^(due|deadline|end.?date|date|datetime|due.?at)$/i.test(k) && task[k] != null && String(task[k]).trim() !== '') {
        return task[k];
      }
    }
    return null;
  }

  function getCardId(card) {
    const ds = card?.dataset || {};
    const fromData = ds.taskId ?? ds.taskid ?? ds.id ?? ds.cardId ?? ds.cardid ?? null;
    if (fromData != null && fromData !== '') return /^\d+$/.test(String(fromData)) ? Number(fromData) : String(fromData);
    const m = String(card?.id || '').match(/card(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function detectCardType(card) {
    const badgeRaw  = card?.querySelector?.('.card-badge')?.textContent ?? '';
    const badgeNorm = norm(badgeRaw);
    if (badgeNorm === 'userstory') return 'userstory';
    if (badgeNorm === 'techtask' || badgeNorm === 'technicaltask') return 'techtask';
    if (/user/i.test(badgeRaw)) return 'userstory';
    if (/tech/i.test(badgeRaw)) return 'techtask';
    const ds = card?.dataset || {};
    const main = norm(ds.main || ds.type || '');
    if (main === 'userstory') return 'userstory';
    if (main === 'techtask')  return 'techtask';
    const id = getCardId(card);
    if (id != null) {
      const t = allTasks().find(x => String(x?.id) === String(id));
      const m = norm(t?.main);
      if (m === 'userstory') return 'userstory';
      if (m === 'techtask')  return 'techtask';
    }
    return null;
  }

  const initials = (n)=> String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?';
  function pickColor(key){ const s=String(key||''); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%360; return `hsl(${h} 80% 75%)`; }
  function avatarHtml(u){
    const name=u.name||u.email||'User'; const src=u.badge||u.avatar;
    if (src) return `<img class="avatar-img" src="${esc(src)}" alt="${esc(name)}" title="${esc(name)}">`;
    const init=initials(name); const bg=u.color||pickColor(name);
    return `<span class="avatar" title="${esc(name)}" style="background:${bg}">${esc(init)}</span>`;
  }

  function readAssignees(task){
    const raw =
      Array.isArray(task?.assigned)   ? task.assigned   :
      Array.isArray(task?.assignees)  ? task.assignees  :
      Array.isArray(task?.assignedTo) ? task.assignedTo :
      Array.isArray(task?.team)       ? task.team       :
      Array.isArray(task?.users)      ? task.users      : [];
    let list = raw.map((x)=>{
      if (typeof x === 'string') return { name:x };
      if (typeof x === 'number') return { name:'User '+x };
      if (x && typeof x==='object') return { name:x.name||x.email||'User', badge:x.badge||x.avatar, color:x.color };
      return null;
    }).filter(Boolean);
    if (!list.length){
      const card = document.getElementById(`card${task?.id}`); if (card){
        list = [];
        card.querySelectorAll('.card-assignees .avatar-img').forEach(img=>{
          const name=img.getAttribute('alt')||img.getAttribute('title')||''; const src=img.getAttribute('src')||'';
          if (src || name) list.push({ name, badge:src });
        });
        card.querySelectorAll('.card-assignees .avatar').forEach(span=>{
          const name=span.getAttribute('title')||''; const init=(span.textContent||'').trim();
          const style=span.getAttribute('style')||''; const m=style.match(/background:\s*([^;]+)/i); const color=m?m[1].trim():null;
          if (name || init) list.push({ name, initials:init, color });
        });
      }
    }
    const seen=new Set();
    return list.filter(u=>{ const k=String(u.name||''); if(!k||seen.has(k)) return false; seen.add(k); return true; });
  }

  function assigneesHtml(task){
    const list=readAssignees(task);
    if (!list.length) return '<div class="muted" style="color:#6b7280">No assignees</div>';
    return `
      <ul class="assignee-list" style="display:flex;gap:8px;flex-wrap:wrap;list-style:none;padding:0;margin:0">
        ${list.map(u=>`
          <li class="assignee" style="display:flex;align-items:center;gap:8px">
            ${avatarHtml(u)}
            <span class="assignee-name">${esc(u.name||'')}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function ensureHost(id){
    let host=document.getElementById(id);
    if(!host){
      host=document.createElement('div');
      host.id=id;
      host.setAttribute('aria-hidden','true');
      Object.assign(host.style,{ zIndex:'99999', position:'fixed', inset:'0', display:'none', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.3)' });
      document.body.appendChild(host);
    }
    return host;
  }
  function closeOverlayById(id){
    const host=document.getElementById(id); if(!host) return;
    host.classList.add('hidden'); host.classList.remove('active');
    host.setAttribute('aria-hidden','true'); host.innerHTML=''; host.style.display='none';
  }
  function closeOverlay(type){
    const hostId = (type==='userstory') ? 'overlay-userstory' : 'overlay-techtask';
    closeOverlayById(hostId);
    document.body.classList.remove('no-scroll');
  }

  function readDueFromCard(card){
    if(!card) return null;
    const ds = card.dataset || {};
    const dsKey = ['due','dueDate','duedate','deadline','enddate','date','datetime','dueAt','dateTime']
      .find(k => ds[k] != null && String(ds[k]).trim() !== '');
    if (dsKey) return ds[dsKey];
    const el =
      card.querySelector('[data-due],[data-deadline],[data-date],[data-datetime],[data-due-at]') ||
      card.querySelector('.card-due,.card-deadline,.card-date,.due,.deadline,.date') ||
      card.querySelector('time[datetime]');
    if (el) {
      const v = el.getAttribute?.('datetime') || el.textContent || '';
      if (String(v).trim()) return v;
    }
    const txt = (card.textContent || '').trim();
    const m = txt.match(/(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}|\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }

  function renderOverlay(type, task){
    const cardEl = document.getElementById(`card${task?.id}`) || null;
    const dueRaw = getDueRaw(task) ?? readDueFromCard(cardEl);
    const dueText = fmtDate(dueRaw);
    const prText  = fmtPrioLabel(task.priority);
    const subs    = Array.isArray(task.subtasks) ? task.subtasks : [];
    const subtasksHtml = subs.length
      ? subs.map((s,i)=>`
          <label class="subtask-item" style="display:flex;gap:8px;align-items:center;margin:4px 0">
            <input type="checkbox" data-sub-idx="${i}" ${s.status==='done'?'checked':''} disabled>
            <span>${esc(s.title||'')}</span>
          </label>
        `).join('')
      : '<div class="muted" style="color:#6b7280">No subtasks</div>';

    const isUS = (type==='userstory');
    const badgeText  = isUS ? 'User Story' : 'Tech Task';
    const badgeStyle = isUS ? 'background:#3B82F6;color:#fff' : 'background:#10B981;color:#0b1b13';

    return `
      <div class="modal" role="dialog" aria-modal="true"
           style="max-width:720px;width:clamp(320px,90vw,720px);background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);padding:24px;max-height:90vh;overflow:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;position:relative">
        <button class="modal-close" type="button" aria-label="Close"
                style="position:absolute;right:16px;top:12px;border:none;background:transparent;font-size:24px;line-height:1;cursor:pointer">×</button>

        <div class="modal-header" style="margin-bottom:16px">
          <span class="badge"
                style="display:inline-block;${badgeStyle};border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;margin-bottom:8px">${badgeText}</span>
          <h2 style="margin:0 0 6px 0;font-size:22px">${esc(task.title || 'Untitled')}</h2>
          ${task.description ? `<p class="muted" style="margin:0;color:#6b7280">${esc(task.description)}</p>` : ''}
        </div>

        <div class="modal-body" style="display:grid;gap:16px">
          <div class="meta-row" style="display:flex;gap:16px">
            <div class="meta-item" style="flex:1">
              <div class="meta-label" style="font-size:12px;color:#6b7280">Due date</div>
              <div class="meta-value" style="font-weight:600">${esc(dueText || '—')}</div>
            </div>
            <div class="meta-item" style="flex:1">
              <div class="meta-label" style="font-size:12px;color:#6b7280">Priority</div>
              <div class="meta-value" style="font-weight:600">${esc(prText)}</div>
            </div>
          </div>

          <div>
            <div class="block-title" style="color:#6b7280;margin-bottom:8px">Assigned To</div>
            <div class="assignees-row">${assigneesHtml(task)}</div>
          </div>

          <div>
            <div class="block-title" style="color:#6b7280;margin-bottom:8px">Subtasks</div>
            <div class="subtasks-wrap">${subtasksHtml}</div>
          </div>
        </div>

        <div class="modal-footer" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" type="button" data-action="delete"
                  style="border:1px solid #e5e7eb;background:#fff;border-radius:8px;padding:8px 12px;cursor:pointer">Delete</button>
          <button class="btn primary" type="button" data-action="edit"
                  style="background:#111827;color:#fff;border-radius:8px;padding:8px 12px;border:none;cursor:pointer">Edit</button>
        </div>
      </div>
    `;
  }

  function openOverlay(type, task){
    const hostId = (type==='userstory') ? 'overlay-userstory' : 'overlay-techtask';
    const host = ensureHost(hostId);
    host.innerHTML = renderOverlay(type, task);
    host.classList.remove('hidden'); host.classList.add('active');
    host.setAttribute('aria-hidden','false');
    host.style.display='flex';
    document.body.classList.add('no-scroll');
    attachOverlayEvents(type, host, task);
  }

  function attachOverlayEvents(type, root, task){
    const close = () => closeOverlay(type);
    root.querySelector('.modal-close')?.addEventListener('click', close);
    root.addEventListener('click', (e)=>{ if (e.target === root) close(); });

    root.querySelector('[data-action="delete"]')?.addEventListener('click', ()=>{
      const ev = (type==='userstory') ? 'userstory:delete' : 'techtask:delete';
      document.dispatchEvent(new CustomEvent(ev, { detail:{ task } }));
      close();
      if (type==='userstory' && typeof window.deleteTaskById==='function'){
        try { window.deleteTaskById(task.id); } catch {}
      }
    });

    root.querySelector('[data-action="edit"]')?.addEventListener('click', (e)=>{
      e.preventDefault();
      try {
        window.__editTaskPending = task;
        window.openEditOverlay?.(task);
      } finally {
        close();
      }
    });
  }

  function fallbackFromCard(card, id, type){
    return {
      id: id ?? null,
      main: type,
      title: card?.querySelector('.card-title')?.textContent || 'Untitled',
      description: card?.querySelector('.card-desc')?.textContent || '',
      enddate: '',
      priority: 'medium',
      subtasks: [],
      assigned: []
    };
  }

  let lastOpenAt = 0;
  async function openFromCard(card){
    const now=Date.now(); if (now - lastOpenAt < 200) return; lastOpenAt=now;
    const type = detectCardType(card); if (!type) return;
    if (type==='userstory') closeOverlayById('overlay-techtask');
    else                    closeOverlayById('overlay-userstory');
    const id = getCardId(card);
    const tasks = allTasks();
    const taskById = (id!=null) ? tasks.find(x=>String(x?.id)===String(id)) : null;
    if (taskById) openOverlay(type, taskById);
    else          openOverlay(type, fallbackFromCard(card, id, type));
  }

  function onPreActivate(e){
    const card = e.target.closest?.('.board-card'); if (!card) return;
    const type = detectCardType(card);              if (!type) return;
    try{ e.stopImmediatePropagation(); }catch{}
    try{ e.stopPropagation(); }catch{}
    e.cancelBubble = true;
    try{ e.preventDefault(); }catch{}
    openFromCard(card);
  }
  function onActivate(e){
    const card = e.target.closest?.('.board-card'); if (!card) return;
    const type = detectCardType(card);              if (!type) return;
    try{ e.stopImmediatePropagation(); }catch{}
    try{ e.stopPropagation(); }catch{}
    e.cancelBubble = true;
    try{ e.preventDefault(); }catch{}
    openFromCard(card);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const opts = { capture: true, passive: false };
    document.addEventListener('pointerdown', onPreActivate, opts);
    document.addEventListener('click', onActivate, opts);
    window.debugUSSimpleEdit = () => {
      const card = document.querySelector('.board-card');
      if (!card) return;
      const type = detectCardType(card) || 'userstory';
      const id = getCardId(card);
      openOverlay(type, fallbackFromCard(card, id, type));
    };
  });

  window.openCardDetailsFromCard = openFromCard;
})();
