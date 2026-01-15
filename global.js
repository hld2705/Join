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
      link.href = "./help.html";
      link.id = "mobile-help-link";
      link.textContent = "Help";
      overlay.prepend(link);
    }
  } else {
    helpIcon.style.display = "block";
    if (mobileHelp) mobileHelp.remove();
  }
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

function mobileUpdateHelpLink(mobileHelp, helpIcon, overlay) {
  if (window.innerWidth >= 900) {
    helpIcon.style.display = "block";
    if (mobileHelp) mobileHelp.remove();
  } else {
    helpIcon.style.display = "none";
    if (!mobileHelp) {
      const link = document.createElement("a");
      link.href = "./help.html";
      link.id = "mobile-help-link";
      link.textContent = "Help";
      overlay.prepend(link);
    }}}

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

function isInput(el) {
  return el.matches("input[type='text'], input[type='email'], input[type='date'], input[type='password'], input[type='phone'], input[type='tel'], textarea");
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
  return params.get("uid");
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
  link.href = "./help.html";
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

function isInput(el) {
  return el.matches("input[type='text'], input[type='email'], input[type='date'], input[type='password'], input[type='phone'], input[type='tel'], textarea");
}

window.addEventListener("DOMContentLoaded", () => {
  dynamicUserHeaderBadge();
});

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
 * Generates the HTML template for the user header badge.
 *
 * @param {Object} user
 * @returns {string}
 */
function getUserHeaderBadgeTemplate(user) {
    return `
        <div class="user-info">
            <a class="user-info-help" href="./help.html"
               onclick="event.preventDefault(); navigate('./help.html')">
                <img class="Hilfe" src="./assets/help.svg" alt="help">
            </a>

            <div id="header-badge" class="profil"
                 style="background:${user.badge.color}"
                 onclick="badgeOverlay()">
                <p class="avatar-text">${user.badge.text}</p>
            </div>

            <div id="badge-overlay" class="navbar">
                <a href="legal_notice.html">Legal Notice</a>
                <a href="privacy_policy.html">Privacy Policy</a>
                <a href="index.html" id="logout-link">Log out</a>
            </div>
        </div>
    `;
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

function getGuestHeaderTemplate() {
    return `
        <div class="user-info">
            <a class="user-info-help" href="./help.html"
               onclick="event.preventDefault(); navigate('./help.html')">
                <img class="Hilfe" src="./assets/help.svg" alt="help">
            </a>

            <div id="header-badge" class="guestloginprofilebadge"
                 onclick="badgeOverlay()">
                <p class="avatar-text-guest">G</p>
            </div>

            <div id="badge-overlay" class="navbar">
                <a href="legal_notice.html">Legal Notice</a>
                <a href="privacy_policy.html">Privacy Policy</a>
                <a href="index.html" id="logout-link" onclick="LogOut()">Log out</a>
            </div>
        </div>
    `;
}

/**
 * removes the flagged user guest = true
 */

function LogOut() {
  sessionStorage.removeItem("guest", "true");
}

window.addEventListener("DOMContentLoaded", initHeader);

function initHeader() {
  const isGuest =
    sessionStorage.getItem("guest") === "true" ||
    window.location.search.includes("nonlogin=true");

  if (isGuest) {
    renderGuestHeader();
  } else {
    dynamicUserHeaderBadge();
  }
}