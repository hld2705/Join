// db.js
import { join } from './firstdata.js';

const BASE_URL = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app/';

let users = [];
let tasks = [];
let loggedInUser = null;

/**
 * Lädt Benutzer- und Taskdaten aus Firebase.
 * Setzt eingeloggten Benutzer.
 */
export async function loadData() {
  try {
    const usersRes = await fetch(`${BASE_URL}/users.json`);
    const usersJson = await usersRes.json();
    users = usersJson ? Object.values(usersJson) : [];

    const tasksRes = await fetch(`${BASE_URL}/tasks.json`);
    const tasksJson = await tasksRes.json();
    tasks = tasksJson ? Object.values(tasksJson) : [];

    loggedInUser = users.find(u => u.login === 1);
    console.log('✅ Eingeloggter Benutzer:', loggedInUser);
  } catch (error) {
    console.error('❌ Fehler beim Laden der Daten:', error);
  }
}

/**
 * Speichert einen Datensatz an einem bestimmten Pfad.
 */
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

/**
 * Initialisiert Daten, falls keine vorhanden sind.
 */
export async function initializeDefaultData() {
  await loadData();

  if (!users || users.length === 0) {
    console.log('🆕 Keine Benutzer gefunden – Standardbenutzer wird geladen...');
    for (const user of join.users) {
      await saveData('users', user);
    }
  }

  if (!tasks || tasks.length === 0) {
    console.log('🆕 Keine Aufgaben gefunden – Standardtasks werden geladen...');
    for (const task of join.tasks) {
      await saveData('tasks', task);
    }
  }

  await loadData(); // Daten nach Initialisierung neu laden
}

/**
 * Getter für Benutzerliste
 */
export function getUsers() {
  return users;
}

/**
 * Getter für Taskliste
 */
export function getTasks() {
  return tasks;
}

/**
 * Gibt aktuell eingeloggten Benutzer zurück
 */
export function getLoggedInUser() {
  return loggedInUser;
}

/**
 * Wird beim Laden der Seite aufgerufen
 */
window.onload = async () => {
  await initializeDefaultData();
  console.log('✅ Daten wurden geladen und/oder initialisiert.');
};


