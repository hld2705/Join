let urgentActive = false;
let mediumActive = false;
let lowActive = false;
let task = [];
let names = [];
let taskFormURL = "/add_task/form_task.html";
let subtaskCounter = 0;

function init() {
    removeRequiredTitle();
    loadAddTaskForm();
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
            }
        })
}

/* function loadEditTaskForm() {
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
        */



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
    div.dataset.badge = user.badge.replace("./", "/");
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
    const taskData = getTaskInputs();
    const newTask = {
        id: Date.now(),
        status: "todo",
        ...taskData,
    };

    return firebase.database().ref('tasks/' + newTask.id).set(newTask)
        .catch((error) => {
            console.error('Task wurde nicht weitergeleitet:', error);
        });
}

function editTask() {
    const editTaskData = getTaskInputs();
    const oldTask = tasks.find(t => t.id === openedCardId);

    const updatedTask = {
        ...oldTask,
        ...editTaskData,
        id: oldTask.id,
    };
    return firebase.database().ref('tasks/' + oldTask.id).update(updatedTask)
        .catch((error) => {
            console.error('Task wurde nicht weitergeleitet:', error);
        });
}

function getTaskInputs() {
    const oldTask = tasks.find(t => t.id === openedCardId);// das auch
    return {
        title: document.getElementById('title-input').value,
        description: document.getElementById('description-input').value,
        date: document.getElementById('date-input').value,
        main: oldTask ? oldTask.main : getCategory(), // Das hab ich hinzugefügt (Halid), wenn nicht würde der task.main immer überschrieben, weil task.main = "" ist, weil der nutzer nichts eingibt
        subtasks: getSubtasks(),
        priority: getPriority(),
        assigned: getAssignedUsers(),
    };
}

function getAssignedUsers() {
    return Array.from(document.querySelectorAll('.Assigned-dropdown-username.bg-grey'))
        .map(el => el.dataset.userId);
}

function getAssignedUserBadge() {
    return Array.from(document.querySelectorAll('.Assigned-dropdown-username.bg-grey'))
        .map(el => el.dataset.badge);
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
    if (!categoryInput || !msg) return; setupIdSwitchingForForms

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

function filterList(e) {
    let inputText = e.target.value.trim().toLowerCase();
    let list = document.getElementById('dropdownList');
    let items = list.querySelectorAll('.Assigned-dropdown-username');
    if (inputText.length < 1) {
        items.forEach(div => div.style.display = '');
        return;
    }
    items.forEach(div => {
        let name = (div.dataset.name || '').toLowerCase();
        div.style.display = name.includes(inputText) ? '' : 'none';
    });
    list.classList.add('open');
}

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

function TaskTransitionRequirement(e) {
    checkRequiredCategory(); checkRequiredDate(); checkRequiredTitle();
    let validTitle = document.getElementById('title-input').checkValidity();
    let validDate = document.getElementById('date-input').checkValidity();
    let validCategory = document.getElementById('category-input').placeholder !== "Select task category";
    let allValid = validTitle && validDate && validCategory;
    if (!allValid) {
        e.preventDefault();
        return;
    }
    addNewTask();
    switchToBoard(e);
};

function switchToBoard(e) {
    if (!window.location.pathname.endsWith('board.html')) {
        addedTaskTransition(e);
    } else {
        redirectToBoard();
    }
}

document.addEventListener("click", (e) => {
    if (e.target.id === 'add-task-button') {
        TaskTransitionRequirement(e);
    }
});

function closeTaskOverlay() {
    const bg = document.getElementById('task-overlay-background');
    const mount = document.getElementById('task-form-container');
    bg?.classList.remove('is-open');
    mount.innerHTML = '';
    document.body.classList.remove('no-scroll');
}

function redirectToBoard() {
    let title = document.getElementById('title-input');
    let date = document.getElementById('date-input');

    if (!title.value.trim() || !date.value.trim()) {
        checkRequiredTitle?.();
        checkRequiredDate?.();
        return;
    }
    if (window.location.href.includes("board.html")) {
        document.getElementById('task-added-info').style.display = "none";
        closeTaskOverlay();
    } else {
        location.assign("../board.html");
    }
}

function setupIdSwitchingForForms() {
    const forms = ['#task-form-container', '#edit-task-form-container'];
    document.addEventListener('pointerdown', function (e) {
        const container = e.target.closest(forms.join(', '));
        if (container) {
            container.dataset.active = 'true';
            forms.forEach(sel => {
                if (sel !== `#${container.id}`) {
                    document.querySelector(sel)?.removeAttribute('data-active');
                }
            });
        }
    }, true);
}

setupIdSwitchingForForms();

function cursorToEnd(el) {
    el.focus();
    document.getSelection().collapse(el, 1);
}
