import { getTasks, getLoggedInUser, loadData } from '../db.js';

document.addEventListener("DOMContentLoaded", async () => {
  await loadData(); // Daten aus Firebase laden

  const user = getLoggedInUser() || { name: 'Gast', id: 0, badge: './assets/default-badge.svg' };

  // Profil-Badge setzen
  const badgeImg = document.querySelector('img.profil');
  if (badgeImg) {
    badgeImg.src = user.badge.startsWith('./') 
      ? user.badge.replace('./', '/') // ./assets/... → /assets/...
      : user.badge;
    badgeImg.alt = `${user.name} Badge`;
  }

  // Begrüßung anzeigen
  document.getElementById("greeting").innerHTML = createGreeting(user.name);

  // Deadline-Aufgaben anzeigen
  await displayTasksUntilNextDeadline(user.id);

  // Logout-Menü initialisieren
  openLogOutMenu();
});


function createGreeting(name) {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good day";
  return `${greeting}, <span class="highlight-name">${name}</span>!`;
}

async function displayTasksUntilNextDeadline(userId) {
  const tasks = getTasks();
  console.log("Geladene Tasks:", tasks);

  const today = new Date();

  const upcomingTasks = tasks
    .filter(task => {
      const assignedId = task.assigned?.id;
      const end = new Date(task.enddate);
      const isValidDate = !isNaN(end);
      const isFuture = end >= today;
      const isForUser = assignedId === userId;

      console.log(`🔍 Task "${task.title}" → assignedId: ${assignedId}, isValidDate: ${isValidDate}, isFuture: ${isFuture}, isForUser: ${isForUser}`);
      
      return isValidDate && isFuture && isForUser;
    })
    .sort((a, b) => new Date(a.enddate) - new Date(b.enddate));

  console.log("✅ Gefilterte Deadlines:", upcomingTasks);

  const taskElement = document.querySelector('.task');
  if (!taskElement) {
    console.warn("⚠️ Kein .task-Container im HTML gefunden!");
    return;
  }

  if (upcomingTasks.length === 0) {
    taskElement.innerHTML = "<p>Keine anstehenden Aufgaben.</p>";
    return;
  }

  const next = upcomingTasks[0];
  taskElement.innerHTML = `
    <div class="task-item">
      <h4>${next.title}</h4>
      <p>Deadline: ${next.enddate}</p>
      <p>Status: ${next.status}</p>
    </div>
  `;
}

 const profilImg = document.querySelector('.profil');
  const navbar = document.getElementById('navbar');

  profilImg.addEventListener('click', () => {
    navbar.style.display = (navbar.style.display === 'block') ? 'none' : 'block';
  });

  // Klick außerhalb schließt die Navbar
  document.addEventListener('click', (e) => {
    if (!profilImg.contains(e.target) && !navbar.contains(e.target)) {
      navbar.style.display = 'none';
    }
  });

  document.getElementById('logout-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = "index.html";
});
