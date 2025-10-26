let urgentActive = false;
let mediumActive = false;
let lowActive = false;
let task = [];
let names = [];
let taskFormURL = "/add_task/form_task.html";
let subtaskCounter = 0;

function init() {
    removeRequiredTitle();
    removeRequiredDate();
    getAllUser("/users")
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

async function getAllUser(path = "") {
    let response = await fetch(FIREBASE_URL + path + ".json");
    let responseToJson = await response.json();
    let users = Object.values(responseToJson);

    for (let i = 1; i < users.length; i++) {
    }
    return users;
}

function loadAddTaskForm() {
    fetch(taskFormURL)
        .then(response => response.text())
        .then(html => {
            let formContainer = document.getElementById('task-form-container');
            if (!formContainer) return;
            if (formContainer) {
                formContainer.innerHTML = html;
                let btn = document.getElementById('add-task-button');
                btn.addEventListener('click', addNewTask);
            }
        })
}

function loadEditTaskForm() {
    fetch(taskFormURL)
        .then(response => response.text())
        .then(html => {
            let formContainer = document.getElementById('edit-task-form-container');
            if (!formContainer) return;
            if (formContainer) {
                formContainer.innerHTML = html;
            }
        });
}

async function showUserName() {
    let dropList = document.getElementById('dropdownList');
    let users = await getAllUser("/users");

    if (dropList.childElementCount > 0) return;

    for (let i = 1; i < users.length; i++) {
        appendUserItem(dropList, users[i]);
    }
}

function appendUserItem(dropList, user) {
    let div = document.createElement("div");
    let name = document.createElement("span");
    let img = document.createElement("img");
    div.classList.add("Assigned-dropdown-username");
    div.dataset.userId = user.id;
    div.dataset.name = user.name.toLowerCase();
    name.textContent = user.name;
    img.src = user.badge.replace("./", "/");
    img.classList.add("userBadge");
    div.append(img, name, renderCheckButton());
    dropList.appendChild(div);
}

function openCalendar() {
    let dateInput = document.getElementById('date-input');
    if (!dateInput) return;

    if (dateInput.showPicker) {
        dateInput.showPicker();
    } else {
        dateInput.focus();
    }
}

function addNewTask() {
    let taskData = getTaskInputs();
    let newTask = {
        id: Date.now(),
        taskData,
    };
    return firebase.database().ref('tasks/' + newTask.id).set(newTask)
        .catch((error) => {
            console.error('Task wurde nicht weitergeleitet:', error);
        })
};

function getTaskInputs() {
    return {
        title: document.getElementById('title-input').value,
        description: document.getElementById('description-input').value,
        date: document.getElementById('date-input').value,
        category: getCategory(),
        subtasks: getSubtasks(),
        priority: getPriority(),
        assignedUser: getAssignedUsers(),
    };
}

function getAssignedUsers() {
    return Array.from(document.querySelectorAll('.Assigned-dropdown-username.bg-grey'))
        .map(el => el.dataset.name);
}

function getPriority() {
    let activeInput = document.querySelector('.priority-input.bg-green, .priority-input.bg-red, .priority-input.bg-orange');
    return priority = activeInput ? activeInput.dataset.prio : null;
}

function getCategory() {
    let categoryInput = document.getElementById('category-input');
    let categoryPlaceholder = categoryInput.placeholder;
    return category = categoryPlaceholder !== "Select task category" ? categoryPlaceholder : "";
}

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

function checkRequiredTitle() {
    let titleInput = document.getElementById('title-input');
    let requiredMessage = document.getElementById('required-message-title');
    if (!titleInput.checkValidity()) {
        titleInput.classList.add('submit');
        document.getElementById('required-message-title').innerHTML = "This field is required"
    } else {
        titleInput.classList.remove('submit');
        requiredMessage.innerHTML = "";
    }
}

function checkRequiredDate() {
    let dateInput = document.getElementById('date-input');
    let requiredMessage = document.getElementById('required-message-date');
    if (!dateInput.checkValidity()) {
        dateInput.classList.add('submit');
        document.getElementById('required-message-date').innerHTML = "This field is required"
    } else {
        dateInput.classList.remove('submit');
        requiredMessage.innerHTML = "";
    }
}

function checkRequiredCategory() {
    let categoryInput = document.getElementById('category-input');
    let requiredMessage = document.getElementById('required-message-date');
    if (categoryInput.placeholder === "Select task category") {
        categoryInput.classList.add('submit');
        document.getElementById('required-message-category').innerHTML = "This field is required"
    } else {
        categoryInput.classList.remove('submit');
        requiredMessage.innerHTML = "";
    }
}

function removeRequiredTitle() {
    let titleInput = document.getElementById('title-input');

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            titleInput.classList.remove('submit');
            document.getElementById('required-message-title').innerHTML = "";
        });
    }
}

function removeRequiredDate() {
    let dateInput = document.getElementById('date-input');

    if (dateInput) {
        dateInput.addEventListener('input', () => {
            dateInput.classList.remove('submit');
            document.getElementById('required-message-date').innerHTML = "";
        });
    }
}

function removeRequiredCategory() {
    let categoryInput = document.getElementById('category-input');
    let msg = document.getElementById('required-message-category');
    if (!categoryInput || !msg) return;

    if (categoryInput.placeholder !== "Select task category") {
        categoryInput.classList.remove("submit");
        msg.textContent = "";
    }
}

function clearAllInputs() {
    let title = document.getElementById('title-input');
    let description = document.getElementById('description-input');
    let date = document.getElementById('date-input');
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
    if (e.target.id !== 'add-task-button') return;
    checkRequiredCategory(); checkRequiredDate(); checkRequiredTitle();
    let validTitle = document.getElementById('title-input').checkValidity();
    let validDate = document.getElementById('date-input').checkValidity();
    let validCategory = document.getElementById('category-input').placeholder !== "Select task category";
    let allValid = validTitle && validDate && validCategory;
    if (!allValid) {
        e.preventDefault();
        e.stopPropagation?.();
        return;
    }
    addedTaskTransition(e);
    addNewTask();
};

document.addEventListener("click", TaskTransitionRequirement);

function redirectToBoard() {
    let title = document.getElementById('title-input');
    let date = document.getElementById('date-input');

    if (!title.value.trim() || !date.value.trim()) {
        checkRequiredTitle?.();
        checkRequiredDate?.();
        return;
    }
    location.assign("../board.html");
}

function setupIdSwitchingForForms() {
    let originalGetElementById = document.getElementById.bind(document);
    let currentFormContainer = null;
    document.addEventListener('pointerdown', function (e) {
        let container = e.target.closest('#task-form-container, #edit-task-form-container');
        if (container) currentFormContainer = container;
    }, true);
    document.getElementById = function (id) {
        if (currentFormContainer) {
            let cont = currentFormContainer.querySelector('#' + id);
            if (cont) return cont;
        }
        return originalGetElementById(id);
    };
}

setupIdSwitchingForForms();


