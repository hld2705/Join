import { userStoryOverlayTemplate, techTaskOverlayTemplate } from './userstory-overlay-template.js';

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', onCardClick);
});

function onCardClick(e) {
  const card = e.target.closest('.board-card');
  if (!card) return;

  const id = Number(String(card.id || '').replace(/^card/, '')) || null;
  const task = findTaskById(id) || fallbackFromCard(card, id);
  if (!task) return;

  const main = String(task.main || '').toLowerCase();
  if (main !== 'userstory' && main !== 'techtask') return;

  const view = buildView(task);
  const markup = main === 'userstory'
    ? userStoryOverlayTemplate(view)
    : techTaskOverlayTemplate(view);

  openDetailsOverlay(markup, task);
}

function getOverlayHost() {
  let host = document.getElementById('overlay-add-task');
  if (host) return host;

  host = document.getElementById('overlay-task-details');
  if (!host) {
    host = document.createElement('div');
    host.id = 'overlay-task-details';
    document.body.appendChild(host);
  }
  return host;
}

function openDetailsOverlay(markup, task) {
  const host = getOverlayHost();
  host.innerHTML = markup;
  host.classList.remove('hidden');
  host.classList.add('active');
  host.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');

  attachOverlayEvents(host, task);
}

function closeDetailsOverlay() {
  const host = getOverlayHost();
  host.classList.add('hidden');
  host.classList.remove('active');
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

function attachOverlayEvents(host, task) {

  host.querySelector('.modal-close')?.addEventListener('click', () => closeDetailsOverlay());

  host.addEventListener('click', (e) => { if (e.target === host) closeDetailsOverlay(); });


  host.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('task:edit', { detail: { task } }));
    closeDetailsOverlay();
    if (typeof window.addTaskToBoard === 'function') window.addTaskToBoard();
  });

  host.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('task:delete', { detail: { task } }));
    closeDetailsOverlay();
    if (typeof window.deleteTaskById === 'function') {
      try { window.deleteTaskById(task.id); } catch {}
    }
  });
}

function findTaskById(id) {
  if (!id && id !== 0) return null;

  const candidates = [
    (typeof getTasks === 'function' ? getTasks() : null),
    (Array.isArray(window?.tasks) ? window.tasks : null),
  ].find(Boolean);

  if (!Array.isArray(candidates)) return null;
  return candidates.find(t => Number(t?.id) === Number(id)) || null;
}

function fallbackFromCard(card, id) {
  const badgeText = (card.querySelector('.card-badge')?.textContent || '').trim().toLowerCase();
  const main = badgeText.includes('technical') ? 'techtask' : (badgeText.includes('user') ? 'userstory' : '');
  return {
    id,
    main,
    title: card.querySelector('.card-title')?.textContent || 'Untitled',
    description: card.querySelector('.card-desc')?.textContent || '',
    enddate: '',
    priority: 'medium',
    subtasks: [],
    assigned: []
  };
}

function buildView(task) {
  const dueText = formatDate(task.enddate || task.due);
  const priorityText = formatPriorityLabel(task.priority);


  let assigneesHtml = '';
  if (typeof materializeAssignees === 'function') {
 
    const t = materializeAssignees(task);
    assigneesHtml = t.assigneeBadgesHtml || '';
  } else {
    const assignees = resolveAssigneesFallback(task);
    assigneesHtml = assignees.map(avatarBadgeSimple).join('');
  }


  const subs = Array.isArray(task.subtasks) ? task.subtasks : [];
  const subtasksHtml = subs.length
    ? subs.map((s, i) => `
        <label class="subtask-item">
          <input type="checkbox" data-sub-idx="${i}" ${s.status === 'done' ? 'checked' : ''} disabled>
          <span>${esc(s.title || '')}</span>
        </label>
      `).join('')
    : '';

  return {
    title: task.title || 'Untitled',
    description: task.description || '',
    dueText,
    priorityText,
    assigneesHtml,
    subtasksHtml
  };
}

function resolveAssigneesFallback(task) {
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

function avatarBadgeSimple(user) {
  const name = user.name || user.email || 'User';
  const avatar = user.avatar || user.badge;
  if (avatar) {
    return `<img class="avatar-img" src="${esc(avatar)}" alt="${esc(name)}" title="${esc(name)}">`;
  }
  const initials = initialsFromName(name);
  return `<span class="avatar" title="${esc(name)}">${esc(initials)}</span>`;
}


function esc(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}

function initialsFromName(n){
  return String(n).trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('')||'?';
}

function formatDate(v){
  if (!v) return '';
  try {
    const d = (v instanceof Date) ? v : new Date(String(v));
    if (isNaN(d)) return String(v);
    return d.toLocaleDateString(undefined, { year:'numeric', month:'2-digit', day:'2-digit' });
  } catch { return String(v || ''); }
}

function formatPriorityLabel(p){
  const k = String(p || 'medium').toLowerCase();
  if (k === 'urgent') return 'Urgent';
  if (k === 'high')   return 'High';
  if (k === 'low')    return 'Low';
  return 'Medium';
}
