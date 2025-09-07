import { join } from '/firstdata.js';

let activeUserId = null;

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
  if(activeUserId === userId){
    return;
  }
  activeUserId = userId;
  contactInfo.innerHTML = "";
  contactInfo.innerHTML += contactsRenderTemplate(userInfo)
}

function addNewContact(){
    let popUp = document.getElementById("body");
    popUp.innerHTML += addNewContactTemplate();
}

function closeOverlay() {
    const overlay = document.getElementById("closeoverlay");
    if (overlay) overlay.remove();
}

function editUser(userId){
  let user = join.users.find(u => u.id === userId);
  if (!user) return;
  let popUpEditUser = document.getElementById("body");
  popUpEditUser.innerHTML += editUserTemplate(user);
}

function deleteUser(userId) {
  join.users = join.users.filter(u => u.id !== userId);
  if (activeUserId === userId) {
    activeUserId = null;
    document.getElementById("contactsinfo").innerHTML = "";
  }
  contactsLoad();
}

function saveUser(userId) {
  const user = join.users.find(u => u.id === userId);
  if (!user) return;

  user.name  = document.getElementById("edit_name").value;
  user.email = document.getElementById("edit_email").value;
  user.phone = document.getElementById("edit_phone").value;

  closeOverlay();
  contactsLoad();

  contactsRender(userId);
}

window.saveUser = saveUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.contactsLoad = contactsLoad;
window.contactsRender = contactsRender;
window.addNewContact = addNewContact;
window.closeOverlay = closeOverlay;