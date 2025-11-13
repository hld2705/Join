function renderCheckButton() {
  let checkButton = document.createElement("div")
  checkButton.classList.add("check-button-container");
  checkButton.innerHTML = `<div class="assignedTo-check-button-container">
    <svg class="check-button-svg" width="20" height="22" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect class="check-button" x="4" y="4" width="12" height="18" rx="3" stroke="#2A3647" stroke-width="2"/>
</svg>
<svg class="check-icon-assignedTo hidden" width="14" height="12" viewBox="0 0 18 14" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke="white"
                                d="M5.61905 9.15L14.0941 0.675C14.2941 0.475 14.5316 0.375 14.8066 0.375C15.0816 0.375 15.3191 0.475 15.5191 0.675C15.7191 0.875 15.8191 1.1125 15.8191 1.3875C15.8191 1.6625 15.7191 1.9 15.5191 2.1L6.31905 11.3C6.11905 11.5 5.88572 11.6 5.61905 11.6C5.35239 11.6 5.11905 11.5 4.91905 11.3L0.619055 7C0.419055 6.8 0.323221 6.5625 0.331555 6.2875C0.339888 6.0125 0.444055 5.775 0.644055 5.575C0.844055 5.375 1.08155 5.275 1.35655 5.275C1.63155 5.275 1.86905 5.375 2.06905 5.575L5.61905 9.15Z"
                                fill="white" />
                                </div>`
  return checkButton;
}

function subtaskOutputTemplate(text, i) {
  return `
    <li class="single-subtask" data-subtask-id="${i}">
       <div class="single-subtask-container">
        <div>
          <span id="subtask-text-${i}" class="subtask-text">${text}</span>
        </div>

        <div  class="subtask-icons subtaskoutput-icon-container">
          <img class="edit-icon" src="../assets/edit.png" alt="edit">
          <img class="delete-icon" src="../assets/delete.svg" alt="delete">
        </div>
        
        <div class="edit-subtask-icons hidden">
          <img id="edit-delete-icon" class="delete-icon" src="../assets/delete.svg" alt="delete">
            <div class="divider"></div>
          <img id="edit-accept-icon" class="subtask-check-svg" src="../assets/check-grey.svg" alt="accept">
        </div>
      </div>
    </li>`;
}

function badgeOverlay() {
  document.getElementById('badge-overlay').classList.toggle('show');
}

function overlayTemplateValues() {
  let test = document.getElementById('test')
  let task = getTaskInputs();
  let title = document.getElementById('title-input')
  let subtasksText = '';
  for (let i = 0; i < task.subtasks.length; i++) {
    let singleTask = task.subtasks[i];
    subtasksText += `${singleTask.id}: ${singleTask.text} (done: ${singleTask.done})<br>`;
  }

  if (title) title.value = task.title;

  if (test) {
    test.innerHTML = `<div>
    Title: ${task.title}<br>
    Description: ${task.description}<br>
    Date: ${task.date}<br>
    Category: ${task.category}<br>
    Priority: ${getPriority()}<br>
    Assigned: ${task.assignedUser}<br>
    Subtasks: ${subtasksText}
    </div>`;
  }
}
