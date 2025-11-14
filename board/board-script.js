const boardTaskFormURL = './add_task/form_task.html';

//---------------------Drag&Drop------------------------
function dragAndDrop() {

  const containers = {
    todo: document.getElementById("todo-container"),
    inprogress: document.getElementById("in-progress-container"),
    review: document.getElementById("feedback-container"),
    done: document.getElementById("done-container")
  };

  for (let key in containers) {
    if (containers[key]) containers[key].innerHTML = "";
  }
  console.log("Tasks:", tasks);
  console.log("Statuses in tasks:", tasks.map(t => t.status));
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const container = containers[task.status]
    if (!container) continue;
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
  const target = ev.currentTarget;
  if (!card || !target) return;
  const oldContainer = card.parentElement;

  const emptyTemplate = target.querySelector(".notasks-container");
  if (emptyTemplate) emptyTemplate.remove();

  target.appendChild(card);

  if (oldContainer && oldContainer.children.length === 0) {
    oldContainer.innerHTML = noCardsTemplate();
  }

  updateContainerTemplate(oldContainer);
  updateContainerTemplate(target);
}

function updateContainerTemplate(container) {
  if (!container) return;

  const emptyTemplate = container.querySelector(".notasks-container");
   if (emptyTemplate) emptyTemplate.remove();
  const cards = container.querySelectorAll(".board-card");
 if (cards.length === 0) {
        container.innerHTML = noCardsTemplate();
    }
}

//---------------------Drag&Drop------------------------
function detailedCardInfo(taskId) {
  let body = document.body;
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

function openEditOverlay(taskId) {
  loadEditTaskForm();
  let bg = document.getElementById('edit-overlay-background');
  let formContainer = document.getElementById('edit-task-form-container');
  if (!bg || !formContainer) return;


  setTimeout(() => {
    const task = tasks.find(t => t.id === taskId);

    document.getElementById('title-input').value = task.title;
    document.getElementById('description-input').value = task.description;
    document.getElementById('date-input').value = task.enddate;
   document.getElementById('filteredBadgesContainer').value =  task.assignedUser;

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

function closeEditOverlay() {
  let bg = document.getElementById('edit-overlay-background');
  if (!bg) return;

  bg.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}

function animateDetailedCardIn() {
  let overlay = document.getElementById("card-content");
  overlay.classList.remove("is-open");
  setTimeout(() => {
    overlay.classList.add("is-open");
  }, 20);
}