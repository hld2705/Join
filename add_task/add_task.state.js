let urgentActive = false;
let mediumActive = false;
let lowActive = false;
let task = [];
let names = [];
let subtaskCounter = 0;

function cursorToEnd(el) {
    el.focus();
    document.getSelection().collapse(el, 1);
}

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}

function getRandomColor() {
    const colors = ["#2A3647", "#29ABE2", "#FF7A00", "#9327FF", "#FC71FF", "#fccc59", "#442c8c", "#fc4444"];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Returns the selected task priority.
 *
 * @returns {string|null}
 */
function getPriority() {
    let activeInput = document.querySelector('.priority-input.bg-green, .priority-input.bg-red, .priority-input.bg-orange');
    return priority = activeInput ? activeInput.dataset.prio : null;
}

/**
 * Returns IDs of all selected assigned users.
 *
 * @returns {Array<string>}
 */
function getAssignedUsers() {
    return Array.from(document.querySelectorAll('.Assigned-dropdown-username.bg-grey'))
        .map(el => el.dataset.userId);
}

/**
 * Collects all subtasks from the DOM.
 *
 * @returns {Array<Object>}
 */
function getSubtasks() {
    let subtaskDivs = document.querySelectorAll('[id^="subtask-text-"]');
    let subtasks = [];
    subtaskDivs.forEach((el, index) => {
        let text = (el.textContent || el.innerText || "").trim();
        if (text) {
            subtasks.push({
                id: "subTask" + index,
                text: text,
                done: false
            });
        }
    });
    return subtasks;
}

/**
 * Returns the selected task category.
 *
 * @returns {string}
 */
function getCategory() {
    let categoryInput = document.getElementById('category-input');
    let categoryPlaceholder = categoryInput.placeholder;
    return category = categoryPlaceholder !== "Select task category" ? categoryPlaceholder : "";
}

function isTaskFormValid() {
    const title = document.getElementById("title-input");
    const date = document.getElementById("date-input");
    return title.value.trim() && date.value.trim();
}

/**
 * Collects input values for creating a new task.
 *
 * @returns {Object} Task input data
 */
function getNewTaskInputs() {
    return {
        title: document.getElementById('title-input').value,
        description: document.getElementById('description-input').value,
        enddate: document.getElementById('date-input').value,
        main: getCategory(),
        subtasks: getSubtasks(),
        priority: getPriority(),
        assigned: getAssignedUsers(),
    };
}

/**
 * Collects input values for editing an existing task.
 *
 * @returns {Object} Task input data
 */
function getEditTaskInputs() {
    const oldTask = tasks.find(t => t.id === openedCardId);
    return {
        title: document.getElementById('title-input').value,
        description: document.getElementById('description-input').value,
        enddate: document.getElementById('date-input').value,
        main: oldTask.main,
        subtasks: getSubtasks(),
        priority: getPriority(),
        assigned: getAssignedUsers(),
    };
}