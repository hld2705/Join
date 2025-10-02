let urgentActive = false;
let mediumActive = false;
let lowActive = false;
let task = [];
let names = [];

function init() {
    removeRequiredTitle();
    removeRequiredCategory();
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

const db = firebase.database();

const FIREBASE_URL = "https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app/"


async function getAllUser(path = "") {
    let response = await fetch(FIREBASE_URL + path + ".json");
    let responseToJson = await response.json();
    let users = Object.values(responseToJson);

    for (let i = 1; i < users.length; i++) {
    }
    return users;
}

let taskFormURL = "/add_task/form_task.html";

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

document.addEventListener('DOMContentLoaded', loadAddTaskForm);

function resetAllButton() {
    document.getElementById('urgent').classList.remove('bg-red');
    document.getElementById('double-arrow').src = "../assets/Prio alta.svg"
    urgentActive = false;

    document.getElementById('medium-input').classList.remove('bg-orange');
    document.getElementById('equal').src = "../assets/Prio media.svg"
    mediumActive = false;

    document.getElementById('low-input').classList.remove('bg-green');
    document.getElementById('double-down').src = "../assets/double-down.svg"
    lowActive = false;
}

function changeUrgentColor() {
    if (urgentActive) {
        resetAllButton();
    } else {
        resetAllButton();
        document.getElementById('urgent').classList.add("bg-red");
        document.getElementById('urgent').classList.add("bg-red::placeholder");
        document.getElementById('double-arrow').src = "../assets/arrows-up-white.png";
        urgentActive = true;
    }
};

function changeMediumColor() {
    if (mediumActive) {
        resetAllButton();
    } else {
        resetAllButton();
        document.getElementById('medium-input').classList.add("bg-orange");
        document.getElementById('medium-input').classList.add("bg-orange::placeholder");
        document.getElementById("equal").src = "../assets/equal-white.svg";
        mediumActive = true;
    }
}

function changeLowColor() {
    if (lowActive) {
        resetAllButton();
    } else {
        resetAllButton();
        document.getElementById('low-input').classList.add("bg-green");
        document.getElementById('low-input').classList.add("bg-green::placeholder");
        document.getElementById("double-down").src = "../assets/double-down-white.svg";
        lowActive = true;
    }
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
    firebase.database().ref('tasks/' + newTask.id).set(newTask)
        .then(() => {
            alert('Task wurde gespeichert');
        })
        .catch((error) => {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern');
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
                id: "st" + index,
                text: text,
                done: false
            });
        }
    });
    return subtasks;
}

function inputBorderColorSwitch(e) {
    let assignInput = document.getElementById('assign-input');
    let categoryInput = document.getElementById('category-input');
    if (e.target.closest('#assign-input')) {
        assignInput.classList.toggle("borderColorBlue");
    }
    if (e.target.closest('#category-input')) {
        categoryInput.classList.toggle("borderColorBlue");
    }
    if (e.target.closest('#assign-input') && categoryInput.classList.contains("borderColorBlue")) {
        categoryInput.classList.remove("borderColorBlue");
    }
};

document.addEventListener("click", inputBorderColorSwitch)

async function renderAssignDropdown(e) {
    if (!e.target.closest('#assign-input')) return;
    let dropdownList = document.getElementById('dropdownList');
    let assignedInput = document.getElementById('assign-input');
    let isOpen = dropdownList.classList.contains('open');
    if (isOpen) {
        dropdownList.classList.remove('open');
        assignedInput.classList.remove('borderColorBlue');
        assignedInput.placeholder = "Select contact to assign";
        assignedInput.readOnly = true;
        switchAssignedArrow();
    } else {
        openAssignDropdown();
    }
};

function openAssignDropdown() {
    let dropdownList = document.getElementById('dropdownList');
    let assignedInput = document.getElementById('assign-input');
    showUserName();
    dropdownList.classList.add('open');
    assignedInput.classList.add('borderColorBlue');
    assignedInput.placeholder = "";
    assignedInput.readOnly = false;
    switchAssignedArrow();
}

document.addEventListener('click', renderAssignDropdown);

function switchAssignedArrow() {
    let arrowIcon = document.getElementById('drop-down-svg-assign');
    let currentSrc = arrowIcon.src;
    if (currentSrc.includes("arrow_drop_down.svg")) {
        arrowIcon.src = "../assets/arrow_drop_down2.svg";
    } else {
        arrowIcon.src = "../assets/arrow_drop_down.svg";
    }
}

function clearAssignedInput() {
    document.getElementById('dropdownList').classList.remove('open');
    document.getElementById('filteredBadgesContainer').innerHTML = "";

    document.querySelectorAll('.Assigned-dropdown-username')
        .forEach(el => el.classList.remove('bg-grey'));
    document.querySelectorAll('.check-button')
        .forEach(el => el.classList.remove("check-button-white"));
    clearAssignedIcon();
};

function clearAssignedIcon() {
    let assignCheckIcon = document.querySelectorAll('.check-icon-assignedTo');
    assignCheckIcon.forEach(el => {
        el.classList.add("hidden");
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

async function handleAssignedSearch(e) {
     if (!e.target.closest('#assign-input')) return;
    let list = document.getElementById('dropdownList');
    if (!list) return;
    if (list.childElementCount === 0) {
        await showUserName();
    }
    filterList(e);
}

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

document.addEventListener('input', handleAssignedSearch);

function toggleAssignedinputContent(e) {
    const isInsideAssigned = e.target.closest('.Assigned-dropdown-username');
    if (!isInsideAssigned) return;
    if (isInsideAssigned) {
        isInsideAssigned.classList.toggle('bg-grey');
        let badge = isInsideAssigned.querySelector('.userBadge');
        let badgeContainer = document.getElementById('filteredBadgesContainer');
        let userId = isInsideAssigned.dataset.userId
        toggleAssignedcheckButton(isInsideAssigned)
        filterBadges(badge, badgeContainer, userId);
    }
}

function toggleAssignedcheckButton(isInsideAssigned) {
    const checkButton = isInsideAssigned.querySelector('.check-button');
    const checkIcon = isInsideAssigned.querySelector('.check-icon-assignedTo');
    if (checkButton) {
        checkIcon.classList.toggle("hidden");
        checkButton.classList.toggle("check-button-white");
    }
}

document.addEventListener("click", toggleAssignedinputContent);

function switchArrowIcon() {
    let arrowIcon = document.getElementById('drop-down-svg-category');
    let currentSrc = arrowIcon.src;

    if (currentSrc.includes("arrow_drop_down.svg")) {
        arrowIcon.src = "../assets/arrow_drop_down2.svg";
    } else {
        arrowIcon.src = "../assets/arrow_drop_down.svg";
    }
}

function closeAssignedInputOutclick(e) {
    if (e.target.id !== 'assign-input' && !e.target.closest('#dropdownList') && document.getElementById('dropdownList').classList.contains('open')) {
        document.getElementById('dropdownList').classList.remove('open');
        document.getElementById('assign-input').classList.remove('borderColorBlue');
        document.getElementById('assign-input').placeholder = "Select contact to assign";
        switchAssignedArrow();
    }
}
document.addEventListener('click', closeAssignedInputOutclick);


function filterBadges(badge, badgeContainer, userId) {
    let existing = badgeContainer.querySelector(`[data-user-id="${userId}"]`);
    if (existing) {
        existing.remove();
        return;
    }
    let clone = badge.cloneNode(true);
    clone.dataset.userId = userId;
    badgeContainer.appendChild(clone);
}

function switchCategoryPlaceholder(e) {
    let dropDownCategory = document.getElementById('category-input')
    let dropdownListCategory = document.getElementById('dropdownListCategory')
    let option = e.target.closest('#technical-task-option, #user-story-option');

    if (option) {
        dropDownCategory.placeholder = option.id === "technical-task-option"
            ? "Technical Task"
            : "User Story";
        dropdownListCategory.classList.remove('open');
        switchArrowIcon();
    }
}


function renderCategoryDropdown(e) {
    let dropdownListCategory = document.getElementById('dropdownListCategory')
    let dropdownSelect = e.target.closest('#category-input')
    let dropDownCategory = document.getElementById('category-input')
    if (dropdownSelect) {
        dropDownCategory.placeholder = "Select task category";
        dropdownListCategory.classList.toggle('open');
    } else if (dropdownListCategory.classList.contains('open')) {
        dropdownListCategory.classList.remove('open');
    }
}

document.addEventListener("click", switchCategoryPlaceholder);
document.addEventListener("click", renderCategoryDropdown);

function clearCategoryInput() {
    let dropDownCategory = document.getElementById('category-input');
    let dropdownListCategory = document.getElementById('dropdownListCategory')
    dropDownCategory.placeholder = "Select task category";
    if (dropdownListCategory) {
        dropdownListCategory.classList.remove('open');
    }
}

let subtaskCounter = 0;

function handleSubtaskOutput(e) {
    let inputfield = document.getElementById('subtask-input');
    if (e.target.closest('#subtask-accept')) {
        handleSubtaskAccept(e);
        inputfield.value = '';
    }
    handleSubtaskCancel(e);
}

function handleSubtaskAccept(e) {
    let inputfield = document.getElementById('subtask-input');
    e.preventDefault();
    let subTaskOutput = document.getElementById('subtask-content');
    document.getElementById('cancel-accept-container').style.display = "none";
    let subtaskInput = inputfield.value.trim();
    if (!subtaskInput) return;
    if (!subTaskOutput.querySelector("ul")) {
        subTaskOutput.innerHTML = `<ul></ul>`;
    }
    let ul = subTaskOutput.querySelector('ul');
    ul.insertAdjacentHTML('beforeend', subtaskOutputTemplate(subtaskInput, subtaskCounter));
    subtaskCounter++;
}

function handleSubtaskCancel(e) {
    let inputfield = document.getElementById('subtask-input');
    if (e.target.closest('#subtask-cancel')) {
        inputfield.value = '';
        document.getElementById('cancel-accept-container').style.display = "none";
    }
}

document.addEventListener('click', handleSubtaskOutput);

function toggleSubtaskFocus(e) {
    if (e.target.closest('#subtask-input')) {
        document.getElementById('subtask-input').classList.add('box-shadow-blue');
    }
    if (!e.target.closest('#subtask-input')) {
        document.getElementById('subtask-input').classList.remove('box-shadow-blue');
    }
}

document.addEventListener('click', toggleSubtaskFocus);

function showSubtaskIcons(e) {
    if (e.target.id === 'subtask-input') {
        if (e.target.value.trim() !== "") {
            document.getElementById('cancel-accept-container').style.display = "flex";
            document.getElementById('subtask-input').classList.add('box-shadow-blue');
        }
    }
}

document.addEventListener('keyup', showSubtaskIcons);

function hideSubtaskIcons(e) {
    if (e.target.id === 'subtask-input') {
        let container = document.getElementById('cancel-accept-container');
        if (!container) return;

        if (e.target.value.trim() === "") {
            container.style.display = "none";
        } else {
            container.style.display = "flex";
        }
    }
}

document.addEventListener('input', hideSubtaskIcons);

function clearSubtaskOutput() {
    let container = document.getElementById('subtask-content');
    if (container) container.innerHTML = "";
}

function handleSubtaskDelete(e) {
    let deleteIcon = e.target.closest('.delete-icon');

    if (!deleteIcon) return;
    let container = deleteIcon.closest('#subtask-content');

    if (!container) return;
    let li = deleteIcon.closest('li.single-subtask');

    if (li) {
        document.getElementById('subtask-input').disabled = false;
        li.remove();
    }
}

document.addEventListener('click', handleSubtaskDelete);

function handleConfirmEditText(li, text, icons, afterEditIcons, inputfield) {
    let newText = text.innerText.trim()
    if (newText === '') {
        li.remove();
        return;
    }
    text.contentEditable = 'false';
    icons.style.display = 'block';
    afterEditIcons.style.display = 'none';
    icons.classList.remove('hidden');
    afterEditIcons.classList.add('hidden');
    li.classList.remove('edit-text');
    inputfield.disabled = false;
}

function handleEditIcon(li, text, icons, afterEditIcons, inputfield) {
    inputfield.disabled = true;
    text.contentEditable = 'true';
    cursorToEnd(text);
    icons.style.display = 'none';
    afterEditIcons.style.display = 'flex';
    icons.classList.add('hidden');
    afterEditIcons.classList.remove('hidden');
    li.classList.add('edit-text');
    li.style.listStyleType = 'none';
}

function handleConfirmEdit(editIcon, acceptIcon, li, text, icons, afterEditIcons, inputfield) {
    if (editIcon) {
        handleEditIcon(li, text, icons, afterEditIcons, inputfield);
    }
    if (acceptIcon) {
        handleConfirmEditText(li, text, icons, afterEditIcons, inputfield);
    }
}

function handleIcons(e) {
    let editIcon = e.target.closest('.edit-icon');
    let acceptIcon = e.target.closest('#edit-accept-icon');
    let li = e.target.closest('li.single-subtask');
    let inputfield = document.getElementById('subtask-input');
    if (!editIcon && !acceptIcon) return;
    let text = li.querySelector('.subtask-text');
    let icons = li.querySelector('.subtask-icons');
    let afterEditIcons = li.querySelector('.edit-subtask-icons');
    handleConfirmEdit(editIcon, acceptIcon, li, text, icons, afterEditIcons, inputfield);
}

document.addEventListener('click', handleIcons);


function cursorToEnd(el) {
    el.focus();
    document.getSelection().collapse(el, 1);
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

    if (categoryInput) {
        categoryInput.addEventListener('input', () => {
            categoryInput.classList.remove('submit');
            document.getElementById('required-message-date').innerHTML = "";
        });
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
        taskAddedStart.style.opacity = "1"
        taskAddedStart.classList.add("task-added-end");
        setTimeout(() => {
            redirectToBoard();
        }, 800);
    }
};

function TaskTransitionRequirement(e) {
    if (e.target.id === 'add-task-button') return
    checkRequiredCategory();
    checkRequiredDate;
    checkRequiredTitle;

    let validTitle = document.getElementById('title-input').checkValidity();
    const validDate = document.getElementById('date-input').checkValidity();
    const validCategory = document.getElementById('category-input').placeholder !== "Select task category";
    let allValid = validTitle && validDate && validCategory;
    if (!allValid) {
        e.preventDefault();
        e.stopPropagation?.();
        return;
    }
    addedTaskTransition(e);
    addNewTask();
};


document.addEventListener("click", addedTaskTransition);

function redirectToBoard() {
    location.assign("../board.html");
}