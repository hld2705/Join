import { join } from '../firstdata.js';

let activeUserId = null;

let nextUserId = join.users.length + 1;

function contactsLoad() {
  let contacts = document.getElementById("contactsjs");
  let users = join.users.slice().sort((a, b) => a.name.localeCompare(b.name));
  contacts.innerHTML = "";
  let currentLetter = "";

    for (let i = 0; i < users.length; i++) {
    let firstLetter = "#";
    if (users[i].name && users[i].name.length > 0) {
      firstLetter = users[i].name.charAt(0).toUpperCase();
    }

    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      contacts.innerHTML += `
        <h2 class="letter-header">${currentLetter}</h2>
        <img src="/assets/Vector 10.svg">
      `;
    }

    contacts.innerHTML += contactsLoadTemplate(users, i)
  }
  addedNewUser();
}

function contactsRender(userId) {
  let contactInfo = document.getElementById("contactsinfo");
  let userInfo = join.users.find(u => u.id === userId);
  if (!userInfo) return;
  if(activeUserId === userId){
    return;
  }
  if (window.innerWidth <= 780) {
    contactInfo.innerHTML = contactsRenderTemplate(userInfo);
  } else {
    let contactInfo = document.getElementById("contactsinfo");
    if (contactInfo) {
      contactInfo.innerHTML = contactsRenderTemplate(userInfo);
    }
  }
  activeUserId = userId;
  contactInfo.innerHTML = "";
  contactInfo.innerHTML = contactsRenderTemplate(userInfo)
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

  const nameEl  = document.getElementById('edit_name');
  const emailEl = document.getElementById('edit_email');
  const phoneEl = document.getElementById('edit_phone');
  const user = join.users.find(u => u.id === userId);
  if (!user) return;
  user.name  = nameEl.value.trim();
  user.email = emailEl.value.trim();
  user.phone = phoneEl.value.trim();

  closeOverlay();
  contactsLoad();
  contactsRender(userId);
  updateDetailsPanel(user);
}

function updateDetailsPanel(user) {
  const nameNode = document.getElementById('detailed_name');
  const emailNode = document.getElementById('detailed_email');
  const phoneNode = document.getElementById('detailed_phone');

  if (nameNode)  nameNode.textContent  = user.name;
  if (emailNode) emailNode.textContent = user.email;
  if (phoneNode) phoneNode.textContent = user.phone;
}

function createContact() {
  let nameNew  = document.getElementById("name_new_user").value.trim();  
  let emailNew = document.getElementById("email_new_user").value.trim();  
  let phoneNew = document.getElementById("phone_new_user").value.trim();

  let newUser = {
    id: nextUserId++,
    name: nameNew,
    email: emailNew,
    phone: phoneNew,
    badge: "/assets/icons/person.svg"
  };

  join.users.push(newUser);
  contactsLoad();
  contactsRender(newUser.id);
}

async function addedNewUser() {
  let body = document.getElementById("mainbodycontainerid");
  body.innerHTML += `<div id="successMessage">${addedNewUserTemplate()}</div>`;
  await new Promise(r => setTimeout(r, 1500));
  document.getElementById("successMessage").remove();
}


window.createContact = createContact;
window.updateDetailsPanel = updateDetailsPanel;
window.saveUser = saveUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.contactsLoad = contactsLoad;
window.contactsRender = contactsRender;
window.addNewContact = addNewContact;
window.closeOverlay = closeOverlay;