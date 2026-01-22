/** Normalizes subtasks into an array.
 * @param {Array|Object|null} subtasks
 * @returns {Array}
 */
function normalizeSubtasks(subtasks) {
  return Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks || []);
}

/** Calculates progress data for subtasks.
 * @param {Array} subtasks
 * @returns {Object}
 */
function getProgressData(subtasks) {
  const total = subtasks.length;
  const done = subtasks.filter(s => s.done).length;
  return {
    total,
    done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    hideProgressClass: total === 0 ? "hidden" : ""
  };
}

/** Normalizes subtasks to a safe array.
 * @param {Array|Object|null} subtasks
 * @returns {Array}
 */
function getSafeSubtasks(subtasks) {
  if (!subtasks) return [];
  return Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks);
}

/** Calculates subtask progress values.
 * @param {Array} subtasks
 * @returns {Object}
 */
function getSubtaskProgress(subtasks) {
  const done = subtasks.filter(s => s.done).length;
  const total = subtasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/** Truncates subtask text.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
function CutSubtaskText(text, max = 20) {
  if (text.length > max) {
    return text.slice(0, max) + "…";
  } else {
    return text;
  }
}

/** Computes all visual data needed to render a task card.
 * @param {Array|Object} subtasks
 * @param {Array<string|Object>} assigned
 * @param {string} main
 * @param {string} priority
 * @returns {Object}
 * Prepared data for board card rendering (progress, badges, colors).
 */
function getDragAndDropData(subtasks, assigned, main, priority) {
  const safeSubtasks = normalizeSubtasks(subtasks);
  const progress = getProgressData(safeSubtasks);
  return {
    bgColor: getBgColor(main),
    imgSrc: getPriorityImg(priority),
    badges: renderBadges(assigned),
    main: mainTranslate(main),
    ...progress
  };
}

/** Normalizes main task type label.
 * @param {string} main
 * @returns {string}
 */
function mainTranslate(main) {
  if (main === "userstory") {
    return "User Story";
  } else if (main === "User Story") {
    return "User Story";
  }
  if (main === "techtask") {
    return "Technical Task";
  } else if (main === "Technical Task") {
    return "Technical Task";
  }
}

/** Returns background color based on task type.
 * @param {string} main
 * @returns {string}
 */
function getBgColor(main) {
  if (main === "User Story" || main === "userstory") return "#0038FF";
  if (main === "Technical Task" || main === "techtask") return "#1FD7C1";
  return "#fff";
}

/** Returns priority icon path.
 * @param {string} priority
 * @returns {string}
 */
function getPriorityImg(priority) {
  if (priority === "urgent") return "./assets/urgent-priority-board.svg";
  if (priority === "medium") return "./assets/medium-priority-board.svg";
  if (priority === "low") return "./assets/low-priority-board.svg";
  return "";
}

/** Returns subtask checkbox icon.
 * @param {boolean} isDone
 * @returns {string}
 */
function getSubtasksImg(isDone) {
  if (isDone === true) return "./assets/subtask_checked.svg";
  return "./assets/subtask_empty.svg";
}

/** Returns priority icons for edit overlay.
 * @param {string} priority
 * @returns {Object}
 */
function getEditPriorityIcons(priority) {
  return {
    urgent: priority === "urgent"
      ? "../assets/arrows-up-white.png"
      : "./assets/urgent-priority-board.svg",
    medium: priority === "medium"
      ? "../assets/equal-white.svg"
      : "./assets/medium-priority-board.svg",
    low: priority === "low"
      ? "../assets/double-down-white.svg"
      : "./assets/low-priority-board.svg",
  };
}

/** Resolves assigned user ID.
 * @param {string|Object} val
 * @returns {string}
 */
function getAssignedId(val) {
  return typeof val === "object" ? String(val.id) : String(val);
}