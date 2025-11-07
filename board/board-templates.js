
function dragAndDropTemplate(taskId, title, main, description, subtasks, assigned, priority) {

    let bgColor = "#fff"
    if (main === "User Story") bgColor = "#0038FF";
    else if (main === "Technical Task") bgColor = "#1FD7C1";

    let imgSrc = ""
    if(priority === "urgent") imgSrc="./assets/urgent-priority-board.svg"
    if(priority === "medium") imgSrc="./assets/medium-priority-board.svg"
    if(priority === "low") imgSrc="./assets/low-priority-board.svg"
    if(priority === "") return[]; //????????

    let done = 0; //???
    let progress = subtasks / (done / subtasks) * 100;//???

    const badges = renderBadges(assigned);

    return `
    <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
      <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})">
            <div id="cards" class="board-card" onclick='detailedCardInfo(${JSON.stringify({taskId, title, main, description, subtasks, assigned, priority})})'>
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
        </div>
  `;
}

function detailedCardInfoTemplate(task){
    let bgColor = "#fff"
    if (task.main === "User Story") bgColor = "#0038FF";
    else if (task.main === "Technical Task") bgColor = "#1FD7C1";

    return`
    <div class="overlay-cards" id="overlayclose" onclick="closeOverlayCard()">
        <div class="card-content" onclick="event.stopPropagation()">
            <div class="cards-content-header">
             <div class="task-main-container" style="background-color: ${bgColor}">${task.main}
            </div>    
            </div>
        </div>      
    </div>
    `
}