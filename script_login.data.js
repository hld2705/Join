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

firebase.initializeApp(firebaseConfig);
const FIREBASE_USERS = firebase.database().ref("users");

window.logIn = async function logIn() {

    const name = document.getElementById("name_sign_up").value.trim();
    const email = document.getElementById("email_sign_up").value.trim();
    const password = document.getElementById("password_sign_up").value.trim();
    const passwordConfirm = document.getElementById("confirmation_password_sign_up").value.trim();
    if (!signUpValidation(name, email, password, passwordConfirm)) return;
    const newEntry = FIREBASE_USERS.push();

 const exists = await userExistsByEmail(email);
    if (exists) {
        const emailBorder = document.getElementById("email_sign_up");
        const existsMsg = document.getElementById("required-sign_up-email");
        emailBorder.classList.add("submit");
        existsMsg.classList.add("show");
        existsMsg.innerHTML = `*User already found!`
        return;
    }

    const firebaseId = newEntry.key;
    const newUserObj = {
        id: firebaseId,
        name: name,
        email: email,
        phone: "",
        password: password,
        login: 1,
        badge: {
            text: getInitials(name),
            color: getRandomColor()
        },
        newUser: true
    };
    await newEntry.set(newUserObj);
    forwardingNextPage(firebaseId);
};

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}

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

    function signUpValidation(name, email, password, passwordConfirm) {
    let hasError = false;

    const nameBorder = document.getElementById("name_sign_up");
    const emailBorder = document.getElementById("email_sign_up");
    const passwordBorder = document.getElementById("password_sign_up");
    const password2Border = document.getElementById("confirmation_password_sign_up");

    const nameMsg = document.getElementById("required-sign_up-name");
    const emailMsg = document.getElementById("required-sign_up-email");
    const passwordMsg = document.getElementById("required-sign_up-password");
    const password2Msg = document.getElementById("required-sign_up-password2");

    resetSignUpUI();


    if (!name) {
        nameBorder.classList.add("submit");
        nameMsg.classList.add("show");
        hasError = true;
    }

    if (!email || !isValidEmail(email)) {
        emailBorder.classList.add("submit");
        emailMsg.classList.add("show");
        hasError = true;
    }

    if (!password) {
        passwordBorder.classList.add("submit");
        passwordMsg.classList.add("show");
        hasError = true;
    }

    if (password && password !== passwordConfirm) {
        passwordBorder.classList.add("submit");
        password2Border.classList.add("submit");
        password2Msg.classList.add("show");
        hasError = true;
    }

    return !hasError;
}

function resetSignUpUI() {
    [
        "name_sign_up",
        "email_sign_up",
        "password_sign_up",
        "confirmation_password_sign_up"
    ].forEach(id => {
        const input = document.getElementById(id);
        input.classList.remove("submit");
        input.closest(".userinputcustom")?.classList.remove("submit");
    });

    [
        "required-sign_up-name",
        "required-sign_up-email",
        "required-sign_up-password",
        "required-sign_up-password2"
    ].forEach(id =>
        document.getElementById(id)?.classList.remove("show")
    );
}


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
    setTimeout(() => { window.location = `/summary.html?uid=${user.id}` }, 100)
};

async function validateAndFindUser(identifier, password) {
    let hasError = false;

    const nameInput = document.getElementById("login_identifier");
    const passInput = document.getElementById("password");

    const nameMsg = document.getElementById("required-login-name");
    const passMsg = document.getElementById("required-login-password");

    if (!identifier || !isValidEmail(identifier)) {
        nameInput.classList.add("submit");
        nameMsg.classList.add("show");
        hasError = true;
    }

    if (!password) {
        passInput.classList.add("submit");
        passMsg.classList.add("show");
        hasError = true;
    }

    if (hasError) return false;

    const snapshot = await FIREBASE_USERS.get();
    const users = snapshot.val();

    if (!users) {
        nameInput.classList.add("submit");
        nameMsg.classList.add("show");
        return false;
    }

    let matchedUser = null;

    for (const uid in users) {
        const u = users[uid];
        if (u.email?.trim().toLowerCase() === identifier) {
            matchedUser = u;
            break;
        }
    }

    if (!matchedUser) {
        nameInput.classList.add("submit");
        nameMsg.classList.add("show");
        return false;
    }

    if (matchedUser.password !== password) {
        passInput.classList.add("submit");
        passMsg.classList.add("show");
        return false;
    }

    return matchedUser;
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
    setTimeout(() => { window.location.href = "./summary.html?nonlogin=true"; }, 100)
}