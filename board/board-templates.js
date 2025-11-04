function dragAndDropTemplate(taskId){
    return `
        <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
            <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})"></div>
        </div>
        <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
            <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})"></div>
        </div>
        <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
            <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})"></div>
        </div>
        <div class="startendcontainer" ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
            <div id="${taskId}" class="template-wrapper" draggable="true" ondragstart="startDragging(event, ${taskId})"></div>
        </div>
  `};