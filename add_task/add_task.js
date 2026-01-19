let taskFormURL = "./add_task/form_task.html";
let priority = 'medium';

/**
 * Initializes the add task view and loads required data.
 */
function init() {
    removeRequiredTitle();
    loadAddTaskForm();
    removeRequiredDate();
    getAllUser("/users");
}

const firebaseConfig = {
    apiKey: "AIzaSyDaAKocqkIROo_InISQbRjsoG8z1JCK3g0",
    authDomain: "join-gruppenarbeit-75ecf.firebaseapp.com",
    databaseURL: "https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-gruppenarbeit-75ecf",
    storageBucket: "join-gruppenarbeit-75ecf.firebasestorage.app",
    messagingSenderId: "180158531840",
    appId: "1:180158531840:web:c894124a7d6eb515364be5",
    measurementId: "G-5R563MH52P"
};

firebase.initializeApp(firebaseConfig);
const FIREBASE_URL = "https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app/"

/**
 * Fetches all users from Firebase.
 *
 * @param {string} path - Firebase path
 * @returns {Promise<Array<Object>>} Array of user objects
 */
async function getAllUser(path = "") {
    let response = await fetch(FIREBASE_URL + path + ".json");
    let data = await response.json();
    if (!data) return [];

    return Object.entries(data).map(([id, user]) => ({
        id,
        ...user,
        color: user.badge?.color ?? user.color ?? null
    }));
}

/**
 * Loads the add task form HTML into the DOM.
 */
function loadAddTaskForm() {
    fetch(taskFormURL)
        .then(response => response.text())
        .then(html => {
            let formContainer = document.getElementById('task-form-container');
            if (!formContainer) return;
            if (formContainer) {
                formContainer.innerHTML = html;
            }
            setPriorityOnLoad();
        })
}

/**
 * Renders all users into the assigned users dropdown.
 */
async function showUserName() {
    let dropList = document.getElementById('dropdownList');
    let users = await getAllUser("/users");
    if (dropList.childElementCount > 0) return;
    users
        .filter(u => u !== null)
        .forEach(u => appendUserItem(dropList, u));
}

/**
 * Appends a user entry to the assigned users dropdown.
 *
 * @param {HTMLElement} dropList
 * @param {Object} user
 */
function appendUserItem(dropList, user) {
    let div = document.createElement("div");
    let name = document.createElement("span");
    div.classList.add("Assigned-dropdown-username");
    div.dataset.userId = user.id;
    div.dataset.name = user.name.toLowerCase();
    name.textContent = user.name;
    let badge = document.createElement("div");
    badge.classList.add("userBadge", "userBadgeCircle");
    badge.textContent = user.badge?.text || getInitials(user.name);
    badge.style.backgroundColor = user.color;
    div.append(badge, name, renderCheckButton());
    dropList.appendChild(div);
}

/**
 * Opens the date picker and restricts selection to future dates.
 */
function openCalendar() {
    let dateInput = document.getElementById('date-input');
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    dateInput.min = formattedToday;
    if (!dateInput) return;
    if (dateInput.showPicker) {
        dateInput.showPicker();
    } else {dateInput.focus();}
}

/**
 * Locks the onload function for the priority to be already preset to medium
 */
function setPriorityOnLoad(){
    changePriorityColor("medium");
}

/**
 * Creates a new task and stores it in Firebase.
 *
 * @returns {Promise<void>}
 */
function addNewTask() {
    const taskData = getNewTaskInputs();
    const newTask = {
        id: Date.now(),
        status: window.currentTaskColumn || "todo",
        ...taskData,
    };
    return firebase.database().ref('tasks/' + newTask.id).set(newTask)
        .catch((error) => {
            console.error('Task wurde nicht weitergeleitet:', error);
        });
}

/**
 * Updates an existing task with edited values.
 *
 * @returns {Promise<void>}
 */
function editTask() {
    const editTaskData = getEditTaskInputs();
    const oldTask = tasks.find(t => t.id === openedCardId);
    const filteredData = {};
    for (const key in editTaskData) {
        const value = editTaskData[key];
        if (key === "main") continue;
        if (value === "" || value === undefined || value === null) continue;
        if (key === "assigned") {
        if (Array.isArray(value) && value.length === 0) {
            continue;}}filteredData[key] = value;}
    return firebase.database()
        .ref("tasks/" + oldTask.id)
        .update(filteredData)
        .catch(err => console.error("Task update failed:", err));
}

function getAssignedUserBadge() {
    return Array.from(document.querySelectorAll('.Assigned-dropdown-username.bg-grey'))
        .map(el => el.dataset.badge);
}

/**
 * Validates the title input field and toggles
 * the required error message and submit styling.
 * Uses native HTML5 form validation via `checkValidity()`.
 * @returns {void}
 */
function checkRequiredTitle() {
    let titleInput = document.getElementById('title-input');
    let requiredMessage = document.getElementById('required-message-title');
    let value = titleInput.value.trim();

    if (!value) {
        titleInput.classList.add('submit');
        requiredMessage.style.visibility = "visible";
        return false;
    } else {
        titleInput.classList.remove('submit');
        requiredMessage.style.visibility = "hidden";
        return true;
    }
}

document.addEventListener('input', (e) => {
    if (e.target.id !== 'title-input') return;
    checkRequiredTitle();
});

/**
 * Validates the date input field and toggles
 * the required error message and submit styling.
 * Uses native HTML5 form validation via `checkValidity()`.
 * @returns {void}
 */
function checkRequiredDate() {
    let dateInput = document.getElementById('date-input');
      let requiredMessage = document.getElementById('required-message-date');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!dateInput.checkValidity() || selectedDate < today) {
        dateInput.classList.add('submit');
        requiredMessage.style.visibility = "visible";
        requiredMessage.innerText = "Date must not be in the past";
    } else {
        dateInput.classList.remove('submit');
        requiredMessage.style.visibility = "hidden";
    }}

document.addEventListener('change', (e) => {
    if (e.target.id !== 'date-input') return;
    checkRequiredDate();
});

function checkRequiredCategory() {
    let categoryInput = document.getElementById('category-input');
    let requiredMessage = document.getElementById('required-message-category');
    if (categoryInput.placeholder === "Select task category") {
        categoryInput.classList.add('submit');
        requiredMessage.style.visibility = "visible";
    } else {
        categoryInput.classList.remove('submit');
        requiredMessage.style.visibility = "hidden";}
}

function removeRequiredTitle() {
    let titleInput = document.getElementById('title-input');
    if (titleInput) {
        titleInput.addEventListener('input', () => {
            titleInput.classList.remove('submit');
            document.getElementById('required-message-title').innerHTML = "";});}
}

function removeRequiredDate() {
    let dateInput = document.getElementById('date-input');
    if (dateInput) {
        dateInput.addEventListener('input', () => {
            dateInput.classList.remove('submit');
            document.getElementById('required-message-date').innerHTML = "";});}
}

function removeRequiredCategory() {
    let categoryInput = document.getElementById('category-input');
    if (categoryInput.placeholder !== "Select task category") {
        categoryInput.classList.remove("submit");
        document.getElementById('required-message-category').style.visibility = "hidden";
    }
}

function clearAllInputs() {
    let title = document.getElementById('title-input');
    let description = document.getElementById('description-input');
    let date = document.getElementById('date-input');
    document.getElementById('required-message-title').style.visibility = "hidden";
    document.getElementById('required-message-date').style.visibility = "hidden";
    document.getElementById('required-message-category').style.visibility = "hidden";
    document.getElementById('category-input').classList.remove('submit');
    title.classList.remove('submit');
    date.classList.remove('submit');
    title.value = "";
    description.value = "";
    date.value = "";
}

function clearAll(e) {
    if (e.target.closest('#clear-button')) {
        clearAllInputs();
        resetAllButton();
        clearAssignedInput();
        clearCategoryInput();
        clearSubtaskOutput();
    }
}

document.addEventListener('click', clearAll);

function filterList(e) {
    let inputText = e.target.value.trim().toLowerCase();
    let list = document.getElementById('dropdownList');
    let items = list.querySelectorAll('.Assigned-dropdown-username');
    if (inputText.length < 1) {
        items.forEach(div => div.style.display = '');
        return;}
    items.forEach(div => {
        let name = (div.dataset.name || '').toLowerCase();
        div.style.display = name.includes(inputText) ? '' : 'none';});
    list.classList.add('open');
}

/**
 * Handles the visual transition after a task is added
 * and redirects to the board view once the animation finishes.
 *
 * Triggered by clicking the "add task" button.
 *
 * @param {Event} e - The click event triggered by the add task action.
 * @returns {void}
 */
function addedTaskTransition(e) {
    if (e.target.id === 'add-task-button') {
        let taskAddedStart = document.getElementById('task-added-info');
        taskAddedStart.style.visibility = "visible";
        taskAddedStart.style.opacity = "1";
        taskAddedStart.classList.add("task-added-end");
        setTimeout(() => {
            redirectToBoard();
        }, 800);
    }
};

function TaskTransitionRequirement(e) {
    e.preventDefault();
}

/**
 * Validates form inputs and triggers task creation.
 *
 * @param {Event} e
 */
function TaskTransitionRequirement(e) {
    checkRequiredCategory(); checkRequiredDate(); checkRequiredTitle();
   const titleInput = document.getElementById('title-input');
    let validTitle = titleInput.checkValidity() && titleInput.value.trim().length > 0;
    let validDate = document.getElementById('date-input').checkValidity();
    let validCategory = document.getElementById('category-input').placeholder !== "Select task category";
    let allValid = validTitle && validDate && validCategory;
    if (!allValid) {
        e.preventDefault();
        return;}
    addNewTask();
    switchToBoard(e);
};

function switchToBoard(e) {
    if (!window.location.pathname.endsWith('board.html')) {
        addedTaskTransition(e);
    } else {redirectToBoard();}
}

document.addEventListener("click", (e) => {
    if (e.target.id === 'add-task-button') {
        TaskTransitionRequirement(e);
    }
});

function closeTaskOverlay() {
    let overlayBg = document.getElementById("task-overlay-background");
    let container = document.getElementById("task-form-container");
    let taskAddedInfo = document.getElementById('task-added-info');
    taskAddedInfo.style.display = "flex"
    setTimeout(() => {
        overlayBg.remove();
        container.innerHTML = "";
        setTimeout(() => {
        taskAddedInfo.style.display = "none";}, 0);}, 900);
}

/**
 * Redirects to board view after task creation.
 */
function redirectToBoard() {
    if (!isTaskFormValid()) {
        checkRequiredTitle?.();
        checkRequiredDate?.();
        return;}
    if (window.location.href.includes("board.html")) {
        closeTaskOverlay();
        setTimeout(async () => {
            await loadData();
            dragAndDrop();}, 300);
    } else {location.assign("../board.html");}}

function setupIdSwitchingForForms() {
    const forms = ['#task-form-container', '#edit-task-form-container'];
    document.addEventListener('pointerdown', function (e) {
        const container = e.target.closest(forms.join(', '));
        if (container) {
            container.dataset.active = 'true';
            forms.forEach(sel => {
                if (sel !== `#${container.id}`) {
                    document.querySelector(sel)?.removeAttribute('data-active');}});}}, true);
}

setupIdSwitchingForForms();

