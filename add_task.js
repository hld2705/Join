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

async function showUserName() {
    let dropList = document.getElementById('dropdownList');
    let users = await getAllUser("/users");
    dropList.innerHTML = "";

    for (let i = 1; i < users.length; i++) {
        let div = document.createElement("div");
        let name = document.createElement("span");
        let img = document.createElement("img");
        div.classList.add("Assigned-dropdown-username");
        div.id = "userName"
        name.textContent = users[i].name;
        img.src = users[i].badge;
        img.classList.add("userBadge")

        div.appendChild(img);
        div.appendChild(name);
        dropList.appendChild(div);
    }
}

// Es wird pro Name in der Datenbank eine div mit dem Namen und dem Badge generiert und der Checkbutton eingefügt.

document.addEventListener("click", function (e) {
    const isInsideAssigned = e.target.closest('.Assigned-dropdown-username');
    const isInsideCheckbox = e.target.closest('.assignedTo-check-button-container');

    if (isInsideAssigned && !isInsideCheckbox) {
        isInsideAssigned.classList.toggle('bg-grey');
        const checkButton = isInsideAssigned.querySelector('.check-button');
        const checkIcon = isInsideAssigned.querySelector('.check-icon-assignedTo');

        let badge = isInsideAssigned.querySelector('.userBadge');
        let badgeContainer = document.getElementById('filteredBadgesContainer');

        if (checkButton) {
            checkIcon.classList.toggle("hidden");
            checkButton.classList.toggle("check-button-white");
        }
        filterBadges(badge, badgeContainer);
    }

    if (isInsideCheckbox) {
        const checkButton = isInsideCheckbox.querySelector('.check-button');
        const checkIcon = isInsideCheckbox.querySelector('.check-icon-assignedTo');
        if (checkButton && checkIcon) {
            checkIcon.classList.toggle("hidden");
            checkIcon.classList.toggle("check-icon-black");
        }
    }
});

// Wenn auf das div mit dem Username geklickt wird, soll die div markiert werden.

function filterBadges(badge, badgeContainer) {
    let userNames = document.getElementById('dropdownList')
    badgeContainer.innerHTML = "";
    let selectedUsers = document.querySelectorAll('.Assigned-dropdown-username.bg-grey .userBadge');

    if (selectedUsers) {
        badgeContainer.innerHTML += badge.outerHTML;
        return badgeContainer;
    }
};

// machs mir for loop und vorher leeren, dann += verwenden

// Filtert mir die Badges aus dem Dropdownmenü und zeigt sie mir darunter an.



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
    let newTask = {
        "title": title.value,
        "description": description.value,
        "date": date.value,
    };
    task.push(newTask);
    console.log(task);
    title.value = "";
    description.value = "";
    date.value = "";
}

// Werte von Title, Date und Description werden genommen und sollen ausgelesen werden. Werte werden gelöscht wenn der "Clear" Button betätigt wird.

function inputBorderColorSwitch() {
    let assignInput = document.getElementById('assign-input');

    assignInput.classList.toggle("borderColorBlue");
}

function renderAssignDropdown() {
    let arrowIcon = document.getElementById('drop-down-svg-assign');
    let currentSrc = arrowIcon.src;
    let dropdownList = document.getElementById('dropdownList');

    if (currentSrc.includes("arrow_drop_down.svg")) {
        arrowIcon.src = "./assets/arrow_drop_down2.svg";
        dropdownList.classList.add('open');
    } else {
        arrowIcon.src = "./assets/arrow_drop_down.svg";
        dropdownList.classList.remove('open');
    }
}

// Das Assigned to Input wird gerendert und befüllt mit den User Daten aus der Firebase Datenbank.

function renderCategoryDropdown() {
    let arrowIcon = document.getElementById('drop-down-svg-category');
    let currentSrc = arrowIcon.src;
    let dropdownListCategory = document.getElementById('dropdownListCategory');

    if (currentSrc.includes("arrow_drop_down.svg")) {
        arrowIcon.src = "./assets/arrow_drop_down2.svg";
        dropdownListCategory.classList.toggle('open');
    } else {
        arrowIcon.src = "./assets/arrow_drop_down.svg";
        dropdownListCategory.classList.remove('open');
    }
}

// Das Category Input wird gerendert.

const taskFormURL = "form_task.html";

function loadAddTaskForm() {
    fetch(taskFormURL)
        .then(response => response.text())
        .then(html => {
            document.getElementById('task-form-container').innerHTML = html;
        })
        .catch((err) => console.log("Can’t access " + taskFormURL + " response. Blocked by browser?" + err));
}

addEventListener("DOMContentLoaded", () => {
    loadAddTaskForm();
});

// fetched die Daten von meiner form_task.html und fügt sie in meine add_task.html ein.

