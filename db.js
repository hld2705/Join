import { join } from './firstdata.js';

const BASE_URL = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app/';

let users = [];
let tasks = [];
let loggedInUser = null;

function normalizeId(x){ return String(x); }
async function putUser(u) {
  const res = await fetch(`${BASE_URL}/users/${u.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(u),
  });
  if (!res.ok) throw new Error('Fehler beim Speichern');
  return res.json();
}

export async function loadData() {
  try {
    const usersRes = await fetch(`${BASE_URL}/users.json`);
    const usersJson = await usersRes.json();
    users = usersJson ? Object.values(usersJson) : [];

    const tasksRes = await fetch(`${BASE_URL}/tasks.json`);
    const tasksJson = await tasksRes.json();
    tasks = tasksJson ? Object.values(tasksJson) : [];

  } catch (error) {
    console.error('❌ Fehler beim Laden der Daten:', error);
  }
}

export async function saveData(path = '', data = null) {
  if (!data || !path) return;
  try {
    const res = await fetch(`${BASE_URL}/${path}/${data.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error);
  }
}

export async function initializeDefaultData() {
  await loadData();

  if (!users || users.length === 0) {
    for (const user of join.users) await saveData('users', user);
  }
  if (!tasks || tasks.length === 0) {
    for (const task of join.tasks) await saveData('tasks', task);
  }
  await loadData();
}

// Restore seed tasks that are missing or were deleted. Does not remove existing ones.
export async function restoreSeedTasks() {
  try {
    const existing = Array.isArray(tasks) ? tasks : [];
    const byId = new Set(existing.map(t => String(t?.id)));
    for (const task of join.tasks) {
      if (!byId.has(String(task.id))) {
        await saveData('tasks', task);
      }
    }
    await loadData();
    return true;
  } catch (e) {
    console.error('❌ Fehler beim Wiederherstellen der Seed-Tasks:', e);
    return false;
  }
}

export function getUsers() { return users; }
export function getTasks() { return tasks; }
export function getLoggedInUser() { return loggedInUser; }

export async function setLoggedInUserFromSession({ selfHeal = true } = {}) {
  const sid = (typeof sessionStorage !== 'undefined')
    ? sessionStorage.getItem('currentUserId')
    : null;

  if (sid != null) {
    const u = users.find(x => normalizeId(x.id) === normalizeId(sid)) || null;
    if (u) {
      loggedInUser = u;

      if (selfHeal) {
        const needsFix = !users.some(x => x.login === 1 && normalizeId(x.id) === normalizeId(sid));
        if (needsFix) {
          await Promise.all(users.map(x => {
            const next = { ...x, login: normalizeId(x.id) === normalizeId(sid) ? 1 : 0 };
            return putUser(next);
          }));
          await loadData();
          loggedInUser = users.find(x => normalizeId(x.id) === normalizeId(sid)) || u;
        }
      }

      return loggedInUser;
    }
  }

  loggedInUser = users.find(u => u.login === 1) || null;

  return loggedInUser;
}

export async function setCurrentUser(userId, { persistLoginFlag = true } = {}) {
  try { sessionStorage.setItem('currentUserId', String(userId)); } catch {}
  if (persistLoginFlag) {
    await Promise.all(users.map(u => {
      const next = { ...u, login: Number(u.id) === Number(userId) ? 1 : 0 };
      return putUser(next);
    }));
    await loadData();
  }
  loggedInUser = users.find(u => normalizeId(u.id) === normalizeId(userId)) || null;
  return loggedInUser;
}

document.addEventListener('DOMContentLoaded', async () => {
  await initializeDefaultData();
  await setLoggedInUserFromSession({ selfHeal: true });
});



