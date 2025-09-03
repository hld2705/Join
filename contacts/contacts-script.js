import { join } from '/firstdata.js';

function contactsLoad() {
  let contacts = document.getElementById("contactsjs");
  let users = join.users.slice().sort((a, b) => a.name.localeCompare(b.name));
  contacts.innerHTML = "";
  let currentLetter = "";

  for (let i = 0; i < users.length; i++) {
    let firstLetter = users[i].name[0].toUpperCase();

    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      contacts.innerHTML += `
        <h2 class="letter-header">${currentLetter}</h2>
        <img src="/assets/Vector 10.svg">
      `;
    }

    contacts.innerHTML += contactsLoadTemplate(users, i)
  }
}

function contactsRender(userId) {
  let contactInfo = document.getElementById("contactsinfo");
  let userInfo = join.users.find(u => u.id === userId);

  if (!userInfo) return;

  contactInfo.innerHTML += contactsRenderTemplate(userInfo)
}

function addNewContact(){
    let popUp = document.getElementById("body");
    popUp.innerHTML += addNewContactTemplate();
}

function closeOverlay() {
    const overlay = document.querySelector(".createnewcontact-overlay");
    if (overlay) overlay.remove();
}

window.contactsLoad = contactsLoad;
window.contactsRender = contactsRender;
window.addNewContact = addNewContact;
window.closeOverlay = closeOverlay;