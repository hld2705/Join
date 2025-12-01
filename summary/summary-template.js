/*--------------------------------------------------------------- */

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
/*--------------------------------------------------------------- */
async function getToDo() {
  await loadData();

  const todoTasks = tasks.filter(todo => todo.status === "todo");
  const ToDoCard = document.getElementById("summary-To-do");

  ToDoCard.innerHTML = `
    <div class="summary-todo">
      <div class="icon-to-do">
        <svg width="34" height="30" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_361727_4286" style="mask-type:alpha"
                maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="34">
            <rect width="34" height="34" fill="#D9D9D9"/>
          </mask>
          <g mask="url(#mask0_361727_4286)">
            <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 
                     8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 
                     17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 
                     2.94167 19.275 3.325L20.675 4.725C21.0583 
                     5.10833 21.2583 5.57083 21.275 6.1125C21.2917 
                     6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 
                     10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z"
                  fill="white"/>
          </g>
        </svg>
      </div>
      <div class="done-text-container">
        <h1 class="task-count">${todoTasks.length}</h1>
        <span>TO-DO</span>
      </div>
    </div>
  `;
}

getToDo()

async function getDoneTasks() {
  await loadData();

  const DoneTasks = tasks.filter(done => done.status === "done");
  const DoneCard = document.getElementById("summary-done");

  DoneCard.innerHTML = `
             <div class="summary-todo">
                  <div class="icon-summary">
                    <svg class="check-icon" width="37" height="30" viewBox="0 0 37 30" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.5 14.566L14.7288 25.6321L33.4434 3.5" stroke="white" stroke-width="7"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
                <div class="done-text-container">
                  <h1 class="task-count">${DoneTasks.length}</h1>
                  <span>Done</span>
                </div>
                `
}

getDoneTasks();


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
                 <div class="vector"></div>`
}

getUrgent()

async function getEndDate() {
  await loadData();

  const next = getNextUpcomingDeadline(tasks);
  if (!next) return;

  renderNextDeadline(next.enddate);
}

function getNextUpcomingDeadline(tasks) {
  if (!Array.isArray(tasks)) return null;
  const now = Date.now();
  let nextTask = null;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task.enddate) continue;
    const timestamp = Date.parse(task.enddate);
    if (isNaN(timestamp)) continue;
    if (timestamp < now) continue;
    if (!nextTask || timestamp < Date.parse(nextTask.enddate)) {
      nextTask = task;
    }
  }

  return nextTask;
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

getEndDate();

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

getTasksInBoard()

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

getTasksInProgress()

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

getFeedbackTasks();


function redirectToBoard() {
  location.assign("../board.html");
}


async function updateGreeting() {
  const greetingSpan = document.querySelector('.greeting span:first-child');
  const userSpan = document.querySelector('.logged-user');
  if (!greetingSpan || !userSpan) return;

  /*-----------------------------------------------------------------*/
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");

  if (!uid) {
    greetingSpan.textContent = "Not logged in";
    userSpan.style.display = "none";
    return;
  }

  const snapshot = await FIREBASE_USERS.child(uid).once("value");
  const userData = snapshot.val();

  if (!userData || !userData.name) {
    greetingSpan.textContent = "Unknown user";
    userSpan.style.display = "none";
    return;
  }
  /*----------------------------------------------------------------- */

  const hours = new Date().getHours();
  let greetingText;

  if (hours >= 5 && hours < 12) greetingText = "Good morning";
  else if (hours >= 12 && hours < 18) greetingText = "Good afternoon";
  else if (hours >= 18 && hours < 22) greetingText = "Good evening";
  else greetingText = "Good night";
  /* Test
    if (!loggedInUser || loggedInUser.name === "Gast") {
      greetingSpan.textContent = `${greetingText}!`;
      userSpan.style.display = "none";
    } else {
      greetingSpan.textContent = `${greetingText},`;
      userSpan.textContent = loggedInUser.name;
      userSpan.style.display = "inline";
    }*/
  greetingSpan.textContent = `${greetingText},`;
  userSpan.textContent = userData.name;
  userSpan.style.display = "inline";
}


window.addEventListener("load", updateGreeting);