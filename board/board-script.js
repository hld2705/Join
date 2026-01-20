const boardTaskFormURL = './add_task/form_task.html';
let originalParent;
let isDragging = false;
let touchDraggingCard = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchHasMoved = false;
let touchGhost = null;
let originalContainer = null;
let openedCardId = null;
let selectedPriority = null;
let dragTimeout = null;

function normalizeSubtasks(subtasks) {
  return Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks || []);
}

function getProgressData(subtasks) {
  const total = subtasks.length;
  const done = subtasks.filter(s => s.done).length;
  return {
    total,
    done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    hideProgressClass: total === 0 ? "hidden" : ""
  };
}

/**
 * Computes all visual data needed to render a task card.
 *
 * @param {Array|Object} subtasks
 * @param {Array<string|Object>} assigned
 * @param {string} main
 * @param {string} priority
 * @returns {Object}
 * Prepared data for board card rendering (progress, badges, colors).
 */
function getDragAndDropData(subtasks, assigned, main, priority) {
  const safeSubtasks = normalizeSubtasks(subtasks);
  const progress = getProgressData(safeSubtasks);
  return {
    bgColor: getBgColor(main),
    imgSrc: getPriorityImg(priority),
    badges: renderBadges(assigned),
    main: mainTranslate(main),
    ...progress
  };
}

function mainTranslate(main){
  if(main === "userstory"){
   return "User Story"
  } else if(main === "User Story"){return "User Story"}
  if(main === "techtask"){
   return "Technical Task"
  } else if(main === "Technical Task"){return "Technical Task"}
}

/**
 * Returns all board column containers.
 * @returns {Object}
 */
function getBoardContainers() {
  return {
    todo: document.getElementById("todo-container"),
    inprogress: document.getElementById("in-progress-container"),
    review: document.getElementById("feedback-container"),
    done: document.getElementById("done-container")
  };
}

/**
 * Clears all task containers.
 * @param {Object} containers
 */
function clearContainers(containers) {
  for (let key in containers) {
    if (containers[key]) containers[key].innerHTML = "";
  }
}

/**
 * Renders a single task into its status container.
 * @param {Object} task
 * @param {Object} containers
 */
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

/**
 * Renders all tasks into their respective containers.
 *
 * @param {Object} containers
 */
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

/**
 * Fully re-renders the board:
 * - clears containers
 * - renders tasks
 * - fills empty columns
 * - updates placeholders
 */
async function dragAndDrop() {
  const containers = getBoardContainers();
  clearContainers(containers);
  fillContainers(containers);
  fillEmptyContainers(containers);
  updateAllContainers();
}

/**
 * Resolves a user ID from object or primitive.
 *
 * @param {string|Object} value
 * @returns {string}
 */
function getUserId(value) {
  return typeof value === "object" ? String(value.id) : String(value);
}

/**
 * 
 * @param {Array<string|object} assigned
 * Array of user IDs or user objects assigned to a task.
 * @returns {Array<Object>}
 * Array of badge ovjects {badge, name, color} used in templates.
 * @requires join.users to be up-to-date
 * @note if a user ID cannot be resolved, the badge is skipped.
 */
function renderBadges(assigned) {
  if (!assigned || assigned.length === 0) {
  return [];}
  let badges = [];
  for (let i = 0; i < assigned.length; i++) {
    let userId = typeof assigned[i] === "object" ? assigned[i].id : assigned[i];
    let user = join.users.find(u => String(u.id) === String(userId));
    if (!user) {user = users.find(u => String(u.id) === String(userId));}
    if (typeof user.badge === "string") {badges.push({badge: user.badge,name: user.name,color: user.color,type: "image"});
    } else if (user.badge && typeof user.badge === "object") {
      badges.push({badge: user.badge.text || getInitials(user.name),badgeColor: user.badge.color || user.color,name: user.name,color: user.color,type: "text"});
    }}
  return badges;
}

function updateContainerTemplate(container) {
  if (!container) return;
  container.querySelectorAll(".notasks-container").forEach(el => el.remove());
  const hasCards = container.querySelectorAll(".board-card").length > 0;
  if (!hasCards) {container.insertAdjacentHTML("beforeend", noCardsTemplate());}
}

function updateAllContainers() {
  const containers = [
    document.getElementById("todo-container"),
    document.getElementById("in-progress-container"),
    document.getElementById("feedback-container"),
    document.getElementById("done-container")];
  containers.forEach(container => updateContainerTemplate(container));
}

function detailedCardInfo(taskId) {
  openedCardId = taskId;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  document.body.insertAdjacentHTML("beforeend", detailedCardInfoTemplate(task));
}

function getSafeSubtasks(subtasks) {
  if (!subtasks) return [];
  return Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks);
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

function CutSubtaskText(text, max = 20) {
  if (text.length > max) {
    return text.slice(0, max) + "…";
  } else {
    return text;
  }
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

/**
 * Toggles completion state of a subtask and updates board state.
 * @param {number} taskId
 * @param {number} index
 */
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

/**
 * Deletes a task from Firebase and updates the board.
 * @param {number} taskId
 */
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

function resetPriorityStyles() {
  document.getElementById('urgent').classList.remove("bg-red");
  document.getElementById('medium-input').classList.remove("bg-orange");
  document.getElementById('low-input').classList.remove("bg-green");
  document.getElementById('double-arrow').src = "./assets/urgent-priority-board.svg";
  document.getElementById('equal').src = "./assets/medium-priority-board.svg";
  document.getElementById('double-down').src = "./assets/low-priority-board.svg";
}

function changePriorityColor(priority) {
  resetPriorityStyles();
  selectedPriority = priority;
  if (priority === "urgent"){
  document.getElementById('urgent').classList.add("bg-red");
  document.getElementById('double-arrow').src = "../assets/arrows-up-white.png";}  
  if (priority === "medium"){
  document.getElementById('medium-input').classList.add("bg-orange");
  document.getElementById("equal").src = "../assets/equal-white.svg";} 
  if (priority === "low") {
  document.getElementById('low-input').classList.add("bg-green");
  document.getElementById("double-down").src = "../assets/double-down-white.svg";} 
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

/**
 * Updates an existing task with edited values.
 * @async
 * @returns {Promise<void>}
 */
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

function preselectSingleUser(userId) {
  const el = document.querySelector(
    `.Assigned-dropdown-username[data-user-id="${userId}"]`
  );
  if (!el) return;
  el.classList.add("bg-grey");
  const checkButton = el.querySelector(".check-button");
  const checkIcon = el.querySelector(".check-icon-assignedTo");
  if (checkButton) {
    checkIcon.classList.remove("hidden");
    checkButton.classList.add("check-button-white");
  }
}

function getAssignedId(val) {
  return typeof val === "object" ? String(val.id) : String(val);
}

async function preselectAssignedUsers(assigned) {
  if (!assigned || assigned.length === 0) return;
  await showUserName();
  for (let i = 0; i < assigned.length; i++) {
    preselectSingleUser(getAssignedId(assigned[i]));
  }
}
