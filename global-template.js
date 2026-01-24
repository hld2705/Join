function isInput(el) {
  return el.matches("input[type='text'], input[type='email'], input[type='date'], input[type='password'], input[type='phone'], input[type='tel'], textarea");
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
               onclick="event.preventDefault(); navigate('./help.html')" id="help">
                <img class="Hilfe" src="./assets/help.svg" alt="help">
            </a>
            <div id="header-badge" class="profil"
                 style="background:${user.badge.color}"
                 onclick="badgeOverlay()">
                <p class="avatar-text">${user.badge.text}</p>
            </div>
            <div id="badge-overlay" class="navbar">
                <a href="legal_notice.html" onclick="event.preventDefault(); navigate('./legal_notice.html')">Legal Notice</a>
                <a href="privacy_policy.html" onclick="event.preventDefault(); navigate('./privacy_policy.html')">Privacy Policy</a>
                <a href="index.html" id="logout-link">Log out</a>
            </div>
        </div>
    `;
}

/**
 * 
 * @returns Guest header badge, also with the popup menu upon clicking on it
 */
function getGuestHeaderTemplate() {
    return `
        <div class="user-info">
            <a class="user-info-help" href="./help.html"
               onclick="event.preventDefault(); navigate('./help.html')" id="help">
                <img class="Hilfe" src="./assets/help.svg" alt="help">
            </a>
            <div id="header-badge" class="guestloginprofilebadge"
                 onclick="badgeOverlay()">
                <p class="avatar-text-guest">G</p>
            </div>
            <div id="badge-overlay" class="navbar">
                <a href="legal_notice.html?nonlogin=true">Legal Notice</a>
                <a href="privacy_policy.html?nonlogin=true">Privacy Policy</a>
                <a href="index.html" id="logout-link" onclick="LogOut()">Log out</a>
            </div>
        </div>
    `;
}
