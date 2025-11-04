const boardTaskFormURL = './add_task/form_task.html';

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