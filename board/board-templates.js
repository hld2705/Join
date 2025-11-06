
function dragAndDropTemplate(taskId, title, main, description, subtasks, badges,) {

    let bgColor = "#fff"
    if (main === "User Story") bgColor = "#0038FF";
    else if (main === "Technical Task") bgColor = "#1FD7C1";
    let badgeHTML = "";
    if (badges && badges.length > 0) {
        for (let i = 0; i < badges.length; i++) {
            badgeHTML += `<img src="${badges[i]}" class="task-badge">`;
        }
    }

    let done = 0; //???
    let progress = subtasks / (done / subtasks) * 100;//???
    return `
    <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
      <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})">
            <div id="cards" class="board-card">
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
                    ${badgeHTML}
                </div>
                    </div>
                </div>
            </div>
        </div>
  `;
}
