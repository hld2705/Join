/**
 * Creates and renders a new subtask entry.
 *
 * @param {Event} e
 */
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

/**
 * Handles subtask input actions such as accept and cancel.
 *
 * @param {Event} e
 */
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

document.addEventListener('click', handleSubtaskOutput);

function handleSubtaskCancel(e) {
    let inputfield = document.getElementById('subtask-input');
    if (e.target.closest('#subtask-cancel')) {
        inputfield.value = '';
        document.getElementById('cancel-accept-container').style.display = "none";
    }
}

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

/**
 * Deletes a subtask entry from the list.
 *
 * @param {Event} e
 */
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
}

/**
 * Handles edit and confirm actions for a subtask.
 *
 * @param {HTMLElement|null} editIcon
 * @param {HTMLElement|null} acceptIcon
 * @param {HTMLElement} li
 * @param {HTMLElement} text
 * @param {HTMLElement} icons
 * @param {HTMLElement} afterEditIcons
 * @param {HTMLInputElement} inputfield
 */
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