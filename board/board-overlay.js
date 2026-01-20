let addTaskInteractionsLoaded = false;

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

/**
 * Saves edited task data, reloads board state and reopens the detail overlay.
 *
 * @async
 * @returns {Promise<void>}
 */
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

/**
 * Prepares the edit overlay UI with task data.
 *
 * @param {Object} task
 */
function prepareEditOverlay(task) {
  editOverlayTemplate(task);
  initEditOverlayAssigned(task);

  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;
  }

  initEditOverlayPriority(task);
}

/**
 * Initializes assigned users and their badges in the edit overlay.
 *
 * @param {Object} task - Task currently being edited
 * @param {Array} task.assigned - Assigned users of the task
 * @returns {Promise<void>}
 */
async function initEditOverlayAssigned(task) {
  await showUserName();
  await preselectAssignedUsers(task.assigned);

  document
    .querySelectorAll('.Assigned-dropdown-username.bg-grey')
    .forEach(el => {
      const badge = el.querySelector('.userBadge');
      const container = document.getElementById('filteredBadgesContainer');
      filterBadges(badge, container, el.dataset.userId);
    });
}

/**
 * Initializes priority UI and state for the edit overlay.
 *
 * @param {Object} task - Task currently being edited
 */
function initEditOverlayPriority(task) {
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

/**
 * Initializes board data and renders tasks on page load.
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  if (users && users.length > 0) {
    join.users = users;
  }
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
    changePriorityColor();
  }, 50);
}

function openAddTaskOverlay(column) {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");
  if (window.innerWidth < 1230) {
    window.location.href = "add_task.html?uid=" + uid;
    return;
  }
  const overlayBg = document.getElementById("task-overlay-background");
  const overlay = document.getElementById("task-overlay");
  prepareAddTaskOverlay(column);
  overlayBg.style.display = "block";
  animateOverlayIn(overlay);
}

// Carryover from board-script (last functions in the file)
function getSelectedAssignedUsers() {
  return document.querySelectorAll(".Assigned-dropdown-username.bg-grey");
}

function renderFilteredBadges() {
  const container = document.getElementById("filteredBadgesContainer");
  if (!container) return;
  container.innerHTML = "";
  const users = Array.from(getSelectedAssignedUsers());
  appendAssignedBadges(container, users);
  appendBadgeDotsIfNeeded(container, users);
}

function appendAssignedBadges(container, users) {
  const maxVisible = 3;
  users.slice(0, maxVisible).forEach(user => {
    const badgeEl = user.querySelector(".userBadge");
    const nameEl = user.querySelector("span");
    if (!badgeEl) return;
    const badge = badgeEl.cloneNode(true);
    badge.classList.add("assigned-badge");
    badge.title = nameEl ? nameEl.textContent : "";
    container.appendChild(badge);
  });
}

function appendBadgeDotsIfNeeded(container, users) {
  if (users.length <= 3) return;
  const dots = document.createElement("span");
  dots.classList.add("badge-dots");
  dots.textContent = "...";
  container.appendChild(dots);
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
    noResults.style.display = "flex";
  } else {
    noResults.style.display = "none";
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function editOverlayTemplate(task) {
    const subtaskContent = renderSubtaskEdit(task.subtasks);
    let formContainer = document.getElementById('edit-task-form-container');
    task.priority === "urgent";
    const icons = getEditPriorityIcons(task.priority);
    if (!formContainer) return;
    if (formContainer) formContainer.innerHTML = editOverlayMarkup(task, icons, subtaskContent);
}

function renderSubtaskEdit(subtasks) {
    if (!subtasks || subtasks.length === 0) return "<ul></ul>";

    let html = "<ul>";
    subtasks.forEach((st, i) => {
        html += subtaskEditItemTemplate(st, i);
    });
    html += "</ul>";

    return html;
}

function detailedCardInfoTemplate(task) {
    const bgColor = getBgColor(task.main);
    const imgSrc = getPriorityImg(task.priority);
    const badges = renderBadges(task.assigned);
    const subtask = renderSubtask(task.subtasks, task.id);

    return detailedCardInfoMarkup(task, bgColor, imgSrc, badges, subtask);
}