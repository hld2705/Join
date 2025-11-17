
const boardTaskFormURL = './add_task/form_task.html';
let originalParent;
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

  const emptyImg = new Image();
  emptyImg.src = '';
  ev.dataTransfer.setDragImage(emptyImg, 0, 0);  // das Standard sichtbare Design vom Browser wird entfernt
  originalParent = document.getElementById(`card-${id}`).parentElement; //
  createDraggableCard(ev, id);
}

function createDraggableCard(ev, id) {
  const original = document.getElementById(`card-${id}`);

  lastContainer = original.parentElement;

  original.classList.add("drag-origin"); // das ist opacity: 0.  Damit die Original-Card kurz unsichtbar wird.

  draggableCard = original.cloneNode(true); // kopieren der Karte ohne events, also nur HTML
  draggableCard.classList.add("drag-follow");

  document.body.appendChild(draggableCard); // wird ganz oben im body platziert, weil er sonst von anderen Effekten beeinflusst wird.

  offsetX = ev.offsetX;
  offsetY = ev.offsetY; // damit die Karte direkt dort erscheint wo sie angeklickt wurde (nicht ganz oben im body halt)

  followMouse(ev); // die Karte wird an die Maus gesetzt und bleibt dort "kleben"

  document.addEventListener("dragover", followMouse); // beim bewegen der Maus wird jedes mal aktualisiert
  document.addEventListener("dragend", removeDraggableCard); // Klon wird entfernt wenn Maus losgelassen wird.
}

function followMouse(ev) {
  draggableCard.style.left = (ev.pageX - offsetX) + "px";
  draggableCard.style.top = (ev.pageY - offsetY) + "px"; // quasi einfach die Maus Position minus dem Klick Abstand
}

function removeDraggableCard() {
  if (draggableCard) draggableCard.remove();
  draggableCard = null;
  document.removeEventListener("dragover", followMouse);
  document.removeEventListener("dragend", removeDraggableCard); // denke selbsterklärend
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
  if (!subtasks || subtasks.length === 0) return ["Currently no subtasks available"];

  let rendered = [];
  for (let i = 0; i < subtasks.length; i++) {
    rendered.push({
      name: subtasks[i],
      done: false
    });
  }
  return rendered;
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

  fetch(boardTaskFormURL)
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;
      overlayBg.style.display = "block";
      animateOverlayIn(overlay);
    })
}

function openEditOverlay(taskId) {
  loadEditTaskForm();

  let bg = document.getElementById('edit-overlay-background');
  let formContainer = document.getElementById('edit-task-form-container');
  if (!bg || !formContainer) return;


  setTimeout(() => {
    let task = tasks.find(t => t.id === taskId);
    let badges = renderBadges(task.assigned);
    let subtasksText = "";

    document.getElementById('title-input').value = task.title;
    document.getElementById('description-input').value = task.description;
    document.getElementById('date-input').value = task.enddate;
    document.getElementById('filteredBadgesContainer').innerHTML =
      badges.map((b, index) => `
                            <div class="card-overlay-badge-name-details-container" data-user-id="${task.assigned[index]}">
                            <img class="userBadge" src="${b.badge}" style="border-color:${b.color}">
                            </div>
                            `).join('');

    for (let i = 0; i < task.subtasks.length; i++) {
      let singleTask = task.subtasks[i];
      subtasksText += `${singleTask.text}<br>`;
    }
    let subtaskOutput = document.getElementById('subtask-content');
    subtaskOutput.innerHTML = "<ul></ul>";
    let ul = subtaskOutput.querySelector("ul");

    task.subtasks.forEach((st, index) => {
      ul.insertAdjacentHTML(
        "beforeend",
        subtaskOutputTemplate(st.text, index)
      );
    });

  }, 30);

  closeOverlayCardInstant();
  bg.classList.add('is-open');
  bg.addEventListener('click', function (e) {
    if (e.target === bg) {
      closeEditOverlay();
    }
  })
}

function animateDetailedCardOut(overlay) {
  overlay.classList.remove("is-open");
}

async function closeEditOverlay() {
  let bg = document.getElementById('edit-overlay-background');
  if (!bg) return;
  bg.classList.remove('is-open');

  await editTask();
  await loadData();
  dragAndDrop()

  if (openedCardId !== null) {
    closeOverlayCardInstant();
    detailedCardInfo(openedCardId);
    animateDetailedCardIn();
  }
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