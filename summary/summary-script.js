
const firebaseConfig = {
  apiKey: "AIzaSyDaAKocqkIROo_InISQbRjsoG8z1JCK3g0",
  authDomain: "join-gruppenarbeit-75ecf.firebaseapp.com",
  databaseURL: "https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-gruppenarbeit-75ecf",
  storageBucket: "join-gruppenarbeit-75ecf.appspot.com",
  messagingSenderId: "180158531840",
  appId: "1:180158531840c894124a7d6eb515364be5",
  measurementId: "G-5R563MH52P"
};

firebase.initializeApp(firebaseConfig);

const FIREBASE_USERS = firebase.database().ref("users");
const FIREBASE_TASK = firebase.database().ref("tasks");

/**
 * Loads all tasks and renders the amount of completed tasks
 * into the summary Done card.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getDoneTasks() {
  await loadData();

  const doneTasks = tasks.filter(task => task.status === "done");
  const doneCard = document.getElementById("summary-done");
  if (!doneCard) return;

  doneCard.innerHTML = doneTasksTemplate(doneTasks.length);
}

/**
 * Loads all tasks and renders the amount of urgent tasks
 * into the summary urgent section.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getUrgent() {
  await loadData();
  const Urgent = tasks.filter(urgent => urgent.priority === "urgent");
  let SummaryCard = document.getElementById("deadline-container");
  SummaryCard.innerHTML = `
           <img src="./assets/urgent-icon.png">
                <div class="done-text-container">
                  <h1 class="task-count">${Urgent.length}</h1>
                  <span>Urgent</span>
                </div>
               `
}


/**
 * Determines the next upcoming task deadline and renders it
 * in the summary view.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getEndDate() {
  await loadData();
  const next = getNextUpcomingDeadline(tasks);
  if (!next) return;
  renderNextDeadline(next.enddate);
}

/**
 * Finds the task with the nearest future end date.
 *
 * @param {Array<Object>} tasks
 * @returns {Object|null} Task with the closest upcoming deadline
 */
function getNextUpcomingDeadline(tasks) {
  if (!Array.isArray(tasks)) return null;
  const now = Date.now();
  let nextTask = null;
  for (let task of tasks) {
    if (!task.enddate) continue;
    const time = Date.parse(task.enddate);
    if (isNaN(time) || time < now) continue;
    if (!nextTask || time < Date.parse(nextTask.enddate)) {
      nextTask = task;
    }
  }
  return nextTask;
}

function guestLogIn() {
  const fullNav = document.getElementById("togglednone");
  const loginNav = document.getElementById("loginnav");
  const isNonLogin = window.location.search.includes("nonlogin=true");

  if (fullNav) fullNav.style.display = isNonLogin ? "none" : "flex";

  if (loginNav) {
    loginNav.style.display = isNonLogin ? "flex" : "none";
    loginNav.style.cursor = "default";
  }
}

function renderNextDeadline(dateString) {
  const el = document.getElementById("enddate");
  if (!el) return;
  const formatted = new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  el.innerHTML = `
    <h1 class="urgent-date-text">${formatted}</h1>
    <span>Upcoming deadline</span>
  `;
}

/**
 * Loads all tasks and renders the total number of tasks
 * currently available in the board.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getTasksInBoard() {
  await loadData();
  const total = Array.isArray(tasks) ? tasks.length : 0;
  let boardCard = document.getElementById('current-board-tasks');
  boardCard.innerHTML = `
  <div class="overview-box-wrapper" >
  <h1 class="task-count">${total}</h1>
  <span>Tasks in <br>Board</span>
  </div>`
}

/**
 * Loads all tasks and renders the number of tasks
 * currently in progress.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getTasksInProgress() {
  await loadData();
  const inProgress = tasks.filter(progress => progress.status === "inprogress");
  let ProgressCard = document.getElementById('progress-board-tasks');
  ProgressCard.innerHTML = `
  <div class="overview-box-wrapper" >
  <h1 class="task-count">${inProgress.length}</h1>
  <span>Tasks in <br>Progress</span>
  </div>`
}

/**
 * Loads all tasks and renders the number of tasks
 * awaiting feedback.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getFeedbackTasks() {
  await loadData();
  const feedback = tasks.filter(f => f.status === "review");
  let feedbackCard = document.getElementById('feedback-board-tasks');
  feedbackCard.innerHTML = `
  <div class="overview-box-wrapper" >
  <h1 class="task-count">${feedback.length}</h1>
  <span>Awaiting<br>Feedback</span>
  </div>`
}

function redirectToBoard() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");
  if (!uid) {
    window.location.href = "/board.html?nonlogin=true";
    return;
  }else{
    window.location.href = "/board.html?uid=" + uid;
  }
}

function getGreetingByTime() {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return "Good morning";
  if (hours >= 12 && hours < 18) return "Good afternoon";
  if (hours >= 18 && hours < 22) return "Good evening";
  return "Good night";
}

/**
 * Updates the greeting text depending on time of day
 * and logged-in or guest user state.
 *
 * @async
 * @returns {Promise<void>}
 */
async function updateGreeting() {
  const greeting = document.querySelector(".greeting span:first-child");
  const userSpan = document.querySelector(".logged-user");
  if (!greeting || !userSpan) return;
  const text = getGreetingByTime();
  const uid = new URLSearchParams(location.search).get("uid");
  const isGuest = location.search.includes("nonlogin=true") || sessionStorage.getItem("guest") === "true";
  if (isGuest) return setGreeting(greeting, userSpan, text, "Guest");
  if (!uid) return hideGreeting(greeting, userSpan, "Not logged in");
  const snap = await FIREBASE_USERS.child(uid).once("value");
  const user = snap.val();
  if (!user?.name) return hideGreeting(greeting, userSpan, "Unknown user");
  setGreeting(greeting, userSpan, text, user.name);
}

function setGreeting(greeting, userSpan, text, name) {
  greeting.textContent = `${text},`;
  userSpan.textContent = name;
  userSpan.style.display = "inline";
}

function hideGreeting(greeting, userSpan, text) {
  greeting.textContent = text;
  userSpan.style.display = "none";
}

/**
 * Fetches the currently logged-in user from Firebase
 * based on the URL parameter.
 *
 * @async
 * @returns {Promise<Object|null>}
 */
async function getLoggedInUser() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");
  if (!uid) return null;
  const snapshot = await FIREBASE_USERS.child(uid).once("value");
  return snapshot.val();
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  getToDo();
  getDoneTasks();
  getUrgent();
  getEndDate();
  getTasksInBoard();
  getTasksInProgress();
  getFeedbackTasks();
});

window.addEventListener("DOMContentLoaded", async () => {
  document.body.style.opacity = "1";
  await updateGreeting();
  const content = document.getElementById("summary_content");
  const userSpan = document.querySelector(".logged-user");
  const user = await getLoggedInUser();
  if (user?.name) userSpan.textContent = user.name;
  if (window.innerWidth >= 900) return;
  showWelcome(content, user, userSpan);
});

function showWelcome(content, user) {
  const showGuest = sessionStorage.getItem("guestWelcome");
  const showUser = sessionStorage.getItem("userWelcome");
  if (!showGuest && !showUser) return;
  const greeting = getGreetingByTime();
  const name = user?.name || "Guest";
  content.innerHTML = welcomeTemplate(greeting, name);
  setTimeout(() => {
    sessionStorage.removeItem("guestWelcome");
    sessionStorage.removeItem("userWelcome");
    location.reload();
  }, 1500);
}
