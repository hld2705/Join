window.onload = () => {
    loginUserPushedInfo();
}

import { join } from './firstdata.js'

function loginUserPushedInfo() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const newUser = {
    id: join.users.length,
    name: "",
    email: email,
    phone: "",
    password: password,
    login: 1,
    badge: "./assets/profilebadge/default.svg",
  };
  join.users.push(newUser);
  console.log("user added:", newUser);
  console.log("All users now:", join.users);

}

window.logIn = function logIn(){
  const name = document.getElementById("name_sign_up").value;
  const email = document.getElementById("email_sign_up").value;
  const password = document.getElementById("password_sign_up").value;
  const newSignedUser = {
    id: join.users.length,
    name: name,
    email: email,
    phone: "",
    password: password,
    login: 1,
    badge: "./assets/profilebadge/default.svg",
  };
  join.users.push(newSignedUser);
  console.log(newSignedUser)
  confirmationSignTemplate();
}
