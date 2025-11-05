
function dragAndDropTemplate(taskId, title, main, description, subtasks) {

    let bgColor = "#fff"
    if(main === "userstory") bgColor = "#0038FF";
    else if(main === "techtask") bgColor = "#1FD7C1";
    let displayMain = main;
    if(main === "userstory") displayMain = "User Story";
    else if(main === "techtask") displayMain = "Tech Task";

  return `
    <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
      <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})">
            <div id="cards" class="board-card">
                <div class="task-main-container" style="background-color: ${bgColor}">${displayMain}</div> 
                <div class="card-container-title-content">
                <h2>${title}<h2>
                <p>${description}</p>
                </div>
                <div>${subtasks}</div>
            </div>
      </div>
    </div>
  `;
}
