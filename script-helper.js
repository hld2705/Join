/** Extracts initials from a full name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}

/** Returns a random predefined color.
 * @returns {string}
 */
function getRandomColor() {
    const colors = ["#2A3647", "#29ABE2", "#FF7A00", "#9327FF", "#FC71FF", "#fccc59", "#442c8c", "#fc4444"];
    return colors[Math.floor(Math.random() * colors.length)];
}

/** Validates the signup name input.
 * @param {string} name
 * @returns {boolean}
 */
function validateName(name) {
    if (name) return false;
    document.getElementById("name_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-name").classList.add("show");
    return true;
}

/** Validates the signup email input.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
    if (email && isValidEmail(email)) return false;
    document.getElementById("email_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-email").classList.add("show");
    return true;
}

/** Validates the signup password input.
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
    if (password) return false;
    document.getElementById("password_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-password").classList.add("show");
    return true;
}

/** Validates password confirmation match.
 * @param {string} password
 * @param {string} passwordConfirm
 * @returns {boolean}
 */
function validatePasswordMatch(password, passwordConfirm) {
    if (!password || password === passwordConfirm) return false;
    document.getElementById("password_sign_up").classList.add("submit");
    document.getElementById("confirmation_password_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-password2").classList.add("show");
    return true;
}