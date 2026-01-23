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

/**
 * Returns the correct help URL depending on user state.
 *
 * @returns {string}
 */
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

/**
 * Adds focus styling to input elements.
 *
 * @param {FocusEvent} event
 */
function handleFocus(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.add("bordercolor-blue");
}

/**
 * Removes focus styling from input elements.
 *
 * @param {FocusEvent} event
 */
function handleBlur(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.remove("bordercolor-blue");
}

/**
 * Retrieves the user id from URL params or local storage.
 *
 * @returns {string|null}
 */
function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("uid") ||
    localStorage.getItem("uid")
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

/**
 * Handles window resize events.
 */
function handleResize() {
  updateHelpLink();
}

window.addEventListener("resize", handleResize);

/**
 * Updates the help link for mobile and desktop views.
 */
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

/**
 * Adds focus styling to input elements.
 *
 * @param {FocusEvent} event
 */
function handleFocus(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.add("bordercolor-blue");
}

/**
 * Removes focus styling from input elements.
 *
 * @param {FocusEvent} event
 */
function handleBlur(event) {
  const el = event.target;
  if (!isInput(el)) return;
  el.classList.remove("bordercolor-blue");
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
  if (!userInfo) return;
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

/**
 * Renders the guest header UI.
 */
function renderGuestHeader() {
  const userInfo = document.getElementById("user-info-id");
  if (!userInfo) return;
  userInfo.insertAdjacentHTML("beforeend", getGuestHeaderTemplate());
  updateHelpLink();
}

/**
 * Removes the guest flag from session storage.
 */
function LogOut() {
  sessionStorage.removeItem("guest", "true");
}

window.addEventListener("DOMContentLoaded", initHeader);

/**
 * Marks the session as non-login.
 */
function nonLoginEntry(){
  sessionStorage.setItem("nonlogin","true");
}

/**
 * Checks whether the session is marked as non-login.
 *
 * @returns {boolean}
 */
function nonLoginEntryCheck(){
  return (sessionStorage.getItem("nonlogin") === "true");
}

/**
 * Initializes the header depending on user or guest state.
 */
function initHeader() {
  if(nonLoginEntryCheck()) return;
  const uid = getUserId();
  const isGuest = !uid && sessionStorage.getItem("guest") === "true";
  if (isGuest) {
    renderGuestHeader();
  } else {
    dynamicUserHeaderBadge();
  }
}