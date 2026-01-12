let urgentActive = false;
let mediumActive = false;
let lowActive = false;
let task = [];
let names = [];
let taskFormURL = "./add_task/form_task.html";
let subtaskCounter = 0;

function init() {
    removeRequiredTitle();
    loadAddTaskForm();

    setTimeout(() => {
        changeMediumColor();
    }, 50);

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

async function showUserName() {
    let dropList = document.getElementById('dropdownList');
    let users = await getAllUser("/users");
    if (dropList.childElementCount > 0) return;
    users
        .filter(u => u !== null)
        .forEach(u => appendUserItem(dropList, u));
}

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

function openCalendar() {
    let dateInput = document.getElementById('date-input');
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    dateInput.min = formattedToday;

    if (!dateInput) return;

    if (dateInput.showPicker) {
        dateInput.showPicker();
    } else {
        dateInput.focus();
    }
}

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
                continue;
            }
        }
        filteredData[key] = value;
    }

    return firebase.database()
        .ref("tasks/" + oldTask.id)
        .update(filteredData)
        .catch(err => console.error("Task update failed:", err));
}

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
        requiredMessage.style.visibility = "visible";
    } else {
        titleInput.classList.remove('submit');
        requiredMessage.style.visibility = "hidden";
    }
}

document.addEventListener('input', (e) => {
    if (e.target.id !== 'title-input') return;
    checkRequiredTitle();
});

function checkRequiredDate() {
    let dateInput = document.getElementById('date-input');
    let requiredMessage = document.getElementById('required-message-date');
    if (!dateInput.checkValidity()) {
        dateInput.classList.add('submit');
        requiredMessage.style.visibility = "visible";
    } else {
        dateInput.classList.remove('submit');
        requiredMessage.style.visibility = "hidden";
    }
}

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
        requiredMessage.style.visibility = "hidden";
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
    let overlayBg = document.getElementById("task-overlay-background");
    let container = document.getElementById("task-form-container");
    let taskAddedInfo = document.getElementById('task-added-info');
    taskAddedInfo.style.display = "flex"
    setTimeout(() => {
        overlayBg.remove();
        container.innerHTML = "";

        setTimeout(() => {
            taskAddedInfo.style.display = "none";
        }, 0);
    }, 900);

}

function redirectToBoard() {
    if (!isTaskFormValid()) {
        checkRequiredTitle?.();
        checkRequiredDate?.();
        return;}
    if (window.location.href.includes("board.html")) {
        closeTaskOverlay();
        setTimeout(async () => {
            await loadData();
            dragAndDrop();
        }, 300);
    } else {
        location.assign("../board.html");
    }}

function isTaskFormValid() {
    const title = document.getElementById("title-input");
    const date = document.getElementById("date-input");
    return title.value.trim() && date.value.trim();
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
