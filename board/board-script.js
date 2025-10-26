import { loadData, getTasks, getUsers, initializeDefaultData } from '../db.js';
import { boardShell, cardTemplate } from './board-templates.js';

const COLS = ['todo', 'inprogress', 'review', 'done'];
const ADD_FORM_URL = './add_task/form_task.html';
const AUTO_REFRESH_MS = 8000;

let QUERY = '';
let __refreshTimer = null;
let __isRefreshing = false;
let __isDraggingCard = false;
let __suppressClicksUntil = 0;
let __lastDown = { x: 0, y: 0, t: 0 };
let __refreshReq = 0;

document.addEventListener('DOMContentLoaded', init);

function init() {
  installDragClickGuards();
  document.getElementById('board-root').innerHTML = boardShell();
  bindAddButtons();
  bindFind();
  bootData();
}

function bindAddButtons() {
  document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', openAddTask));
  document.getElementById('bt-add-task')?.addEventListener('click', openAddTask);
}

function bindFind() {
  document.getElementById('input-find-task')?.addEventListener('input', (e) => {
    QUERY = e.target.value.trim().toLowerCase();
    renderBoard(getTasks() ?? []);
  });
}

async function bootData() {
  if (typeof initializeDefaultData === 'function') await initializeDefaultData();
  await loadData();
  const users = (typeof getUsers === 'function') ? getUsers() : [];
  if (Array.isArray(users)) window.CONTACTS = users;
  setProfileAvatar();
  renderBoard(getTasks() ?? []);
  scheduleRefresh();
  initProfileMenuAndLogout();
  rebindAddTaskGuards();
}

function scheduleRefresh() {
  if (AUTO_REFRESH_MS > 0) __refreshTimer = setInterval(refreshBoard, AUTO_REFRESH_MS);
  window.addEventListener('focus', () => requestRefresh(50));
  window.addEventListener('storage', () => requestRefresh(100));
  window.addEventListener('tasks:changed', () => requestRefresh(0));
}

async function refreshBoard() {
  if (__isRefreshing) return;
  if (performance.now() < __suppressRefreshUntil) return; // <-- skip refresh immediately after drop
  __isRefreshing = true;
  try {
    await loadData();
    renderBoard(getTasks() ?? []);
  } finally {
    __isRefreshing = false;
  }
}


function requestRefresh(delay = 0) {
  const req = ++__refreshReq;
  setTimeout(() => { if (req === __refreshReq) refreshBoard(); }, delay);
}

function renderBoard(tasks) {
  COLS.forEach(id => { const c = document.getElementById(id); if (c) c.innerHTML = ''; });
  const safe = Array.isArray(tasks) ? tasks : [];
  const filtered = safe
    .filter(t => t && typeof t === 'object' && COLS.includes(t.status))
    .filter(t => !QUERY || (`${t.title ?? ''} ${t.description ?? ''}`).toLowerCase().includes(QUERY));
  filtered.forEach(t => document.getElementById(t.status)?.insertAdjacentHTML('beforeend', cardTemplate(t)));
  addPlaceholdersIfEmpty();
  enableDragAndDrop();
  bindCardOpenerOnce();
  cardTemplate(task);
}

function addPlaceholdersIfEmpty() {
  const txt = { todo: 'No tasks To do', inprogress: 'No tasks In progress', review: 'No tasks Await feedback', done: 'No tasks Done' };
  COLS.forEach(id => {
    const col = document.getElementById(id);
    if (col && col.children.length === 0) col.innerHTML = `<div class="placeholder">${txt[id]}</div>`;
  });
}

function installDragClickGuards() {
  document.addEventListener('pointerdown', (e) => {
    const card = e.target.closest?.('.board-card'); if (!card) return;
    __lastDown = { x: e.clientX ?? 0, y: e.clientY ?? 0, t: performance.now() };
  }, true);
  document.addEventListener('dragstart', (e) => {
    if (!e.target.closest?.('.board-card')) return;
    __isDraggingCard = true; __suppressClicksUntil = performance.now() + 400;
  }, true);
  document.addEventListener('dragend', () => { setTimeout(() => { __isDraggingCard = false; }, 0); }, true);
  document.addEventListener('click', (e) => {
    const card = e.target.closest?.('.board-card'); if (!card) return;
    const moved = Math.hypot((e.clientX ?? 0) - __lastDown.x, (e.clientY ?? 0) - __lastDown.y) > 5;
    const tooSoon = performance.now() < __suppressClicksUntil;
    if (__isDraggingCard || moved || tooSoon) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
}

function enableDragAndDrop() {
  document.querySelectorAll('.board-card').forEach(card => {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.id);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('is-dragging');
      __isDraggingCard = true; __suppressClicksUntil = performance.now() + 600;
    });
    card.addEventListener('dragend', () => { card.classList.remove('is-dragging'); setTimeout(() => { __isDraggingCard = false; }, 0); });
  });
  document.querySelectorAll('.columns-content').forEach(col => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; col.classList.add('drop-target'); });
    col.addEventListener('dragleave', () => col.classList.remove('drop-target'));
    col.addEventListener('drop', (e) => handleDrop(e, col));
  });
}

let __suppressRefreshUntil = 0;

function handleDrop(e, col) {
  e.preventDefault();
  col.classList.remove('drop-target');

  const cardId = e.dataTransfer.getData('text/plain');
  const card = document.getElementById(cardId);
  if (!card) return;

  col.appendChild(card);

  const id = cardId.replace('card', '');
  const tasks = getTasks() || [];
  const task = tasks.find(t => String(t.id) === id);
  if (task) {
    task.status = col.dataset.status;
    saveTasks(tasks); 
  }

  // suppress automatic refresh for 1s
  __suppressRefreshUntil = performance.now() + 1000;

  window.dispatchEvent(new CustomEvent('tasks:changed'));
}

function bindCardOpenerOnce() {
  if (document.__boardCardOpenerBound) return;
  document.__boardCardOpenerBound = true;
  document.addEventListener('click', (e) => {
    const card = e.target.closest?.('.board-card'); if (!card) return;
    const moved = Math.hypot((e.clientX ?? 0) - __lastDown.x, (e.clientY ?? 0) - __lastDown.y) > 5;
    const tooSoon = performance.now() < __suppressClicksUntil;
    if (__isDraggingCard || moved || tooSoon) return;
    const id = card.id.replace('card', ''); const tasks = getTasks?.() || [];
    const task = tasks.find(t => String(t.id) === id); if (!task) return;
    window.openEditOverlay?.();
  });
}

export function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function initProfileMenuAndLogout() {
  const profilImg = document.querySelector('.profil');
  const navbar = document.getElementById('navbar');
  if (profilImg && navbar) {
    profilImg.addEventListener('click', (e) => { e.stopPropagation(); navbar.classList.toggle('open'); });
    navbar.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => navbar.classList.remove('open'));
  }
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) logoutLink.addEventListener('click', onLogoutClick);
}

function onLogoutClick(e) {
  e.preventDefault();
  try { sessionStorage.removeItem('currentUserId'); sessionStorage.removeItem('currentUserEmail'); } catch {}
  window.location.href = 'index.html';
}

async function setProfileAvatar() {
  const users = window.CONTACTS || [];
  const userId = sessionStorage.getItem('currentUserId');
  const user = users.find(u => u.id === userId) || users.find(u => u.email && u.email === sessionStorage.getItem('currentUserEmail'));
  let el = document.getElementById('profile-avatar') || document.querySelector('.profil');
  if (!el || !user) return;
  el.style.filter = 'none';
  const avatar = user.avatar && String(user.avatar);
  if (await trySvg(el, avatar, user)) return;
  if (tryImg(el, avatar, user)) return;
  fallbackBadge(el, user);
}

async function trySvg(el, avatar, user) {
  try {
    if (!(avatar && avatar.endsWith('.svg'))) return false;
    const res = await fetch(avatar); if (!res.ok) throw 0;
    const svgText = await res.text();
    el.outerHTML = `<div id="${el.id || 'profile-avatar'}" class="${el.className}">${svgText}</div>`;
    const wrapper = document.getElementById(el.id || 'profile-avatar') || document.querySelector('.profil');
    const svg = wrapper?.querySelector('svg'); if (!svg) return true;
    svg.setAttribute('width', '50'); svg.setAttribute('height', '50');
    svg.style.display = 'block'; svg.style.borderRadius = '50%'; return true;
  } catch { return false; }
}

function tryImg(el, avatar, user) {
  if (!avatar) return false;
  const alt = user.name || user.email || 'profile avatar';
  if (el.tagName.toLowerCase() === 'img') el.src = avatar, el.alt = alt;
  else el.innerHTML = `<img class="avatar-img" src="${avatar}" alt="${alt}" loading="lazy">`;
  return true;
}

function fallbackBadge(el, user) {
  const name = user.name || user.email || 'User';
  const initials = (name.split(/\s+/).map(p => p[0]).join('').slice(0, 2) || '?').toUpperCase();
  const badge = `<div class="avatar" title="${name}" style="background:#FF8A00;color:#fff;">${initials}</div>`;
  if (el.tagName.toLowerCase() === 'img') el.outerHTML = `<div id="${el.id || 'profile-avatar'}" class="${el.className}">${badge}</div>`;
  else el.innerHTML = badge;
}

function rebindAddTaskGuards() {
  const guard = () => !!window.__addTaskOpen;
  const wrapDoc = (type, name) => {
    const fn = window[name]; if (typeof fn !== 'function') return;
    try { document.removeEventListener(type, fn); } catch {}
    const wrapped = function(ev){ if (!guard()) return; try { return fn.call(this, ev); } catch {} };
    document.addEventListener(type, wrapped); window[name] = wrapped;
  };
  ['closeAssignedInputOutclick','renderCategoryDropdown','toggleSubtaskFocus','handleAssignedSearch','showSubtaskIcons','handleSubtaskOutput','handleSubtaskDelete','handleIcons','clearAll']
    .forEach(n => wrapDoc(n === 'handleAssignedSearch' ? 'input' : (n === 'showSubtaskIcons' ? 'keyup' : 'click'), n));
}

function ensureGlobalToast() {
  let t = document.getElementById('task-added-info');
  if (!t) {
    t = document.createElement('div');
    t.id = 'task-added-info';
    t.className = 'task-added';
    t.style.visibility = 'hidden';
    t.style.opacity = '0';
    document.body.appendChild(t);
  }
}

function patchAddedTaskTransition() {
  const orig = window.addedTaskTransition;
  if (typeof orig !== 'function' || orig.__patched) return;
  function patched(e){ ensureGlobalToast(); return orig.call(this, e); }
  patched.__patched = true; window.addedTaskTransition = patched;
}

function wireDirectCreateButton(root) {
  const btn = root.querySelector('#add-task-button'); if (!btn) return;
  btn.addEventListener('click', (ev) => {
    ev.preventDefault(); ev.stopPropagation();
    if (typeof window.TaskTransitionRequirement === 'function') {
      window.TaskTransitionRequirement({ target: btn, preventDefault(){}, stopPropagation(){} });
    }
  });
}

async function openAddTask() {
  window.__addTaskOpen = true;
  const bg = document.getElementById('task-overlay-background');
  const panel = document.getElementById('task-overlay');
  const mount = document.getElementById('task-form-container');
  if (!bg || !panel || !mount) return;
  prepareOverlay(bg, panel, mount);
  try {
    const html = await fetchHtml(ADD_FORM_URL);
    mount.replaceChildren(htmlToFragment(html));
    ensureGlobalToast(); patchAddedTaskTransition();
    mount.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    wireDirectCreateButton(mount);
    bindOverlayClose(bg);
  } catch { mount.innerHTML = '<div class="overlay-error">Formular konnte nicht geladen werden.</div>'; }
  rebindAddTaskGuards();
}

function prepareOverlay(bg, panel, mount) {
  mount.innerHTML = '';
  panel.style.display = 'block';
  bg.classList.add('is-open');
  document.body.classList.add('no-scroll');
}

async function fetchHtml(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error('fetch failed');
  return await res.text();
}

function htmlToFragment(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content;
}

function bindOverlayClose(bg) {
  document.getElementById('addTask-close-Img')?.addEventListener('click', closeAddTask, { once: true });
  const onBgClick = (e) => { if (e.target === bg) closeAddTask(); };
  bg.addEventListener('click', onBgClick, { once: true });
  const onEsc = (e) => { if (e.key === 'Escape') { closeAddTask(); document.removeEventListener('keydown', onEsc); } };
  document.addEventListener('keydown', onEsc);
}

function closeAddTask() {
  window.__addTaskOpen = false;
  const bg = document.getElementById('task-overlay-background');
  const panel = document.getElementById('task-overlay');
  const mount = document.getElementById('task-form-container');
  if (!bg || !panel || !mount) return;
  bg.classList.remove('is-open');
  panel.style.display = 'none';
  mount.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

window.openAddTask = openAddTask;
