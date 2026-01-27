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

/**Eventlistener needed for closing certain overlays */
document.addEventListener('click', function (event) {
  const overlay = document.getElementById('badge-overlay');
  if (!overlay) return;
  if (
    !event.target.closest('#badge-overlay') &&
    !event.target.closest('.user-info')
  ) {overlay.classList.remove('show');}
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
  if(!isGuest && !uid){
    window.location.relocate = "index.html";
  }
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
  sessionStorage.removeItem("loggedIn", "true");
}

window.addEventListener("DOMContentLoaded", initHeader);

/**
 * Marks the session as non-login.
 */
function nonLoginEntry(){
  sessionStorage.setItem("nonlogin","true");
}

/**
 * Needed to predefine the pages this function is going to take place, thats why the shortest way was using an eventlistener
 */
window.addEventListener("DOMContentLoaded", () => {
  const protectedPages = ["/privacy_policy.html", "/legal_notice.html", "summary.html", "/help.html", "/contacts.html","/board.html","/add_task.html"];
  if (!protectedPages.includes(window.location.pathname)) return;
  falseLoginPrevention();
});

/**
 * Logs the user out after trying to manipulate his way into logging in to the page by coping url's beforehand
 * works in a way that if you do copy a url it will load, but the very next click is going to get you logged out
 */
function falseLoginPrevention() {
  const p = new URLSearchParams(location.search);
  const path = location.pathname;
  const hasUid = p.has("uid");
  const nonLoginParam = p.get("nonlogin") === "true";
  const loggedIn = sessionStorage.getItem("loggedIn") === "true";
  const guest = sessionStorage.getItem("guest") === "true";
  const nonLogin = sessionStorage.getItem("nonlogin") === "true";
  if ((path.includes("privacy_policy.html") || path.includes("legal_notice.html")) && nonLoginParam)
    return resetToNonLogin();
  if (hasUid && !loggedIn && !guest) return location.replace("index.html");
  if (!nonLogin && !path.endsWith("index.html") && !loggedIn && !guest)
    location.replace("index.html");
}

/**
 * To keep the code short, this helper function was needed
 */
function resetToNonLogin() {
  ["loggedIn", "guest", "nonlogin"].forEach(k => sessionStorage.removeItem(k));
  localStorage.removeItem("uid");
  sessionStorage.setItem("nonlogin", "true");
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