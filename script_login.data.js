
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

  if (!email || !password) {
    alert("Email and password are required.");
    return;
  }

  const entry = FIREBASE_USERS.push();
  const firebaseId = entry.key;

  const newSignedUser = {
    id: firebaseId,  
    name: name || "",
    email: email,
    phone: "",
    password: password,
    login: 1,
    badge: "./assets/icons/person.svg",
    newUser: true,
  };

  await entry.set(newSignedUser);

  forwardingNextPage(firebaseId);
}


async function forwardingNextPage(firebaseId) {
  confirmationSignTemplate(); 
  await new Promise(r => setTimeout(r, 1000));
  const overlay = document.getElementById("signedup");
  if (overlay) overlay.remove();
  window.location = `/summary.html?uid=${firebaseId}`;
}


window.goBackLogin = function(){
  let errorWindow = document.getElementById("errorWindow");
  if(errorWindow) errorWindow.remove();

}
document.getElementById("loginButton").addEventListener("click", loginUserPushedInfo);

async function loginUserPushedInfo() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const snapshot = await FIREBASE_USERS.get();
    const users = snapshot.val();

    let userFound = null;
    for (const userId in users) {
      if (users[userId].email === email) {
        userFound = users[userId];
        break;
      }
    }



    if (userFound.password !== password) {
      alert("Incorrect password. Please try again.");
      return;
    }
    console.log("Login successful for", userFound.email);
    window.location = `/summary.html?uid=${userFound.id}`;

  } catch (error) {
    console.error("Error checking users:", error);
  }
}
