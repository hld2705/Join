import { getUsers } from '/db.js';

    function contactsLoad() {
    let contacts = document.getElementById("contactsjs");
    let users = getUsers();
    contacts.innerHTML = "";
    for (let i = 0; i < users.length; i++) {
      contacts.innerHTML += `<div>${users[i].email}</div>`;
    }
  }

  window.contactsLoad = contactsLoad;