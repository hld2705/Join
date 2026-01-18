/**
 * Toggles the user badge overlay and updates help link visibility.
 */
function badgeOverlay() {
  const overlay = document.getElementById("badge-overlay");
  const helpIcon = document.querySelector(".user-info-help");
  const mobileHelp = document.getElementById("mobile-help-link");
  overlay.classList.toggle("show");
  badgeOverlayMobile(overlay, helpIcon, mobileHelp)
  updateHelpLink();
}

/**
 * Handles mobile-specific badge overlay behavior.
 *
 * @param {HTMLElement} overlay
 * @param {HTMLElement} helpIcon
 * @param {HTMLElement|null} mobileHelp
 */
function badgeOverlayMobile(overlay, helpIcon, mobileHelp) {
  if (innerWidth < 900) {
    helpIcon.style.display = "none";
    if (!mobileHelp) {
      const link = document.createElement("a");
      link.href = getHelpUrl();
      link.id = "mobile-help-link";
      link.textContent = "Help";
      overlay.prepend(link);
    }
  } else {
    helpIcon.style.display = "block";
    if (mobileHelp) mobileHelp.remove();
  }
}

function getHelpUrl() {
  const isGuest =
  sessionStorage.getItem("guest") === "true" ||
  window.location.search.includes("nonlogin=true");
  if (isGuest) return "./help.html?nonlogin=true";
  const uid = getUserId();
  return uid ? `./help.html?uid=${uid}` : "./index.html";
}

window.addEventListener("resize", updateHelpLink);
window.addEventListener("DOMContentLoaded", updateHelpLink);

/**
 * Updates the help link depending on viewport size.
 */
function updateHelpLink() {
  const overlay = document.getElementById("badge-overlay");
  const helpIcon = document.querySelector(".user-info-help");
  const mobileHelp = document.getElementById("mobile-help-link");
  if (!overlay || !helpIcon) return;
  mobileUpdateHelpLink(mobileHelp, helpIcon, overlay);
}

document.addEventListener('click', function (event) {
  const overlay = document.getElementById('badge-overlay');
  if (!overlay) return;
  if (
    !event.target.closest('#badge-overlay') &&
    !event.target.closest('.user-info')
  ) {
    overlay.classList.remove('show');
  }
});

document.addEventListener("focus", handleFocus, true);
document.addEventListener("blur", handleBlur, true);

function handleFocus(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.add("bordercolor-blue");
}

function handleBlur(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.remove("bordercolor-blue");
}

window.addEventListener("DOMContentLoaded", () => {
  dynamicUserHeaderBadge();
});

/**
 * Retrieves the param from the window location
 * @returns params(uid)
 */
function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("uid") ||
    sessionStorage.getItem("uid")
  );
}


/**
 * Fetches the currently logged-in user from Firebase.
 *
 * @async
 * @returns {Promise<Object|null>}
 */
async function getCurrentUser() {
  const uid = getUserId();
  if (!uid) return null;
  const snapshot = await firebase
    .database()
    .ref("users/" + uid)
    .once("value");
  return snapshot.val();
}

function handleResize() {
  updateHelpLink();
}

window.addEventListener("resize", handleResize);

function updateHelpLink() {
  const helpIcon = document.querySelector(".user-info-help");
  const mobileHelp = document.getElementById("mobile-help-link");
  const overlay = document.getElementById("badge-overlay");
  if (!helpIcon) return;
  helpIcon.style.display = innerWidth >= 900 ? "block" : "none";
  if (innerWidth >= 900) return mobileHelp?.remove();
  if (mobileHelp) return;
  const link = document.createElement("a");
  link.href = getHelpUrl();
  link.id = "mobile-help-link";
  link.textContent = "Help";
  overlay?.prepend(link);
}

document.addEventListener('click', function (event) {
  const overlay = document.getElementById('badge-overlay');
  if (!overlay) return;
  if (
    !event.target.closest('#badge-overlay') &&
    !event.target.closest('.user-info')
  ) {
    overlay.classList.remove('show');
  }
});

document.addEventListener("focus", handleFocus, true);
document.addEventListener("blur", handleBlur, true);

function handleFocus(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.add("bordercolor-blue");
}

function handleBlur(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.remove("bordercolor-blue");
}

function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("uid");
}

/**
 * Gets the UID from the window location 
 * @returns snapshot = users, value
 */

async function getCurrentUser() {
  const uid = getUserId();
  if (!uid) return null;
  const snapshot = await firebase
    .database()
    .ref("users/" + uid)
    .once("value");
  return snapshot.val();
}

/**
 * Dynamically renders the user badge in the header.
 *
 * @async
 * @returns {Promise<void>}
 */
async function dynamicUserHeaderBadge() {
  const user = await getCurrentUser();
  if (!user || !user.badge) return;
  const userInfo = document.getElementById("user-info-id");
  if (userInfo.querySelector(".user-info")) return;
  userInfo.insertAdjacentHTML("beforeend", getUserHeaderBadgeTemplate(user));
  updateHelpLink();
}

/**
 * Navigates to a given path while keeping user or guest state.
 *
 * @param {string} path
 */
function navigate(path) {
  const isGuest = sessionStorage.getItem("guest") === "true";
  const uid = getUserId();
  if (isGuest) {
    window.location.href = `${path}?nonlogin=true`;
    return;
  }
  if (!uid) {
    window.location.href = "/index.html";
    return;
  }
  window.location.href = `${path}?uid=${uid}`;
}

function renderGuestHeader() {
  const userInfo = document.getElementById("user-info-id");
  if (!userInfo) return;
  userInfo.insertAdjacentHTML("beforeend", getGuestHeaderTemplate());
  updateHelpLink();
}

/**
 * removes the flagged user guest = true
 */
function LogOut() {
  sessionStorage.removeItem("guest", "true");
}

window.addEventListener("DOMContentLoaded", initHeader);

function initHeader() {
  const uid = getUserId();
  const isGuest = !uid && sessionStorage.getItem("guest") === "true";
  if (isGuest) {
    renderGuestHeader();
  } else {
    dynamicUserHeaderBadge();
  }
}