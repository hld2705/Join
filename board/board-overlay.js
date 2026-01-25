let addTaskInteractionsLoaded = false;

/** Instantly opens the detailed card without animation delay. */
function openDetailedInfoCardInstant() {
  const card = document.getElementById("card-content");
  if (card) card.classList.add('is-instant-open');
}

/**
 * Animates detailed card overlay out.
 * @param {HTMLElement} overlay
 */
function animateDetailedCardOut(overlay) {
  overlay.classList.remove("is-open");
}

/** Removes any existing detailed card overlay from DOM. */
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

/** Cancels edit overlay with exit animation. */
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

/** Animates detailed card overlay in. */
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

/**
 * Opens the edit overlay for a specific task.
 * @param {number|string} taskId
 */
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

/** Closes detailed card overlay with animation. */
function closeOverlayCard() {
  let close = document.getElementById("overlayclose");
  let overlay = document.getElementById("card-content");
  overlay.classList.remove("is-open");
  setTimeout(() => {
    close.remove();
  }, 250);
}

/** Instantly closes detailed card overlay. */
function closeOverlayCardInstant() {
  const close = document.getElementById("overlayclose");
  if (close) close.remove();
}

/**
 * Animates overlay element in.
 * @param {HTMLElement} overlay
 */
function animateOverlayIn(overlay) {
  overlay.classList.remove("is-open");
  setTimeout(() => {
    overlay.classList.add("is-open");
  }, 20);
}

/** Closes add-task overlay and resets its content. */
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

/**
 * Animates overlay element out.
 * @param {HTMLElement} overlay
 */
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

/**
 * Prepares add-task overlay for a specific column.
 * @param {string} column
 */
function prepareAddTaskOverlay(column) {
  window.currentTaskColumn = column;
  addTaskOverlayTemplate();
  if (!addTaskInteractionsLoaded) {
    loadAddTaskInteractions();
    addTaskInteractionsLoaded = true;
  }
  setTimeout(() => {
    mediumActive = false;
    changePriorityColor("medium");
  }, 50);
}

/**
 * Opens add-task overlay or redirects on small screens.
 * @param {string} column
 */
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

/** Returns all currently selected assigned users. */
function getSelectedAssignedUsers() {
  return document.querySelectorAll(".Assigned-dropdown-username.bg-grey");
}

/** Renders assigned user badges in edit overlay. */
function renderFilteredBadges() {
  const container = document.getElementById("filteredBadgesContainer");
  if (!container) return;
  container.innerHTML = "";
  const users = Array.from(getSelectedAssignedUsers());
  appendAssignedBadges(container, users);
  appendBadgeDotsIfNeeded(container, users);
}

/**
 * Appends assigned user badges to container.
 * @param {HTMLElement} container
 * @param {Array<Element>} users
 */
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

/**
 * Appends overflow dots if too many assigned users exist.
 * @param {HTMLElement} container
 * @param {Array} users
 */
function appendBadgeDotsIfNeeded(container, users) {
  if (users.length <= 3) return;
  const dots = document.createElement("span");
  dots.classList.add("badge-dots");
  dots.textContent = "...";
  container.appendChild(dots);
}

/**
 * Checks if a board card matches search value.
 * @param {HTMLElement} card
 * @param {string} search
 * @returns {boolean}
 */
function cardMatchesSearch(card, search) {
  const title = card.dataset.title || "";
  const description = card.dataset.description || "";
  return title.includes(search) || description.includes(search);
}

/**
 * Filters board cards based on search input.
 * @param {string} value
 */
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

/**
 * Toggles no-result message based on visible cards.
 * @param {number} count
 */
function noResult(count) {
  let noResults = document.getElementById("no-results");
  if (count === 0) {
    noResults.style.display = "flex";
  } else {
    noResults.style.display = "none";
  }
}

/**
 * Capitalizes first letter of a string.
 * @param {string} string
 * @returns {string}
 */
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Renders edit overlay markup for a task.
 * @param {Object} task
 */
function editOverlayTemplate(task) {
  const subtaskContent = renderSubtaskEdit(task.subtasks);
  let formContainer = document.getElementById('edit-task-form-container');
  task.priority === "urgent";
  const icons = getEditPriorityIcons(task.priority);
  if (!formContainer) return;
  if (formContainer) formContainer.innerHTML = editOverlayMarkup(task, icons, subtaskContent);
}

/**
 * Renders editable subtasks list.
 * @param {Array} subtasks
 * @returns {string}
 */
function renderSubtaskEdit(subtasks) {
  if (!subtasks || subtasks.length === 0) return "<ul></ul>";

  let html = "<ul>";
  subtasks.forEach((st, i) => {
    html += subtaskEditItemTemplate(st, i);
  });
  html += "</ul>";

  return html;
}

/**
 * Builds detailed card markup for a task.
 * @param {Object} task
 * @returns {string}
 */
function detailedCardInfoTemplate(task) {
  const bgColor = getBgColor(task.main);
  const imgSrc = getPriorityImg(task.priority);
  const badges = renderBadges(task.assigned);
  const subtask = renderSubtask(task.subtasks, task.id);

  return detailedCardInfoMarkup(task, bgColor, imgSrc, badges, subtask);
}
