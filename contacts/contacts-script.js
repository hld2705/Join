
let activeUserId = null;

let nextUserId = join.users.length + 1;

function contactsLoad() {
  let contacts = document.getElementById("contactsjs");
  let users = join.users.slice().sort((a, b) => a.name.localeCompare(b.name));
  contacts.innerHTML = "";
  let currentLetter = "";
  let responsiveEditContactId = document.getElementById("responsiveeditcontactid");
  responsiveEditContactId.style.display = "none";

  for (let i = 0; i < users.length; i++) {
    let firstLetter = "#";
    if (users[i].name && users[i].name.length > 0) {
      firstLetter = users[i].name.charAt(0).toUpperCase();
    }

    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      if(currentLetter !== "G")
      {contacts.innerHTML += `<div class="letter-separationline-container">
        <h2 class="letter-header">${currentLetter}</h2>
        <img class="separationline" src="./assets/Vector 10.svg">
        </div>
      `;
    }}; 
    if(users[i].id === 0) continue;

    contacts.innerHTML += contactsLoadTemplate(users, i)
  }
}

function contactsRender(userId) {
  let contactInfo = document.getElementById("contactsinfo");
  let responsiveLeftSide = document.getElementById("responsiveleftsidecontacts");
  let responsiveContactsDetails = document.getElementById("responsivecontactsmoto");

  let userInfo = join.users.find(u => u.id === userId);
  if (!userInfo) return;

  if (activeUserId === userId) {
    contactInfo.innerHTML = "";
    activeUserId = null;
    return;
  }

  if (window.innerWidth <= 780) {
    if (responsiveLeftSide) {
      responsiveLeftSide.style.display = "none";
    }
    if (responsiveContactsDetails) {
      responsiveContactsDetails.style.display = "block";
    }
  }
  
  activeUserId = userId;
  contactInfo.innerHTML = "";
  contactInfo.innerHTML = contactsRenderTemplate(userInfo);
  updateResponsiveButtons();
}

function updateResponsiveButtons() {
  let responsiveAddContactId = document.getElementById("responsiveaddcontactid");
  let responsiveEditContactId = document.getElementById("responsiveeditcontactid");

  if (window.innerWidth <= 780) {
    if (activeUserId) {
      if (responsiveAddContactId) responsiveAddContactId.style.display = "none";
      if (responsiveEditContactId) responsiveEditContactId.style.display = "block";      
    } else {
      if (responsiveAddContactId) responsiveAddContactId.style.display = "flex";
      if (responsiveEditContactId) responsiveEditContactId.style.display = "none";
    }
  } else {
    if (responsiveAddContactId) responsiveAddContactId.style.display = "none";
    if (responsiveEditContactId) responsiveEditContactId.style.display = "none";
  }
}

function editUserOptionsResponsive(){
  let userId = activeUserId;
  let responsiveEditContactId = document.getElementById("responsiveeditcontactid");
  if (window.innerWidth >= 780) {
    responsiveEditContactId.style.display = "none";
  }else{responsiveEditContactId.style.display = "block";}
  responsiveEditContactId.innerHTML = editUserOptionsResponsiveTemplate(userId);

}
function addNewContact() {
  let popUp = document.getElementById("body");
  popUp.innerHTML += addNewContactTemplate();
}

function closeOverlay() {
  const overlay = document.getElementById("closeoverlay");
  if (overlay) overlay.remove();
}

function editUser(userId) {
  let user = join.users.find(u => u.id === userId);
  if (!user) return;
  let popUpEditUser = document.getElementById("body");
  popUpEditUser.innerHTML += editUserTemplate(user);
  contactsLoad();
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

  const nameEl = document.getElementById('edit_name');
  const emailEl = document.getElementById('edit_email');
  const phoneEl = document.getElementById('edit_phone');
  const user = join.users.find(u => u.id === userId);
  if (!user) return;
  user.name = nameEl.value.trim();
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

  if (nameNode) nameNode.textContent = user.name;
  if (emailNode) emailNode.textContent = user.email;
  if (phoneNode) phoneNode.textContent = user.phone;
}

function createContact() {
  let nameNew = document.getElementById("name_new_user").value.trim();
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

  addedNewUser();
  contactsLoad();

}

async function addedNewUser() {
  let body = document.getElementById("mainbodycontainerid");
  body.innerHTML += `<div id="successMessage">${addedNewUserTemplate()}</div>`;
  await new Promise(r => setTimeout(r, 1500));
  document.getElementById("successMessage").remove();
}

function reRenderContacts() {
  let contactInfo = document.getElementById("contactsinfo");
  let responsiveLeftSide = document.getElementById("responsiveleftsidecontacts");
  let responsiveContactsDetails = document.getElementById("responsivecontactsmoto");

  if (window.innerWidth <= 780) {
    contactInfo.innerHTML = "";
    if (responsiveLeftSide) {
      responsiveLeftSide.style.display = "block";
    }
    if (responsiveContactsDetails) {
      responsiveContactsDetails.style.display = "none";
    }
  }
  contactInfo.innerHTML = "";
  activeUserId = null;
  contactsLoad();

  let responsiveAddContactId = document.getElementById("responsiveaddcontactid");
  if (responsiveAddContactId) {
    responsiveAddContactId.style.display = "flex";
  }
  let responsiveEditContactId = document.getElementById("responsiveeditcontactid");
  if (responsiveEditContactId) {
    responsiveEditContactId.style.display = "none";
  }
}

window.addEventListener("resize", updateResponsiveButtons);
window.updateResponsiveButtons = updateResponsiveButtons;
window.editUserOptionsResponsive = editUserOptionsResponsive
window.reRenderContacts = reRenderContacts;
window.createContact = createContact;
window.updateDetailsPanel = updateDetailsPanel;
window.saveUser = saveUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.contactsLoad = contactsLoad;
window.contactsRender = contactsRender;
window.addNewContact = addNewContact;
window.closeOverlay = closeOverlay;