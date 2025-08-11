/**
 * 
 * @param {Object} task This is the object of the task. 
 * @returns Return the template of the task.
 */
function loadCard(task) {
    return `<div draggable="true" ondragstart="startDragging(${task.id})"  id="${task.id}" class="card">
                <div class="tpl-progress">
                    <div class="card-category">
                        <p style="background-color: ${task.category.color}">${task.category.name}</p>
                    </div>
                    <div class="card-text">
                        <p class="card-title">${task.title}</p>
                        <p class="card-description">${task.description}</p>
                    </div>
                    <div id="progress-bar${task.id}" class="card-progress"></div>
                    <div class="card-contact">
                        <div id="card${task.id}-contacts" class="card-badges"></div>
                        <div id="priority${task.id}"></div>
                    </div>
                </div>
            </div>`
}

/**
 * 
 * @param {object} task This is the task object containing all necessary information.
 * @param {number} doneSubtaks The amount of the done subtasks
 * @returns 
 */
function loadProgressBar(task, doneSubtaks) {
    return `<div class="progress-bar"></div>
            <div class="card-subtasks">${doneSubtaks}/${task.subtasks.length} Subtasks</div>`
}

/**
 * 
 * @param {nummber} assignedContact This is the user ID of the Contact.
 * @returns Return the img of the bages of the user.
 */
function loadBagesForCard(assignedContact) {
    return `<img src="./assets/icons/profilebadge/${assignedContact.id}.svg">`
}

function loadPriorityImage(task) {
    return `<img src="./assets/icons/add_task/Prio_${task.priority}.svg">`
}

/**
 * 
 * @returns Return the template of the "No tasks To do" Card.
 */
function loadNoTodoCard() {
    return `<div class="card-no-task">
                <div class="tpl-no-task">
                    <p>No tasks To do</p>
                </div>
            </div>`
}

/**
 * 
 * @returns Return the template of the "No tasks Done" Card.
 */
function loadNoDoneCard() {
    return `<div class="card-no-task">
                <div class="tpl-no-task">
                    <p>No tasks Done</p>
                </div>
            </div>`
}

function loadOverlayAddTaskBoard() {
    return `<div class="content-add-task bg-overlay">
                <div>
                    <h1>Add Task</h1>
                    <div id="close-overlay" onclick="closeOverlay()">
                        <img src="./assets/icons/board/close.svg" alt="close">
                    </div>
                    <form class="form-add-task"  action="">
                        <div class="left-form">
                            <div>
                                <label for="title">Title<p class="required-star">*</p></label>
                                <input id="input-title" type="text" name="title" placeholder="Enter a title" required>
                            </div>
                            <div>
                                <label for="description">Description</label>
                                <textarea name="description" id="description" placeholder="Enter a Description"></textarea>
                            </div>
                            <div>
                                <label for="date">Due date<p class="required-star">*</p></label>
                                <input id="input-date" type="date" lang="en" placeholder="dd/mm/yyyy"  required>
                            </div>                      
                        </div>

                        <div class="divider"></div>

                        <div class="right-form">
                            <div>
                                <label for="priority">Priority</label>
                                <div class="priority">
                                    <div id="bt-urgent" onclick="selectPriority('urgent')" class="bt-priority">
                                        <p>Urgent</p>
                                        <img id="svg-urgent" src="./assets/icons/add_task/Prio_urgent.svg">
                                    </div>
                                    <div id="bt-medium" onclick="selectPriority('medium')" class="bt-priority">
                                        <p>Medium</p>
                                        <img id="svg-medium" src="./assets/icons/add_task/Prio_medium.svg">
                                    </div>
                                    <div id="bt-low" onclick="selectPriority('low')" class="bt-priority">
                                        <p>Low</p>
                                        <img id="svg-low" src="./assets/icons/add_task/Prio_low.svg">
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label for="assign">Assigned to</label>
                                <div class="bg-drop-down">
                                    <div onclick="openAssignedMenu()" class="input-menu">
                                        <input type="text" placeholder="Select contacts to assign" id="input-assign">
                                        <img id="arrow-contacts" src="./assets/icons/add_task/arrow_drop_down_down.svg">
                                    </div>
                                    <div class="menu-drop-down" id="contacts">
                                        <div id="menu-drop-down" class="scrollbar"></div>
                                    </div>
                                </div>
                                <div id="selected-contacts"></div>
                            </div>

                            <div>
                                <label for="category">Category<p class="required-star">*</p></label>
                                <div class="bg-drop-down">
                                    <div onclick="openCategoryMenu()" class="input-menu">
                                        <input id="category-input" placeholder="Select task category" required>
                                        <img id="arrow-category" src="./assets/icons/add_task/arrow_drop_down_down.svg">
                                    </div>
                                    <div class="menu-drop-down" id="categories">
                                        <div class="menu-option" onclick="selectCategory('Technical Task')">Technical Task</div>
                                        <div class="menu-option" onclick="selectCategory('User Story')">User Story</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label for="subtask">Subtasks</label>
                                <div class="subtask-input">
                                    <input type="text" id="subtask-input" name="subtask" placeholder="Add new subtask">
                                    <div id="subtask-icons">
                                        <img id="plus-subtask" onclick="addSubtask()" src="./assets/icons/add_task/plus.svg">
                                    </div>
                                    <ul id="list-subtasks"></ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </div> 

                <div class="bt-container">
                    <div class="required-info">
                        <p class="required-star">*</p>
                        This field is required
                    </div>
                    <div class="bt-add-task">
                        <div onclick="clearTask()" id="bt-clear">
                            <p>Clear</p>
                            <img src="./assets/icons/close.svg">
                        </div>
                        <div onclick="createTask()" id="bt-create-task">
                            <p>Create Task</p>
                            <img src="./assets/icons/check.svg">
                        </div>
                    </div>
                </div>
            </div>`
}

/**
 * 
 * @param {object} task The task object containing all necessary task details.
 * @returns Return the template of the overlay for the task which was clicked.
 */
function loadTaskOverlay(task) {
    return `<div class="content-select-task">
                <div>
                    <div class="category-select-task">
                        <p style="background-color: ${task.category.color}">${task.category.name}</p>
                    </div>
                    <div id="close-overlay-select-task" >
                        <img src="./assets/icons/board/close.svg" alt="close">
                    </div>
                </div>
                <div>
                    <p class="select-tk-title">${task.title}</p>
                </div>
                <div>
                    <p class="select-tk-description">${task.description}</p>
                </div>
                <div class="table-select-task">
                    <div class="table-gap font-color">
                        <p>Due date:</p>
                        <p>Priority:</p>
                    </div>
                    <div class="table-gap">
                        <p>${task.enddate}</p>
                        <div class="priority-gap">
                            <p class="capitalize">${task.priority}</p>
                            <img src="./assets/icons/add_task/Prio_${task.priority}.svg">
                        </div>
                    </div>
                </div>
                <div>
                    <p class="font-color">Assigned To:</p>
                    <div id="assigned-select-task"></div>
                </div>
                <div>
                    <p class="font-color">Subtasks:</p>
                    <div id="subtasks-select-task"></div>
                </div>
                <div>
                    <div class="bts-select-task">
                        <div class="bt-select-task-transition">
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_75601_14777" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="24">
                                <rect x="0.144531" width="24" height="24" fill="#D9D9D9"/>
                                </mask>
                                <g mask="url(#mask0_75601_14777)">
                                <path d="M7.14453 21C6.59453 21 6.1237 20.8042 5.73203 20.4125C5.34036 20.0208 5.14453 19.55 5.14453 19V6C4.8612 6 4.6237 5.90417 4.43203 5.7125C4.24036 5.52083 4.14453 5.28333 4.14453 5C4.14453 4.71667 4.24036 4.47917 4.43203 4.2875C4.6237 4.09583 4.8612 4 5.14453 4H9.14453C9.14453 3.71667 9.24036 3.47917 9.43203 3.2875C9.6237 3.09583 9.8612 3 10.1445 3H14.1445C14.4279 3 14.6654 3.09583 14.857 3.2875C15.0487 3.47917 15.1445 3.71667 15.1445 4H19.1445C19.4279 4 19.6654 4.09583 19.857 4.2875C20.0487 4.47917 20.1445 4.71667 20.1445 5C20.1445 5.28333 20.0487 5.52083 19.857 5.7125C19.6654 5.90417 19.4279 6 19.1445 6V19C19.1445 19.55 18.9487 20.0208 18.557 20.4125C18.1654 20.8042 17.6945 21 17.1445 21H7.14453ZM7.14453 6V19H17.1445V6H7.14453ZM9.14453 16C9.14453 16.2833 9.24036 16.5208 9.43203 16.7125C9.6237 16.9042 9.8612 17 10.1445 17C10.4279 17 10.6654 16.9042 10.857 16.7125C11.0487 16.5208 11.1445 16.2833 11.1445 16V9C11.1445 8.71667 11.0487 8.47917 10.857 8.2875C10.6654 8.09583 10.4279 8 10.1445 8C9.8612 8 9.6237 8.09583 9.43203 8.2875C9.24036 8.47917 9.14453 8.71667 9.14453 9V16ZM13.1445 16C13.1445 16.2833 13.2404 16.5208 13.432 16.7125C13.6237 16.9042 13.8612 17 14.1445 17C14.4279 17 14.6654 16.9042 14.857 16.7125C15.0487 16.5208 15.1445 16.2833 15.1445 16V9C15.1445 8.71667 15.0487 8.47917 14.857 8.2875C14.6654 8.09583 14.4279 8 14.1445 8C13.8612 8 13.6237 8.09583 13.432 8.2875C13.2404 8.47917 13.1445 8.71667 13.1445 9V16Z" fill="#2A3647"/>
                                </g>
                            </svg>
                            <p>Delete</p>
                        </div>
                        <div class="subtask-divider"></div>
                        <div id="edit-task" class="bt-select-task-transition">
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_75592_9969" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="24">
                                <rect x="0.144531" width="24" height="24" fill="#D9D9D9"/>
                                </mask>
                                <g mask="url(#mask0_75592_9969)">
                                <path d="M5.14453 19H6.54453L15.1695 10.375L13.7695 8.975L5.14453 17.6V19ZM19.4445 8.925L15.1945 4.725L16.5945 3.325C16.9779 2.94167 17.4487 2.75 18.007 2.75C18.5654 2.75 19.0362 2.94167 19.4195 3.325L20.8195 4.725C21.2029 5.10833 21.4029 5.57083 21.4195 6.1125C21.4362 6.65417 21.2529 7.11667 20.8695 7.5L19.4445 8.925ZM17.9945 10.4L7.39453 21H3.14453V16.75L13.7445 6.15L17.9945 10.4Z" fill="#2A3647"/>
                                </g>
                            </svg>
                            <p>Edit</p>
                        </div>
                    </div>
                </div>
            </div>`
}

/**
 * 
 * @param {object} contact The contact object containing all necessary contact details.
 * @returns Return the template of the assigned contacts for the task.
 */
function loadTaskAssigned(contact) {
    return `<div class="contacts-select-task">
                <img src="./assets/icons/profilebadge/${contact.id}.svg">
                <p>${contact.name}</p>
            </div>`
}

/**
 * 
 * @param {object} subtask The subtask object containing all necessary subtask details.
 * @returns Return the template of the subtask for the task.
 */
function loadTaskSubtasks(subtask) {
    return `<div class="subtask-select-task">
                <img src="./assets/icons/board/${subtask.status}_button.svg">
                <p>${subtask.description}</p>                    
            </div>`
}

/**
 * 
 * @returns Return the template of the edit task overlay.
 */
function loadEditTask(task) {
    return `<div class="content-select-task content-task-edit">
                <div>
                    <div class="close-task-edit" id="close-overlay-select-task">
                        <img src="./assets/icons/board/close.svg" alt="close">
                    </div>
                </div>
                <div class="form-scrollbar">
                    <form class="form-task-edit">
                        <div>
                            <label for="title">Title</label>
                            <input id="input-title" type="text" name="title" placeholder="Enter a title" required>
                        </div>
                        <div>
                            <label for="description">Description</label>
                            <textarea name="description" id="description" placeholder="Enter a Description"></textarea>
                        </div>
                        <div>
                            <label for="date">Due date</label>
                            <input id="input-date" type="date" lang="en" placeholder="dd/mm/yyyy" required>
                        </div>
                        <div>
                            <label for="priority">Priority</label>
                            <div class="priority">
                                <div id="bt-urgent" onclick="selectPriority('urgent')" class="bt-priority">
                                    <p>Urgent</p>
                                    <img id="svg-urgent" src="./assets/icons/add_task/Prio_urgent.svg">
                                </div>
                                <div id="bt-medium" onclick="selectPriority('medium')" class="bt-priority">
                                    <p>Medium</p>
                                    <img id="svg-medium" src="./assets/icons/add_task/Prio_medium.svg">
                                </div>
                                <div id="bt-low" onclick="selectPriority('low')" class="bt-priority">
                                    <p>Low</p>
                                    <img id="svg-low" src="./assets/icons/add_task/Prio_low.svg">
                                </div>
                            </div>
                        </div>
                        <div>
                            <label for="assign">Assigned to</label>
                            <div class="bg-drop-down">
                                <div id="edit-assigned-menu" class="input-menu">
                                    <input type="text" placeholder="Select contacts to assign" id="edit-input-assign">
                                    <img id="edit-arrow-contacts" src="./assets/icons/add_task/arrow_drop_down_down.svg">
                                </div>
                                <div class="menu-drop-down" id="edit-contacts">
                                    <div id="edit-drop-down" class="scrollbar"></div>
                                </div>
                            </div>
                            <div class="edit-selected-contacts" id="selected-contacts"></div>
                        </div>
                        <div>
                            <label for="subtask">Subtasks</label>
                            <div class="subtask-input">
                                <input type="text" id="subtask-input" name="subtask" placeholder="Add new subtask">
                                <div id="subtask-icons">
                                    <img id="plus-subtask" src="./assets/icons/add_task/plus.svg">
                                </div>
                                <ul id="list-subtasks"></ul>
                            </div>
                        </div>      
                    </form>
                </div>
                <div id="bt-edit">
                    <p>Ok</p>
                    <img src="./assets/icons/check.svg">
                </div>
            </div>`   
}
