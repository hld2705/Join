const boardTaskFormURL = './add_task/form_task.html';
let originalParent;
let isDragging = false;

let touchDraggingCard = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let touchGhost = null;

function dragAndDrop() {
  const containers = {
    todo: "todo-container",
    inprogress: "in-progress-container",
    review: "feedback-container",
    done: "done-container"
  };
  for (let key in containers) {
    const container = document.getElementById(containers[key]);
    container.innerHTML = "";
    tasks.filter(t => t.status === key).forEach(t => {
      container.innerHTML += dragAndDropTemplate(
        t.id, t.title, t.main, t.description, t.subtasks, t.assigned, t.priority, t.enddate
      );
    });
    if (container.children.length === 0) container.innerHTML = noCardsTemplate();
  }
  updateAllContainers();
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
      })
    }
  };
  return badges;
}

function touchStart(e) {
  if (e.touches.length !== 1) return;
  const card = e.currentTarget;
  const touch = e.touches[0];
  const rect = card.getBoundingClientRect();
  touchDraggingCard = card;
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
  touchGhost = card.cloneNode(true);
  touchGhost.style.position = "fixed";
  touchGhost.style.left = rect.left + "px";
  touchGhost.style.top = rect.top + "px";
  touchGhost.style.width = rect.width + "px";
  touchGhost.style.pointerEvents = "none";
  touchGhost.style.visibility = "hidden";
  document.body.appendChild(touchGhost);
  e.preventDefault();
}

function touchMove(e) {
  if (!touchGhost) return;
  const touch = e.touches[0];
  touchGhost.style.left = (touch.clientX - touchOffsetX) + "px";
  touchGhost.style.top = (touch.clientY - touchOffsetY) + "px";
  e.preventDefault();
}

function touchEnd(e) {
  if (!touchDraggingCard) return;
  const touch = e.changedTouches[0];
  const container = getTargetContainer(touch);
  if (!container) return cleanupTouchDrag();
  moveCard(container, touchDraggingCard);
  updateTaskStatus(touchDraggingCard, container);
  updateContainerTemplate(container);
  cleanupTouchDrag();
}

function getTargetContainer(touch) {
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const progress = el && el.closest(".distribution-progress");
  return progress && progress.querySelector(".task-container");
}

function moveCard(container, card) {
  container.appendChild(card);
}

function updateTaskStatus(card, container) {
  const taskId = Number(card.id.replace("card-", ""));
  const statusMap = {
    "todo-container": "todo",
    "in-progress-container": "inprogress",
    "feedback-container": "review",
    "done-container": "done"
  };
  const task = tasks.find(t => t.id === taskId);
  const newStatus = statusMap[container.id];
  if (!task || !newStatus) return;
  task.status = newStatus;
  firebase.database().ref("tasks/" + taskId).update({ status: newStatus });
}


function cleanupTouchDrag() {
  if (touchGhost) {
    touchGhost.remove();
    touchGhost = null;
  }
  if (touchDraggingCard) {
    touchDraggingCard.style.visibility = "visible";
    touchDraggingCard = null;
  }
  updateAllContainers();
}

let originalContainer = null;

function startDragging(ev, id) {
  const card = document.getElementById(`card-${id}`);
  originalContainer = card.parentElement;
  ev.dataTransfer.setData("text", `card-${id}`);
  card.classList.add("dragging");
  isDragging = true;
  document.querySelectorAll(".landing-field").forEach(lf => lf.remove());
}

function dragoverHandler(ev) {
  ev.preventDefault();
  const draggingCard = document.querySelector(".board-card.dragging");
  if (!draggingCard || ev.currentTarget.querySelector(".task-container") === originalContainer) return;
  clearLandingFields();
  if (!insertLandingField(ev.clientY, draggingCard, ev.currentTarget)) appendLandingField(draggingCard, ev.currentTarget);
}

function clearLandingFields() {
  document.querySelectorAll(".landing-field").forEach(lf => lf.remove());
}

function insertLandingField(mouseY, card, container) {
  const children = Array.from(container.querySelectorAll(".board-card"));
  for (let child of children) {
    if (mouseY < child.getBoundingClientRect().top + child.offsetHeight / 2) {
      let lf = child.nextElementSibling;
      if (!lf || !lf.classList.contains("landing-field")) {
        lf = document.createElement("div");
        lf.className = "landing-field";
        lf.style.height = card.offsetHeight + "px";
        child.parentElement.insertBefore(lf, child.nextSibling);
      }
      lf.style.display = "block";
      return true;
    }
  }
  return false;
}

function appendLandingField(card, container) {
  let lf = container.querySelector(".landing-field:last-child");
  if (!lf) {
    lf = document.createElement("div");
    lf.className = "landing-field";
    lf.style.height = card.offsetHeight + "px";
    container.querySelector(".task-container").appendChild(lf);
  }
  lf.style.display = "block";
}

function onDragEnd() {
  setTimeout(() => {
    isDragging = false;
    document.querySelectorAll(".board-card.dragging").forEach(c => c.classList.remove("dragging"));
    document.querySelectorAll(".landing-field").forEach(lf => lf.style.display = "none");
    updateAllContainers();
  }, 50);
}

function dragenterHandler(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add("drag-over");
}

function moveTo(ev, newStatus) {
  ev.preventDefault();
  const card = document.getElementById(ev.dataTransfer.getData("text"));
  const container = ev.currentTarget.querySelector(".task-container");
  if (!card || !container) return;
  placeCard(container, card);
  updateTask(card, newStatus);
  document.querySelectorAll(".landing-field").forEach(lf => lf.style.display = "none");
  updateContainerTemplate(container);
}

function placeCard(container, card) {
  const lf = container.querySelector(".landing-field[style*='display: block']");
  if (lf) {
    container.insertBefore(card, lf);
    lf.remove();
  } else {
    container.appendChild(card);
  }
}

function updateTask(card, status) {
  const id = Number(card.id.replace("card-", ""));
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.status = status;
  firebase.database().ref("tasks/" + id).update({ status });
}

let openedCardId = null;

function updateContainerTemplate(container) {
  if (!container) return;
  container.querySelectorAll(".notasks-container").forEach(el => el.remove());
  const hasCards = container.querySelectorAll(".board-card").length > 0;
  if (!hasCards) {
    container.insertAdjacentHTML("beforeend", noCardsTemplate());
  }
}

function updateAllContainers() {
  const containers = [
    document.getElementById("todo-container"),
    document.getElementById("in-progress-container"),
    document.getElementById("feedback-container"),
    document.getElementById("done-container")
  ];
  containers.forEach(container => updateContainerTemplate(container));
}

function detailedCardInfo(taskId) {
  openedCardId = taskId;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  document.body.insertAdjacentHTML("beforeend", detailedCardInfoTemplate(task));
}

function renderSubtaskItem(st, taskId, index) {
  return `
        <div class="subtask-item">
            <img
                id="subtask-${taskId}-${index}" 
                src="${getSubtasksImg(st.done)}"
                class="subtask-icon"
                onclick="toggleSubtask(${taskId}, ${index})"
            >
            <p>${st.text}</p>
        </div>
    `;
}

function renderSubtaskMore(count, taskId) {
  return `
    <div class="subtask-more" onclick="showAllSubtasks(${taskId})">
      +${count}
    </div>
  `;
}

function renderSubtask(subtasks, taskId) {
  if (!subtasks) return "<p>Currently no subtasks available</p>";
  const safe = Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks);
  if (safe.length === 0) {
    return "<p>Currently no subtasks available</p>";
  }
  const visibleSubtasks = safe.slice(0, 2);
  const remainingCount = safe.length - visibleSubtasks.length;
  let html = visibleSubtasks
    .map((st, i) => renderSubtaskItem(st, taskId, i))
    .join('');
  if (remainingCount > 0) {
    html += renderSubtaskMore(remainingCount, taskId);
  }
  return html;
}

function showAllSubtasks(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  const container = document.querySelector(
    '.card-overlay-subtasks-details-container .subtask-render-icons-text'
  );
  if (!container) return;
  container.innerHTML = task.subtasks
    .map((st, i) => renderSubtaskItem(st, taskId, i))
    .join('');
}

function toggleSubtask(taskId, index) {
  let task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.subtasks[index].done = !task.subtasks[index].done;
  saveData("tasks", task);
  updateBoardSubtaskProgress(taskId, task.subtasks);
  const img = document.querySelector(`#subtask-${taskId}-${index}`);
  if (img) img.src = getSubtasksImg(task.subtasks[index].done);
  dragAndDrop();
}

function updateBoardSubtaskProgress(taskId, subtasks) {
  const done = subtasks.filter(s => s.done).length;
  const total = subtasks.length;
  const card = document.getElementById(`card-${taskId}`);
  if (!card) return;
  const text = card.querySelector('.subtask-template');
  if (text) {
    text.textContent = `${done}/${total} Subtasks`;
  }
  const progressBar = card.querySelector('.subtask-progress');
  if (progressBar) {
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    progressBar.value = percent;
  }
}

function deleteCard(taskId) {
  firebase.database().ref("tasks/" + taskId).remove();
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

let selectedPriority = null;

function changesUrgentColor() {
  selectedPriority = "urgent";
  document.getElementById('urgent').classList.add("bg-red");
  document.getElementById('double-arrow').src = "../assets/arrows-up-white.png";
}

function changesMediumColor() {
  selectedPriority = "medium";
  document.getElementById('medium-input').classList.add("bg-orange");
  document.getElementById("equal").src = "../assets/equal-white.svg";
}

function changesLowColor() {
  selectedPriority = "low";
  document.getElementById('low-input').classList.add("bg-green");
  document.getElementById("double-down").src = "../assets/double-down-white.svg";
}

function changePriorityColor(priority) {
  if (priority === "urgent") changesUrgentColor();
  if (priority === "medium") changesMediumColor();
  if (priority === "low") changesLowColor();
}

function getEditPriorityIcons(priority) {
  return {
    urgent: priority === "urgent"
      ? "../assets/arrows-up-white.png"
      : "./assets/urgent-priority-board.svg",
    medium: priority === "medium"
      ? "../assets/equal-white.svg"
      : "./assets/medium-priority-board.svg",
    low: priority === "low"
      ? "../assets/double-down-white.svg"
      : "./assets/low-priority-board.svg",
  };
}

function getPriorityImg(priority) {
  if (priority === "urgent") return "./assets/urgent-priority-board.svg";
  if (priority === "medium") return "./assets/medium-priority-board.svg";
  if (priority === "low") return "./assets/low-priority-board.svg";
  return "";
}

function getSubtasksImg(isDone) {
  if (isDone === true) return "./assets/subtask_checked.svg";
  return "./assets/subtask_empty.svg";
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

function openAddTaskOverlay(column) {
  if (window.innerWidth < 1230) {
    window.location.href = "add_task.html";
    return;}
  window.currentTaskColumn = column;
  let overlayBg = document.getElementById("task-overlay-background");
  let overlay = document.getElementById("task-overlay");
  addTaskOverlayTemplate();
  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;}
  setTimeout(() => {
    mediumActive = false;
    changeMediumColor();
  }, 50);
  overlayBg.style.display = "block";
  animateOverlayIn(overlay);
}

function editTask() {
  const editTaskData = getTaskInputs();
  const oldTask = tasks.find(t => t.id === openedCardId);
  const filteredData = {};
  for (const key in editTaskData) {
    const value = editTaskData[key];
    if (key === "main") continue;
    if (value === "" || value === undefined || value === null) continue;
    filteredData[key] = value;}
  return firebase.database()
    .ref("tasks/" + oldTask.id)
    .update(filteredData)
    .catch(err => console.error("Task update failed:", err));
}

document.addEventListener("click", function (e) {
  let card = e.target.closest(".board-card");
  if (card) card.classList.add("card-active");
});

function loadAddTaskInteractions() {
  let script = document.createElement("script");
  script.src = "./add_task/add_task_interactions.js";
  document.body.appendChild(script);
}

let addTaskInteractionsLoaded = false;

function openEditOverlay(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  editOverlayTemplate(task);
  preselectUsersAndPriority(task);
  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;
  }
  const bg = document.getElementById('edit-overlay-background');
  const formContainer = document.getElementById('edit-task-form-container');
  if (!bg || !formContainer) return;
  closeOverlayCardInstant();
  bg.classList.add('is-open');
  bg.onclick = e => { if (e.target === bg) cancelEditOverlay(); };
}

function preselectUsersAndPriority(task) {
  setTimeout(() => preselectAssignedUsers(task.assigned), 0);
  setTimeout(() => {
    changePriorityColor(task.priority);
    urgentActive = task.priority === "urgent";
    mediumActive = task.priority === "medium";
    lowActive = task.priority === "low";
  }, 20);
}

async function preselectAssignedUsers(assigned) {
  if (!assigned || assigned.length === 0) return;
  await showUserName();
  assigned.forEach(userId => {
    const el = document.querySelector(
      `.Assigned-dropdown-username[data-user-id="${userId}"]`
    );
    if (el) {
      el.classList.add("bg-grey");
      let checkButton = el.querySelector('.check-button');
      let checkIcon = el.querySelector('.check-icon-assignedTo');
      if (checkButton) {
        checkIcon.classList.toggle("hidden");
        checkButton.classList.toggle("check-button-white");
      }}});
  renderFilteredBadges();
}

function renderFilteredBadges() {
  const container = document.getElementById("filteredBadgesContainer");
  if (!container) return;
  container.innerHTML = "";
  const selectedUsers = document.querySelectorAll(
    ".Assigned-dropdown-username.bg-grey"
  );
  selectedUsers.forEach(userEl => {
    const name = userEl.querySelector("span")?.textContent || "";
    const badgeEl = userEl.querySelector(".userBadge");
    if (!badgeEl) return;
    const badge = badgeEl.cloneNode(true);
    badge.classList.add("assigned-badge");
    badge.title = name;
    container.appendChild(badge);
  });
}

function openDetailedInfoCardInstant() {
  const card = document.getElementById("card-content");
  if (card) card.classList.add('is-instant-open');
}

function animateDetailedCardOut(overlay) {
  overlay.classList.remove("is-open");
}

function removeExistingDetailOverlay() {
  const oldOverlay = document.getElementById("overlayclose");
  if (oldOverlay) oldOverlay.remove();
}

async function closeEditOverlay() {
  const bg = document.getElementById('edit-overlay-background');
  if (!bg) return;
  await editTask();
  await loadData();
  removeExistingDetailOverlay();
  detailedCardInfo(openedCardId);
  await dragAndDrop();
  bg.classList.remove('is-open');
  openDetailedInfoCardInstant();
}

function cancelEditOverlay() {
  let bg = document.getElementById('edit-overlay-background');
  let overlay = document.getElementById('edit-overlay');
  if (!bg || !overlay) return;
  overlay.classList.add('edit-overlay-exit');
  setTimeout(() => {
    overlay.classList.remove('edit-overlay-exit');
    bg.classList.remove('is-open');
    openDetailedInfoCardInstant();
    closeOverlayCardInstant();
  }, 350);
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
  let count = 0;
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let title = card.dataset.title;
    let description = card.dataset.description;
    if (title.includes(search) || description.includes(search)) {
      card.style.display = "";
      count++;
    } else {
      card.style.display = "none";
    }}
  noResult(count);
}

function noResult(count) {
  let noResults = document.getElementById("no-results");
  if (count === 0) {
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

