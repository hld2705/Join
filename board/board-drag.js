 let autoScrollInterval = null;
 let lastTouch = null;

function createTouchGhost(card, rect) {
  const ghost = card.cloneNode(true);
  ghost.style.position = "fixed";
  ghost.style.left = rect.left + "px";
  ghost.style.top = rect.top + "px";
  ghost.style.width = rect.width + "px";
  ghost.style.pointerEvents = "none";
  ghost.style.visibility = "visible";
  document.body.appendChild(ghost);
  return ghost;
}

function initTouchDrag(card, touch, rect) {
  touchDraggingCard = card;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchHasMoved = false;
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
}

function touchStart(e) {
  if (e.touches.length !== 1) return;

  const card = e.currentTarget;
  const touch = e.touches[0];
  const rect = card.getBoundingClientRect();

  dragTimeout = setTimeout(() => {
    initTouchDrag(card, touch, rect);
    touchGhost = createTouchGhost(card, rect);
  }, 350);
}

function handleTouchLandingField(touch) {
  const container = getDropContainer(touch);
  if (!container) {
    removeLandingFields();
    return;
  }
  const noTasks = container.querySelector(".notasks-container");
if (noTasks) noTasks.style.display = "none";
  const cards = Array.from(container.querySelectorAll(".board-card"));
  const ghostHeight = touchGhost.offsetHeight;
  removeLandingFields();
  const ghostRect = touchGhost.getBoundingClientRect();
const ghostY = ghostRect.top + ghostRect.height / 2;

const inserted = findPosition(cards, ghostY, ghostHeight);
  if (!inserted) {
    insertLandingFieldAtEnd(container.closest(".distribution-progress"), ghostHeight);
  }
}

function ScrollOnEdge(touch) {
  const edge = 90;
  const speed = 80;
  const container = document.querySelector(".content");
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const y = touch.clientY;
  if (y < rect.top + edge) {
    container.scrollTop -= speed;
  } else if (y > rect.bottom - edge) {
    container.scrollTop += speed;
  }
}

function touchMove(e) {
  if (!touchGhost) return;
  e.cancelable && e.preventDefault();
  const t = lastTouch = e.touches[0];
  const moved = hasTouchMoved(t);
  if (moved && !touchHasMoved) touchHasMoved = true;
  handleDragCancel(moved);
  handleTouchDragging(e, t);
  handleTouchLandingField(t);
  autoScrollInterval ||= setInterval(
    () => lastTouch && ScrollOnEdge(lastTouch),
    80
  );
}


function hasTouchMoved(touch) {
  return Math.abs(touch.clientX - touchStartX) > 10 ||
    Math.abs(touch.clientY - touchStartY) > 10;
}

function handleDragCancel(moved) {
  if (!moved || !dragTimeout) return;

  clearTimeout(dragTimeout);
  dragTimeout = null;
}

function handleTouchDragging(e, touch) {
  if (!touchHasMoved) return;

  if (e.cancelable) e.preventDefault();

  touchGhost.style.left = (touch.clientX - touchOffsetX) + "px";
  touchGhost.style.top = (touch.clientY - touchOffsetY) + "px";
}

function handleTouchClick(card) {
  const taskId = Number(card.id.replace("card-", ""));
  cleanupTouchDrag();
  detailedCardInfo(taskId);
  setTimeout(() => {
    animateDetailedCardIn();
    updateAllContainers();
  }, 10);
}

/**
 * Handles touch end behavior for board cards.
 * - Tap → open task details
 * - Drag → move card between columns
 *
 * @param {TouchEvent} e
 */

function touchEnd(e) {
  clearTimeout(dragTimeout);
  dragTimeout = null;
  if (!touchDraggingCard) return;
  if (!touchHasMoved) {
    e.preventDefault();
    e.stopPropagation();
    return handleTouchClick(touchDraggingCard);
  }
  handleTouchDrop(e);
  if (autoScrollInterval) {
  clearInterval(autoScrollInterval);
  autoScrollInterval = null;
}
}

function handleTouchDrop(e) {
  const touch = e.changedTouches[0];
  const container = getDropContainer(touch);
  if (!container) return cleanupTouchDrag();

  moveCardInContainer(touchDraggingCard, container);
  updateTaskStatusByContainer(touchDraggingCard, container);
  updateContainerTemplate(container);
  cleanupTouchDrag();
}

function getDropContainer(touch) {
  if (!touchGhost) return null;
  const rect = touchGhost.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const target = document.elementFromPoint(x, y);
  return target
    ?.closest(".distribution-progress")
    ?.querySelector(".task-container");
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
  touchHasMoved = false;
  updateAllContainers();
  if (autoScrollInterval) {
  clearInterval(autoScrollInterval);
  autoScrollInterval = null;
}
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