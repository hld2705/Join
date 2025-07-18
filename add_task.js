let urgentActive = false;
let mediumActive = false;
let lowActive = false;

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