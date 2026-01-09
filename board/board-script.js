const boardTaskFormURL = './add_task/form_task.html';
let originalParent;
let isDragging = false;
let touchDraggingCard = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let touchGhost = null;
let originalContainer = null;
let openedCardId = null;
let selectedPriority = null;

function getDragAndDropData(subtasks, assigned, main, priority) {
  const safeSubtasks = Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks || []);
  const total = safeSubtasks.length;
  const done = safeSubtasks.filter(s => s.done).length;
  return {
    bgColor: getBgColor(main),
    imgSrc: getPriorityImg(priority),
    badges: renderBadges(assigned),
    total,
    done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    hideProgressClass: total === 0 ? "hidden" : ""
  };
}

function getBoardContainers() {
  return {
    todo: document.getElementById("todo-container"),
    inprogress: document.getElementById("in-progress-container"),
    review: document.getElementById("feedback-container"),
    done: document.getElementById("done-container")
  };
}

function clearContainers(containers) {
  for (let key in containers) {
    if (containers[key]) containers[key].innerHTML = "";
  }
}

function renderTasketoContainer(task, containers) {
  const container = containers[task.status];
  if (!container) return;
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

function fillContainers(containers) {
  for (let i = 0; i < tasks.length; i++) {
    renderTasketoContainer(tasks[i], containers);
  }
}

function fillEmptyContainers(containers) {
  for (let key in containers) {
    const container = containers[key];
    if (container && container.children.length === 0) {
      container.innerHTML = noCardsTemplate();
    }
  }
}

function dragAndDrop() {
  const containers = getBoardContainers();
  clearContainers(containers);
  fillContainers(containers);
  fillEmptyContainers(containers);
  updateAllContainers();
}

function getUserId(value) {
  return Number(typeof value === "object" ? value.id : value);
}

function renderBadges(assigned) {
  if (!assigned || assigned.length === 0) return [];
  const badges = [];
  for (let i = 0; i < assigned.length; i++) {
    const userId = getUserId(assigned[i]);
    const user = join.users.find(u => u.id === userId);
    if (!user) continue;

    badges.push({
      badge: user.badge,
      name: user.name,
      color: user.color
    });}
  return badges;
}

function createTouchGhost(card, rect) {
  const ghost = card.cloneNode(true);
  ghost.style.position = "fixed";
  ghost.style.left = rect.left + "px";
  ghost.style.top = rect.top + "px";
  ghost.style.width = rect.width + "px";
  ghost.style.pointerEvents = "none";
  ghost.style.visibility = "hidden";
  document.body.appendChild(ghost);
  return ghost;
}

function touchStart(e) {
  if (e.touches.length !== 1) return;
  const card = e.currentTarget;
  const touch = e.touches[0];
  const rect = card.getBoundingClientRect();
  touchDraggingCard = card;
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
  touchGhost = createTouchGhost(card, rect);
  e.preventDefault();
}

function touchMove(e) {
  if (!touchGhost) return;
  const touch = e.touches[0];
  touchGhost.style.left = (touch.clientX - touchOffsetX) + "px";
  touchGhost.style.top = (touch.clientY - touchOffsetY) + "px";
  e.preventDefault();
}

function updateTaskStatusByContainer(card, container) {
  const taskId = Number(card.id.replace("card-", ""));
  let newStatus = null;
  if (container.id === "todo-container") newStatus = "todo";
  if (container.id === "in-progress-container") newStatus = "inprogress";
  if (container.id === "feedback-container") newStatus = "review";
  if (container.id === "done-container") newStatus = "done";
  const task = tasks.find(t => t.id === taskId);
  if (!task || !newStatus) return;
  task.status = newStatus;
  firebase.database().ref("tasks/" + taskId).update({ status: newStatus });
}

function touchEnd(e) {
  if (!touchDraggingCard) return;
  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  const column = target && target.closest(".distribution-progress");
  if (!column) return cleanupTouchDrag();
  const container = column.querySelector(".task-container");
  if (!container) return cleanupTouchDrag();
  container.appendChild(touchDraggingCard);
  updateTaskStatusByContainer(touchDraggingCard, container);
  updateContainerTemplate(container);
  cleanupTouchDrag();
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

function startDragging(ev, id) {
  const card = document.getElementById(`card-${id}`);
  originalContainer = card.parentElement;
  ev.dataTransfer.setData("text", `card-${id}`);
  card.classList.add("dragging");
  isDragging = true;
  document.querySelectorAll(".landing-field").forEach(lf => lf.remove());
}

function removeLandingFields() {
  document.querySelectorAll(".landing-field").forEach(lf => lf.remove());
}

function insertLandingFieldAfter(child, height) {
  let lf = child.nextElementSibling;
  if (!lf || !lf.classList.contains("landing-field")) {
    lf = document.createElement("div");
    lf.classList.add("landing-field");
    lf.style.height = height + "px";
    child.parentElement.insertBefore(lf, child.nextSibling);
  }
  lf.style.display = "block";
}

function insertLandingFieldAtEnd(container, height) {
  let lf = container.querySelector(".landing-field:last-child");
  if (!lf) {
    lf = document.createElement("div");
    lf.classList.add("landing-field");
    lf.style.height = height + "px";
    container.querySelector(".task-container").appendChild(lf);
  }
  lf.style.display = "block";
}

function findPosition(cards, y, height) {
  for (let card of cards) {
    const rect = card.getBoundingClientRect();
    if (y < rect.top + rect.height / 2) {
      insertLandingFieldAfter(card, height);
      return true;
    }
  }
  return false;
}

function dragoverHandler(ev) {
  ev.preventDefault();
  removeLandingFields();
  const draggingCard = document.querySelector(".board-card.dragging");
  const inner = ev.currentTarget.querySelector(".task-container");
  if (!draggingCard || inner === originalContainer) return;
  const cards = Array.from(ev.currentTarget.querySelectorAll(".board-card"));
  const inserted = findPosition(cards, ev.clientY, draggingCard.offsetHeight);
  if (!inserted)
    insertLandingFieldAtEnd(ev.currentTarget, draggingCard.offsetHeight);
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

function moveCardInContainer(card, container) {
  const lf = container.querySelector(".landing-field[style*='display: block']");
  if (lf) {
    container.insertBefore(card, lf);
    lf.remove();
  } else {
    container.appendChild(card);
  }
}

function updateTaskStatus(card, newStatus) {
  const taskId = Number(card.id.replace("card-", ""));
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = newStatus;
  firebase.database().ref("tasks/" + taskId).update({ status: newStatus });
}

function moveTo(ev, newStatus) {
  ev.preventDefault();
  const cardId = ev.dataTransfer.getData("text");
  const card = document.getElementById(cardId);
  const container = ev.currentTarget.querySelector(".task-container");
  if (!card || !container) return;

  moveCardInContainer(card, container);
  updateTaskStatus(card, newStatus);
  document.querySelectorAll(".landing-field")
    .forEach(lf => lf.style.display = "none");
  updateContainerTemplate(container);
}

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

function getSafeSubtasks(subtasks) {
  if (!subtasks) return [];
  return Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks);
}

function renderNoSubtasks() {
  return "<p>Currently no subtasks available</p>";
}

function renderSubtask(subtasks, taskId) {
  const safe = getSafeSubtasks(subtasks);
  if (safe.length === 0) return renderNoSubtasks();

  const visible = safe.slice(0, 2);
  const remaining = safe.length - visible.length;
  let html = visible
    .map((st, i) => renderSubtaskItem(st, taskId, i))
    .join("");
  if (remaining > 0)
    html += renderSubtaskMore(remaining, taskId);
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

function getSubtaskProgress(subtasks) {
  const done = subtasks.filter(s => s.done).length;
  const total = subtasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

function updateBoardSubtaskProgress(taskId, subtasks) {
  const card = document.getElementById(`card-${taskId}`);
  if (!card) return;
  const { done, total, percent } = getSubtaskProgress(subtasks);
  const text = card.querySelector(".subtask-template");
  if (text) text.textContent = `${done}/${total} Subtasks`;
  const bar = card.querySelector(".subtask-progress");
  if (bar) bar.value = percent;
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

function prepareAddTaskOverlay(column) {
  window.currentTaskColumn = column;
  addTaskOverlayTemplate();
  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;
  }
  setTimeout(() => {
    mediumActive = false;
    changeMediumColor();
  }, 50);
}

function openAddTaskOverlay(column) {
  if (window.innerWidth < 1230) {
    window.location.href = "add_task.html";
    return;
  }
  const overlayBg = document.getElementById("task-overlay-background");
  const overlay = document.getElementById("task-overlay");
  prepareAddTaskOverlay(column);
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
    filteredData[key] = value;
  }
  return firebase.database().ref("tasks/" + oldTask.id)
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

function prepareEditOverlay(task) {
  editOverlayTemplate(task);
  setTimeout(() => preselectAssignedUsers(task.assigned), 0);
  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;
  }
  setTimeout(() => {
    changePriorityColor(task.priority);
    urgentActive = task.priority === "urgent";
    mediumActive = task.priority === "medium";
    lowActive = task.priority === "low";
  }, 20);
}

function openEditOverlay(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  prepareEditOverlay(task);
  const bg = document.getElementById("edit-overlay-background");
  const form = document.getElementById("edit-task-form-container");
  if (!bg || !form) return;

  closeOverlayCardInstant();
  bg.classList.add("is-open");
  bg.addEventListener("click", e => {
    if (e.target === bg) cancelEditOverlay();
  });
}

function preselectSingleUser(userId) {
  const el = document.querySelector(
    `.Assigned-dropdown-username[data-user-id="${userId}"]`
  );
  if (!el) return;
  el.classList.add("bg-grey");
  const checkButton = el.querySelector(".check-button");
  const checkIcon = el.querySelector(".check-icon-assignedTo");
  if (checkButton) {
    checkIcon.classList.toggle("hidden");
    checkButton.classList.toggle("check-button-white");
  }
}

async function preselectAssignedUsers(assigned) {
  if (!assigned || assigned.length === 0) return;
  await showUserName();
  for (let i = 0; i < assigned.length; i++) {
    preselectSingleUser(assigned[i]);
  }
  renderFilteredBadges();
}

function getSelectedAssignedUsers() {
  return document.querySelectorAll(".Assigned-dropdown-username.bg-grey");
}

function renderFilteredBadges() {
  const container = document.getElementById("filteredBadgesContainer");
  if (!container) return;
  container.innerHTML = "";
  const users = getSelectedAssignedUsers();
  for (let i = 0; i < users.length; i++) {
    const nameEl = users[i].querySelector("span");
    const badgeEl = users[i].querySelector(".userBadge");
    if (!badgeEl) continue;
    const badge = badgeEl.cloneNode(true);
    badge.classList.add("assigned-badge");
    badge.title = nameEl ? nameEl.textContent : "";
    container.appendChild(badge);
  }
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

function cardMatchesSearch(card, search) {
  const title = card.dataset.title || "";
  const description = card.dataset.description || "";
  return title.includes(search) || description.includes(search);
}

function filterBoardCards(value) {
  const search = value.toLowerCase();
  const cards = document.getElementsByClassName("board-card");
  let count = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cardMatchesSearch(cards[i], search)) {
      cards[i].style.display = "";
      count++;
    } else {
      cards[i].style.display = "none";
    }
  }
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