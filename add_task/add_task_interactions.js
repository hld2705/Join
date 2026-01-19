priority = null;

/**
 * Resets all priority buttons to their default state.
 */
function resetPriorityStyles() {
  document.getElementById('urgent').classList.remove("bg-red");
  document.getElementById('medium-input').classList.remove("bg-orange");
  document.getElementById('low-input').classList.remove("bg-green");
  document.getElementById('double-arrow').src = "./assets/urgent-priority-board.svg";
  document.getElementById('equal').src = "./assets/medium-priority-board.svg";
  document.getElementById('double-down').src = "./assets/low-priority-board.svg";
}

/**
 * Toggles the urgent priority state and updates its visual appearance.
 */
function changePriorityColor(priority) {
  resetPriorityStyles();
  selectedPriority = priority;
  if (priority === "urgent"){
  document.getElementById('urgent').classList.add("bg-red");
  document.getElementById('double-arrow').src = "../assets/arrows-up-white.png";}  
  if (priority === "medium"){
  document.getElementById('medium-input').classList.add("bg-orange");
  document.getElementById("equal").src = "../assets/equal-white.svg";} 
  if (priority === "low") {
  document.getElementById('low-input').classList.add("bg-green");
  document.getElementById("double-down").src = "../assets/double-down-white.svg";} 
}

/**
 * Toggles focus border styles between assign and category inputs.
 *
 * @param {Event} e
 */
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

/**
 * Toggles the assigned users dropdown.
 */
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

/**
 * Opens the assigned users dropdown and prepares input interaction.
 */
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

/**
 * Clears all assigned user selections and resets the assigned input.
 */
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

/**
 * Handles search input for filtering assigned users.
 *
 * @param {Event} e
 */
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

/**
 * Toggles selection state of an assigned user entry.
 *
 * @param {Event} e
 */
function toggleAssignedinputContent(e) {
    let isInsideAssigned = e.target.closest('.Assigned-dropdown-username');
    if (!isInsideAssigned) return;
    isInsideAssigned.classList.toggle('bg-grey');
    let badge = isInsideAssigned.querySelector('.userBadge');
    let badgeContainer = document.getElementById('filteredBadgesContainer');
    let userId = isInsideAssigned.dataset.userId;
    toggleAssignedcheckButton(isInsideAssigned);
    filterBadges(badge, badgeContainer, userId);
    
    getAssignedSpace();
}

function getAssignedSpace() {
    let hasAnySelected = document.querySelector(
        '.Assigned-dropdown-username.bg-grey'
    );
    let categoryContainer = document.getElementById('category-container');
    if (!categoryContainer) return;
    if (hasAnySelected) {
        categoryContainer.classList.add('margin-top20');
    } else {
        categoryContainer.classList.remove('margin-top20');
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

/**
 * Closes the assigned users dropdown when clicking outside.
 *
 * @param {Event} e
 */
function closeAssignedInputOutclick(e) {
    if (e.target.id !== 'assign-input' && e.target.id !== 'drop-down-svg-assign' && !e.target.closest('#dropdownList') && document.getElementById('dropdownList').classList.contains('open')) {
        document.getElementById('dropdownList').classList.remove('open');
        document.getElementById('assign-input').classList.remove('borderColorBlue');
        document.getElementById('assign-input').placeholder = "Select contact to assign";
        switchAssignedArrow();
    }
}

document.addEventListener('click', closeAssignedInputOutclick);

/**
 * Adds or removes a user badge and updates badge visibility.
 *
 * @param {HTMLElement} badge
 * @param {HTMLElement} badgeContainer
 * @param {string} userId
 */
function filterBadges(badge, badgeContainer, userId) {
    const MAX_VISIBLE = 3;
    const existing = badgeContainer.querySelector(`[data-user-id="${userId}"]`);
    if (existing) {
        existing.remove();
        updateBadges(badgeContainer, MAX_VISIBLE);
        return;
    }
    const clone = badge.cloneNode(true);
    clone.dataset.userId = userId;
    badgeContainer.appendChild(clone);
    updateBadges(badgeContainer, MAX_VISIBLE);
}

/**
 * Updates visible badges and applies overflow indicator.
 *
 * @param {HTMLElement} container
 * @param {number} maxVisible
 */
function updateBadges(container, maxVisible) {
    const oldDots = container.querySelector(".badge-dots");
    if (oldDots) oldDots.remove();
    const badges = Array.from(container.children).filter(
        el => !el.classList.contains("badge-dots")
    ); for (let i = 0; i < badges.length; i++) {
        badges[i].style.display = i < maxVisible ? "flex" : "none";
    } if (badges.length > maxVisible) {
        const dots = document.createElement("span");
        dots.className = "badge-dots";
        dots.textContent = "...";
        container.appendChild(dots);
    }
}

/**
 * Sets the selected task category and updates placeholder text.
 *
 * @param {Event} e
 */
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

/**
 * Toggles the category dropdown visibility.
 *
 * @param {Event} e
 */
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

function toggleSubtaskFocus(e) {
    if (e.target.closest('#subtask-input')) {
        document.getElementById('subtask-input').classList.add('box-shadow-blue');
    }
    if (!e.target.closest('#subtask-input')) {
        document.getElementById('subtask-input').classList.remove('box-shadow-blue');
    }
}

document.addEventListener('click', toggleSubtaskFocus);

function renderCheckButton() {
    const checkButton = document.createElement("div");
    checkButton.classList.add("check-button-container");
    checkButton.innerHTML = checkButtonTemplate();
    return checkButton;
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