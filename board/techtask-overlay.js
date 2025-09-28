/* techtask-overlay.script.js */
(function () {
  if (window.__TT_OVERLAY_LOADED__) {
    console.log('[TT] overlay already loaded');
    return;
  }
  window.__TT_OVERLAY_LOADED__ = true;
  console.log('[TT] overlay loaded (with hydration)');

  /* ============== Helpers: normalize, escape, dates, prio ============== */
  const ttNorm = (x) => String(x || '').trim().toLowerCase().replace(/\s|-/g, '');

  function esc(s){
    return String(s ?? '')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
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
    // unterstützt: enddatum, enddate, due, dueDate, deadline, end_date
    return task?.enddatum ?? task?.enddate ?? task?.due ?? task?.dueDate ?? task?.deadline ?? task?.end_date ?? null;
  }

  /* ===================== join (ES-Modul) binden + Tasks ===================== */
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

  /* ===================== Card utils & detection ===================== */
  function getCardId(card){
    const ds = card?.dataset || {};
    const fromData = ds.taskId ?? ds.taskid ?? ds.id ?? ds.cardId ?? ds.cardid ?? null;
    if (fromData != null && fromData !== '') {
      return /^\d+$/.test(String(fromData)) ? Number(fromData) : String(fromData);
    }
    const m = String(card?.id || '').match(/card(\d+)/);
    if (m) return Number(m[1]);
    return null;
  }

  function isTechTaskCard(card){
    if (!card) return false;

    // 1) Badge
    const raw = card.querySelector('.card-badge')?.textContent ?? '';
    const norm = ttNorm(raw);
    if (norm === 'techtask' || norm === 'technicaltask') return true;
    if (/tech/i.test(raw) && /task/i.test(raw)) return true;

    // 2) data-*
    const ds = card.dataset || {};
    const mainAttr = ttNorm(ds.main || ds.type || '');
    if (mainAttr === 'techtask') return true;

    // 3) per Task
    const id = getCardId(card);
    if (id != null) {
      const t = getAllTasks().find(x => String(x?.id) === String(id));
      if (t && ttNorm(t.main) === 'techtask') return true;
    }
    return false;
  }

  function isTechTask(task){
    const normMain = ttNorm(task?.main);
    if (normMain) return normMain === 'techtask';
    const b = document.getElementById(`card${task?.id}`)?.querySelector?.('.card-badge')?.textContent ?? '';
    const normBadge = ttNorm(b);
    return normBadge === 'techtask' || normBadge === 'technicaltask';
  }

  function fallbackFromCard(card, id){
    return {
      id: id ?? null,
      main: 'techtask',
      title: card?.querySelector('.card-title')?.textContent || 'Untitled',
      description: card?.querySelector('.card-desc')?.textContent || '',
      enddate: '',
      priority: 'medium',
      subtasks: [],
      assigned: []
    };
  }

  /* ===================== Snapshot + Hydration ===================== */
  function getCardSnapshot(card) {
    return {
      id: getCardId(card),
      type: 'techtask',
      title: (card?.querySelector('.card-title')?.textContent || '').trim(),
      desc:  (card?.querySelector('.card-desc')?.textContent  || '').trim(),
      badge: (card?.querySelector('.card-badge')?.textContent || '').trim()
    };
  }

  function findTaskBySnapshot(tasks, snap) {
    const titleNorm = String(snap?.title || '').trim().toLowerCase();
    if (snap?.id != null) {
      const byId = tasks.find(t => String(t?.id) === String(snap.id));
      if (byId) return byId;
    }
    if (titleNorm) {
      const sameTitle = tasks.filter(t => String(t?.title || '').trim().toLowerCase() === titleNorm);
      if (sameTitle.length === 1) return sameTitle[0];
      if (sameTitle.length > 1) {
        const filtered = sameTitle.filter(t => ttNorm(t?.main) === 'techtask');
        if (filtered.length === 1) return filtered[0];
      }
      const soft = tasks.find(t => String(t?.title || '').trim().toLowerCase().includes(titleNorm));
      if (soft) return soft;
    }
    const byType = tasks.find(t => ttNorm(t?.main) === 'techtask');
    return byType || null;
  }

  function waitForTaskBySnapshot(snap, maxMs = 60000, step = 150) {
    const start = Date.now();
    return new Promise(resolve => {
      (async function tick() {
        await bindJoinFromModules();
        const tasks = getAllTasks();
        const found = Array.isArray(tasks) && tasks.length ? findTaskBySnapshot(tasks, snap) : null;
        if (found || Date.now() - start >= maxMs) return resolve(found || null);
        setTimeout(tick, step);
      })();
    });
  }

  async function hydrateOverlayWhenReady(snap) {
    const real = await waitForTaskBySnapshot(snap);
    if (!real) return;
    const host = document.getElementById('overlay-techtask');
    if (!host || host.getAttribute('aria-hidden') === 'true') return;

    host.innerHTML = renderTechTask(real);
    attachTechTaskEvents(host, real);
    console.debug('[TT] overlay hydrated → due=', getDueRaw(real));
  }

  /* ===================== Assignees ===================== */
  function ttGetContactsBook(){
    if (Array.isArray(window.join?.users)) return window.join.users;
    if (Array.isArray(window.CONTACTS)) return window.CONTACTS;
    if (Array.isArray(window.users)) return window.users;
    if (window.firstdata && Array.isArray(window.firstdata.users)) return window.firstdata.users;
    if (window.firstData && Array.isArray(window.firstData.users)) return window.firstData.users;
    if (Array.isArray(window.contacts)) return window.contacts;
    return [];
  }
  const ttInitials = (n)=> String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?';
  function ttPickColor(key){ const s=String(key||''); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%360; return `hsl(${h} 80% 75%)`; }
  function ttContactToAvatar(c){ return { name:c.name, badge:c.badge||c.avatar||null, initials:c.initials||ttInitials(c.name), color:c.color||ttPickColor(c.name) }; }

  function ttNormalizeAssignees(task){
    const raw =
      Array.isArray(task?.assigned)   ? task.assigned   :
      Array.isArray(task?.assignees)  ? task.assignees  :
      Array.isArray(task?.assignedTo) ? task.assignedTo :
      Array.isArray(task?.team)       ? task.team       :
      Array.isArray(task?.users)      ? task.users      : [];

    const book = ttGetContactsBook();
    const byId    = new Map(book.map(u => [String(u?.id ?? ''), u]));
    const byEmail = new Map(book.map(u => [String((u?.email ?? '').toLowerCase()), u]));
    const byName  = new Map(book.map(u => [String((u?.name  ?? '').toLowerCase()), u]));

    const list = raw.map((x)=>{
      if (typeof x === 'number'){
        const c = byId.get(String(x)); const name = c?.name || `User ${x}`;
        return c ? ttContactToAvatar(c) : { name, badge:null, initials:ttInitials(name), color:ttPickColor(name) };
      }
      if (typeof x === 'string'){
        const k=x.toLowerCase(); const c=byEmail.get(k)||byName.get(k); const name = c?.name || x;
        return c ? ttContactToAvatar(c) : { name, badge:null, initials:ttInitials(name), color:ttPickColor(name) };
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
          initials: x.initials || via?.initials || ttInitials(name),
          color: x.color || via?.color || ttPickColor(name),
        };
      }
      return null;
    }).filter(Boolean);

    const seen = new Set();
    return list.filter(a=>{ const k = String(a?.name || a?.email || a?.id || ''); if (seen.has(k)) return false; seen.add(k); return true; });
  }

  function ttAssigneesFromCard(task){
    const card = document.getElementById(`card${task?.id}`); if (!card) return [];
    const out=[];
    card.querySelectorAll('.card-assignees .avatar-img').forEach(img=>{
      const name=img.getAttribute('alt')||img.getAttribute('title')||''; const src=img.getAttribute('src')||'';
      if (src || name) out.push({ name, badge:src, initials:ttInitials(name), color:null });
    });
    card.querySelectorAll('.card-assignees .avatar').forEach(span=>{
      const name=span.getAttribute('title')||''; const initials=(span.textContent||'').trim();
      const style=span.getAttribute('style')||''; const m=style.match(/background:\s*([^;]+)/i); const color=m?m[1].trim():null;
      if (name || initials) out.push({ name, badge:null, initials:initials||ttInitials(name), color });
    });
    const seen=new Set();
    return out.filter(p=>{ const k=(p.name||p.badge||p.initials||'').toLowerCase(); if(!k||seen.has(k)) return false; seen.add(k); return true; });
  }

  function ttAvatarHtml(u){
    const name=u.name||u.email||'User'; const src=u.badge||u.avatar;
    if (src) return `<img class="avatar-img" src="${esc(src)}" alt="${esc(name)}" title="${esc(name)}">`;
    const init=ttInitials(name); const bg=u.color||ttPickColor(name);
    return `<span class="avatar" title="${esc(name)}" style="background:${bg}">${esc(init)}</span>`;
  }

  function ttBuildAssigneesListHtml(task){
    let list=[];
    if (typeof window.materializeAssignees === 'function'){
      try{
        const t = window.materializeAssignees(task) || {};
        const resolved = Array.isArray(t.assigneesResolved) ? t.assigneesResolved : [];
        list = resolved.map(u=>({ name:u.name||u.email||'', badge:u.badge||u.avatar||null, initials:u.initials||ttInitials(u.name||u.email||''), color:u.color }));
      } catch {}
    }
    if (!list.length) list = ttNormalizeAssignees(task);
    if (!list.length) list = ttAssigneesFromCard(task);
    if (!list.length) return '<div class="muted" style="color:#6b7280">No assignees</div>';

    return `
      <ul class="assignee-list" style="display:flex;gap:8px;flex-wrap:wrap;list-style:none;padding:0;margin:0">
        ${list.map(u=>`
          <li class="assignee" style="display:flex;align-items:center;gap:8px">
            ${ttAvatarHtml(u)}
            <span class="assignee-name">${esc(u.name)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  /* ===================== Overlay host & render ===================== */
  function ensureTechHost(){
    let host = document.getElementById('overlay-techtask');
    if (!host){
      host = document.createElement('div');
      host.id = 'overlay-techtask';
      host.setAttribute('aria-hidden','true');
      Object.assign(host.style, { zIndex:'99999', position:'fixed', inset:'0', display:'none', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.3)' });
      document.body.appendChild(host);
    }
    return host;
  }

  function openTechTaskOverlay(task){
    const host = ensureTechHost();
    host.innerHTML = renderTechTask(task);
    host.classList.remove('hidden');
    host.classList.add('active');
    host.setAttribute('aria-hidden','false');
    host.style.display='flex';
    document.body.classList.add('no-scroll');
    attachTechTaskEvents(host, task);
  }

  function closeTechTaskOverlay(){
    const host = ensureTechHost();
    host.classList.add('hidden');
    host.classList.remove('active');
    host.setAttribute('aria-hidden','true');
    host.innerHTML = '';
    host.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }

  function closeUserStoryOverlayIfOpen(){
    const us = document.getElementById('overlay-userstory');
    if (!us) return;
    try {
      us.classList.add('hidden');
      us.classList.remove('active');
      us.setAttribute('aria-hidden','true');
      us.style.display = 'none';
      us.innerHTML = '';
      console.debug('[TT] US-Overlay geschlossen');
    } catch {}
  }

  function renderTechTask(task){
    const dueText = fmtDate(getDueRaw(task));
    const prText  = fmtPrioLabel(task.priority);
    const assigneesHtml = ttBuildAssigneesListHtml(task);
    const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
    const subtasksHtml = subs.length
      ? subs.map((s,i)=>`
          <label class="subtask-item" style="display:flex;gap:8px;align-items:center;margin:4px 0">
            <input type="checkbox" data-sub-idx="${i}" ${s.status==='done'?'checked':''} disabled>
            <span>${esc(s.title||'')}</span>
          </label>
        `).join('')
      : '<div class="muted" style="color:#6b7280">No subtasks</div>';

    return `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="tt-title"
           style="max-width:720px;width:clamp(320px,90vw,720px);background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);padding:24px;max-height:90vh;overflow:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;position:relative">
        <button class="modal-close" type="button" aria-label="Close"
                style="position:absolute;right:16px;top:12px;border:none;background:transparent;font-size:24px;line-height:1;cursor:pointer">×</button>

        <div class="modal-header" style="margin-bottom:16px">
          <span class="badge badge-green"
                style="display:inline-block;background:#10B981;color:#0b1b13;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;margin-bottom:8px">Tech Task</span>
          <h2 id="tt-title" style="margin:0 0 6px 0;font-size:22px">${esc(task.title || 'Untitled')}</h2>
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

          <div class="tt-block">
            <div class="block-title" style="color:#6b7280;margin-bottom:8px">Assigned To</div>
            <div class="assignees-row">${assigneesHtml}</div>
          </div>

          <div class="tt-block">
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

  /* ===================== Add-Task Desktop Edit (Prefill robust) ===================== */
  function qAny(root, sels) { for (const s of sels) { const el = root.querySelector(s); if (el) return el; } return null; }
  function toISODate(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; }

  async function waitForEl(sel, max = 4000) {
    return new Promise(res => {
      const first = document.querySelector(sel); if (first) return res(first);
      const obs = new MutationObserver(() => { const e = document.querySelector(sel); if (e){obs.disconnect();res(e);} });
      obs.observe(document.documentElement, { childList:true, subtree:true });
      setTimeout(()=>{obs.disconnect();res(null);}, max);
    });
  }

  function prefillDesktopForm(root, task) {
    const title = qAny(root, ['input[name=title]','#title','input[placeholder*="title" i]']);
    if (title) { title.value = task?.title || ''; title.dispatchEvent(new Event('input',{bubbles:true})); title.dispatchEvent(new Event('change',{bubbles:true})); }

    const desc = qAny(root, ['textarea[name=description]','#description','textarea']);
    if (desc) { desc.value = task?.description || ''; desc.dispatchEvent(new Event('input',{bubbles:true})); desc.dispatchEvent(new Event('change',{bubbles:true})); }

    const rawDue = getDueRaw(task);
    const dateInp = qAny(root, ['input[type=date]','#date-input','input[name=enddate]','input[name=due]','input[name=dueDate]']);
    if (dateInp && rawDue != null) {
      const d = parseDateValue(rawDue);
      if (d) {
        dateInp.value = toISODate(d);
        dateInp.dispatchEvent(new Event('input',{bubbles:true}));
        dateInp.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }

    const pr = String(task?.priority || 'medium').toLowerCase();
    const prBtn = qAny(root, [`[data-priority="${pr}"]`, `.priority [data-value="${pr}"]`, `.priority button.${pr}`]);
    if (prBtn && typeof prBtn.click === 'function') prBtn.click();

    if (typeof window.applyAssignees === 'function') {
      try { window.applyAssignees(task); } catch {}
    } else {
      root.dispatchEvent(new CustomEvent('edit:prefill-assignees', { detail: { task }, bubbles: true }));
    }

    const ok = qAny(root, ['button[type=submit]','.btn.primary','.ok-btn']);
    if (ok && /ok/i.test(ok.textContent || '')) ok.textContent = 'Save';
  }

  async function openDesktopAddTaskEdit(task) {
    let host = document.getElementById('overlay-add-task');
    if (!host) {
      if (typeof window.openTaskEditor === 'function') {
        try { window.openTaskEditor(task); } catch {}
      } else if (typeof window.addTaskToBoard === 'function') {
        try { window.addTaskToBoard(); } catch {}
      }
      host = await waitForEl('#overlay-add-task', 5000);
    }
    if (!host) return;

    host.classList.add('active'); host.classList.remove('hidden');
    host.setAttribute('aria-hidden','false'); host.style.display='flex';
    document.body.classList.add('no-scroll');

    host.dataset.mode = 'edit';
    if (task?.id != null) host.dataset.taskId = String(task.id);

    prefillDesktopForm(host, task);
    setTimeout(()=>prefillDesktopForm(host, task), 120);
    setTimeout(()=>prefillDesktopForm(host, task), 300);
  }

  /* ===================== Events in Overlay ===================== */
  function attachTechTaskEvents(root, task){
    const close = () => closeTechTaskOverlay();
    root.querySelector('.modal-close')?.addEventListener('click', close);
    root.addEventListener('click', (e)=>{ if (e.target === root) close(); });

    root.querySelector('[data-action="edit"]')?.addEventListener('click', async ()=>{
      close();
      if (typeof window.openEditorForTask === 'function') {
        try { await window.openEditorForTask(task); return; } catch {}
      }
      await openDesktopAddTaskEdit(task);
    });

    root.querySelector('[data-action="delete"]')?.addEventListener('click', ()=>{
      document.dispatchEvent(new CustomEvent('techtask:delete', { detail: { task } }));
      close();
    });
  }

  /* ===================== Pointer/Click Handler (mit Hydration) ===================== */
  let lastOpenAt = 0;

  async function openFromCard(card, from) {
    const now = Date.now();
    if (now - lastOpenAt < 200) { console.debug('[TT] debounce: skip open (from', from, ')'); return; }
    lastOpenAt = now;

    closeUserStoryOverlayIfOpen();

    await bindJoinFromModules();
    const id = getCardId(card);
    const tasks = getAllTasks();
    const taskById = (id != null ? tasks.find(x => String(x?.id) === String(id)) : null);

    if (taskById) {
      openTechTaskOverlay(taskById);
      console.debug('[TT] open overlay (real task) id=', id, 'due=', getDueRaw(taskById));
    } else {
      const fb = fallbackFromCard(card, id);
      openTechTaskOverlay(fb);
      console.debug('[TT] open overlay (fallback) id=', id, 'due=', getDueRaw(fb));
      // Nachladen, wenn Tasks später kommen
      const snap = getCardSnapshot(card);
      hydrateOverlayWhenReady(snap);
    }
  }

  function onTTPreActivate(e){
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    const isTT = isTechTaskCard(card);
    console.debug('[TT] pointerdown on card, isTT=', isTT);
    if (!isTT) return;

    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}

    openFromCard(card, 'pointerdown');
  }

  function onTTActivate(e){
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    const isTT = isTechTaskCard(card);
    console.debug('[TT] click on card, isTT=', isTT);
    if (!isTT) return;

    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}

    openFromCard(card, 'click');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const opts = { capture: true, passive: false };
    document.addEventListener('pointerdown', onTTPreActivate, opts);
    document.addEventListener('click',       onTTActivate,    opts);

    // Debug-Helfer
    window.debugTT = () => {
      const card = document.querySelector('.board-card');
      const isTT = isTechTaskCard(card);
      console.log('[TT] debugTT → badge=', card?.querySelector?.('.card-badge')?.textContent?.trim(), 'isTT?', isTT);
      if (isTT) {
        const id = getCardId(card);
        openTechTaskOverlay(fallbackFromCard(card, id));
        const snap = getCardSnapshot(card);
        hydrateOverlayWhenReady(snap);
      } else {
        const t = getAllTasks().find(isTechTask);
        if (t) openTechTaskOverlay(t);
      }
    };
  });
})();
