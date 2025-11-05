
function dragAndDropTemplate(taskId, title) {
  return `
    <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
      <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})">
        ${title}
      </div>
    </div>
  `;
}
