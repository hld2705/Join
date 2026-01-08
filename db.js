const BASE_URL = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app/';

let users = [];
let tasks = [];
let loggedInUser = null;

async function loadData() {
  const usersRes = await fetch(BASE_URL + '/users.json');
  const tasksRes = await fetch(BASE_URL + '/tasks.json');
  const usersData = await usersRes.json();
  const tasksData = await tasksRes.json();
  if (usersData) {
    for (let key in usersData) {
      users.push({ id: key, ...usersData[key] });
    }
  }
  if (tasksData) {
    for (let key in tasksData) {
      tasks.push({ id: key, ...tasksData[key] });
    }
  }}

async function saveData(type, item) {
  await fetch(BASE_URL + '/' + type + '/' + item.id + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

async function setCurrentUser(userId) {
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    if (user.id === userId) {
      user.login = 1;
      loggedInUser = user;
    } else {
      user.login = 0;
    }
    await saveData('users', user);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
