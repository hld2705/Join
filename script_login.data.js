const BASE_URL = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app';
const SUMMARY_URL = '/summary.html'; 

const $ = (s) => document.querySelector(s);
const norm = (s) => (s || '').trim().toLowerCase();

async function fetchJson(url, opt) {
  const r = await fetch(url, opt);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
async function fetchUsers() {
  const data = await fetchJson(`${BASE_URL}/users.json`);
  return Object.values(data || []);
}
async function putUser(u) {
  await fetchJson(`${BASE_URL}/users/${u.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(u),
  });
}
async function setLoginFlagsFor(userId) {
  const users = await fetchUsers();
  await Promise.all(
    users.map(u => putUser({ ...u, login: Number(u.id) === Number(userId) ? 1 : 0 }))
  );
}

function showError(msg) {
  alert(msg);
}

async function credentialLogin() {
  const email = norm($('#email')?.value);
  const password = $('#password')?.value || '';
  if (!email || !password) {
    showError('Bitte E-Mail & Passwort eingeben.');
    return;
  }

  const users = await fetchUsers();
  const user = users.find(u => norm(u.email) === email);
  if (!user) { showError('E-Mail nicht gefunden.'); return; }
  if (user.password !== password) { showError('Falsches Passwort.'); return; }

  try {
    sessionStorage.setItem('currentUserId', String(user.id));
    sessionStorage.setItem('currentUserEmail', user.email || '');
  } catch {}

  await setLoginFlagsFor(user.id);

  window.location.href = SUMMARY_URL;
}

async function guestLogin() {
  const guestId = 0;

  try {
    sessionStorage.setItem('currentUserId', String(guestId));
    sessionStorage.setItem('currentUserEmail', '');
  } catch {}
  await setLoginFlagsFor(guestId);

  window.location.href = SUMMARY_URL;
}

window.loginUserPushedInfo = async function () {
  try {
    await credentialLogin();
  } catch (e) {
    console.error('[loginUserPushedInfo] error:', e);
    showError('Login fehlgeschlagen. Bitte erneut versuchen.');
  }
};

function attachHandlers() {
  const loginBtn = document.querySelector('.buttonlogin');
  const loginAnchor = loginBtn?.closest('a');
  const guestBtn = document.querySelector('.buttonguestlogin');
  const guestAnchor = guestBtn?.closest('a');

  if (loginAnchor) {
    loginAnchor.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      credentialLogin().catch(err => {
        console.error('[credentialLogin] error:', err);
        showError('Login fehlgeschlagen. Bitte erneut versuchen.');
      });
    });
  } else if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      credentialLogin().catch(err => {
        console.error('[credentialLogin] error:', err);
        showError('Login fehlgeschlagen. Bitte erneut versuchen.');
      });
    });
  }

  if (guestAnchor) {
    guestAnchor.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      guestLogin().catch(err => {
        console.error('[guestLogin] error:', err);
        showError('Gast-Login fehlgeschlagen.');
      });
    });
  } else if (guestBtn) {
    guestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      guestLogin().catch(err => {
        console.error('[guestLogin] error:', err);
        showError('Gast-Login fehlgeschlagen.');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', attachHandlers);

