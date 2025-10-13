import { loadData, getUsers, getLoggedInUser, saveData, getTasks } from '../db.js';

const SELF_HEAL_LOGIN_FLAG = false;
const MOBILE_GATEWAY_AUTO_MS = 2500;

document.addEventListener('DOMContentLoaded', initSummary);

async function initSummary() {
  await loadData();

  let user = resolveUserFromSessionOrDb();

  if (SELF_HEAL_LOGIN_FLAG && user && user.id !== 0) {
    await syncLoginFlag(user.id);
    await loadData();
    user = resolveUserFromSessionOrDb();
  }

  setProfileBadge(user);
  setGreetingSafe(user);

  removeNextDeadlineUI();     
  renderSummaryTaskStatus();  

  setupMobileGatewayAuto();
  initProfileMenuAndLogout();
}

/* ---------------- User-Resolve ---------------- */

function resolveUserFromSessionOrDb() {
  const users = getUsers() || [];

  const sid =
    sessionStorage.getItem('currentUserId') ||
    localStorage.getItem('currentUserId') ||
    null;

  if (sid != null) {
    const u = users.find(x => String(x.id) === String(sid));
    if (u) return u;
  }

  const semail =
    sessionStorage.getItem('currentUserEmail') ||
    localStorage.getItem('currentUserEmail') ||
    null;

  if (semail) {
    const needle = String(semail).trim().toLowerCase();
    const u = users.find(x => (x.email || '').trim().toLowerCase() === needle);
    if (u) return u;
  }

  const flagUser = users.find(x => x && x.login === 1);
  if (flagUser) return flagUser;
  return { id: 0, name: 'Gast', badge: '/assets/profilebadge/guest.svg' };
}

async function syncLoginFlag(correctUserId) {
  const users = getUsers() || [];
  await Promise.all(
    users.map(u => saveData('users', { ...u, login: Number(u.id) === Number(correctUserId) ? 1 : 0 }))
  );
}

/* ---------------- Badge & Greeting ---------------- */

function setProfileBadge(user) {
  const img = document.querySelector('img.profil');
  if (!img) return;
  const src = (user.badge || '').startsWith('./')
    ? user.badge.replace('./', '/')
    : (user.badge || '/assets/profilebadge/guest.svg');
  img.src = src;
  img.alt = `${user.name || 'Gast'} Badge`;
}

function setGreetingSafe(user) {
  const name = user.name || 'Gast';
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good day';

  const prefEl = document.getElementById('greeting-prefix');
  const nameEl = document.getElementById('greeting-name');
  if (prefEl && nameEl) {
    prefEl.textContent = greeting + ',';
    nameEl.textContent = name + '!';
  } else {
    const whole = document.getElementById('greeting');
    if (whole) {
      whole.innerHTML = `${greeting}, <span class="highlight-name">${escapeHtml(name)}</span>!`;
    }
  }

  const mp = document.getElementById('mg-greeting-prefix');
  const mn = document.getElementById('mg-greeting-name');
  if (mp && mn) { mp.textContent = greeting + ','; mn.textContent = (user.name || 'guest') + '!'; }
}

function setupMobileGatewayAuto() {
  const mq = window.matchMedia('(max-width: 1100px)');
  const gateway = document.getElementById('mobile-gateway');
  let timer = null;

  const showGateway = () => {
    document.body.classList.add('mobile-gateway');
    gateway?.removeAttribute('hidden');
    gateway?.removeAttribute('aria-hidden');

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      document.body.classList.remove('mobile-gateway');
      gateway?.setAttribute('hidden', '');
      gateway?.setAttribute('aria-hidden', 'true');
    }, MOBILE_GATEWAY_AUTO_MS);
  };

  const hideGateway = () => {
    if (timer) clearTimeout(timer);
    document.body.classList.remove('mobile-gateway');
    gateway?.setAttribute('hidden', '');
    gateway?.setAttribute('aria-hidden', 'true');
  };

  const apply = () => {
    if (mq.matches) showGateway();
    else hideGateway();
  };

  apply();
  mq.addEventListener('change', () => { apply(); });
}

/* ---------------- Summary – Next Deadline ---------------- */


function removeNextDeadlineUI() {
  const box = document.querySelector('.summary-task-status');
  if (box) box.innerHTML = '';
  ['next-task-title', 'next-task-date', 'next-task-status', 'next-task-empty'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}


function getTaskDateRaw(t) {
  return t?.enddate ?? t?.end_date ?? t?.dueDate ?? t?.due ?? null;
}

function getNextDeadlineTask() {
  const tasks = getTasks() || [];
  const today = new Date().setHours(0, 0, 0, 0);

  const withDates = tasks
    .map(t => ({ t, d: new Date(getTaskDateRaw(t)) }))
    .filter(x => x.d instanceof Date && !isNaN(x.d))
    .filter(x => x.d.setHours(0,0,0,0) >= today)
    .sort((a, b) => a.d - b.d);

  console.log('[summary] tasks total:', tasks.length, 'with future dates:', withDates.length);
  return withDates.length ? withDates[0].t : null;
}

function fmtDate(d) {
  const x = new Date(d);
  if (isNaN(x)) return '';
  return x.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


function getOrCreateSummaryStatusHost() {
  let host = document.querySelector('.summary-task-status');
  if (host) return host;


  const container =
    document.querySelector('.task') ||
    document.querySelector('.summary-content') ||
    document.body;

  host = document.createElement('div');
  host.className = 'summary-task-status';
  container.prepend(host);
  console.warn('[summary] .summary-task-status fehlte – neu erstellt.');
  return host;
}


function renderSummaryTaskStatus() {
  const host = getOrCreateSummaryStatusHost();

  const t = getNextDeadlineTask();
  if (!t) {
    host.removeAttribute('onclick');
    host.removeAttribute('role');
    host.removeAttribute('tabindex');
    host.innerHTML = `
      <div class="status-left">
        <div class="icon-summary"><img src="./assets/pencil2.svg" alt="Urgent"></div>
        <div class="number-urgent-container"><div class="number">0</div><span class="label">Keine Deadline</span></div>
      </div>
      <img class="vector" src="./assets/Vector%205.png" alt="" aria-hidden="true">
      <div class="info-date"><span class="date">—</span><span class="info">Keine anstehende Aufgabe</span></div>
    `;
    console.log('[summary] keine nächste Deadline gefunden.');
    return;
  }

  const dateRaw = getTaskDateRaw(t);
  host.setAttribute('role', 'button');
  host.setAttribute('tabindex', '0');
  host.setAttribute('onclick', "navigateTo('./board.html')");
  host.innerHTML = `
    <div class="status-left">
      <div class="icon-summary"><img src="./assets/pencil2.svg" alt="Urgent"></div>
      <div class="number-urgent-container"><div class="number">1</div><span class="label">Urgent</span></div>
    </div>
    <img class="vector" src="./assets/Vector%205.png" alt="" aria-hidden="true">
    <div class="info-date"><span class="date">${fmtDate(dateRaw)}</span><span class="info">${escapeHtml(t.title || 'Nächste Aufgabe')}</span></div>
  `;
  console.log('[summary] nächste Deadline:', dateRaw, 'title:', t.title);
}


function initProfileMenuAndLogout() {
  const profilImg = document.querySelector('.profil');
  const navbar = document.getElementById('navbar');

  if (profilImg && navbar) {
    profilImg.addEventListener('click', (e) => {
      e.stopPropagation();
      navbar.style.display = (navbar.style.display === 'block') ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!profilImg.contains(e.target) && !navbar.contains(e.target)) {
        navbar.style.display = 'none';
      }
    });
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

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
