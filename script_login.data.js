const firebaseConfig = {
    apiKey: "AIzaSyDaAKocqkIROo_InISQbRjsoG8z1JCK3g0",
    authDomain: "join-gruppenarbeit-75ecf.firebaseapp.com",
    databaseURL: "https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-gruppenarbeit-75ecf",
    storageBucket: "join-gruppenarbeit-75ecf.appspot.com",
    messagingSenderId: "180158531840",
    appId: "1:180158531840:web:c894124a7d6eb515364be5",
    measurementId: "G-5R563MH52P"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const FIREBASE_USERS = firebase.database().ref("users");

/**
 * Validates signup inputs, checks if user already exists,
 * and creates a new user in Firebase if not.
 *
 * @async
 * @returns {Promise<void>}
 */
window.logIn = async function logIn() {
    const data = getSignUpInputValues();
    if (!signUpValidation(data.name, data.email, data.password, data.passwordConfirm)) return;
    const exists = await userExistsByEmail(data.email);
    resetSignUpUI();
    if (exists) {
        showUserAlreadyExists();
        return;
    }
    const firebaseId = await createNewUser(data);
    forwardingNextPage(firebaseId);
};

function getSignUpInputValues() {
    return {
        name: document.getElementById("name_sign_up").value.trim(),
        email: document.getElementById("email_sign_up").value.trim(),
        password: document.getElementById("password_sign_up").value.trim(),
        passwordConfirm: document.getElementById("confirmation_password_sign_up").value.trim()
    };
}

function showUserAlreadyExists() {
    const emailBorder = document.getElementById("email_sign_up");
    const existsMsg = document.getElementById("required-sign_up-email");
    emailBorder.classList.add("submit");
    existsMsg.classList.add("show");
    existsMsg.innerHTML = "*User already found!";
}

/**
 * Creates a new user entry in Firebase and returns its generated id.
 *
 * @async
 * @param {Object} data
 * @returns {Promise<string>} Firebase user id
 */
async function createNewUser(data) {
    const newEntry = FIREBASE_USERS.push();
    const firebaseId = newEntry.key;
    const newUserObj = createNewUserObject(firebaseId, data);
    await newEntry.set(newUserObj);
    return firebaseId;
}

/**
 * Builds the user object structure for Firebase.
 *
 * @param {string} id
 * @param {Object} data
 * @returns {Object}
 */
function createNewUserObject(id, data) {
    return {
        id,
        name: data.name,
        email: data.email,
        phone: "",
        password: data.password,
        login: 1,
        badge: {
            text: getInitials(data.name),
            color: getRandomColor()
        },
        newUser: true
    };
}

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}

/**
 * Checks if a user with the given email already exists in Firebase.
 *
 * @async
 * @param {string} email
 * @returns {Promise<boolean>}
 */
async function userExistsByEmail(email) {
    const snapshot = await FIREBASE_USERS.get();
    const users = snapshot.val();
    if (!users) return false;
    email = email.toLowerCase().trim();
    for (const id in users) {
        if (users[id].email?.toLowerCase() === email) {
            return true;
        }
    }
    return false;
}

function getRandomColor() {
    const colors = ["#2A3647", "#29ABE2", "#FF7A00", "#9327FF", "#FC71FF", "#fccc59", "#442c8c", "#fc4444"];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Validates signup input fields.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string} passwordConfirm
 * @returns {boolean}
 */
function signUpValidation(name, email, password, passwordConfirm) {
    resetSignUpUI();
    let hasError = false;
    hasError |= validateName(name);
    hasError |= validateEmail(email);
    hasError |= validatePassword(password);
    hasError |= validatePasswordMatch(password, passwordConfirm);

    return !hasError;
}

function validateName(name) {
    if (name) return false;
    document.getElementById("name_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-name").classList.add("show");
    return true;
}

function validateEmail(email) {
    if (email && isValidEmail(email)) return false;
    document.getElementById("email_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-email").classList.add("show");
    return true;
}

function validatePassword(password) {
    if (password) return false;
    document.getElementById("password_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-password").classList.add("show");
    return true;
}

function validatePasswordMatch(password, passwordConfirm) {
    if (!password || password === passwordConfirm) return false;
    document.getElementById("password_sign_up").classList.add("submit");
    document.getElementById("confirmation_password_sign_up").classList.add("submit");
    document.getElementById("required-sign_up-password2").classList.add("show");
    return true;
}

function InputSignUpValidation() {
    const nameInput = document.getElementById("name_sign_up");
    const emailInput = document.getElementById("email_sign_up");
    const passwordInput = document.getElementById("password_sign_up");
    const passwordConfirmInput = document.getElementById("confirmation_password_sign_up");
    nameInput.addEventListener("input", validateNameLive);
    emailInput.addEventListener("input", validateEmailLive);
    passwordInput.addEventListener("input", validatePasswordLive);
    passwordConfirmInput.addEventListener("input", validatePasswordMatchLive);
}

document.addEventListener("DOMContentLoaded", InputSignUpValidation);

function validateNameLive() {
    const input = document.getElementById("name_sign_up");
    const msg = document.getElementById("required-sign_up-name");
    if (input.value.trim()) {
        input.classList.remove("submit");
        msg.classList.remove("show");
    }
}

function validateEmailLive() {
    const input = document.getElementById("email_sign_up");
    const msg = document.getElementById("required-sign_up-email");
    if (isValidEmail(input.value.trim())) {
        input.classList.remove("submit");
        msg.classList.remove("show");
    }
}

function validatePasswordLive() {
    const input = document.getElementById("password_sign_up");
    const msg = document.getElementById("required-sign_up-password");
    if (input.value.trim()) {
        input.classList.remove("submit");
        msg.classList.remove("show");
    }
}

function validatePasswordMatchLive() {
    const pass = document.getElementById("password_sign_up").value;
    const confirm = document.getElementById("confirmation_password_sign_up").value;
    const passInput = document.getElementById("password_sign_up");
    const confirmInput = document.getElementById("confirmation_password_sign_up");
    const msg = document.getElementById("required-sign_up-password2");
    if (pass && confirm && pass === confirm) {
        passInput.classList.remove("submit");
        confirmInput.classList.remove("submit");
        msg.classList.remove("show");
    }
}

function resetSignUpUI() {
    resetSignUpInputs();
    resetSignUpMessages();
}

function resetSignUpInputs() {
    const inputIds = [
        "name_sign_up",
        "email_sign_up",
        "password_sign_up",
        "confirmation_password_sign_up"
    ];

    inputIds.forEach(id => {
        const input = document.getElementById(id);
        input.classList.remove("submit");
        input.closest(".userinputcustom")?.classList.remove("submit");
    });
}

function resetSignUpMessages() {
    const messageIds = [
        "required-sign_up-name",
        "required-sign_up-email",
        "required-sign_up-password",
        "required-sign_up-password2"
    ];

    messageIds.forEach(id => {
        document.getElementById(id)?.classList.remove("show");
    });
}

/**
 * Stores the user id locally, shows a confirmation overlay,
 * then redirects to the summary page.
 *
 * @async
 * @param {string} firebaseId
 * @returns {Promise<void>}
 */
async function forwardingNextPage(firebaseId) {
    localStorage.setItem("uid", firebaseId);
    await new Promise(r => setTimeout(r, 300));
    confirmationSignTemplate();
    const overlay = document.getElementById("signedup");
    let confirmationContainer = document.getElementById("signedupconfirmationid");
    requestAnimationFrame(() => {
        confirmationContainer.classList.add("is-open");
    });
    await new Promise(r => setTimeout(r, 2000));
    if (overlay) overlay.remove();
    window.location = "/summary.html?uid=" + firebaseId;
}

window.goBackLogin = function () {
    const errorWindow = document.getElementById("errorWindow");
    if (errorWindow) errorWindow.remove();
};

/**
 * Handles login submission, validates inputs, and forwards user to summary page on success.
 *
 * @async
 * @returns {Promise<void>}
 */
window.loginUserPushedInfo = async function () {
    const identifier = document.getElementById("login_identifier").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    let isMobile = window.innerWidth < 780;
    resetLoginUI();
    const user = await validateAndFindUser(identifier, password);
    if (!user) return;
    if (isMobile) {
        sessionStorage.setItem("userWelcome", "true");
    }
    setTimeout(() => { window.location = `/summary.html?uid=${user.id}` }, 100);
};

function showPasswordError(message) {
    const passError = document.getElementById("required-login-password");
    passError.textContent = message;
    passError.classList.add("show");
}

function hidePasswordError() {
    const passError = document.getElementById("required-login-password");
    passError.classList.remove("show");
    passError.textContent = "";
}

/**
 * Returns a user by email from Firebase or null if not found.
 *
 * @async
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function getUserByEmail(email) {
    let snapshot = await FIREBASE_USERS.get();
    let users = snapshot.val();

    for (let id in users) {
        if (users[id].email.toLowerCase() === email.toLowerCase()) {
            return users[id];
        }
    }

    return null;
}

/**
 * Validates login inputs and returns the matching user object on success.
 *
 * @async
 * @param {string} identifier
 * @param {string} password
 * @returns {Promise<Object|false>}
 */
async function validateAndFindUser(identifier, password) {
    const emailInput = document.getElementById("login_identifier");
    const passInput = document.getElementById("password");
    const emailMsg = document.getElementById("required-login-name");
    emailInput.classList.remove("submit");
    passInput.classList.remove("submit");
    emailMsg.classList.remove("show");
    if (!identifyUser(identifier, emailInput, emailMsg)) return false;
    if (!isLoginPasswordCorrect(passInput, password)) return false;
    const user = await getUserByEmail(identifier);
    if (!isLoginPasswordMatching(user, password, emailInput, passInput)) return false;
    return user;
}

function isLoginPasswordCorrect(passInput, password) {
    if (!password) {
        passInput.classList.add("submit");
        showPasswordError("Password is required");
        return false;
    }
    return true;
}

function isLoginPasswordMatching(user, password, emailInput, passInput) {
    if (user && user.password === password) return true;
    emailInput.classList.add("submit");
    passInput.classList.add("submit");
    showPasswordError("Password or email does not match");
    return false;
}

function identifyUser(identifier, emailInput, emailMsg) {
    if (identifier && isValidEmail(identifier)) return true;

    emailInput.classList.add("submit");
    emailMsg.textContent = "Please enter a valid email address";
    emailMsg.classList.add("show");
    return false;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resetLoginUI() {
    [
        "login_identifier",
        "password"
    ].forEach(id =>
        document.getElementById(id).classList.remove("submit")
    );
    [
        "required-login-name",
        "required-login-password"
    ].forEach(id =>
        document.getElementById(id).classList.remove("show")
    );
}

window.guestLogIn = function () {
    let isMobile = window.innerWidth < 780;
    sessionStorage.setItem("guest", "true");
    if (isMobile) {
        sessionStorage.setItem("guestWelcome", "true");
    }
    setTimeout(() => { window.location.href = "./summary.html?nonlogin=true"; }, 100);
};
