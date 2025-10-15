import { loadData, getTasks, getUsers, initializeDefaultData } from '../db.js';
import { boardShell, cardTemplate, attachAddTaskOverlayEvents } from './board-templates.js';

const COLS = ['todo', 'inprogress', 'review', 'done'];
let QUERY = '';

const AUTO_REFRESH_MS = 8000; 
let __refreshTimer = null;
let __isRefreshing = false;

async function refreshBoard() {
  if (__isRefreshing) return;
  __isRefreshing = true;
  try {
    await loadData();                 
    renderBoard(getTasks() ?? []);   
  } catch (e) {
    console.warn('[board] refresh failed:', e);
  } finally {
    __isRefreshing = false;
  }
}

let __refreshReq = 0;
function requestRefresh(delay = 0) {
  const req = ++__refreshReq;
  setTimeout(() => { if (req === __refreshReq) refreshBoard(); }, delay);
}

let __isDraggingCard = false;
let __suppressClicksUntil = 0;
let __lastDown = { x: 0, y: 0, t: 0 };

function installDragClickGuards() {
  document.addEventListener('pointerdown', (e) => {
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    __lastDown = { x: e.clientX ?? 0, y: e.clientY ?? 0, t: performance.now() };
  }, true);
  document.addEventListener('dragstart', (e) => {
    if (!e.target.closest?.('.board-card')) return;
    __isDraggingCard = true;
    __suppressClicksUntil = performance.now() + 400;
  }, true);

  document.addEventListener('dragend', () => {
    setTimeout(() => { __isDraggingCard = false; }, 0);
  }, true);
  document.addEventListener('click', (e) => {
    const card = e.target.closest?.('.board-card');
    if (!card) return;

    const moved =
      Math.hypot((e.clientX ?? 0) - __lastDown.x, (e.clientY ?? 0) - __lastDown.y) > 5;
    const tooSoon = performance.now() < __suppressClicksUntil;

    if (__isDraggingCard || moved || tooSoon) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      return;
    }
  }, true);
}

function getContacts() { return Array.isArray(window.CONTACTS) ? window.CONTACTS : []; }
function resolveUser(userRef) {
  if (!userRef) return null;
  const users = getContacts();
  if (typeof userRef === 'object' && userRef.id) return userRef;
  return users.find(u => u.id === userRef || u.email === userRef || u.name === userRef) || null;
}
function getInitialsFromName(n = '') {
  const p = String(n).trim().split(/\s+/).filter(Boolean);
  return (p[0]?.[0] || '' + (p[1]?.[0] || '')).toUpperCase() || '?';
}
function avatarBadge(user) {
  if (!user) return `<div class="avatar" title="Unknown">?</div>`;
  const name = user.name || user.email || 'User';
  if (user.avatar) return `<img class="avatar-img" src="${user.avatar}" alt="${name}" loading="lazy">`;
  const initials = user.initials || getInitialsFromName(name);
  return `<div class="avatar" title="${name}">${initials}</div>`;
}
function materializeAssignees(task) {
  const list = Array.isArray(task.assignees) ? task.assignees : [];
  const resolved = list.map(resolveUser).filter(Boolean);
  const badges = resolved.map(avatarBadge).join('');
  return { ...task, assigneesResolved: resolved, assigneeBadgesHtml: badges };
}

document.addEventListener('DOMContentLoaded', init);

async function init() {
  installDragClickGuards();
  document.getElementById('board-root').innerHTML = boardShell();

  document.querySelectorAll('[data-add]').forEach(b =>
    b.addEventListener('click', openOverlay)
  );

  document.getElementById('bt-add-task')?.addEventListener('click', openOverlay);
  document.getElementById('input-find-task')?.addEventListener('input', (e) => {
    QUERY = e.target.value.trim().toLowerCase();
    renderBoard(getTasks() ?? []);
  });

  if (typeof initializeDefaultData === 'function') await initializeDefaultData();
  await loadData();

  const users = (typeof getUsers === 'function') ? getUsers() : [];
  if (Array.isArray(users)) window.CONTACTS = users;

  setProfileAvatar();
  renderBoard(getTasks() ?? []);

  if (AUTO_REFRESH_MS > 0) {
    __refreshTimer = setInterval(refreshBoard, AUTO_REFRESH_MS);
  }
  window.addEventListener('focus', () => requestRefresh(50));
  window.addEventListener('storage', () => requestRefresh(100));
  window.addEventListener('tasks:changed', () => requestRefresh(0));
}

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
  enableDragAndDrop();    
  bindCardOpenerOnce();   
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

let __dragging = false;
let __suppressUntil = 0;
let __down = {x:0, y:0};

function installCardGuardsOnce() {
  if (document.__cardGuardsInstalled) return;
  document.__cardGuardsInstalled = true;

  document.addEventListener('pointerdown', (e) => {
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    __down = { x: e.clientX ?? 0, y: e.clientY ?? 0 };
    e.stopImmediatePropagation();
    e.stopPropagation();
  }, true);

  document.addEventListener('dragstart', (e) => {
    if (!e.target.closest?.('.board-card')) return;
    __dragging = true;
    __suppressUntil = performance.now() + 500;
  }, true);

  document.addEventListener('dragend', () => {
    setTimeout(() => { __dragging = false; }, 0);
  }, true);

  document.addEventListener('click', (e) => {
    const card = e.target.closest?.('.board-card');
    if (!card) return;

    const moved = Math.hypot((e.clientX ?? 0) - __down.x, (e.clientY ?? 0) - __down.y) > 5;
    const tooSoon = performance.now() < __suppressUntil;
    if (__dragging || moved || tooSoon) return;
    if (typeof window.openCardDetailsFromCard === 'function') {
      window.openCardDetailsFromCard(card);
    }
  }, true);
}
installCardGuardsOnce();

function enableDragAndDrop() {
  document.querySelectorAll('.board-card').forEach(card => {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.id); 
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('is-dragging');
      __isDraggingCard = true;
      __suppressClicksUntil = performance.now() + 600;
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      setTimeout(() => { __isDraggingCard = false; }, 0);
    });
  });

  document.querySelectorAll('.columns-content').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drop-target');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drop-target');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drop-target');

      const cardId = e.dataTransfer.getData('text/plain');
      const card = document.getElementById(cardId);
      if (!card) return;

      col.appendChild(card);
      const id = cardId.replace('card', '');
      const tasks = getTasks?.() || [];
      const task = tasks.find(t => String(t.id) === id);
      if (task) {
        task.status = col.dataset.status;
        window.dispatchEvent(new CustomEvent('tasks:changed')); 
      }
      __suppressClicksUntil = performance.now() + 600;
    });
  });
}

function bindCardOpenerOnce() {
  if (document.__boardCardOpenerBound) return;
  document.__boardCardOpenerBound = true;

  document.addEventListener('click', (e) => {
    const card = e.target.closest?.('.board-card');
    if (!card) return;
    const moved = Math.hypot((e.clientX ?? 0) - __lastDown.x, (e.clientY ?? 0) - __lastDown.y) > 5;
    const tooSoon = performance.now() < __suppressClicksUntil;
    if (__isDraggingCard || moved || tooSoon) return;

    const id = card.id.replace('card', '');
    const tasks = getTasks?.() || [];
    const task = tasks.find(t => String(t.id) === id);
    if (!task) return;
    window.openEditOverlay?.();
  });
}

function openOverlay() {
  const host = document.getElementById('overlay-add-task');
  if (!host) return;
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
  const users = window.CONTACTS || [];
  const userId = sessionStorage.getItem('currentUserId');
  const user =
    users.find(u => u.id === userId) ||
    users.find(u => u.email && u.email === sessionStorage.getItem('currentUserEmail'));

  let el = document.getElementById('profile-avatar') || document.querySelector('.profil');
  if (!el || !user) return;

  el.style.filter = 'none';
  const avatar = user.avatar && String(user.avatar);
  try {
    if (avatar && avatar.endsWith('.svg')) {
      const res = await fetch(avatar);
      if (!res.ok) throw new Error('SVG fetch failed');
      const svgText = await res.text();
      el.outerHTML = `<div id="${el.id || 'profile-avatar'}" class="${el.className}">${svgText}</div>`;
      const wrapper = document.getElementById(el.id || 'profile-avatar') || document.querySelector('.profil');
      const svg = wrapper?.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '50');
        svg.setAttribute('height', '50');
        svg.style.display = 'block';
        svg.style.borderRadius = '50%';
      }
      return;
    }
    if (avatar) {
      if (el.tagName.toLowerCase() === 'img') {
        el.src = avatar;
        el.alt = user.name || user.email || 'profile avatar';
      } else {
        el.innerHTML = `<img class="avatar-img" src="${avatar}" alt="${user.name || user.email || 'profile avatar'}" loading="lazy">`;
      }
      return;
    }
  } catch {}

  const name = user.name || user.email || 'User';
  const initials = (name.split(/\s+/).map(p => p[0]).join('').slice(0, 2) || '?').toUpperCase();
  const badge = `<div class="avatar" title="${name}" style="background:#FF8A00;color:#fff;">${initials}</div>`;
  if (el.tagName.toLowerCase() === 'img') {
    el.outerHTML = `<div id="${el.id || 'profile-avatar'}" class="${el.className}">${badge}</div>`;
  } else {
    el.innerHTML = badge;
  }
}