function dragAndDropTemplate(taskId, title, main, description, subtasks, assigned, priority) {
    const bgColor = getBgColor(main);
    const imgSrc = getPriorityImg(priority);

    let done = 0; //???
    let progress = subtasks / (done / subtasks) * 100;//???

    const badges = renderBadges(assigned);

    return `
           <div id="card-${taskId}" draggable="true" ondragstart="startDragging(event, ${taskId})" class="board-card" onclick='detailedCardInfo(${taskId}); animateDetailedCardIn()'>
                <div class="task-main-container" style="background-color: ${bgColor}">${main}
                </div> 
                    <div class="card-container-title-content">
                        <h2>${title}<h2>
                        <p>${description}</p>
                    </div>
                        <div class="progress-bar-container">
                            <progress value="${progress}" max="${subtasks}"></progress>
                            <p>${subtasks} Subtasks</p>
                        </div>
                    <div class="contacts-badge-container">
                        <div class="only-badges-container">
                            ${badges.map(b => `
                            <img class="badges-img" src="${b.badge}" title="${b.name}" style="border-color:${b.color}">
                            `).join('')}
                        </div>
                        <div>
                          <img class="priority-badge" src="${imgSrc}">  
                        </div>
                    </div>
                </div>
            </div>
  `;
}





function detailedCardInfoTemplate(task) {
    const bgColor = getBgColor(task.main);
    const imgSrc = getPriorityImg(task.priority);
    const badges = renderBadges(task.assigned);
    const subtask = renderSubtask(task.subtasks)
    return `
    <div class="overlay-cards" id="overlayclose" onclick="closeOverlayCard()">
        <div id="card-content" class="card-content" onclick="event.stopPropagation()">
            <div class="cards-content-header">
                <div class="card-overlay-main-container" style="background-color: ${bgColor}">${task.main}</div>
                    <img class="card-overlay-main-container-img" src="./assets/close.svg" onclick="closeOverlayCard()">    
                </div>
                <div class="card-overlay-title-container">
                    <p>${task.title}</p>
                </div>
            <div class="card-overlay-description-details-container">
                <p>${task.description}</p>
                <p>Due date: ${task.enddate}</p>
                <div class="card-overlay-priority-details-container">
                    <p>Priority: ${task.priority}</p> <img src="${imgSrc}">
                </div>
            </div>
            <div class="card-overlay-assigned_to-details-container">
                <p>Assigned To:</p>
                    <div>
                        ${badges.map(b => `
                            <div class="card-overlay-badge-name-details-container">
                            <img class="" src="${b.badge}" title="${b.name}" style="border-color:${b.color}">
                            <p>${b.name}</p>
                            </div>`).join('')}
                    </div>   
            </div>
            <div class="card-overlay-subtasks-details-container">
                <p>Subtasks</p>
                <div>
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