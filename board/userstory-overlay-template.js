// task-detail-templates.js
// Liefert die HTML-Strings für die Detail-Overlays ohne CSS/Inline-Styles.

export function userStoryOverlayTemplate({ title, description, dueText, priorityText, assigneesHtml, subtasksHtml }) {
  return baseTemplate({
    badgeText: 'User Story',
    badgeClass: 'badge-blue',
    title,
    description,
    dueText,
    priorityText,
    assigneesHtml,
    subtasksHtml,
    dialogId: 'us-title',
  });
}

export function techTaskOverlayTemplate({ title, description, dueText, priorityText, assigneesHtml, subtasksHtml }) {
  return baseTemplate({
    badgeText: 'Technical Task',
    badgeClass: 'badge-green',
    title,
    description,
    dueText,
    priorityText,
    assigneesHtml,
    subtasksHtml,
    dialogId: 'tt-title',
  });
}

/* ---------- Intern ---------- */
function baseTemplate({ badgeText, badgeClass, title, description, dueText, priorityText, assigneesHtml, subtasksHtml, dialogId }) {
  return `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${esc(dialogId)}">
      <button class="modal-close" type="button" aria-label="Close">×</button>

      <div class="modal-header">
        <span class="badge ${esc(badgeClass)}">${esc(badgeText)}</span>
        <h2 id="${esc(dialogId)}">${esc(title || 'Untitled')}</h2>
        ${description ? `<p class="muted">${esc(description)}</p>` : ''}
      </div>

      <div class="modal-body">
        <div class="meta-row">
          <div class="meta-item">
            <div class="meta-label">Due date</div>
            <div class="meta-value">${esc(dueText || '—')}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Priority</div>
            <div class="meta-value">${esc(priorityText || '—')}</div>
          </div>
        </div>

        <div class="us-block">
          <div class="block-title">Assigned To</div>
          <div class="assignees-row">${assigneesHtml || '<div class="muted">No assignees</div>'}</div>
        </div>

        <div class="us-block">
          <div class="block-title">Subtasks</div>
          <div class="subtasks-wrap">
            ${subtasksHtml || '<div class="muted">No subtasks</div>'}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn ghost" type="button" data-action="delete">Delete</button>
        <button class="btn primary" type="button" data-action="edit">Edit</button>
      </div>
    </div>
  `;
}

function esc(s) {
  return String(s ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
