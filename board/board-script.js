const boardTaskFormURL = './add_task/form_task.html';

//---------------------Drag&Drop------------------------
function dragAndDrop() {
  let container = document.getElementById("template-container");
  container.innerHTML = '';
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const badges = Array.isArray(task.assignedBadge) ? task.assignedBadge : [];
    // Die Zeile über dem hier musste ich so machen, weil mehrere Badges ausgewählt werden müssen wenn nötig. Also quasi, WENN task.assignedBadge ein Array ist, NIMM task.assignedBadge SONST Leeres Array. Die auskommentierten Zeilen unter dem hier, erklären nochmal wie man es noch schreiben kann, kann aber gelöscht werden
    /* if (Array.isArray(task.assignedBadge)) {
   badges = task.assignedBadge;
 } else {
   badges = [];
 } */
    container.innerHTML += dragAndDropTemplate(task.id, task.title, task.main, task.description, task.subtasks, badges);
  }
}
/*
function renderAssignedUsers(){
 let users = await getAllUser("/users");
}*/

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
  //cardsSortment();
});
