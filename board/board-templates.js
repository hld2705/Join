
function dragAndDropTemplate(taskId, title, main, description, subtasks) {

    let bgColor = "#fff"
    if(main === "User Story") bgColor = "#0038FF";
    else if(main === "Technical Task") bgColor = "#1FD7C1";

  return `
    <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
      <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})">
            <div id="cards" class="board-card">
                <div class="task-main-container" style="background-color: ${bgColor}">${main}</div> 
                <div class="card-container-title-content">
                <h2>${title}<h2>
                <p>${description}</p>
                </div>
                <progress value="${subtasks}" max="100">${subtasks}</progress>
                <p>${subtasks} Subtasks</p>
            </div>
      </div>
    </div>
  `;
}
