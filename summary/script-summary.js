import { getTasks, getLoggedInUser, loadData } from '../db.js';

document.addEventListener("DOMContentLoaded", async () => {
  await loadData(); // Daten aus Firebase laden

 const user = getLoggedInUser() || { name: 'Gast', id: 0 }; // Gast bekommt id: 0

  document.getElementById("greeting").innerHTML = createGreeting(user.name);

  await displayTasksUntilNextDeadline(user.id); // Nutzerbezogene Tasks anzeigen
});

/**
 * Erstellt Begrüßung je nach Tageszeit
 */
function createGreeting(name) {
  const hour = new Date().getHours();
  let greeting = "Good evening";

  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good day";

  return `${greeting}, <span class="highlight-name">${name}</span>!`;
}

/**
 * Zeigt Aufgaben mit Frist in der Zukunft, nur für eingeloggten User
 */
async function displayTasksUntilNextDeadline(userId) {
  const tasks = getTasks();
  console.log("Geladene Tasks:", tasks);

  const today = new Date();
  const upcomingTasks = tasks
    .filter(task => new Date(task.enddate) >= today)
    .filter(task => task.assigned?.id === userId) // Nur Tasks für den User
    .sort((a, b) => new Date(a.enddate) - new Date(b.enddate));

  const taskElement = document.querySelector('.task');
  if (!taskElement) {
    console.warn("⚠️ Kein .task-Container im HTML gefunden!");
    return;
  }

  if (upcomingTasks.length === 0) {
    taskElement.innerHTML = "<p>Keine anstehenden Aufgaben.</p>";
    return;
  }

  taskElement.innerHTML = upcomingTasks.map(task => `
    <div class="task-item">
      <h4>${task.title}</h4>
      <p>Deadline: ${task.enddate}</p>
      <p>Status: ${task.status}</p>
    </div>
  `).join('');
}

/**
 *  Initializes the menu behavior.
 */
function openLogOutMenu() {
    let profileBadge = document.getElementById('profile-badge')
    let logOutMenu = document.getElementById('log-out-menu');
    profileBadge.addEventListener("click", () => {
        logOutMenu.innerHTML = loadMenu();
        logOutMenu.classList.toggle("active");
        logout();
    });
    closeLogOutMenu(logOutMenu, profileBadge);
}

/**
 * Sets up the logout process.
 */
function logout() {
    let logOut = document.getElementById('log-out');
    if (logOut) {
        logOut.addEventListener("click", () => {
            localStorage.removeItem('user');
        });  
    }
}

/**
 * Closes the logout menu when clicking outside of the menu
 * @param {HTMLElement} logOutMenu The logout menu element to be closed.
 * @param {HTMLElement} profileBadge The profile badge element used to toggle the menu.
 */
function closeLogOutMenu (logOutMenu, profileBadge) {
    document.addEventListener("click" , function (event) {
        if (!logOutMenu.contains(event.target) && !profileBadge.contains(event.target)) {
            logOutMenu.classList.remove("active");
        }
    })
}