const BASE_URL = 'https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app/';

let users = [];
let tasks = [];
let loggedInUser = null;
let join = { users: [], tasks: [] };


/**
 * Fetches data from Firebase for the given path.
 * @async
 * @param {string} path - Firebase endpoint path
 * @returns {Promise<Object|null>}
 */
async function fetchData(path) {
  const response = await fetch(BASE_URL + path);
  return await response.json();
}

/**
 * Converts Firebase object data into an array with IDs.
 * @param {Object|null} data
 * @returns {Array<Object>}
 */
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

/**
 * Loads users and tasks from Firebase into memory.
 * @async
 * @sets users
 * @sets tasks
 * @warning Must be called after creating users or tasks
 *          to keep local state in sync.
 */
async function loadData() {
  const usersData = await fetchData('/users.json');
  const tasksData = await fetchData('/tasks.json');
  users = createArrayFromData(usersData);
  tasks = createArrayFromData(tasksData);
}

/**
 * Saves a single item to Firebase.
 * @async
 * @param {string} type - Firebase collection name (e.g. "users", "tasks")
 * @param {Object} item - Item to be stored
 * @returns {Promise<void>}
 */
async function saveData(type, item) {
  await fetch(BASE_URL + '/' + type + '/' + item.id + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

/**
 * Sets the currently logged-in user and updates login state in Firebase.
 *
 * @async
 * @param {string} userId
 * @sets loggedInUser
 * @returns {Promise<void>}
 */
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

if (typeof window !== "undefined") {
  window.join = join;
}

