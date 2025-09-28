(function () {
  /* ================ Helpers (vor erstem Gebrauch!) ================ */

  function fallbackFromCard(card, id) {
    return {
      id: id ?? null,
      main: 'userstory', // konsistent klein
      title: card?.querySelector('.card-title')?.textContent || 'Untitled',
      description: card?.querySelector('.card-desc')?.textContent || '',
      enddate: '',
      priority: 'medium',
      subtasks: [],
      assigned: []
    };
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

  // Robust: Badge normalisieren; akzeptiert "user story" / "user-story" / "userstory"
  // Falls Badge fehlt: data-main / data-type; als letzte Rettung: enthält "user"
  function isUserStoryCard(card) {
    const raw = card?.querySelector?.('.card-badge')?.textContent ?? '';
    const norm = String(raw).trim().toLowerCase().replace(/\s|-/g, '');
    if (norm) {
      if (norm === 'userstory') return true;
      // sehr tolerant: wenn im Badge "user" vorkommt, gilt auch
      if (/user/i.test(raw)) return true;
    }
    const ds = card?.dataset || {};
    const main = String(ds.main || ds.type || '')
      .trim().toLowerCase().replace(/\s|-/g, '');
    if (main) return main === 'userstory';
    return false;
  }

  function getAllTasks() {
    return (window.getTasks?.() || window.tasks || window.firstdata?.tasks || []);
  }

  function isUserStory(t) {
    const mainNorm = String(t?.main || '').trim().toLowerCase().replace(/\s|-/g, '');
    if (mainNorm) return mainNorm === 'userstory';
    const badge = document.getElementById(`card${t?.id}`)?.querySelector?.('.card-badge')?.textContent ?? '';
    const badgeNorm = String(badge).trim().toLowerCase().replace(/\s|-/g, '');
    return badgeNorm === 'userstory';
  }

  /* ================ State & Observer ================ */

  let lastOpenAt = 0;
  const INTENT_TTL = 1500; // ms, wie lange wir "letzte US-Absicht" berücksichtigen
  const lastIntent = { ts: 0, id: null, html: '' };
  let techObserver = null;

  function rememberIntent(card) {
    lastIntent.ts = Date.now();
    lastIntent.id = getCardId(card);
    lastIntent.html = card?.outerHTML || '';
  }

  function hasRecentIntent() {
    return Date.now() - lastIntent.ts <= INTENT_TTL;
  }

  function ensureTechOverlayObserver() {
    if (techObserver) return;
    const root = document.body || document.documentElement;
    techObserver = new MutationObserver(muts => {
      for (const m of muts) {
        // Reagieren auf #overlay-add-task Einfügen/Änderung
        const tech = document.getElementById('overlay-add-task');
        if (!tech) continue;
        const visible = tech.style.display !== 'none' || tech.classList.contains('active');
        if (visible && hasRecentIntent()) {
          console.debug('[US] Observer: Tech-Task-Overlay entdeckt -> schließen & US öffnen');
          closeTechTaskOverlay(tech);
          // Wenn wir eine Id haben, versuche echten Task zu finden, sonst Fallback aus HTML
          const tasks = getAllTasks();
          const t = (lastIntent.id != null
            ? tasks.find(x => String(x?.id) === String(lastIntent.id))
            : null) || buildTaskFromLastHTML();
          if (t) openUserStoryOverlay(t);
        }
      }
    });
    techObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  }

  function closeTechTaskOverlayIfOpen() {
    const tech = document.getElementById('overlay-add-task');
    if (tech) closeTechTaskOverlay(tech);
  }
  function closeTechTaskOverlay(tech) {
    try {
      tech.classList.add('hidden');
      tech.classList.remove('active');
      tech.setAttribute('aria-hidden', 'true');
      tech.style.display = 'none';
      document.body.classList.remove('no-scroll');
      tech.innerHTML = '';
      console.debug('[US] Tech-Overlay geschlossen');
    } catch {}
  }

  function buildTaskFromLastHTML() {
    if (!lastIntent.html) return null;
    const tmp = document.createElement('div');
    tmp.innerHTML = lastIntent.html;
    const card = tmp.querySelector('.board-card');
    if (!card) return null;
    return fallbackFromCard(card, lastIntent.id ?? getCardId(card));
  }

  /* ================ Init ================ */

  document.addEventListener('DOMContentLoaded', () => {
    const opts = { capture: true, passive: false };
    document.addEventListener('pointerdown', onCardPreActivate, opts); // früh blocken
    document.addEventListener('click', onCardActivate, opts);          // Fallback
    ensureTechOverlayObserver();

    // Debug-Helfer
    window.debugUS = () => {
      const card = document.querySelector('.board-card');
      const raw = card?.querySelector?.('.card-badge')?.textContent ?? '';
      const norm = String(raw).trim().toLowerCase().replace(/\s|-/g, '');
      console.log('badge raw/norm =', raw, '/', norm, '-> isUS?', isUserStoryCard(card));
      if (card && isUserStoryCard(card)) {
        const id = getCardId(card);
        openUserStoryOverlay(fallbackFromCard(card, id));
        return;
      }
      const t = getAllTasks().find(isUserStory);
      if (t) openUserStoryOverlay(t);
    };
  });

  /* ================ Event-Handler ================ */

  function onCardPreActivate(e) {
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    const isUS = isUserStoryCard(card);
    console.debug('[US] pointerdown on card, isUS=', isUS);
    if (!isUS) return;

    // Absicht merken (für Observer-Fallback)
    rememberIntent(card);

    // Hart stoppen: kein anderer Handler (auch nicht im Capture) soll weiterlaufen
    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}

    closeTechTaskOverlayIfOpen();

    // Leicht verzögert öffnen, verhindert Kollisionen
    queueMicrotask(() => tryOpenFromCard(card, 'pointerdown'));
  }

  function onCardActivate(e) {
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    const isUS = isUserStoryCard(card);
    console.debug('[US] click on card, isUS=', isUS);
    if (!isUS) return;

    rememberIntent(card);

    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}

    closeTechTaskOverlayIfOpen();
    tryOpenFromCard(card, 'click');
  }

  function tryOpenFromCard(card, from) {
    const now = Date.now();
    if (now - lastOpenAt < 200) {
      console.debug('[US] debounce: skip open (from', from, ')');
      return;
    }
    lastOpenAt = now;

    const id = getCardId(card);
    const tasks = getAllTasks();
    const t = (id != null ? tasks.find(x => String(x?.id) === String(id)) : null) || fallbackFromCard(card, id);

    console.debug('[US] open overlay (from', from, ') id=', id, 'hasTask=', !!t);
    openUserStoryOverlay(t);
  }

  /* ================ Overlay (User Story) ================ */

  function ensureOverlayHost() {
    // eigener Host; hoher z-index, um über der App zu liegen
    let host = document.getElementById('overlay-userstory');
    if (!host) {
      host = document.createElement('div');
      host.id = 'overlay-userstory';
      host.setAttribute('aria-hidden', 'true');
      host.style.zIndex = '99999';
      host.style.position = 'fixed';
      host.style.inset = '0';
      host.style.display = 'none';
      host.style.alignItems = 'center';
      host.style.justifyContent = 'center';
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
    host.style.display = 'flex';
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
    const dueText       = fmtDate(task.enddate || task.due);
    const priorityText  = fmtPrioLabel(task.priority);
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
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="us-title" style="max-width:720px;width:clamp(320px,90vw,720px);background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);padding:24px;max-height:90vh;overflow:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial">
        <button class="modal-close" type="button" aria-label="Close" style="position:absolute;right:16px;top:12px;border:none;background:transparent;font-size:24px;line-height:1;cursor:pointer">×</button>

        <div class="modal-header" style="margin-bottom:16px">
          <span class="badge badge-blue" style="display:inline-block;background:#3B82F6;color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;margin-bottom:8px">User Story</span>
          <h2 id="us-title" style="margin:0 0 6px 0;font-size:22px">${esc(task.title || 'Untitled')}</h2>
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
              <div class="meta-value" style="font-weight:600">${esc(priorityText)}</div>
            </div>
          </div>

          <div class="us-block">
            <div class="block-title" style="font-size:13px;color:#6b7280;margin-bottom:8px">Assigned To</div>
            <div class="assignees-row">
              ${assigneesHtml}
            </div>
          </div>

          <div class="us-block">
            <div class="block-title" style="font-size:13px;color:#6b7280;margin-bottom:8px">Subtasks</div>
            <div class="subtasks-wrap">
              ${subtasksHtml}
            </div>
          </div>
        </div>

        <div class="modal-footer" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" type="button" data-action="delete" style="border:1px solid #e5e7eb;background:#fff;border-radius:8px;padding:8px 12px;cursor:pointer">Delete</button>
          <button class="btn primary" type="button" data-action="edit" style="background:#111827;color:#fff;border-radius:8px;padding:8px 12px;border:none;cursor:pointer">Edit</button>
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

  /* ================ Assignees ================ */

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
          via?.name || x.name ||
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

  function us2Initials(n){ return String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?'; }
  function us2PickColor(key){ const s=String(key||''); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%360; return `hsl(${h} 80% 75%)`; }

  function us2AvatarHtml(u) {
    const name = u.name || u.email || 'User';
    const src  = u.badge || u.avatar;
    if (src) return `<img class="avatar-img" src="${esc(src)}" alt="${esc(name)}" title="${esc(name)}">`;
    const init = us2Initials(name);
    const bg   = u.color || us2PickColor(name);
    return `<span class="avatar" title="${esc(name)}" style="background:${bg}">${esc(init)}</span>`;
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
      <ul class="assignee-list" style="display:flex;gap:8px;flex-wrap:wrap;list-style:none;padding:0;margin:0">
        ${list.map(u => `
          <li class="assignee" style="display:flex;align-items:center;gap:8px">
            ${us2AvatarHtml(u)}
            <span class="assignee-name">${esc(u.name)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  /* ================ Misc Utils ================ */

  function esc(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
  function fmtDate(v){ if(!v) return ''; try{const d=new Date(String(v)); if(isNaN(d)) return String(v); return d.toLocaleDateString(undefined,{year:'numeric',month:'2-digit',day:'2-digit'});}catch{return String(v||'');}}
  function fmtPrioLabel(p){const k=String(p||'medium').toLowerCase(); if(k==='urgent')return'Urgent'; if(k==='high')return'High'; if(k==='low')return'Low'; return 'Medium';}
})();
