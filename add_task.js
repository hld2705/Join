let urgentActive = false;
let mediumActive = false;
let lowActive = false;
let task = [];
let names = [];

function init() {
    removeRequired();
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

// Es werden alle Userdaten aus der Datenbank geholt und als return zurückgegeben.

function resetAllButton() {
    document.getElementById('urgent').classList.remove('bg-red');
    document.getElementById('double-arrow').src = "./assets/Prio alta.svg"
    urgentActive = false;

    document.getElementById('medium-input').classList.remove('bg-orange');
    document.getElementById('equal').src = "./assets/Prio media.svg"
    mediumActive = false;

    document.getElementById('low-input').classList.remove('bg-green');
    document.getElementById('double-down').src = "./assets/double-down.svg"
    lowActive = false;
}

function changeUrgentColor() {
    if (urgentActive) {
        resetAllButton();
    } else {
        resetAllButton();
        document.getElementById('urgent').classList.add("bg-red");
        document.getElementById('urgent').classList.add("bg-red::placeholder");
        document.getElementById('double-arrow').src = "./assets/arrows-up-white.png";
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
        document.getElementById("equal").src = "./assets/equal-white.svg";
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
        document.getElementById("double-down").src = "./assets/double-down-white.svg";
        lowActive = true;
    }
}

// bei der Priority-Kategorie wird die Farbe der Buttons geswitched, je nachdem auf welchen man klickt.

function openCalendar() {
    let dateInput = document.getElementById('date-input');
    let calendarIcon = document.getElementById('calendar-icon')
    let calendar = flatpickr(dateInput, {
        dateFormat: "d.m.Y",

    });
    document.getElementById('calendar-icon').addEventListener('click', () => {
        calendar.open();
    });
}

// Kalendar wird geöffnet 

function addNewTask() {
    let title = document.getElementById('title-input');
    let description = document.getElementById('description-input');
    let date = document.getElementById('date-input');
    let subtask = document.getElementById('subtask-input')
    let newTask = {
        "title": title.value,
        "description": description.value,
        "date": date.value,
        "subtask": subtask.value,
    };
    task.push(newTask);
    title.value = "";
    description.value = "";
    date.value = "";
    subtask.value = "";
    document.getElementById('cancel-accept-container').style.display = "none";
}

// Werte von Title, Date und Description werden genommen und sollen ausgelesen werden. 




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

// Assigned to und Category Inputs bekommen einen blauen Rahmen wenn sie angeklickt werden, und im "Focus" stehen.

function renderAssignDropdown(e) {
    let dropdownList = document.getElementById('dropdownList');
    let assignedInput = document.getElementById('assign-input');
    if (e.target.closest('#assign-input')) {
        switchAssignedArrow();
        dropdownList.classList.toggle('open');
        assignedInput.placeholder = "";
        assignedInput.readOnly = false;
    }
    if (e.target.closest('#assign-input') && !dropdownList.classList.contains('open')) {
        assignedInput.placeholder = "Select contact to assign";
        assignedInput.readOnly = true;
    }

}

document.addEventListener('click', renderAssignDropdown);

function switchAssignedArrow() {
    let arrowIcon = document.getElementById('drop-down-svg-assign');
    let currentSrc = arrowIcon.src;
    if (currentSrc.includes("arrow_drop_down.svg")) {
        arrowIcon.src = "./assets/arrow_drop_down2.svg";
    } else {
        arrowIcon.src = "./assets/arrow_drop_down.svg";
    }
}

function clearAssignedInput() {
    let dropdownList = document.getElementById('dropdownList');
    dropdownList.classList.remove('open');
    let badgeContainer = document.getElementById('filteredBadgesContainer');
    badgeContainer.innerHTML = "";
    let assignBackgroundOnClick = document.querySelectorAll('.Assigned-dropdown-username');
    assignBackgroundOnClick.forEach(el => {
        el.classList.remove('bg-grey');
    });
    let assignCheckIcon = document.querySelectorAll('.check-icon-assignedTo');
    let assignCheckButton = document.querySelectorAll('.check-button');
    assignCheckButton.forEach(el => {
        el.classList.remove("check-button-white");
    });
    assignCheckIcon.forEach(el => {
        el.classList.add("hidden");
    });
};


// Das Assigned to Input wird gerendert und befüllt mit den User Daten aus der Firebase Datenbank.


async function showUserName() {
    let dropList = document.getElementById('dropdownList');
    let users = await getAllUser("/users");

    if (dropList.childElementCount > 0) return;

    for (let i = 1; i < users.length; i++) {
        let div = document.createElement("div");
        let name = document.createElement("span");
        let img = document.createElement("img");
        div.classList.add("Assigned-dropdown-username");
        div.dataset.userId = users[i].id; // gibt jeden Nutzer eine eigene ID. document.querySelectorAll("[data-user-id]") <- so kann ich alle id´s gleichzeitig finden.
        div.dataset.name = users[i].name.toLowerCase();
        name.textContent = users[i].name;
        img.src = users[i].badge;
        img.classList.add("userBadge")

        div.appendChild(img);
        div.appendChild(name);
        dropList.appendChild(div);
        div.appendChild(renderCheckButton())
    }
}



function searchAssignedUser(e) {
    if (e.target.id === "assing-input") {
        if (e.target.value.length <= 3) return;
        if (e.target.value.contains(showUserName())) {
            console.log("hello");
        }
    }
}

document.addEventListener('input', searchAssignedUser);





// Es wird pro Name in der Datenbank eine div mit dem Namen und dem Badge generiert und der Checkbutton eingefügt.

function toggleAssignedinputContent(e) {
    const isInsideAssigned = e.target.closest('.Assigned-dropdown-username');
    const isInsideCheckbox = e.target.closest('.assignedTo-check-button-container');
    if (isInsideAssigned && !isInsideCheckbox) {
        isInsideAssigned.classList.toggle('bg-grey');
        const checkButton = isInsideAssigned.querySelector('.check-button');
        const checkIcon = isInsideAssigned.querySelector('.check-icon-assignedTo');

        let badge = isInsideAssigned.querySelector('.userBadge');
        let badgeContainer = document.getElementById('filteredBadgesContainer');
        let userId = isInsideAssigned.dataset.userId

        if (checkButton) {
            checkIcon.classList.toggle("hidden");
            checkButton.classList.toggle("check-button-white");
        }
        filterBadges(badge, badgeContainer, userId);
    }

    if (isInsideCheckbox) {
        const checkButton = isInsideCheckbox.querySelector('.check-button');
        const checkIcon = isInsideCheckbox.querySelector('.check-icon-assignedTo');
        if (checkButton && checkIcon) {
            checkIcon.classList.toggle("hidden");
            checkIcon.classList.toggle("check-icon-black");
        }
    }
}

document.addEventListener("click", toggleAssignedinputContent);

// Wenn auf das div mit dem Username geklickt wird, soll die div markiert werden.

function switchArrowIcon() {
    let arrowIcon = document.getElementById('drop-down-svg-category');
    let currentSrc = arrowIcon.src;

    if (currentSrc.includes("arrow_drop_down.svg")) {
        arrowIcon.src = "./assets/arrow_drop_down2.svg";
    } else {
        arrowIcon.src = "./assets/arrow_drop_down.svg";
    }
}

function filterBadges(badge, badgeContainer, userId) {
    let existing = badgeContainer.querySelector(`[data-user-id="${userId}"]`); // Wenn Id von der div = Id vom Badge, also wenn das Badge existiert, dann lösch mir das Badge aus dem Container
    if (existing) {
        existing.remove();
        return;
    }
    let clone = badge.cloneNode(true);
    clone.dataset.userId = userId;
    badgeContainer.appendChild(clone);
}

// Filtert mir die Badges aus dem Dropdownmenü und zeigt sie mir darunter an.

function switchInputCursor(e) {
    let assignInput = document.getElementById('assign-input');
    if (e.target.id === 'assign-input') {
        if (assignInput.style.cursor === "text") {
            assignInput.style.cursor = "pointer";
        } else {
            assignInput.style.cursor = "text";
        }
    }
}

document.addEventListener('click', switchInputCursor);

function closeAssignedInputOutclick(e) {
    if (e.target.id !== 'assign-input' && !e.target.closest('#dropdownList') && document.getElementById('dropdownList').classList.contains('open')) {
        document.getElementById('dropdownList').classList.remove('open');
        document.getElementById('assign-input').classList.remove('borderColorBlue');
        document.getElementById('assign-input').placeholder = "Select contact to assign";
        switchAssignedArrow();
    }
}

document.addEventListener('click', closeAssignedInputOutclick);

function switchCategoryPlaceholder(e) {
    let dropDownCategory = document.getElementById('category-input')
    let technicalSelect = e.target.closest('#technical-task-option');
    let userStorySelect = e.target.closest('#user-story-option');
    let dropdownListCategory = document.getElementById('dropdownListCategory')

    if (technicalSelect) {
        dropDownCategory.placeholder = "Technical Task";
        dropdownListCategory.classList.remove('open');
        switchArrowIcon();
    }
    if (userStorySelect) {
        dropDownCategory.placeholder = "User Story";
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

// Das Category Input wird gerendert und der Placeholder wird bei Category geändert, je nachdem wo man drauf klickt


const taskFormURL = "form_task.html";

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
        .catch((err) => console.log("Can’t access " + taskFormURL + " response. Blocked by browser?" + err));
}

document.addEventListener("DOMContentLoaded", () => {
    loadAddTaskForm();
});

// fetched die Daten von meiner form_task.html und fügt sie in meine add_task.html ein.

function handleSubtaskOutput(e) {
    let inputfield = document.getElementById('subtask-input');
    if (e.target.closest('#subtask-accept')) {
        e.preventDefault();
        let subTaskOutput = document.getElementById('subtask-content');
        document.getElementById('cancel-accept-container').style.display = "none";
        let subtaskInput = inputfield.value.trim();
        if (!subtaskInput) return;

        if (!subTaskOutput.querySelector("ul")) {
            subTaskOutput.innerHTML = `<ul></ul>`;
        }
        let ul = subTaskOutput.querySelector('ul');
        ul.insertAdjacentHTML('beforeend', subtaskOutputTemplate(subtaskInput));
        inputfield.value = '';
    }
    if (e.target.closest('#subtask-cancel')) {
        inputfield.value = '';
        document.getElementById('cancel-accept-container').style.display = "none";
    }
}

function subtaskOutputTemplate(text) {
    return `<li  class="single-subtask">
     <div class="single-subtask-container">
     <div>
     <span class="subtask-text">${text}</span>
     </div>
     <div class= subtaskoutput-icon-container>
     <img class="edit-icon" src="./assets/edit.png">
      <img src="./assets/delete.svg">
       </div>
    </li>`;
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
    let subTaskOutput = document.getElementById('subtask-content');
    subTaskOutput.innerHTML = "";
}

function checkRequired() {
    let titleInput = document.getElementById('title-input');
    let dateInput = document.getElementById('date-input');
    let message1 = document.getElementById('required-message-title');
    let message2 = document.getElementById('required-message-date');
    if (!titleInput.checkValidity()) {
        titleInput.classList.add('submit');
        document.getElementById('required-message-title').innerHTML = "This field ist required"
    } else {
        titleInput.classList.remove('submit');
        message1.innerHTML = "";
    }
    if (!dateInput.checkValidity()) {
        dateInput.classList.add('submit');
        document.getElementById('required-message-date').innerHTML = "This field ist required"
    } else {
        dateInput.classList.remove('submit');
        message2.innerHTML = "";
    }
}

// "This field ist required" und eine rote Umrandung werden angezeigt, wenn nichts in "Title" oder "Date" eingegeben wurde.

function removeRequired() {
    let titleInput = document.getElementById('title-input');
    let dateInput = document.getElementById('date-input');

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            titleInput.classList.remove('submit');
            document.getElementById('required-message-title').innerHTML = "";
        });
    }
    if (dateInput) {
        dateInput.addEventListener('input', () => {
            dateInput.classList.remove('submit');
            document.getElementById('required-message-date').innerHTML = "";
        });
    }
}

// Das "this field is required" Feld und die rote Umrandung werden bei Eingabe wieder gelöscht.

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

// Alle Werte werden gelöscht wenn der "Clear" Button betätigt wird.

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

document.addEventListener("click", addedTaskTransition);

function redirectToBoard() {
    location.assign("board.html");
}