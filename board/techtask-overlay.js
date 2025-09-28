(function () {
  /* =============== Basis-Setup =============== */

  const INTENT_TTL = 1500; // ms
  const lastIntent = { ts: 0, type: null, id: null, html: '' };

  /* =============== Helpers: Normalisierung & IDs =============== */

  function normLabel(x) {
    return String(x || '').trim().toLowerCase().replace(/\s|-/g, '');
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

  function detectCardType(card) {
    const raw  = card?.querySelector?.('.card-badge')?.textContent ?? '';
    const norm = normLabel(raw);
    if (norm === 'userstory') return 'userstory';
    if (norm === 'techtask')  return 'techtask';
    if (/user/i.test(raw)) return 'userstory';
    if (/tech/i.test(raw)) return 'techtask';
    const ds = card?.dataset || {};
    const main = normLabel(ds.main || ds.type || '');
    if (main === 'userstory') return 'userstory';
    if (main === 'techtask')  return 'techtask';
    return null;
  }

  /* =============== join aus ES-Modul binden (falls nötig) =============== */

  let __joinBindTried = false;
  async function bindJoinFromModules() {
    if (__joinBindTried || window.join?.tasks) return !!window.join?.tasks;
    __joinBindTried = true;
    try {
      const mods = Array.from(document.querySelectorAll('script[type="module"][src]'));
      for (const s of mods) {
        try {
          const mod = await import(s.src);
          // häufig: export const join = {...}
          if (mod?.join?.tasks && Array.isArray(mod.join.tasks)) {
            window.join = mod.join;
            console.debug('[DUAL] bound window.join from module:', s.src);
            return true;
          }
          // evtl. default-Export mit join
          if (mod?.default?.join?.tasks && Array.isArray(mod.default.join.tasks)) {
            window.join = mod.default.join;
            console.debug('[DUAL] bound window.join from default module:', s.src);
            return true;
          }
          // oder default ist direkt join
          if (mod?.default?.tasks && Array.isArray(mod.default.tasks) && mod?.default?.users) {
            window.join = mod.default;
            console.debug('[DUAL] bound window.join (default object) from module:', s.src);
            return true;
          }
        } catch (e) {
          // still try others
        }
      }
    } catch {}
    return !!window.join?.tasks;
  }

  /* =============== Tasks beziehen (robust) =============== */

  function getAllTasks() {
    const direct = (
      window.getTasks?.() ||
      window.tasks ||
      window.firstdata?.tasks ||
      window.firstData?.tasks ||
      window.join?.tasks ||            // <— hier kommt's hin nach bindJoinFromModules()
      window.db?.tasks ||
      window.data?.tasks
    );
    if (Array.isArray(direct) && direct.length) return direct;

    // weitere naheliegende Felder
    const candidates = [
      window.firstdata?.items, window.firstData?.items,
      window.join?.items, window.db?.items,
    ].filter(Boolean);
    for (const arr of candidates) {
      if (Array.isArray(arr) && arr.length) return arr;
    }

    return [];
  }

  function rememberIntent(card, type) {
    lastIntent.ts = Date.now();
    lastIntent.type = type;
    lastIntent.id = getCardId(card);
    lastIntent.html = card?.outerHTML || '';
  }
  function hasRecentIntent(type) {
    return lastIntent.type === type && (Date.now() - lastIntent.ts <= INTENT_TTL);
  }

  /* =============== Fallbacks aus Karte =============== */

  function fallbackFromCard(card, id, type) {
    return {
      id: id ?? null,
      main: type,
      title: card?.querySelector('.card-title')?.textContent || 'Untitled',
      description: card?.querySelector('.card-desc')?.textContent || '',
      enddate: '', // echtes Datum kommt nach Hydration
      priority: 'medium',
      subtasks: [],
      assigned: []
    };
  }

  /* =============== Snapshot + Matching (für Hydration) =============== */

  function getCardSnapshot(card, typeHint) {
    return {
      id: getCardId(card),
      type: typeHint || detectCardType(card),
      title: (card?.querySelector('.card-title')?.textContent || '').trim(),
      desc:  (card?.querySelector('.card-desc')?.textContent  || '').trim(),
      badge: (card?.querySelector('.card-badge')?.textContent || '').trim()
    };
  }

  function findTaskBySnapshot(tasks, snap) {
    const typeNorm  = snap?.type ? snap.type : null;
    const titleNorm = String(snap?.title || '').trim().toLowerCase();

    if (snap?.id != null) {
      const byId = tasks.find(t => String(t?.id) === String(snap.id));
      if (byId) return byId;
    }

    if (titleNorm) {
      const sameTitle = tasks.filter(t => String(t?.title || '').trim().toLowerCase() === titleNorm);
      if (sameTitle.length === 1) return sameTitle[0];
      if (sameTitle.length > 1) {
        const filtered = sameTitle.filter(t => !typeNorm || normLabel(t?.main) === typeNorm);
        if (filtered.length === 1) return filtered[0];
      }
      const soft = tasks.find(t => String(t?.title || '').trim().toLowerCase().includes(titleNorm));
      if (soft) return soft;
    }

    if (typeNorm) {
      const byType = tasks.find(t => normLabel(t?.main) === typeNorm);
      if (byType) return byType;
    }
    return null;
  }

  /* =============== Overlay-Hosts/Controls =============== */

  function ensureHost(id) {
    let host = document.getElementById(id);
    if (!host) {
      host = document.createElement('div');
      host.id = id;
      host.setAttribute('aria-hidden', 'true');
      host.style.zIndex = '99999';
      host.style.position = 'fixed';
      host.style.inset = '0';
      host.style.display = 'none';
      host.style.alignItems = 'center';
      host.style.justifyContent = 'center';
      host.style.background = 'rgba(0,0,0,.3)';
      document.body.appendChild(host);
    }
    return host;
  }

  function openOverlay(type, html, attach) {
    const host = ensureHost(type === 'userstory' ? 'overlay-userstory' : 'overlay-techtask');
    host.innerHTML = html;
    host.classList.remove('hidden');
    host.classList.add('active');
    host.setAttribute('aria-hidden', 'false');
    host.style.display = 'flex';
    document.body.classList.add('no-scroll');
    attach(host);
  }

  function closeOverlay(type) {
    const id = type === 'userstory' ? 'overlay-userstory' : 'overlay-techtask';
    const host = document.getElementById(id);
    if (!host) return;
    host.classList.add('hidden');
    host.classList.remove('active');
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = '';
    host.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }

  function closeAppOverlayIfOpen() {
    const tech = document.getElementById('overlay-add-task');
    if (!tech) return;
    try {
      tech.classList.add('hidden');
      tech.classList.remove('active');
      tech.setAttribute('aria-hidden', 'true');
      tech.style.display = 'none';
      document.body.classList.remove('no-scroll');
      tech.innerHTML = '';
      console.debug('[DUAL] App-Overlay (#overlay-add-task) geschlossen');
    } catch {}
  }

  /* =============== Render & Data-Utils =============== */

  function esc(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}

  // robustes Datums-Parsing (ISO, unix s/ms, dd.mm.yyyy, dd/mm/yyyy)
  function parseDateValue(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v) ? null : v;

    if (typeof v === 'number') {
      const n = v < 1e12 ? v * 1000 : v; // Sekunden → ms
      const d = new Date(n);
      return isNaN(d) ? null : d;
    }

    const s = String(v).trim();

    let m = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
    if (m) {
      let [ , dd, mm, yyyy ] = m;
      dd = parseInt(dd, 10);
      mm = parseInt(mm, 10) - 1;
      yyyy = parseInt(yyyy, 10);
      if (yyyy < 100) yyyy += (yyyy >= 70 ? 1900 : 2000);
      const d = new Date(yyyy, mm, dd);
      return isNaN(d) ? null : d;
    }

    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  function fmtDate(v){
    const d = parseDateValue(v);
    if (!d) return String(v ?? '');
    try {
      return d.toLocaleDateString(undefined,{year:'numeric',month:'2-digit',day:'2-digit'});
    } catch {
      return d.toDateString();
    }
  }

  function fmtPrioLabel(p){
    const k=String(p||'medium').toLowerCase();
    if(k==='urgent')return'Urgent';
    if(k==='high')  return'High';
    if(k==='low')   return'Low';
    return 'Medium';
  }

  // Due-Date aus diversen Keys (inkl. enddate/enddatum)
  function getDueRaw(task) {
    return (
      task?.enddatum ??
      task?.enddate ??
      task?.due ??
      task?.dueDate ??
      task?.deadline ??
      task?.end_date ??
      null
    );
  }

  // Assignees / Avatare
  function us2Initials(n){ return String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?'; }
  function us2PickColor(key){ const s=String(key||''); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%360; return `hsl(${h} 80% 75%)`; }
  function us2ContactToAvatar(c){ return { name: c.name, badge: c.badge || c.avatar || null, initials: c.initials || us2Initials(c.name), color: c.color || us2PickColor(c.name) }; }
  function us2AvatarHtml(u){
    const name = u.name || u.email || 'User';
    const src = u.badge || u.avatar;
    if (src) return `<img class="avatar-img" src="${esc(src)}" alt="${esc(name)}" title="${esc(name)}">`;
    const init = us2Initials(name);
    const bg = u.color || us2PickColor(name);
    return `<span class="avatar" title="${esc(name)}" style="background:${bg}">${esc(init)}</span>`;
  }

  function us2GetContactsBook() {
    if (Array.isArray(window.join?.users)) return window.join.users; // <— deine Datenquelle
    if (Array.isArray(window.CONTACTS)) return window.CONTACTS;
    if (Array.isArray(window.users)) return window.users;
    if (window.firstdata && Array.isArray(window.firstdata.users)) return window.firstdata.users;
    if (window.firstData && Array.isArray(window.firstData.users)) return window.firstData.users;
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
        return c ? us2ContactToAvatar(c) : { name, badge:null, initials: us2Initials(name), color: us2PickColor(name) };
      }
      if (typeof x === 'string') {
        const k = x.toLowerCase();
        const c = byEmail.get(k) || byName.get(k);
        const name = c?.name || x;
        return c ? us2ContactToAvatar(c) : { name, badge:null, initials: us2Initials(name), color: us2PickColor(name) };
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

  /* =============== Renderer: User Story & Tech Task =============== */

  function renderUserStory(task) {
    const dueText       = fmtDate(getDueRaw(task));
    const priorityText  = fmtPrioLabel(task.priority);
    const assigneesHtml = us2BuildAssigneesListHtml(task);
    const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
    const subtasksHtml = subs.length
      ? subs.map((s, i) => `
          <label class="subtask-item">
            <input type="checkbox" data-sub-idx="${i}" ${s.status === 'done' ? 'checked' : ''} disabled>
            <span>${esc(s.title || '')}</span>
          </label>`).join('')
      : '<div class="muted">No subtasks</div>';

    return `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="us-title" style="max-width:720px;width:clamp(320px,90vw,720px);background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);padding:24px;max-height:90vh;overflow:auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial;position:relative">
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
            <div class="assignees-row">${assigneesHtml}</div>
          </div>

          <div class="us-block">
            <div class="block-title" style="font-size:13px;color:#6b7280;margin-bottom:8px">Subtasks</div>
            <div class="subtasks-wrap">${subtasksHtml}</div>
          </div>
        </div>

        <div class="modal-footer" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" type="button" data-action="delete" style="border:1px solid #e5e7eb;background:#fff;border-radius:8px;padding:8px 12px;cursor:pointer">Delete</button>
          <button class="btn primary" type="button" data-action="edit" style="background:#111827;color:#fff;border-radius:8px;padding:8px 12px;border:none;cursor:pointer">Edit</button>
        </div>
      </div>`;
  }

  function renderTechTask(task) {
    const dueText       = fmtDate(getDueRaw(task));
    const priorityText  = fmtPrioLabel(task.priority);
    const assigneesHtml = us2BuildAssigneesListHtml(task);
    const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
    const subtasksHtml = subs.length
      ? subs.map((s, i) => `
          <label class="subtask-item" style="display:flex;gap:8px;align-items:center;margin:4px 0">
            <input type="checkbox" data-sub-idx="${i}" ${s.status === 'done' ? 'checked' : ''} disabled>
            <span>${esc(s.title || '')}</span>
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
              <div class="meta-value" style="font-weight:600">${esc(priorityText)}</div>
            </div>
          </div>

          <div class="tt-block">
            <div class="block-title" style="font-size:13px;color:#6b7280;margin-bottom:8px">Assigned To</div>
            <div class="assignees-row">${assigneesHtml}</div>
          </div>

          <div class="tt-block">
            <div class="block-title" style="font-size:13px;color:#6b7280;margin-bottom:8px">Subtasks</div>
            <div class="subtasks-wrap">${subtasksHtml}</div>
          </div>
        </div>

        <div class="modal-footer" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" type="button" data-action="delete"
                  style="border:1px solid #e5e7eb;background:#fff;border-radius:8px;padding:8px 12px;cursor:pointer">Delete</button>
          <button class="btn primary" type="button" data-action="edit"
                  style="background:#111827;color:#fff;border-radius:8px;padding:8px 12px;border:none;cursor:pointer">Edit</button>
        </div>
      </div>`;
  }

  /* =============== Events an Overlays =============== */

  function attachUserStoryEvents(root, task) {
    const close = () => closeOverlay('userstory');
    root.querySelector('.modal-close')?.addEventListener('click', close);
    root.addEventListener('click', (e) => { if (e.target === root) close(); });
    root.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('userstory:edit', { detail: { task } }));
      close();
    });
    root.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('userstory:delete', { detail: { task } }));
      close();
    });
  }

  function attachTechTaskEvents(root, task) {
    const close = () => closeOverlay('techtask');
    root.querySelector('.modal-close')?.addEventListener('click', close);
    root.addEventListener('click', (e) => { if (e.target === root) close(); });
    root.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('techtask:edit', { detail: { task } }));
      close();
    });
    root.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('techtask:delete', { detail: { task } }));
      close();
    });
  }

  function openForType(type, task) {
    if (type === 'userstory') {
      openOverlay('userstory', renderUserStory(task), (host) => attachUserStoryEvents(host, task));
    } else if (type === 'techtask') {
      openOverlay('techtask', renderTechTask(task), (host) => attachTechTaskEvents(host, task));
    }
  }

  /* =============== Observer, Retry & Hydration =============== */

  let lastOpenAt = 0;
  let observerStarted = false;

  const openRetries = new WeakMap(); // card -> count
  const MAX_RETRIES = 10;
  const RETRY_DELAY_MS = 60;

  function ensureObserver() {
    if (observerStarted) return;
    observerStarted = true;

    const root = document.body || document.documentElement;
    const obs = new MutationObserver(async () => {
      const app = document.getElementById('overlay-add-task');
      if (app && (app.style.display !== 'none' || app.classList.contains('active'))) {
        if (hasRecentIntent('userstory') || hasRecentIntent('techtask')) {
          closeAppOverlayIfOpen();

          // versuche, join zu binden
          await bindJoinFromModules();

          const tasks = getAllTasks();
          const t = (lastIntent.id != null
            ? tasks.find(x => String(x?.id) === String(lastIntent.id))
            : null) || buildTaskFromLastHTML();
          if (t) openForType(lastIntent.type, t);

          // Immer Hydration versuchen (per Snapshot), falls Fallback
          const snap = (function(){
            if (!lastIntent.html) return null;
            const tmp = document.createElement('div');
            tmp.innerHTML = lastIntent.html;
            const card = tmp.querySelector('.board-card');
            return card ? getCardSnapshot(card, lastIntent.type) : null;
          })();
          if (snap) hydrateOverlayWhenReady(lastIntent.type, snap);
        }
      }
    });
    obs.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  }

  function waitForTaskBySnapshot(snap, maxMs = 60000, step = 150) {
    const start = Date.now();
    return new Promise(resolve => {
      (async function tick() {
        // versuche bei jedem Durchlauf, join zu binden
        await bindJoinFromModules();

        const tasks = getAllTasks();
        const found = Array.isArray(tasks) && tasks.length ? findTaskBySnapshot(tasks, snap) : null;
        if (found || Date.now() - start >= maxMs) return resolve(found || null);
        setTimeout(tick, step);
      })();
    });
  }

  async function hydrateOverlayWhenReady(type, snap) {
    const real = await waitForTaskBySnapshot(snap);
    if (!real) return;
    const hostId = type === 'userstory' ? 'overlay-userstory' : 'overlay-techtask';
    const host = document.getElementById(hostId);
    if (!host || host.getAttribute('aria-hidden') === 'true') return;

    if (type === 'userstory') {
      host.innerHTML = renderUserStory(real);
      attachUserStoryEvents(host, real);
    } else {
      host.innerHTML = renderTechTask(real);
      attachTechTaskEvents(host, real);
    }
    console.debug('[DUAL] overlay hydrated with real task via snapshot:', snap);
  }

  function tryOpenFromCard(card, type, from) {
    const now = Date.now();
    if (now - lastOpenAt < 200) {
      console.debug('[DUAL] debounce: skip open (', type, 'from', from, ')');
      return;
    }

    const id    = getCardId(card);
    const tasks = getAllTasks();
    const taskById = (id != null ? tasks.find(x => String(x?.id) === String(id)) : null);

    if (!taskById && tasks.length === 0) {
      const c = (openRetries.get(card) || 0) + 1;
      if (c <= MAX_RETRIES) {
        openRetries.set(card, c);
        setTimeout(() => tryOpenFromCard(card, type, from + ' (retry ' + c + ')'), RETRY_DELAY_MS);
        return;
      }
      console.debug('[DUAL] gave up retries → opening fallback; will bind module + hydrate later');
    }

    lastOpenAt = now;

    const task = taskById || fallbackFromCard(card, id, type);
    openForType(type, task);

    // Falls Fallback → binde join (falls noch nicht) und hydratisiere
    if (!taskById) {
      const snap = getCardSnapshot(card, type);
      // Fire and forget
      bindJoinFromModules().then(() => hydrateOverlayWhenReady(type, snap));
    }
  }

  /* =============== Event-Handler Wiring =============== */

  function onCardPreActivate(e) {
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    const type = detectCardType(card);
    if (!type) return;

    rememberIntent(card, type);

    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}

    closeAppOverlayIfOpen();
    queueMicrotask(() => tryOpenFromCard(card, type, 'pointerdown'));
  }

  function onCardActivate(e) {
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    const type = detectCardType(card);
    if (!type) return;

    rememberIntent(card, type);

    try { e.stopImmediatePropagation(); } catch {}
    try { e.stopPropagation(); } catch {}
    e.cancelBubble = true;
    try { e.preventDefault(); } catch {}

    closeAppOverlayIfOpen();
    tryOpenFromCard(card, type, 'click');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const opts = { capture: true, passive: false };
    document.addEventListener('pointerdown', onCardPreActivate, opts);
    document.addEventListener('click',       onCardActivate,    opts);
    ensureObserver();

    // Debug-Shortcut
    window.debugDUAL = async () => {
      const card = document.querySelector('.board-card');
      if (!card) return;
      const type = detectCardType(card);
      const id   = getCardId(card);
      openForType(type, fallbackFromCard(card, id, type));
      await bindJoinFromModules();
      hydrateOverlayWhenReady(type, getCardSnapshot(card, type));
    };
  });
})();
