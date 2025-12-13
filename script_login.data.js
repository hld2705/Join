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
    const firebaseId = newEntry.key;
    const newUserObj = {
        id: firebaseId,
        name: name,
        email: email,
        phone: "",
        password: password,
        login: 1,
        badge: "./assets/icons/person.svg",
        newUser: true
    };
    await newEntry.set(newUserObj);
    forwardingNextPage(firebaseId);
};

function signUpValidation(name, email, password, passwordConfirm) {
    let signUpNameBorder = document.getElementById("input_border_sign_up_name");
    let signUpEmailBorder = document.getElementById("input_border_sign_up_email");
    let signUpPasswordBorder = document.getElementById("input_border_sign_up_password");
    let signUpPasswordConfirmationBorder = document.getElementById("input_border_sign_up_password2");
    let signUpNameP = document.getElementById("required-sign_up-name");
    let signUpEmailP = document.getElementById("required-sign_up-email");
    let signUpPasswordP = document.getElementById("required-sign_up-password");
    let signUpPasswordConfirmationP = document.getElementById("required-sign_up-password2");
    resetSignUpUI();
    if (!name) {
        signUpNameBorder.classList.add("submit");
        signUpNameP.innerHTML = "*This field is required!"
        return;
    }
    if (!email) {
        signUpEmailBorder.classList.add("submit");
        signUpEmailP.innerHTML = "*This field is required!";
        return;
    }
    if (!email.includes("@")) {
        signUpEmailBorder.classList.add("submit");
        signUpEmailP.innerHTML = "*@ is mandatory!";
        return;
    }
    if (!password) {
        signUpPasswordBorder.classList.add("submit");
        signUpPasswordP.innerHTML = "*This field is required!";
        return;
    }
    if (password !== passwordConfirm) {
        signUpPasswordBorder.classList.add("submit");
        signUpPasswordConfirmationBorder.classList.add("submit");
        signUpPasswordP.innerHTML = "*Password doesnt match!";
        signUpPasswordConfirmationP.innerHTML = "*Password doesnt match!";
        return;
    }
    return true;
}

function resetSignUpUI() {
    ["input_border_sign_up_name", "input_border_sign_up_email", "input_border_sign_up_password", "input_border_sign_up_password2"]
        .forEach(id => document.getElementById(id).classList.remove("submit"));
    ["required-sign_up-name", "required-sign_up-email", "required-sign_up-password", "required-sign_up-password2"]
        .forEach(id => document.getElementById(id).innerHTML = "");
}

async function forwardingNextPage(firebaseId) {
    await new Promise(r => setTimeout(r, 300));
    confirmationSignTemplate();

    const overlay = document.getElementById("signedup");
    let confirmationContainer = document.getElementById("signedupconfirmationid");
    confirmationContainer.classList.add('is-open');
    
    await new Promise(r => setTimeout(r, 1000));
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
    if(isMobile){
        sessionStorage.setItem("userWelcome","true");
    }
   setTimeout(() => { window.location = `/summary.html?uid=${user.id}`}, 100)
};

async function validateAndFindUser(identifier, password) {
    let nameB = document.getElementById("input_border_login_name");
    let passB = document.getElementById("input_border_login_password");
    let nameP = document.getElementById("required-login-name");
    let passP = document.getElementById("required-login-password");
    if (!identifier) {
        nameB.classList.add("submit");
        nameP.innerHTML = "*Email or name is required!";
        return false;
    }
    if (!password) {
        passB.classList.add("submit");
        passP.innerHTML = "*Password is required!";
        return false;
    }
    const snapshot = await FIREBASE_USERS.get();
    const users = snapshot.val();
    if (!users) {
        nameB.classList.add("submit");
        nameP.innerHTML = "*No users exist. Please register!";
        return false;
    }
    let matchedUsers = [];
    for (const uid in users) {
        const u = users[uid];
        const dbEmail = u.email?.trim().toLowerCase();
        const dbName = u.name?.trim().toLowerCase();
        if (dbEmail === identifier || dbName === identifier) {
            matchedUsers.push(u);
        }
    }
    if (matchedUsers.length === 0) {
        nameB.classList.add("submit");
        nameP.innerHTML = "*No matched users found. Please register first!";
        return false;
    }
    const user = matchedUsers[0];
    if (user.password !== password) {
        passB.classList.add("submit");
        passP.innerHTML = "*Incorrect password!";
        return false;
    }
    return user;
}

function resetLoginUI() {
    ["input_border_login_name", "input_border_login_password"]
        .forEach(id => document.getElementById(id).classList.remove("submit"));
    ["required-login-name", "required-login-password"]
        .forEach(id => document.getElementById(id).innerHTML = "");
}


window.guestLogIn = function(){
    let isMobile = window.innerWidth < 780;
    if(isMobile){
        sessionStorage.setItem("guestWelcome","true");
    }
    setTimeout(() => {window.location.href = "./summary.html";}, 100)
}