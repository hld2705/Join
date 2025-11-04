function dragAndDropTemplate(taskId){
    return `
    <div ondrop="moveTo(event)" ondragover="dragoverHandler(event)">
        <div class="template-wrapper" draggable="true" ondragstart="startDragging(${taskId})"></div>
        <div class="template-wrapper" draggable="true" ondragstart="startDragging(${taskId})"></div>
        <div class="template-wrapper" draggable="true" ondragstart="startDragging(${taskId})"></div>
        <div class="template-wrapper" draggable="true" ondragstart="startDragging(${taskId})"></div>
    </div>
  `};