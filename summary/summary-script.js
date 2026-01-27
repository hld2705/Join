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
sessionStorage.removeItem("nonlogin", "true");
const FIREBASE_USERS = firebase.database().ref("users");
const FIREBASE_TASK = firebase.database().ref("tasks");

/** Loads done tasks and renders the count into the summary card. */
async function getDoneTasks() {
  await loadData();
  const doneTasks = tasks.filter(task => task.status === "done");
  const doneCard = document.getElementById("summary-done");
  if (!doneCard) return;
  doneCard.innerHTML = doneTasksTemplate(doneTasks.length);
}

/** Loads urgent tasks and renders the urgent summary section. */
async function getUrgent() {
  await loadData();
  const urgentCount = tasks.filter(t => t.priority === "urgent").length;
  renderUrgent(urgentCount);
}

/** Renders the urgent task count. */
function renderUrgent(count) {
  const container = document.getElementById("deadline-container");
  container.innerHTML = urgentTemplate(count);
}

/** Finds and renders the next upcoming task deadline. */
async function getEndDate() {
  await loadData();
  const next = getNextUpcomingDeadline(tasks);
  if (!next) return;
  renderNextDeadline(next.enddate);
}

/** Returns the task with the closest future deadline. */
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

/** Toggles navigation visibility for guest users. */
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

/** Renders the next deadline date. */
function renderNextDeadline(dateString) {
  const el = document.getElementById("enddate");
  if (!el) return;
  const formatted = new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  el.innerHTML = nextDeadlineTemplate(formatted);
}

/** Loads and renders a summary task card. */
async function loadTaskSummary(containerId, filterFn, labelHtml) {
  await loadData();
  const count = filterFn ? tasks.filter(filterFn).length : tasks.length;
  renderSummaryCard(containerId, count, labelHtml);
}

/** Loads total task count. */
function getTasksInBoard() {
  loadTaskSummary('current-board-tasks', null, 'Tasks in <br>Board');
}

/** Loads in-progress task count. */
function getTasksInProgress() {
  loadTaskSummary('progress-board-tasks', t => t.status === 'inprogress', 'Tasks in <br>Progress');
}

/** Loads feedback task count. */
function getFeedbackTasks() {
  loadTaskSummary('feedback-board-tasks', t => t.status === 'review', 'Awaiting<br>Feedback');
}

/** Redirects user to board while keeping login state. */
function redirectToBoard() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");
  if (!uid) {
    window.location.href = "/board.html?nonlogin=true";
    return;
  } else {
    window.location.href = "/board.html?uid=" + uid;
  }
}

/** Returns greeting text based on current time. */
function getGreetingByTime() {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return "Good morning";
  if (hours >= 12 && hours < 18) return "Good afternoon";
  if (hours >= 18 && hours < 22) return "Good evening";
  return "Good night";
}

/** Updates greeting text depending on user state and time. */
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

/** Sets greeting and username text. */
function setGreeting(greeting, userSpan, text, name) {
  greeting.textContent = `${text},`;
  userSpan.textContent = name;
  userSpan.style.display = "inline";
}

/** Hides username and shows fallback greeting. */
function hideGreeting(greeting, userSpan, text) {
  greeting.textContent = text;
  userSpan.style.display = "none";
}

/** Fetches the logged-in user from Firebase. */
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

/** Displays the welcome overlay for guest or user login. */
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
