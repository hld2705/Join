import { createTaskCard } from './board-templates.js';

function renderTasks(tasks) {
  const template = document.getElementById("task-template");

  tasks.forEach(task => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".title").textContent = task.title;
    clone.querySelector(".description").textContent = task.description;

    const tag = clone.querySelector(".tag");
    tag.textContent = task.type;
    tag.className = "tag " + task.type.toLowerCase().replace(/\s+/g, '-');

    const progress = clone.querySelector(".progress");
    if (task.subtasksTotal > 0) {
      const percent = (task.subtasksDone / task.subtasksTotal) * 100;
      progress.style.width = percent + "%";
    } else {
      clone.querySelector(".progress-bar").style.display = "none";
    }

    const avatars = clone.querySelector(".avatars");
    task.assignedTo.forEach(initials => {
      const span = document.createElement("span");
      span.className = "avatar";
      span.textContent = initials;
      avatars.appendChild(span);
    });

    // Füge Karte in richtige Spalte ein
    const column = document.querySelector(`.column[data-status="${task.status}"] .card-container`);
    column.appendChild(clone);
  });
}

renderTasks(tasks);
