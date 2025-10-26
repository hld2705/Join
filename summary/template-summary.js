import { loadData, getTasks } from '../db.js';

<<<<<<< Updated upstream
=======
/** Navigiert zur gewünschten Seite */
>>>>>>> Stashed changes
function navigateTo(page) {
    window.location.href = page;
}
window.navigateTo = navigateTo;

<<<<<<< Updated upstream
=======
/** Erstellt ein To-Do-Kachel-Element */
>>>>>>> Stashed changes
function createSummaryTodo(icon, number, label, link = './board.html') {
    return `
        <div class="summary-todo" onclick="navigateTo('${link}')">
            <div class="icon-summary">
                <img src="${icon}" alt="${label}">
            </div>
            <div class="number-container">
                <div class="number">${number}</div>
                <span>${label}</span>
            </div>
        </div>
    `;
}

<<<<<<< Updated upstream
=======
/**
 * Erstellt eine Status-Kachel mit nächster Deadline und Info-Text.
 * @param {string|Date} date - Deadline-Datum
 * @param {string} info - Beschreibung oder Info (z. B. "Tasks in Board")
 * @param {string} link - Zielseite beim Klick (Standard: './board.html')
 * @returns {string} - HTML-Template
 */
>>>>>>> Stashed changes
function createSummaryTaskStatus(date, info, link = './board.html') {
  const deadline = new Date(date);
  const formattedDate = isNaN(deadline) ? '' : deadline.toLocaleDateString('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <div class="summary-task-status" role="button" tabindex="0" onclick="navigateTo('${link}')">
      <div class="status-left">
        <div class="icon-summary">
          <img src="./assets/pencil2.svg" alt="Urgent icon">
        </div>
        <div class="number-urgent-container">
          <div class="number">1</div>
          <span class="label">Urgent</span>  
        </div>
      </div>
      
      <img class="vector" src="./assets/Vector%205.png" alt="divider" aria-hidden="true">

      <div class="info-date">
        <span class="date">${formattedDate}</span>
        <span class="info">${info}</span>
      </div>
    </div>
  `;
}

<<<<<<< Updated upstream
=======
/** Erstellt ein Zähler-Kachel-Element */
>>>>>>> Stashed changes
function createSummaryCount(number, label, link = './board.html') {
    return `
        <div class="count" onclick="navigateTo('${link}')">
            <div class="number-container">
                <div class="number">${number}</div>
                <span>${label}</span>
            </div>
        </div>
    `;
}

function countTasksByStatus(status) {
    const tasks = getTasks();
    return tasks.filter(task => task.status === status).length;
}

function getNextDeadlineTask() {
    const today = new Date();
    const tasks = getTasks();

    const upcoming = tasks.filter(t => new Date(t.enddate) >= today);
    upcoming.sort((a, b) => new Date(a.enddate) - new Date(b.enddate));
    return upcoming[0];
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadData();
    console.log("Tasks nach loadData:", getTasks());

    const taskContainer = document.querySelector(".task");

    const todoCount = countTasksByStatus('todo');
    const doneCount = countTasksByStatus('done');
    const inProgress = countTasksByStatus('inProgress');
    const feedback = countTasksByStatus('feedback');
    const total = getTasks().length;
    const deadlineTask = getNextDeadlineTask();

    taskContainer.innerHTML = `
        <div class="summary-content"> 
            <div class="todo">
                ${createSummaryTodo('./assets/pencil2.svg', todoCount, 'To-Do')}
                ${createSummaryTodo('./assets/check1.svg', doneCount, 'Done')}
            </div>

            ${deadlineTask 
                ? createSummaryTaskStatus(deadlineTask.enddate, deadlineTask.title)
                : '<div class="summary-task-status">Keine anstehende Deadline</div>'
            }

            <div class="summary-count">
                ${createSummaryCount(total, 'Tasks in Board')}
                ${createSummaryCount(inProgress, 'Task in Progress')}
                ${createSummaryCount(feedback, 'Awaiting Feedback')}
            </div>
        </div>
    `;
});



