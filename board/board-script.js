import { loadData, getTasks, getUsers, initializeDefaultData } from '../db.js';
import {
  boardShell,
  cardTemplate,
  attachAddTaskOverlayEvents,
} from './board-templates.js';

const COLS = ['todo', 'inprogress', 'review', 'done'];
let QUERY = '';

/* =================== Helpers: Contacts & Avatare =================== */
function getContacts() {
  return Array.isArray(window.CONTACTS) ? window.CONTACTS : [];
}

function resolveUser(userRef) {
  if (!userRef) return null;
  const users = getContacts();
  if (typeof userRef === 'object' && userRef.id) return userRef;

  return users.find(u =>
    u.id === userRef ||
    u.email === userRef ||
    u.name === userRef
  ) || null;
}

function getInitialsFromName(nameOrEmail = '') {
  const clean = String(nameOrEmail).trim();
  if (!clean) return '?';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean[0]?.toUpperCase() || '?';
}

function avatarBadge(user) {
  if (!user) return `<div class="avatar" title="Unknown">?</div>`;
  const name = user.name || user.email || 'User';
  if (user.avatar) {
    return `<img class="avatar-img" src="${user.avatar}" alt="${name}" loading="lazy">`;
  }
  const initials = user.initials || getInitialsFromName(name);
  return `<div class="avatar" title="${name}">${initials}</div>`;
}

function materializeAssignees(task) {
  const list = Array.isArray(task.assignees) ? task.assignees : [];
  const resolved = list.map(resolveUser).filter(Boolean);
  const badges = resolved.map(avatarBadge).join('');
  return { ...task, assigneesResolved: resolved, assigneeBadgesHtml: badges };
}

/* =================== Init =================== */
document.addEventListener('DOMContentLoaded', init);

async function init() {
  document.getElementById('board-root').innerHTML = boardShell();

document.getElementById('bt-add-task')?.addEventListener('click', renderTaskOverlay);

  document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', openOverlay));

  document.getElementById('input-find-task')?.addEventListener('input', (e) => {
    QUERY = e.target.value.trim().toLowerCase();
    renderBoard(getTasks() ?? []);
  });

  if (typeof initializeDefaultData === 'function') {
    await initializeDefaultData();
  }
  await loadData();

  const users = (typeof getUsers === 'function') ? getUsers() : [];
  if (Array.isArray(users)) window.CONTACTS = users;

  setProfileAvatar();

  renderBoard(getTasks() ?? []);
}

/* =================== Render Board =================== */
function renderBoard(tasks) {
  COLS.forEach(id => { const c = document.getElementById(id); if (c) c.innerHTML = ''; });

  const safe = Array.isArray(tasks) ? tasks : [];

  const filtered = safe
    .filter(t => t && typeof t === 'object' && COLS.includes(t.status))
    .filter(t => !QUERY || (`${t.title ?? ''} ${t.description ?? ''}`).toLowerCase().includes(QUERY));

  for (const t of filtered) {
    const col = document.getElementById(t.status);
    if (!col) continue;

    const tWithAssignees = materializeAssignees(t);
    col.insertAdjacentHTML('beforeend', cardTemplate(tWithAssignees));
  }

  addPlaceholdersIfEmpty();
}

function addPlaceholdersIfEmpty() {
  const txt = {
    todo: 'No tasks To do',
    inprogress: 'No tasks In progress',
    review: 'No tasks Await feedback',
    done: 'No tasks Done'
  };
  COLS.forEach(id => {
    const col = document.getElementById(id);
    if (col && col.children.length === 0) {
      col.innerHTML = `<div class="placeholder">${txt[id]}</div>`;
    }
  });
}

/* =================== Overlay =================== */
function openOverlay() {
  const host = document.getElementById('overlay-add-task');
  if (!host) {

    return;
  }

  const markup =  renderTaskOverlay?.();
  if (!markup) {
    if (typeof window.addTaskToBoard === 'function') {
      return window.addTaskToBoard();
    }

    return;
  }

  host.innerHTML = markup;
  host.classList.remove('hidden');
  host.classList.add('active');
  host.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');

  attachAddTaskOverlayEvents?.(host);
}

function closeOverlay() {
  const host = document.getElementById('overlay-add-task');
  if (!host) return;

  host.classList.add('hidden');
  host.classList.remove('active');
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

window.openOverlay = openOverlay;
window.closeOverlay = closeOverlay;


window.addTaskToBoard = function () {
  const overlay = document.getElementById('task-overlay');
  const backdrop = document.getElementById('task-overlay-background');
  if (overlay) overlay.style.display = 'block';
  if (backdrop) backdrop.style.display = 'block';
};

/* =================== Navbar =================== */
document.addEventListener('DOMContentLoaded', initProfileMenuAndLogout);
function initProfileMenuAndLogout() {
  const profilImg = document.querySelector('.profil');
  const navbar = document.getElementById('navbar');

  if (profilImg && navbar) {
    profilImg.addEventListener('click', (e) => {
      e.stopPropagation();
      navbar.classList.toggle('open');
    });

    navbar.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => navbar.classList.remove('open'));
  }

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        sessionStorage.removeItem('currentUserId');
        sessionStorage.removeItem('currentUserEmail');
      } catch {}
      window.location.href = 'index.html';
    });
  }
}

async function setProfileAvatar() {
  // 1) aktuellen User bestimmen
  const users = window.CONTACTS || [];
  const userId = sessionStorage.getItem('currentUserId');
  const user =
    users.find(u => u.id === userId) ||
    users.find(u => u.email && u.email === sessionStorage.getItem('currentUserEmail'));

  // 2) Ziel: bevorzugt #profile-avatar, sonst .profil (img/div)
  let el = document.getElementById('profile-avatar') || document.querySelector('.profil');
  if (!el || !user) return;

  // jegliche Filter entfernen (falls global gesetzt)
  el.style.filter = 'none';

  // 3) SVG inline einbetten, damit Originalfarben erhalten bleiben
  const avatar = user.avatar && String(user.avatar);
  try {
    if (avatar && avatar.endsWith('.svg')) {
      const res = await fetch(avatar);
      if (!res.ok) throw new Error('SVG fetch failed');
      const svgText = await res.text();

      // Wrapper als Kreis behalten (rundet das SVG)
      el.outerHTML = `
        <div id="${el.id || 'profile-avatar'}" class="${el.className}">
          ${svgText}
        </div>
      `;

      // Größe & Rundung für das eingebettete SVG setzen
      const wrapper = document.getElementById(el.id || 'profile-avatar') || document.querySelector('.profil');
      if (wrapper) {
        const svg = wrapper.querySelector('svg');
        if (svg) {
          svg.setAttribute('width', '50');
          svg.setAttribute('height', '50');
          svg.style.display = 'block';
          svg.style.borderRadius = '50%';
        }
      }
      return;
    }

    // 4) normales Bild (png/jpg/webp/…) – zeigt immer Originalfarben
    if (avatar) {
      if (el.tagName.toLowerCase() === 'img') {
        el.src = avatar;
        el.alt = user.name || user.email || 'profile avatar';
      } else {
        el.innerHTML = `<img class="avatar-img" src="${avatar}" alt="${user.name || user.email || 'profile avatar'}" loading="lazy">`;
      }
      return;
    }
  } catch (e) {
      }

  // 5) Fallback: Initialen-Badge
  const name = user.name || user.email || 'User';
  const initials = (name.split(/\s+/).map(p => p[0]).join('').slice(0, 2) || '?').toUpperCase();
  // Optional: farbig hinterlegen (hier orange wie im Screenshot)
  const bg = '#FF8A00';
  const color = '#fff';
  const badge = `
    <div class="avatar" title="${name}" style="background:${bg};color:${color};">
      ${initials}
    </div>
  `;
  if (el.tagName.toLowerCase() === 'img') {
    el.outerHTML = `<div id="${el.id || 'profile-avatar'}" class="${el.className}">${badge}</div>`;
  } else {
    el.innerHTML = badge;
  }
}

function renderTaskOverlay() {
  document.getElementById('task-overlay').style.display = "block";
}
