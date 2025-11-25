


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
    document.getElementById('double-arrow').src = "../assets/arrows-up-white.png";
    urgentActive = true;
  }
}

function changeMediumColor() {
  if (mediumActive) {
    resetAllButton();
  } else {
    resetAllButton();
    document.getElementById('medium-input').classList.add("bg-orange");
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
    document.getElementById("double-down").src = "../assets/double-down-white.svg";
    lowActive = true;
  }
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

async function renderAssignDropdown() {
    let dropdownList = document.getElementById('dropdownList');
    let assignedInput = document.getElementById('assign-input');
    if (dropdownList.classList.contains('open')) {
        dropdownList.classList.remove('open');
        assignedInput.placeholder = "Select contact to assign";
        assignedInput.readOnly = true;
        switchAssignedArrow();
        setTimeout(() => assignedInput.classList.remove('borderColorBlue'), 0);
        return;
    }
    openAssignDropdown();
}


function openAssignDropdown() {
    let dropdownList = document.getElementById('dropdownList');
    let assignedInput = document.getElementById('assign-input');
    showUserName();
    dropdownList.classList.add('open');
    assignedInput.placeholder = "";
    assignedInput.readOnly = false;
    switchAssignedArrow();

    setTimeout(() => {
        assignedInput.classList.add('borderColorBlue');
    }, 0);
}



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

async function handleAssignedSearch(e) {
    if (!e.target.closest('#assign-input')) return;
    let list = document.getElementById('dropdownList');
    if (!list) return;
    if (list.childElementCount === 0) {
        await showUserName();
    }
    filterList(e);
}

document.addEventListener('input', handleAssignedSearch);

function toggleAssignedinputContent(e) {
    let isInsideAssigned = e.target.closest('.Assigned-dropdown-username');
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
    let checkButton = isInsideAssigned.querySelector('.check-button');
    let checkIcon = isInsideAssigned.querySelector('.check-icon-assignedTo');
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
        arrowIcon.src = "./assets/arrow_drop_down2.svg";
    } else {
        arrowIcon.src = "./assets/arrow_drop_down.svg";
    }
}

function closeAssignedInputOutclick(e) {
    if (e.target.id !== 'assign-input' && e.target.id !== 'drop-down-svg-assign' && !e.target.closest('#dropdownList') && document.getElementById('dropdownList').classList.contains('open')) {
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
        document.getElementById('category-input').classList.remove("borderColorBlue");
        switchArrowIcon();
        removeRequiredCategory();
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

function handleSubtaskOutput(e) {
    let inputfield = document.getElementById('subtask-input');
    if (e.target.closest?.('#subtask-accept') || (e.type === 'keydown' && e.key === 'Enter' && e.target.id === 'subtask-input')) {
        e.preventDefault();
        handleSubtaskAccept(e);
        inputfield.value = '';
    }
    handleSubtaskCancel(e);
}

document.addEventListener('keydown', (e) => {
    handleSubtaskOutput(e);
});

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
        clearSubtaskOutput();
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

document.addEventListener('dblclick', (e) => {
    let container = e.target.closest('.single-subtask-container');
    if (!container) return;
    let li = container.closest('li.single-subtask') || container;
    if (!li || li.classList.contains('edit-text')) return;
    let text = li.querySelector('.subtask-text');
    let icons = li.querySelector('.subtask-icons');
    let afterEditIcons = li.querySelector('.edit-subtask-icons');
    let inputfield = document.getElementById('subtask-input');
    if (!text) return;
    handleEditIcon(li, text, icons, afterEditIcons, inputfield);
});

document.addEventListener('click', handleIcons);


