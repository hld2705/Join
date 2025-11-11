const boardTaskFormURL = './add_task/form_task.html';

//---------------------Drag&Drop------------------------
function dragAndDrop() {
  let container = document.getElementById("template-overview");
  const containers = {
    todo: document.getElementById("todo-container"),
    inprogress: document.getElementById("in-progress-container"),
    review: document.getElementById("feedback-container"),
    done: document.getElementById("done-container")
  };

  for(let key in containers){
    if (containers[key]) containers[key].innerHTML = "";
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const container = containers[task.status]
    const badges = Array.isArray(task.assignedBadge) ? task.assignedBadge : [];
    if(container){
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

  for(let key in containers){
    const container = containers[key];
    if(container && container.children.length === 0){
      container.innerHTML = noCardsTemplate();
    }
  }
  renderBadges();
}

function renderBadges(assigned) {
  if (!assigned || assigned.length === 0) {
    return [];
  }
  let badges = [];
  for (let i = 0; i < assigned.length; i++) {
    let userId = typeof assigned[i] === "object" ? assigned[i].id : assigned[i];
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
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function moveTo(ev, newStatus) {
 ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const card = document.getElementById(data);
  const target = ev.currentTarget
  if (!card || !target) return;
  target.appendChild(card);

}
//---------------------Drag&Drop------------------------
function detailedCardInfo(taskId) {
  let body = document.body;
  const task = join.tasks.find(t => t.id === taskId);
  if (!task) return;
  document.body.insertAdjacentHTML("beforeend", detailedCardInfoTemplate(task));
}

function renderSubtask(subtasks) {
  if (!subtasks || subtasks.length === 0) return ["Currently no subtasks available"];

  let rendered = [];
  for (let i = 0; i < subtasks.length; i++) {
    rendered.push({
      name: subtasks[i],
      done: false //möglicher platzhalter?
    });
  }
  return rendered;
}

function deleteCard(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
    }
    const cardElement = document.getElementById(taskId);
    if (!cardElement) return;
    const cardContainer = cardElement.querySelectorAll('.startendcontainer');
    if (cardContainer) {
        cardContainer.innerHTML = noCardsTemplate();
    }
    closeOverlayCard();
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

function openEditOverlay() {
  loadEditTaskForm();
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

function animateDetailedCardOut(overlay) {
  overlay.classList.remove("is-open");
}

function closeEditOverlay() {
  let bg = document.getElementById('edit-overlay-background');

  if (!bg) return;

  bg.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}

function animateDetailedCardIn(overlay) {
  overlay.classList.remove("is-open");
  setTimeout(() => {
    overlay.classList.add("is-open");
  }, 20);
}