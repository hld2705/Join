
const boardTaskFormURL = './add_task/form_task.html';
let originalParent;
let isDragging = false;
//---------------------Drag&Drop------------------------
function dragAndDrop() {
  let container = document.getElementById("template-overview");
  const containers = {
    todo: document.getElementById("todo-container"),
    inprogress: document.getElementById("in-progress-container"),
    review: document.getElementById("feedback-container"),
    done: document.getElementById("done-container")
  };

  for (let key in containers) {
    if (containers[key]) containers[key].innerHTML = "";
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const container = containers[task.status]
    const badges = Array.isArray(task.assignedBadge) ? task.assignedBadge : [];
    if (container) {
      container.innerHTML += dragAndDropTemplate(
        task.id,
        task.title,
        task.main,
        task.description,
        task.subtasks,
        task.assigned,
        task.priority,
        task.enddate
      );
    }
  }

  for (let key in containers) {
    const container = containers[key];
    if (container && container.children.length === 0) {
      container.innerHTML = noCardsTemplate();
    }
  }
}

function renderBadges(assigned) {
  if (!assigned || assigned.length === 0) {
    return [];
  }
  let badges = [];
  for (let i = 0; i < assigned.length; i++) {
    let userId = Number(typeof assigned[i] === "object" ? assigned[i].id : assigned[i]);
    let user = join.users.find(u => u.id === userId);
    if (user) {
      badges.push({
        badge: user.badge,
        name: user.name,
        color: user.color
      });
    }
  }
  return badges;
}

function startDragging(ev, id) {
  ev.dataTransfer.setData("text", `card-${id}`);

  originalParent = document.getElementById(`card-${id}`).parentElement; //
}


function onDragEnd() {
  setTimeout(() => { isDragging = false; }, 50);
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function moveTo(ev, newStatus) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const card = document.getElementById(data);
  const target = ev.currentTarget;
  if (!card || !target) return;
  const oldContainer = card.parentElement;
  target.appendChild(card);
  card.classList.remove("drag-origin");
  updateContainerTemplate(oldContainer);
  updateContainerTemplate(target);
}

//---------------------Drag&Drop------------------------
let openedCardId = null;

function updateContainerTemplate(container) {
  if (!container) return;

  const emptyTemplate = container.querySelector(".notasks-container");

  if (container.children.length === 0) {
    container.innerHTML = noCardsTemplate();
  } else if (emptyTemplate) {
    emptyTemplate.remove();
  }
}

function detailedCardInfo(taskId) {
  openedCardId = taskId;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  document.body.insertAdjacentHTML("beforeend", detailedCardInfoTemplate(task));
}



function renderSubtask(subtasks) {
  if (!subtasks || subtasks.length === 0)
    return "<p>Currently no subtasks available</p>";

  let safe = Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks);

  if (safe.length === 0)
    return "<p>Currently no subtasks available</p>";

  return safe.map(st => `
        <div class="subtask-item">
            <input type="checkbox" ${st.done ? "checked" : ""}>
            <p>${st.text}</p>
        </div>
    `).join('');
}



function deleteCard(taskId) {
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) tasks.splice(index, 1);
  const card = document.getElementById(`card-${taskId}`);
  if (card) {
    const parent = card.parentElement;
    card.remove();
    updateContainerTemplate(parent);
  }
  closeOverlayCard();
  dragAndDrop();
}


function getBgColor(main) {
  if (main === "User Story" || main === "userstory") return "#0038FF";
  if (main === "Technical Task" || main === "techtask") return "#1FD7C1";
  return "#fff";
}

function resetAllButton() {
  document.getElementById('urgent').classList.remove('bg-red');
  document.getElementById('double-arrow').src = "../assets/Prio alta.svg"
  urgentActive = false;

  document.getElementById('medium-input').classList.remove('bg-orange');
  document.getElementById('equal').src = "../assets/Prio media.svg"
  mediumActive = false;

  document.getElementById('low-input').classList.remove('bg-green');
  document.getElementById('double-down').src = "../assets/double-down.svg"
  lowActive = false;
}

let selectedPriority = null;

function changeUrgentColor() {
  if (urgentActive) {
    resetAllButton();
    document.getElementById('urgent').classList.add("bg-red");
    document.getElementById('urgent').classList.add("bg-red::placeholder");
    document.getElementById('double-arrow').src = "../assets/arrows-up-white.png";
    urgentActive = true;
  }
};

function changeMediumColor() {
  if (mediumActive) {
    resetAllButton();
    document.getElementById('medium-input').classList.add("bg-orange");
    document.getElementById('medium-input').classList.add("bg-orange::placeholder");
    document.getElementById("equal").src = "../assets/equal-white.svg";
    mediumActive = true;
  }
};

function changeLowColor() {
  if (lowActive) {
    resetAllButton();
    document.getElementById('low-input').classList.add("bg-green");
    document.getElementById('low-input').classList.add("bg-green::placeholder");
    document.getElementById("double-down").src = "../assets/double-down-white.svg";
    lowActive = true;
  }
};

function changePriorityColor(priority) {
  if (priority === "urgent") changeUrgentColor();
  if (priority === "medium") changeMediumColor();
  if (priority === "low") changeLowColor();
}

function getPriorityImg(priority) {
  if (priority === "urgent") return "./assets/urgent-priority-board.svg";
  if (priority === "medium") return "./assets/medium-priority-board.svg";
  if (priority === "low") return "./assets/low-priority-board.svg";
  return "";
}

function closeOverlayCard() {
  let close = document.getElementById("overlayclose");
  let overlay = document.getElementById("card-content");
  overlay.classList.remove("is-open");
  setTimeout(() => {
    close.remove();
  }, 250);
}

function closeOverlayCardInstant() {
  const close = document.getElementById("overlayclose");
  if (close) close.remove();
}


function animateOverlayIn(overlay) {
  overlay.classList.remove("is-open");
  setTimeout(() => {
    overlay.classList.add("is-open");
  }, 20);
}

function closeAddTaskOverlay() {
  let overlayBg = document.getElementById("task-overlay-background");
  let overlay = document.getElementById("task-overlay");
  let container = document.getElementById("task-form-container");

  animateOverlayOut(overlay);

  setTimeout(() => {
    overlayBg.style.display = "none";
    container.innerHTML = "";
  }, 250);
}

function animateOverlayOut(overlay) {
  overlay.classList.remove("is-open");
}

document.getElementById("task-overlay-background").addEventListener("click", (e) => {
  let overlay = document.getElementById("task-overlay");

  if (!overlay.contains(e.target)) {
    closeAddTaskOverlay();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  dragAndDrop();
});

function openAddTaskOverlay() {
  let overlayBg = document.getElementById("task-overlay-background");
  let overlay = document.getElementById("task-overlay");
  let container = document.getElementById("task-form-container");

  addTaskOverlayTemplate();
  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;
  }

  overlayBg.style.display = "block";
  animateOverlayIn(overlay);
}

/*Funktion für firebase, Karten sollten sich nicht verändern */
function editTask() {
  const editTaskData = getTaskInputs();
  const oldTask = tasks.find(t => t.id === openedCardId);

  const filteredData = {};

  for (const key in editTaskData) {
    const value = editTaskData[key];

    if (key === "main") continue;

    if (value === "" || value === undefined || value === null) continue;

    filteredData[key] = value;
  }

  return firebase.database()
    .ref("tasks/" + oldTask.id)
    .update(filteredData)
    .catch(err => console.error("Task update failed:", err));
}


function loadAddTaskInteractions() {
  let script = document.createElement("script");
  script.src = "./add_task/add_task_interactions.js";
  document.body.appendChild(script);
}

let addTaskInteractionsLoaded = false;

function openEditOverlay(taskId) {
  let task = tasks.find(t => t.id === taskId);
  editOverlayTemplate(task);
  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;
  }

  setTimeout(() => {
    changePriorityColor(task.priority);
  }, 20);

  let bg = document.getElementById('edit-overlay-background');
  let formContainer = document.getElementById('edit-task-form-container');
  if (!bg || !formContainer) return;


  closeOverlayCardInstant();
  bg.classList.add('is-open');
  bg.addEventListener('click', function (e) {
    if (e.target === bg) {
      closeEditOverlay();
    }
  })
}

function openDetailedInfoCardInstant() {
  const card = document.getElementById("card-content");
  if (card) card.classList.add('is-instant-open');
}

function animateDetailedCardOut(overlay) {
  overlay.classList.remove("is-open");
}

async function closeEditOverlay() {
  let bg = document.getElementById('edit-overlay-background');
  if (!bg) return;
  await editTask();
  await loadData();
  detailedCardInfo(openedCardId);
  await dragAndDrop();
  bg.classList.remove('is-open');
  //closeOverlayCardInstant();
  openDetailedInfoCardInstant();
  closeOverlayCardInstant();
}


document.body.classList.remove('no-scroll');
if (openedCardId !== null) {
  detailedCardInfo(openedCardId);
  animateDetailedCardIn();

}

function animateDetailedCardIn() {
  let overlay = document.getElementById("card-content");
  overlay.classList.remove("is-open");
  setTimeout(() => {
    overlay.classList.add("is-open");
  }, 20);
}

function filterBoardCards(value) {
  let search = value.toLowerCase();
  let cards = document.getElementsByClassName("board-card");

  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let title = card.dataset.title;

    if (title.includes(search)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  }
}

