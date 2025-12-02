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
    if (!name || !password) {
        alert("Email and password are required.");
        return;
    }
    if (password !== passwordConfirm) {
        alert("Password not matching");
        return;
    }
    if (!name) {
        alert("Please put in your name");
        return;
    }
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

async function forwardingNextPage(firebaseId) {
    confirmationSignTemplate();
    await new Promise(r => setTimeout(r, 1000));
    const overlay = document.getElementById("signedup");
    if (overlay) overlay.remove();
    window.location = "/summary.html?uid=" + firebaseId;
}

window.goBackLogin = function () {
    const errorWindow = document.getElementById("errorWindow");
    if (errorWindow) errorWindow.remove();
};

window.loginUserPushedInfo = async function loginUserPushedInfo() {
    const identifier = document.getElementById("email").value.trim(); 
    const password = document.getElementById("password").value.trim();
    if (!identifier || !password) {
        alert("Please fill in all fields.");
        return;
    }
    try {
        const snapshot = await FIREBASE_USERS.get();
        const users = snapshot.val();
        let matchedUsers = [];
        for (const uid in users) {
            const u = users[uid];
            if (u.email === identifier || u.name === identifier) {
                matchedUsers.push(u);
            }
        }
        if (matchedUsers.length === 0) {
            alert("No user found with that name or email.");
            return;
        }
        if (matchedUsers.length > 1) {
            alert("Multiple accounts found with this name. Use your email instead.");
            return;
        }
        const user = matchedUsers[0];
        if (user.password !== password) {
            alert("Incorrect password.");
            return;
        }
        window.location = `/summary.html?uid=${user.id}`;
    } catch (error) {
        console.error("Login error:", error);
    }
};

