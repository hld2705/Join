/**
 * Loads all tasks and renders the amount of tasks with status "todo"
 * into the summary To-Do card.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getToDo() {
  await loadData();
  const todoTasks = tasks.filter(todo => todo.status === "todo");
  const ToDoCard = document.getElementById("summary-To-do");

  ToDoCard.innerHTML = `
    <div class="summary-todo">
      <div class="icon-to-do">
        <svg width="34" height="30" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_361727_4286" style="mask-type:alpha"
                maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="34">
            <rect width="34" height="34" fill="#D9D9D9"/>
          </mask>
          <g mask="url(#mask0_361727_4286)">
            <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 
                     8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 
                     17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 
                     2.94167 19.275 3.325L20.675 4.725C21.0583 
                     5.10833 21.2583 5.57083 21.275 6.1125C21.2917 
                     6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 
                     10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z"
                  fill="white"/>
          </g>
        </svg>
      </div>
      <div class="done-text-container">
        <h1 class="task-count">${todoTasks.length}</h1>
        <span>TO-DO</span>
      </div>
    </div>
  `;
}

function doneTasksTemplate(count) {
  return `
    <div class="summary-todo">
      <div class="icon-summary">
        <svg class="check-icon" width="37" height="30" viewBox="0 0 37 30" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 14.566L14.7288 25.6321L33.4434 3.5"
            stroke="white" stroke-width="7"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
    <div class="done-text-container">
      <h1 class="task-count">${count}</h1>
      <span>Done</span>
    </div>
  `;
}

function welcomeTemplate(greeting, name) {
  return `
    <div style="height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <h1>${greeting}</h1>
      <h1 style="color:#29ABE2;">${name}</h1>
    </div>
  `;
}

function urgentTemplate(count) {
    return `
        <img src="./assets/urgent-icon.png">
        <div class="done-text-container">
            <h1 class="task-count">${count}</h1>
            <span>Urgent</span>
        </div>
    `;
}

/**
 * Renders a summary card with a task count.
 */
function renderSummaryCard(containerId, count, labelHtml) {
    const el = document.getElementById(containerId);
    el.innerHTML = `
        <div class="overview-box-wrapper">
            <h1 class="task-count">${count}</h1>
            <span>${labelHtml}</span>
        </div>
    `;
}

function nextDeadlineTemplate(formattedDate) {
    return `
        <h1 class="urgent-date-text">${formattedDate}</h1>
        <span>Upcoming deadline</span>
    `;
}