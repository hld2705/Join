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

let addTaskInteractionsLoaded = false;

function prepareEditOverlay(task) {
  editOverlayTemplate(task);
  setTimeout(async () => {
     await showUserName(); 
    await preselectAssignedUsers(task.assigned);
    document
      .querySelectorAll('.Assigned-dropdown-username.bg-grey')
      .forEach(el => {
        const badge = el.querySelector('.userBadge');
        const container = document.getElementById('filteredBadgesContainer');
        filterBadges(badge, container, el.dataset.userId);
      });
  }, 0);

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
    changeMediumColor();
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