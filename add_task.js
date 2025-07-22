let urgentActive = false;
let mediumActive = false;
let lowActive = false;
let task = [];
let Users = [
    "Anja", "Peter", "Ralf", "Lisa", "Raphael", "Paul",
]


function init() {
    removeRequired();
}

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

    titleInput.addEventListener('input', () => {
        titleInput.classList.remove('submit');
        document.getElementById('required-message-title').innerHTML = "";
    });
    dateInput.addEventListener('input', () => {
        dateInput.classList.remove('submit');
        document.getElementById('required-message-date').innerHTML = "";
    });
}

// Das "this field is required" Feld und die rote Umrandung werden bei Eingabe wieder gelöscht.

function openCalendar() {
    let dateInput = document.getElementById('date-input');
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

function renderCategoryDropdown() {
    let list = document.getElementById('dropdownList')
    list.innerHTML = "Hanlo" 
}