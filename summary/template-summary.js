import { loadData, getTasks } from '../db.js';


/** Navigiert zur gewünschten Seite */
function navigateTo(page) {
    window.location.href = page;
}
window.navigateTo = navigateTo;


/** Erstellt ein To-Do-Kachel-Element */
function createSummaryTodo(icon, number, label, link = './board.html') {
    return `
        <div class="summary-todo" onclick="navigateTo('${link}')">
            <img class="icon-summary" src="${icon}" alt="${label}">
            <div class="number-container">
                <div class="number">${number}</div>
                <span>${label}</span>
            </div>
        </div>
    `;
    
}

/**
 * Erstellt eine Status-Kachel mit nächster Deadline und Info-Text.
 * @param {string|Date} date - Deadline-Datum
 * @param {string} info - Beschreibung oder Info (z. B. "Tasks in Board")
 * @param {string} link - Zielseite beim Klick (Standard: './board.html')
 * @returns {string} - HTML-Template
 */
function createSummaryTaskStatus(date, info, link = './board.html') {
  const deadline = new Date(date);
  const formattedDate = deadline.toLocaleDateString('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <div class="summary-task-status" role="button" tabindex="0" onclick="navigateTo('${link}')">
      <div class="status-left">
        <img class="icon-summary" src="./assets/urgent-icon.png" alt="Urgent icon">
        <div class="number-urgent-container">
          <div class="number">1</div>
          <span class="label">Urgent</span>  
        </div>
      </div>
      
      <img class="vector" src="./assets/Vector 5.png" alt="divider" aria-hidden="true">

      <div class="info-date">
        <span class="date">${formattedDate}</span>
        <span class="info">${info}</span>
      </div>
    </div>
  `;
}


/** Erstellt ein Zähler-Kachel-Element */
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

/** Gibt die Anzahl der Tasks mit bestimmtem Status zurück */
function countTasksByStatus(status) {
    const tasks = getTasks();
    return tasks.filter(task => task.status === status).length;
}

/** Gibt die nächste anstehende Aufgabe mit Deadline zurück */
function getNextDeadlineTask() {
    const today = new Date();
    const tasks = getTasks();

    const upcoming = tasks.filter(t => new Date(t.enddate) >= today);
    upcoming.sort((a, b) => new Date(a.enddate) - new Date(b.enddate));
    return upcoming[0];
}

/** Lädt Daten und rendert die Task-Übersicht */
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
                ${createSummaryTodo('./assets/pencil.svg', todoCount, 'To-Do')}
                ${createSummaryTodo('./assets/check-dark.svg', doneCount, 'Done')}
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
