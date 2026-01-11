function dragAndDropTemplate(taskId, title, main, description, subtasks, assigned, priority) {
  const data = getDragAndDropData(subtasks, assigned, main, priority);
  return `
    <div id="card-${taskId}"ontouchstart="touchStart(event)" ontouchmove="touchMove(event)" ontouchend="touchEnd(event)" draggable="true" ondragstart="startDragging(event, ${taskId})" ondragend="onDragEnd()" data-title="${title.toLowerCase()}" data-description="${description.toLowerCase()}" class="board-card"
         onclick="detailedCardInfo(${taskId}); animateDetailedCardIn()">
      <div class="task-main-container" style="background-color:${data.bgColor}">
        ${main}
      </div>
      <div class="card-container-title-content">
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
      <div id="subtask-bar-${taskId}"
           class="progress-bar-container ${data.hideProgressClass}">
        <progress class="subtask-progress"
                  value="${data.percent}"
                  max="100"></progress>
        <p class="subtask-render-p">
          ${data.done}/${data.total} Subtasks
        </p>
      </div>
      <div class="contacts-badge-container">
        <div class="only-badges-container">
          ${data.badges.slice(0, 3).map(b => `
            <img class="badges-img"
                 src="${b.badge}"
                 title="${b.name}"
                 style="border-color:${b.color}">
          `).join("")}
          ${data.badges.length > 3 ? `<span class="badge-dots">...</span>` : ""}
        </div>
        <div>
          <img class="priority-badge" src="${data.imgSrc}">
        </div>
      </div>
    </div>
  `;
}

function detailedCardInfoTemplate(task) {
    const bgColor = getBgColor(task.main);
    const imgSrc = getPriorityImg(task.priority);
    const badges = renderBadges(task.assigned);
    const subtask = renderSubtask(task.subtasks, task.id)
    return `
    <div class="overlay-cards" id="overlayclose" onclick="closeOverlayCard()">
        <div id="card-content" class="card-content" onclick="event.stopPropagation()">
            <div class="cards-content-header">
                <div class="card-overlay-main-container" style="background-color: ${bgColor}">${task.main}</div>
                    <img onclick="closeOverlayCard()" class="card-overlay-main-container-img" src="./assets/close.svg" onclick="closeOverlayCard()">    
                </div>
                <div class="card-overlay-title-container">
                    <p>${task.title}</p>
                </div>
             <p class="card-overlay-description-container">${task.description}</p>
              <div class="card-overlay-description-details-container">
              <p>
              <span class="label">Due date:</span>
               <span>${task.enddate}</span>
             </p>
                <div class="card-overlay-priority-details-container">
                    <p>
                    <span class="label">Priority:</span>
                   <span>${capitalize(task.priority)}</span>
                    </p> 
                    <img src="${imgSrc}">
                </div>
            </div>
            <div class="card-overlay-assigned_to-details-container">
                <p class="label">Assigned To:</p>
                    <div class="card-overlay-assigned_to-details-container-badges">
                        ${badges.slice(0, 3).map(b => `
                                <img class="badges-img" src="${b.badge}" title="${b.name}" style="border-color:${b.color}">
                                `).join('')}
                            ${badges.length > 3 ? `<span class="badge-dots">...</span>` : ''}
                    </div>   
            </div>
            <div class="card-overlay-subtasks-details-container">
                <p class="label">Subtasks</p>
                <div class="subtask-render-icons-text">
                ${subtask}
                </div>             
            </div>
            <div class="card-overlay-icons-details-container">
                <div class="card-overlay-delete-icon-details-container" onclick="deleteCard(${task.id})" id="deleticon">
                    <img src="./assets/delete.svg">
                    <p>Delete</p>
                </div>
                <div class="card-overlay-separationline-details-container"></div>
                <div onclick="openEditOverlay(${task.id})" id="edit-btn" class="card-overlay-delete-icon-details-container">
                <img src="./assets/edit.png"
                <p>Edit</p>
                </div>
            </div>
        </div>      
    </div>
    `
}

function noCardsTemplate() {
    return `<div class="notasks-container">
    <p>No tasks To do<p>
    </div>
    `
}

function renderSubtaskEdit(subtasks) {
    let html = "<ul>";
    if (!subtasks || subtasks.length === 0) {
        return "<ul></ul>";
    }
    subtasks.forEach((st, i) => {
        html += `
      <li class="single-subtask" data-subtask-id="${i}">
        <div class="single-subtask-container">
          
          <div>
            <span id="subtask-text-${i}" class="subtask-text">${st.text}</span>
          </div>

          <div class="subtask-icons subtaskoutput-icon-container">
            <img class="edit-icon" src="./assets/edit.png" alt="edit">
            <img class="delete-icon" src="./assets/delete.svg" alt="delete">
          </div>
          
          <div class="edit-subtask-icons hidden">
            <img id="edit-delete-icon" class="delete-icon" src="./assets/delete.svg" alt="delete">
            <div class="divider"></div>
            <img id="edit-accept-icon" class="subtask-check-svg" src="../assets/check-grey.svg" alt="accept">
          </div>

        </div>
      </li>
    `;
    });

    html += "</ul>";
    return html;
}

function editOverlayTemplate(task) {
    const subtaskContent = renderSubtaskEdit(task.subtasks);
    let formContainer = document.getElementById('edit-task-form-container');
    task.priority === "urgent";
    const icons = getEditPriorityIcons(task.priority);
    if (!formContainer) return;
    if (formContainer) {
        formContainer.innerHTML =
            `
<form novalidate class="task-form">
    <div id="badge-overlay">
        <a href="../legal_notice.html" onclick="event.preventDefault(); navigate('./legal_notice.html')">Legal Notice</a>
        <a href="../privacy_policy.html" onclick="event.preventDefault(); navigate('./privacy_policy.html')">Privacy Policy</a>
        <a href="../index.html" id="logout-link">Log out</a>
    </div>
    <div class="task-content-container">
        <div class="contents">
            <div class="left-task">
                <div class="left-task-container">

                    <h1 class="task-title">Add Task</h1>

                    <div class="title-container">
                        <div class="em-05">Title<span class="asterisk">*</span></div>
                        <input required id="title-input" value="${task.title}" class="input" type="text" placeholder="Enter a title">
                        <p class="required-mssg" id="required-message-title"></p>
                    </div>
                    <div class="padding-top20">
                        <div class="em-05">Description</div>
                        <textarea id="description-input"  class="input" placeholder="Enter a Description">${task.description}</textarea>
                    </div>
                    <div class="due-date-container padding-top20">
                        <div class="em-05">Due date<span class="asterisk">*</span></div>
                        <label for="date-input" style="align-items: center; gap: 6px; cursor: pointer;">
                            <input value="${task.enddate}" type="date" required id="date-input" class="input" placeholder="dd/mm/yyyy">
                            <img id="calendar-icon" onclick="openCalendar()" class="date-icon"
                                src="./add_task_assets/img/event.svg">
                        </label>
                        <p class="required-mssg" id="required-message-date"></p>
                    </div>
                </div>

                <span class="required-text"><span class="asterisk">*</span>This field ist required</span>
            </div>
            <div class="vertical-line"></div>
            <div class="right-task">
                <div class="right-side-inner">
                    <div class="priority-container">
                        <div class="em-05">Priority</div>
                        <div class="priority-input-container">
                            <div data-prio="urgent" id="urg-container" onclick="changeUrgentColor()" class="urgent-container">
                                <input id="urgent" class="input priority-input " placeholder="Urgent" readonly
                                    data-prio="urgent">
                                <img id="double-arrow" class="double-up-arrow" src="${icons.urgent}">
                            </div>
                            <div data-prio="medium" onclick="changeMediumColor()" class="medium-container">
                                <input id="medium-input" class="input priority-input " placeholder="Medium" readonly
                                    data-prio="medium">
                                <img id="equal" class="equals-icon" src="${icons.medium}">
                            </div>
                            <div data-prio="low" onclick="changeLowColor()" id="low-container" class="low-container">
                                <input id="low-input" class="input priority-input  " placeholder="Low" readonly
                                    data-prio="low">
                                <img id="double-down" class="double-down" src="${icons.low}">
                            </div>
                        </div>
                    </div>

                    <div class="assigned-to-container">
                        <div class="em-05 padding-top20">Assigned to</div>
                        <input onclick="renderAssignDropdown()" id="assign-input" type="text" class="input assign-Input cursorPointer"
                            placeholder="Select contact to assign">
                        <img id="drop-down-svg-assign" class="drop-down-arrow-svg" src="../assets/arrow_drop_down.svg">
                        <div id="dropdownList" class="dropdown-list"></div>
                    </div>
                    <div id="filteredBadgesContainer"></div>
                    <div id="editFilterBadges"></div>
                    <div class="category-container">
                        <div class="em-05 padding-top20">Category<span class="asterisk">*</span></div>
                        <input id="category-input" onclick="switchArrowIcon()" type="text"
                            class="input category-input cursorPointer" placeholder="Select task category" readonly>
                        <p class="required-mssg" id="required-message-category"></p>
                        <img onclick="switchArrowIcon()" id="drop-down-svg-category"
                            class="drop-down-arrow-svg-category" src="../assets/arrow_drop_down.svg">
                        <div id="dropdownListCategory" class="dropdown-list">
                            <div id="technical-task-option" class="category-option">Technical Task</div>
                            <div id="user-story-option" class="category-option">User Story</div>
                        </div>
                    </div>

                    <div class="em-05 padding-top20">Subtasks</div>
                    <div class="subtask-input-container">
                        <input type="text" id="subtask-input" class="input subtask-input" placeholder="Add new subtask">
                        <div id="cancel-accept-container" class="cancel-accept-container">
                            <img id="subtask-cancel" class="subtask-close-svg" src="./assets/close.svg">
                            <div class="divider"></div>
                            <div class="subcheck">
                                <img id="subtask-accept" class="subtask-check-svg" src="./assets/check-grey.svg">
                            </div>
                        </div>

                        <div id="subtask-content">${subtaskContent}</div>
                        <span class="mobile-required-text"><span class="asterisk">*</span>This field ist required</span>
                        <div class="tbc-wrapper">
                            <div id="tbc-wrapper-inner">
                                <div class="task-button-container">
                                    <div class="clearBtn-svg-container">
                                        <button type="button" id="clear-button" class="clear-button">Clear</button>
                                        <svg class="cancel-icon" width="25" height="24" viewBox="0 0 25 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12.0692 12.0001L17.3122 17.2431M6.82617 17.2431L12.0692 12.0001L6.82617 17.2431ZM17.3122 6.75708L12.0682 12.0001L17.3122 6.75708ZM12.0682 12.0001L6.82617 6.75708L12.0682 12.0001Z"
                                                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                    <div class="createTaskBtn-svg-container">
                                        <button id="add-task-button" type="button" class="create-task-button">Create
                                            Task</button>
                                       <button onclick="closeEditOverlay()" id="edit-overlay-accept" type="button"
                                            class="create-task-button">OK
                                        </button>
                                        <svg class="check-icon" width="14" height="12" viewBox="0 0 16 12" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path stroke="currentColor"
                                                d="M5.61905 9.15L14.0941 0.675C14.2941 0.475 14.5316 0.375 14.8066 0.375C15.0816 0.375 15.3191 0.475 15.5191 0.675C15.7191 0.875 15.8191 1.1125 15.8191 1.3875C15.8191 1.6625 15.7191 1.9 15.5191 2.1L6.31905 11.3C6.11905 11.5 5.88572 11.6 5.61905 11.6C5.35239 11.6 5.11905 11.5 4.91905 11.3L0.619055 7C0.419055 6.8 0.323221 6.5625 0.331555 6.2875C0.339888 6.0125 0.444055 5.775 0.644055 5.575C0.844055 5.375 1.08155 5.275 1.35655 5.275C1.63155 5.275 1.86905 5.375 2.06905 5.575L5.61905 9.15Z"
                                                fill="white" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</form>
`
    }
}

function addTaskOverlayTemplate() {
    let formContainer = document.getElementById('task-form-container');
    if (!formContainer) return;
    if (formContainer) {
        formContainer.innerHTML =
            `<form novalidate return false; class="task-form">
    <div id="badge-overlay">
        <a href="../legal_notice.html" onclick="event.preventDefault(); navigate('./legal_notice.html')">Legal Notice</a>
        <a href="../privacy_policy.html" onclick="event.preventDefault(); navigate('./privacy_policy.html')">Privacy Policy</a>
        <a href="../index.html" id="logout-link">Log out</a>
    </div>
    <div class="task-content-container">
        <div class="contents">
            <div class="left-task">
                <div class="left-task-container">

                    <h1 class="task-title">Add Task</h1>

                                      <div class="title-container">
                        <div class="em-05">Title<span class="asterisk">*</span></div>
                        <input required id="title-input" class="input" type="text" placeholder="Enter a title">
                        <p class="required-mssg visibility-hidden" id="required-message-title">*This field ist required</p>
                    </div>
                    <div>
                        <div class="em-05">Description</div>
                        <textarea id="description-input" class="input" placeholder="Enter a Description"></textarea>
                    </div>
                    <div class="due-date-container padding-top20">
                        <div class="em-05">Due date<span class="asterisk">*</span></div>
                        <label for="date-input" style="align-items: center; gap: 6px; cursor: pointer;">
                            <input type="date" required id="date-input" class="input" placeholder="dd/mm/yyyy">
                            <img id="calendar-icon" onclick="openCalendar()" class="date-icon"
                                src="../add_task_assets/img/event.svg">
                                 <p class="required-mssg visibility-hidden" id="required-message-date">*This field ist required</p>
                        </label>
                    </div>
                </div>

                <span id="required-text" class="required-text"><span class="asterisk">*</span>This field ist required</span>
            </div>

            <div class="vertical-line"></div>
            <div class="right-task">
                <div class="right-side-inner">
                    <div class="priority-container">
                        <div class="em-05">Priority</div>
                        <div class="priority-input-container">
                            <div id="urg-container" onclick="changeUrgentColor()" class="urgent-container">
                                <input id="urgent" class="input priority-input" placeholder="Urgent" readonly
                                    data-prio="urgent">
                                <img id="double-arrow" class="double-up-arrow" src="../assets/Prio alta.svg">
                            </div>
                            <div onclick="changeMediumColor()" class="medium-container">
                                <input id="medium-input" class="input priority-input no-focus" placeholder="Medium" readonly
                                    data-prio="medium">
                                <img id="equal" class="equals-icon" src="../assets/Prio media.svg">
                            </div>
                            <div onclick="changeLowColor()" id="low-container" class="low-container">
                                <input id="low-input" class="input priority-input" placeholder="Low" readonly
                                    data-prio="low">
                                <img id="double-down" class="double-down" src="../assets/double-down.svg">
                            </div>
                        </div>
                    </div>

                    <div class="assigned-to-container">
                        <div class="em-05 padding-top20">Assigned to</div>
                        <input onclick="renderAssignDropdown()" id="assign-input" type="text" class="input assign-Input cursorPointer"
                            placeholder="Select contact to assign">
                        <img id="drop-down-svg-assign" class="drop-down-arrow-svg" src="../assets/arrow_drop_down.svg">
                        <div id="dropdownList" class="dropdown-list"></div>
                    </div>
                    <div id="filteredBadgesContainer"></div>
                    <div id="editFilterBadges"></div>
                    <div id="category-container" class="category-container">
                        <div class="em-05 ">Category<span class="asterisk">*</span></div>
                        <input id="category-input" onclick="switchArrowIcon()" type="text"
                            class="input category-input cursorPointer" placeholder="Select task category" readonly>
                        <p class="required-mssg visibility-hidden" id="required-message-category">*This field ist required</p>
                        <img onclick="switchArrowIcon()" id="drop-down-svg-category"
                            class="drop-down-arrow-svg-category" src="../assets/arrow_drop_down.svg">
                        <div id="dropdownListCategory" class="dropdown-list">
                            <div id="technical-task-option" class="category-option">Technical Task</div>
                            <div id="user-story-option" class="category-option">User Story</div>
                        </div>
                    </div>

                    <div class="em-05 padding-top0">Subtasks</div>
                    <div class="subtask-input-container">
                        <input type="text" id="subtask-input" class="input subtask-input" placeholder="Add new subtask">
                        <div id="cancel-accept-container" class="cancel-accept-container">
                            <img id="subtask-cancel" class="subtask-close-svg" src="../assets/close.svg">
                            <div class="divider"></div>
                            <div class="subcheck">
                                <img id="subtask-accept" class="subtask-check-svg" src="../assets/check-grey.svg">
                            </div>
                        </div>

                        <div id="subtask-content"></div>
                        <span class="mobile-required-text"><span class="asterisk">*</span>This field ist required</span>
                        <div class="tbc-wrapper">
                            <div id="tbc-wrapper-inner">
                                <div class="task-button-container">
                                    <div class="clearBtn-svg-container">
                                        <button type="button" id="clear-button" class="clear-button">Clear</button>
                                        <svg class="cancel-icon" width="25" height="24" viewBox="0 0 25 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12.0692 12.0001L17.3122 17.2431M6.82617 17.2431L12.0692 12.0001L6.82617 17.2431ZM17.3122 6.75708L12.0682 12.0001L17.3122 6.75708ZM12.0682 12.0001L6.82617 6.75708L12.0682 12.0001Z"
                                                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                    <div class="createTaskBtn-svg-container">
                                        <button id="add-task-button" type="button" class="create-task-button">Create
                                            Task</button>
                                       <button onclick="closeEditOverlay()" id="edit-overlay-accept" type="button"
                                            class="create-task-button">OK
                                        </button>
                                        <svg class="check-icon" width="14" height="12" viewBox="0 0 16 12" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path stroke="currentColor"
                                                d="M5.61905 9.15L14.0941 0.675C14.2941 0.475 14.5316 0.375 14.8066 0.375C15.0816 0.375 15.3191 0.475 15.5191 0.675C15.7191 0.875 15.8191 1.1125 15.8191 1.3875C15.8191 1.6625 15.7191 1.9 15.5191 2.1L6.31905 11.3C6.11905 11.5 5.88572 11.6 5.61905 11.6C5.35239 11.6 5.11905 11.5 4.91905 11.3L0.619055 7C0.419055 6.8 0.323221 6.5625 0.331555 6.2875C0.339888 6.0125 0.444055 5.775 0.644055 5.575C0.844055 5.375 1.08155 5.275 1.35655 5.275C1.63155 5.275 1.86905 5.375 2.06905 5.575L5.61905 9.15Z"
                                                fill="white" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</form>`
    }
}