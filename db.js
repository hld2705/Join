const BASE_URL = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app/';

let users = [];
let tasks = [];
let loggedInUser = null;

async function fetchData(path) {
  const response = await fetch(BASE_URL + path);
  return await response.json();
}

function createArrayFromData(data) {
  let result = [];
  if (!data) return result;

  for (let key in data) {
    result.push({
      id: String(key),
      ...data[key]
    });
  }
  return result;
}

async function loadData() {
  const usersData = await fetchData('/users.json');
  const tasksData = await fetchData('/tasks.json');

  users = createArrayFromData(usersData);
  tasks = createArrayFromData(tasksData);
}

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
