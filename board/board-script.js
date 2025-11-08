const boardTaskFormURL = './add_task/form_task.html';

//---------------------Drag&Drop------------------------
function dragAndDrop() {
  let container = document.getElementById("template-container");
  container.innerHTML = '';
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const badges = Array.isArray(task.assignedBadge) ? task.assignedBadge : [];

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
  ev.dataTransfer.setData("text", id);
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function moveTo(ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text");
  const dragged = document.getElementById(id);
  const target = ev.target.closest('.startendcontainer');
  if (target) target.appendChild(dragged);
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
  if (close) {
    close.remove();
  }
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
    .catch(err => console.error("Fehler beim Laden von addTask:", err));
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
  let bg = document.getElementById('edit-overlay-background');
  let formContainer = document.getElementById('edit-task-form-container');
  if (!bg || !formContainer) return;

  closeOverlayCard()

  bg.classList.add('is-open');
  loadEditTaskForm();

  bg.addEventListener('click', function (e) {
    if (e.target === bg) {
      closeEditOverlay();
    }
  })

}

function closeEditOverlay() {
  let bg = document.getElementById('edit-overlay-background');

  if (!bg) return;

  bg.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}