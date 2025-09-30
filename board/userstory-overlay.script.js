(function () {
  if (window.__DUAL_OVERLAY_SIMPLE_EDIT_LOADED__) {
    console.log('[DUAL] already loaded');
    return;
  }
  window.__DUAL_OVERLAY_SIMPLE_EDIT_LOADED__ = true;
  console.log('[DUAL] overlays (simple, with edit) loaded');

  const norm = (x) => String(x || '').trim().toLowerCase().replace(/\s|-/g, '');
  function esc(s){
    return String(s ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }
  function parseDateValue(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v) ? null : v;
    if (typeof v === 'number') { const n = v < 1e12 ? v*1000 : v; const d=new Date(n); return isNaN(d)?null:d; }
    const s = String(v).trim();
    const m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
    if (m) { let [,dd,mm,yyyy]=m; dd=+dd; mm=+mm-1; yyyy=+yyyy; if (yyyy<100) yyyy += (yyyy>=70?1900:2000); const d=new Date(yyyy,mm,dd); return isNaN(d)?null:d; }
    const d = new Date(s); return isNaN(d)?null:d;
  }
  function fmtDate(v){
    const d=parseDateValue(v);
    if(!d) return String(v??'');
    try{ return d.toLocaleDateString(undefined,{year:'numeric',month:'2-digit',day:'2-digit'});}catch{ return d.toDateString(); }
  }
  function fmtPrioLabel(p){
    const k=String(p||'medium').toLowerCase();
    if(k==='urgent')return 'Urgent';
    if(k==='high')  return 'High';
    if(k==='low')   return 'Low';
    return 'Medium';
  }
  function getDueRaw(task){
    return task?.enddatum ?? task?.enddate ?? task?.due ?? task?.dueDate ?? task?.deadline ?? task?.end_date ?? null;
  }

  let __bindTried = false;
  async function bindJoinFromModules() {
    if (__bindTried || window.join?.tasks) return !!window.join?.tasks;
    __bindTried = true;
    try {
      const mods = Array.from(document.querySelectorAll('script[type="module"][src]'));
      for (const s of mods) {
        try {
          const mod = await import(s.src);
          if (mod?.join?.tasks && Array.isArray(mod.join.tasks)) { window.join = mod.join; return true; }
          if (mod?.default?.join?.tasks && Array.isArray(mod.default.join.tasks)) { window.join = mod.default.join; return true; }
          if (mod?.default?.tasks && Array.isArray(mod.default.tasks)) { window.join = mod.default; return true; }
        } catch {}
      }
    } catch {}
    return !!window.join?.tasks;
  }
  function getAllTasks(){
    const direct = (
      window.getTasks?.() ||
      window.tasks ||
      window.firstdata?.tasks ||
      window.firstData?.tasks ||
      window.join?.tasks ||
      window.db?.tasks ||
      window.data?.tasks ||
      []
    );
    return Array.isArray(direct) ? direct : [];
  }

  function getCardId(card){
    const ds = card?.dataset || {};
    const fromData = ds.taskId ?? ds.taskid ?? ds.id ?? ds.cardId ?? ds.cardid ?? null;
    if (fromData != null && fromData !== '') return /^\d+$/.test(String(fromData)) ? Number(fromData) : String(fromData);
    const m = String(card?.id || '').match(/card(\d+)/);
    if (m) return Number(m[1]);
    return null;
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
      const t = getAllTasks().find(x => String(x?.id) === String(id));
      const m = norm(t?.main);
      if (m === 'userstory') return 'userstory';
      if (m === 'techtask')  return 'techtask';
    }
    return null;
  }
  function getCardSnapshot(card, typeHint) {
    return {
      id: getCardId(card),
      type: typeHint || detectCardType(card),
      title: (card?.querySelector('.card-title')?.textContent || '').trim(),
      desc:  (card?.querySelector('.card-desc')?.textContent  || '').trim(),
      badge: (card?.querySelector('.card-badge')?.textContent || '').trim()
    };
  }

  function getContactsBook(){
    if (Array.isArray(window.join?.users)) return window.join.users;
    if (Array.isArray(window.CONTACTS)) return window.CONTACTS;
    if (Array.isArray(window.users)) return window.users;
    if (window.firstdata && Array.isArray(window.firstdata.users)) return window.firstdata.users;
    if (window.firstData && Array.isArray(window.firstData.users)) return window.firstData.users;
    if (Array.isArray(window.contacts)) return window.contacts;
    return [];
  }
  const initials = (n)=> String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?';
  function pickColor(key){ const s=String(key||''); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%360; return `hsl(${h} 80% 75%)`; }
  function contactToAvatar(c){ return { name:c.name, badge:c.badge||c.avatar||null, initials:c.initials||initials(c.name), color:c.color||pickColor(c.name) }; }
  function normalizeAssignees(task){
    const raw =
      Array.isArray(task?.assigned)   ? task.assigned   :
      Array.isArray(task?.assignees)  ? task.assignees  :
      Array.isArray(task?.assignedTo) ? task.assignedTo :
      Array.isArray(task?.team)       ? task.team       :
      Array.isArray(task?.users)      ? task.users      : [];
    const book = getContactsBook();
    const byId    = new Map(book.map(u => [String(u?.id ?? ''), u]));
    const byEmail = new Map(book.map(u => [String((u?.email ?? '').toLowerCase()), u]));
    const byName  = new Map(book.map(u => [String((u?.name  ?? '').toLowerCase()), u]));
    const list = raw.map((x)=>{
      if (typeof x === 'number'){
        const c = byId.get(String(x)); const name = c?.name || `User ${x}`;
        return c ? contactToAvatar(c) : { name, badge:null, initials:initials(name), color:pickColor(name) };
      }
      if (typeof x === 'string'){
        const k=x.toLowerCase(); const c=byEmail.get(k)||byName.get(k); const name = c?.name || x;
        return c ? contactToAvatar(c) : { name, badge:null, initials:initials(name), color:pickColor(name) };
      }
      if (x && typeof x==='object'){
        const via =
          (x.id!=null && byId.get(String(x.id))) ||
          (x.email && byEmail.get(String(x.email).toLowerCase())) ||
          (x.name  && byName.get(String(x.name).toLowerCase())) || null;
        const name = via?.name || x.name ||
          [x.firstName ?? x.firstname, x.lastName ?? x.lastname].filter(Boolean).join(' ') ||
          x.email || x.username || (x.id != null ? `User ${x.id}` : 'User');
        return {
          name,
          badge: x.badge || x.avatar || via?.badge || via?.avatar || null,
          initials: x.initials || via?.initials || initials(name),
          color: x.color || via?.color || pickColor(name),
        };
      }
      return null;
    }).filter(Boolean);
    const seen = new Set();
    return list.filter(a=>{ const k = String(a?.name || a?.email || a?.id || ''); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  function assigneesFromCard(task){
    const card = document.getElementById(`card${task?.id}`); if (!card) return [];
    const out=[];
    card.querySelectorAll('.card-assignees .avatar-img').forEach(img=>{
      const name=img.getAttribute('alt')||img.getAttribute('title')||''; const src=img.getAttribute('src')||'';
      if (src || name) out.push({ name, badge:src, initials:initials(name), color:null });
    });
    card.querySelectorAll('.card-assignees .avatar').forEach(span=>{
      const name=span.getAttribute('title')||''; const init=(span.textContent||'').trim();
      const style=span.getAttribute('style')||''; const m=style.match(/background:\s*([^;]+)/i); const color=m?m[1].trim():null;
      if (name || init) out.push({ name, badge:null, initials:init || initials(name), color });
    });
    const seen=new Set();
    return out.filter(p=>{ const k=(p.name||p.badge||p.initials||'').toLowerCase(); if(!k||seen.has(k)) return false; seen.add(k); return true; });
  }
  function avatarHtml(u){
    const name=u.name||u.email||'User'; const src=u.badge||u.avatar;
    if (src) return `<img class="avatar-img" src="${esc(src)}" alt="${esc(name)}" title="${esc(name)}">`;
    const init=initials(name); const bg=u.color||pickColor(name);
    return `<span class="avatar" title="${esc(name)}" style="background:${bg}">${esc(init)}</span>`;
  }
  function buildAssigneesListHtml(task){
    let list=[];
    if (typeof window.materializeAssignees === 'function'){
      try{
        const t = window.materializeAssignees(task) || {};
        const resolved = Array.isArray(t.assigneesResolved) ? t.assigneesResolved : [];
        list = resolved.map(u=>({ name:u.name||u.email||'', badge:u.badge||u.avatar||null, initials:u.initials||initials(u.name||u.email||''), color:u.color }));
      } catch {}
    }
    if (!list.length) list = normalizeAssignees(task);
    if (!list.length) list = assigneesFromCard(task);
    if (!list.length) return '<div class="muted" style="color:#6b7280">No assignees</div>';
    return `
      <ul class="assignee-list" style="display:flex;gap:8px;flex-wrap:wrap;list-style:none;padding:0;margin:0">
        ${list.map(u=>`
          <li class="assignee" style="display:flex;align-items:center;gap:8px">
            ${avatarHtml(u)}
            <span class="assignee-name">${esc(u.name)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function ensureHost(id){
    let host = document.getElementById(id);
    if (!host){
      host = document.createElement('div');
      host.id = id;
      host.setAttribute('aria-hidden','true');
      Object.assign(host.style, { zIndex:'99999', position:'fixed', inset:'0', display:'none', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.3)' });
      document.body.appendChild(host);
    }
    return host;
  }
  function closeOverlayById(id){
    const host = document.getElementById(id);
    if (!host) return;
    host.classList.add('hidden'); host.classList.remove('active');
    host.setAttribute('aria-hidden','true');
    host.innerHTML = ''; host.style.display='none';
  }
  function closeOverlay(type){
    const hostId = type === 'userstory' ? 'overlay-userstory' : 'overlay-techtask';
    closeOverlayById(hostId);
    document.body.classList.remove('no-scroll');
  }
  function closeOtherType(current){
    if (current === 'userstory') closeOverlayById('overlay-techtask');
    else closeOverlayById('overlay-userstory');
  }

  function renderOverlay(type, task){
    const dueText = fmtDate(getDueRaw(task));
    const prText  = fmtPrioLabel(task.priority);
    const assigneesHtml = buildAssigneesListHtml(task);
    const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
    const subtasksHtml = subs.length
      ? subs.map((s,i)=>`
          <label class="subtask-item" style="display:flex;gap:8px;align-items:center;margin:4px 0">
            <input type="checkbox" data-sub-idx="${i}" ${s.status==='done'?'checked':''} disabled>
            <span>${esc(s.title||'')}</span>
          </label>
        `).join('')
      : '<div class="muted" style="color:#6b7280">No subtasks</div>';

    const isUS = type === 'userstory';
    const badgeText  = isUS ? 'User Story' : 'Tech Task';
    const badgeStyle = isUS ? 'background:#3B82F6;color:#fff' : 'background:#10B981;color:#0b1b13';

    return `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${isUS?'us':'tt'}-title"
           style="max-width:720px;width:clamp(320px,90vw,720px);background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);padding:24px;max-height:90vh;overflow:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;position:relative">
        <button class="modal-close" type="button" aria-label="Close"
                style="position:absolute;right:16px;top:12px;border:none;background:transparent;font-size:24px;line-height:1;cursor:pointer">×</button>

        <div class="modal-header" style="margin-bottom:16px">
          <span class="badge"
                style="display:inline-block;${badgeStyle};border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;margin-bottom:8px">${badgeText}</span>
          <h2 id="${isUS?'us':'tt'}-title" style="margin:0 0 6px 0;font-size:22px">${esc(task.title || 'Untitled')}</h2>
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

          <div class="${isUS?'us':'tt'}-block">
            <div class="block-title" style="color:#6b7280;margin-bottom:8px">Assigned To</div>
            <div class="assignees-row">${assigneesHtml}</div>
          </div>

          <div class="${isUS?'us':'tt'}-block">
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
    const hostId = type === 'userstory' ? 'overlay-userstory' : 'overlay-techtask';
    const host = ensureHost(hostId);
    host.innerHTML = renderOverlay(type, task);
    host.classList.remove('hidden'); host.classList.add('active');
    host.setAttribute('aria-hidden','false');
    host.style.display='flex'; document.body.classList.add('no-scroll');
    attachOverlayEvents(type, host, task);
  }

  function attachOverlayEvents(type, root, task){
    const close = () => closeOverlay(type);
    root.querySelector('.modal-close')?.addEventListener('click', close);
    root.addEventListener('click', (e)=>{ if (e.target === root) close(); });

    root.querySelector('[data-action="delete"]')?.addEventListener('click', ()=>{
      const ev = type === 'userstory' ? 'userstory:delete' : 'techtask:delete';
      document.dispatchEvent(new CustomEvent(ev, { detail: { task } }));
      close();
      if (type === 'userstory' && typeof window.deleteTaskById === 'function') {
        try { window.deleteTaskById(task.id); } catch {}
      }
    });

    root.querySelector('[data-action="edit"]')?.addEventListener('click', async ()=>{
      const evName = (type === 'userstory') ? 'userstory:edit' : 'techtask:edit';
      try {
   
        const host = document.querySelector('#overlay-add-task');
        if (host) host.setAttribute('data-mode', 'edit');

        document.dispatchEvent(new CustomEvent(evName, { detail: { task } }));

        if (typeof window.openEditorOverlayFromButton === 'function') {
          await window.openEditorOverlayFromButton(task);
        }

        else if (typeof window.openEditorForTask === 'function') {
          await window.openEditorForTask(task);
        } else if (typeof window.openTaskEditor === 'function') {
          await window.openTaskEditor(task);
        } else if (typeof window.addTaskToBoard === 'function') {
          await window.addTaskToBoard();
        }
      } catch (e) {
        console.error('[DUAL] Edit handler failed:', e);
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

  async function openFromCard(card) {
    const now = Date.now();
    if (now - lastOpenAt < 200) return; 
    lastOpenAt = now;

    const type = detectCardType(card);
    if (!type) return;

    if (type === 'userstory') closeOverlayById('overlay-techtask');
    else closeOverlayById('overlay-userstory');

    await bindJoinFromModules();
    const id = getCardId(card);
    const tasks = getAllTasks();
    const taskById = (id != null ? tasks.find(x => String(x?.id) === String(id)) : null);

    if (taskById) {
      openOverlay(type, taskById);
      console.debug('[DUAL] open overlay (real task) type=', type, 'id=', id, 'due=', getDueRaw(taskById));
    } else {
      const fb = fallbackFromCard(card, id, type);
      openOverlay(type, fb);
      console.debug('[DUAL] open overlay (fallback) type=', type, 'id=', id);
    }
  }

  function onPreActivate(e){
    const card = e.target.closest?.('.board-card'); if (!card) return;
    const type = detectCardType(card); if (!type) return;
    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}
    openFromCard(card);
  }
  function onActivate(e){
    const card = e.target.closest?.('.board-card'); if (!card) return;
    const type = detectCardType(card); if (!type) return;
    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}
    openFromCard(card);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const opts = { capture: true, passive: false };
    document.addEventListener('pointerdown', onPreActivate, opts);
    document.addEventListener('click',       onActivate,    opts);

    window.debugUSSimpleEdit = () => {
      const card = document.querySelector('.board-card');
      if (!card) return;
      const type = detectCardType(card) || 'userstory';
      const id   = getCardId(card);
      openOverlay(type, fallbackFromCard(card, id, type));
    };
  });

})();
