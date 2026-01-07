let activeUserId = null;
const firebaseConfig = {
  apiKey: "AIzaSyDaAKocqkIROo_InISQbRjsoG8z1JCK3g0",
  authDomain: "join-gruppenarbeit-75ecf.firebaseapp.com",
  databaseURL: "https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-gruppenarbeit-75ecf",
  storageBucket: "join-gruppenarbeit-75ecf.firebasestorage.app",
  messagingSenderId: "180158531840",
  appId: "1:180158531840:web:c894124a7d6eb515364be5",
  measurementId: "G-5R563MH52P"
};
firebase.initializeApp(firebaseConfig);
const FIREBASE_USERS = firebase.database().ref("users");
async function fetchData() {
  let response = await FIREBASE_USERS.once("value")
  let data = response.val();
  return data ? Object.entries(data).map(([id, user]) => ({ id: String(id), ...user })) : [];
}

async function contactsLoad() {
  const contacts = document.getElementById("contactsjs");
  contacts.innerHTML = "";
  const users = (await fetchData()).filter(u => u && u.name).sort((a, b) => a.name.localeCompare(b.name));
  document.getElementById("responsiveeditcontactid").style.display = "none";
  let currentLetter = "";
  for (const user of users) {
    const firstLetter = user.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      contacts.innerHTML += `<div class="letter-separationline-container">
        <h2 class="letter-header">${currentLetter}</h2>
        <img class="separationline" src="./assets/Vector 10.svg">
      </div>`;
    }
    contacts.innerHTML += contactsLoadTemplate(user);
  }
}


async function contactsRender(userId) {
  const contactInfo = document.getElementById("contactsinfo");
  const responsiveLeft = document.getElementById("responsiveleftsidecontacts");
  const responsiveDetails = document.getElementById("responsivecontactsmoto");
  const prevId = activeUserId;
  activeUserId = userId;
  userHighlight(prevId, userId);
  if (window.innerWidth <= 900) {
    if (responsiveLeft) responsiveLeft.style.display = "none";
    if (responsiveDetails) responsiveDetails.style.display = "block";
  }
  const users = await fetchData();
  const userInfo = users.find(u => String(u.id) === String(userId));
  if (!userInfo) return;
  setTimeout(() => contactInfo.classList.add("is-open"), 50);
  contactInfo.classList.remove("is-open");
  contactInfo.innerHTML = contactsRenderTemplate(userInfo);
  updateResponsiveButtons();
}


function userHighlight(previousId, newId) {
  let prev = document.getElementById(`contactfield${previousId}`);
  let curr = document.getElementById(`contactfield${newId}`);
  if (prev) {
    prev.style.backgroundColor = "#fff";
    prev.style.color = "black";
    prev.style.borderRadius = "10px";
  }
  if (curr) {
    curr.style.backgroundColor = "#2A3647";
    curr.style.color = "white";
    curr.style.borderRadius = "10px";
  }
}

function updateResponsiveButtons() {
  let responsiveAddContactId = document.getElementById("responsiveaddcontactid");
  let responsiveEditContactId = document.getElementById("responsiveeditcontactid");
  if (window.innerWidth <= 900) {
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

function editUserOptionsResponsive() {
  let userId = activeUserId;
  let responsiveEditContactId = document.getElementById("responsiveeditcontactid");
   document.getElementById("responsiveeditcontact-overlay-container").style.display = "block";
  if (window.innerWidth >= 900) {
    responsiveEditContactId.style.display = "none";
  } else { 
    responsiveEditContactId.style.display = "block"; }
  document.getElementById("responsiveeditcontact-overlay-container").innerHTML =
    editUserOptionsResponsiveTemplate(userId);
}

document.addEventListener("click", function(e) {
  let overlay = document.getElementById("edit_overlay");
  if (overlay && !e.target.closest("#edit_overlay")) {
    overlay.remove();
  }
  updateResponsiveButtons();
});

function addNewContact() {
  let popUp = document.getElementById("body");
  if (!document.getElementById("closeoverlay")) {
  popUp.innerHTML += addNewContactTemplate();
}
  let contactContainer = document.getElementById('contact-container')
  if (contactContainer) {
    setTimeout(() => {
      contactContainer.classList.add('is-open')
    }, 20);
  }
}

function closeOverlay() {
  let contactContainer = document.getElementById('contact-container');
  const overlay = document.getElementById("closeoverlay");
  const editOverlay = document.getElementById("closediteoverlay");
  const editContainer = document.getElementById('edit-main-container');
  if (contactContainer) {
    contactContainer.classList.remove('is-open');
  }
  if (editContainer) {
    editContainer.classList.remove('is-open');
  }
  setTimeout(() => {
    if (overlay) overlay.remove();
    if (editOverlay) editOverlay.remove();
  }, 250);
}

async function editUser(userId) {
  let users = await fetchData();
  let user = users.find(u => String(u.id) === String(userId));
  if (!user) return;
  let popUpEditUser = document.getElementById("body");
  popUpEditUser.innerHTML += editUserTemplate(user);
  let contactContainer = document.getElementById('edit-main-container')
 document.getElementById("responsiveeditcontact-overlay-container").style.display = "none";
  if (contactContainer) {
    setTimeout(() => {
      contactContainer.classList.add('is-open')
    }, 20);
  }
}

async function deleteUser(userId) {
  await FIREBASE_USERS.child(userId).remove();
  if (activeUserId === userId) {
    activeUserId = null;
    document.getElementById("contactsinfo").innerHTML = "";
  }
  closeOverlay();
  contactsLoad();
}

async function saveUser(userId) {
  const nameEl = document.getElementById('edit_name').value.trim();
  const emailEl = document.getElementById('edit_email').value.trim();
  const phoneEl = document.getElementById('edit_phone').value.trim();
  if (!validateEditUser()) return;
  await FIREBASE_USERS.child(userId).update({
    name: nameEl,
    email: emailEl,
    phone: phoneEl,
    badge: {
    text: getInitials(nameEl),
    color: getRandomColor()
  }})
  await contactsLoad();
  contactsRender(userId);
  updateDetailsPanel({ name: nameEl, email: emailEl, phone: phoneEl });
  closeOverlay();
}

function updateDetailsPanel(user) {
  const nameNode = document.getElementById('detailed_name');
  const emailNode = document.getElementById('detailed_email');
  const phoneNode = document.getElementById('detailed_phone');
  if (nameNode) nameNode.textContent = user.name;
  if (emailNode) emailNode.textContent = user.email;
  if (phoneNode) phoneNode.textContent = user.phone;
}

function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
}

function getRandomColor() {
  const colors = ["#2A3647", "#29ABE2", "#FF7A00", "#9327FF", "#FC71FF", "#fccc59", "#442c8c", "#fc4444"];
  return colors[Math.floor(Math.random() * colors.length)]; 
}

async function createContact() {
  if (!validateAddNewUser()) return;
  const name = document.getElementById("name_new_user").value.trim();
  const email = document.getElementById("email_new_user").value.trim();
  const phone = document.getElementById("phone_new_user").value.trim();
  const entry = firebase.database().ref("users").push();
  const id = entry.key;
  await entry.set({
    id, name, email, phone,
    badge: { text: getInitials(name), color: getRandomColor() }
  });
  await contactsLoad();
  activeUserId = id;
  userHighlight(id, id);
  await contactsRender(id);
  closeOverlay();
  await addedNewUser();
}

async function addedNewUser() {
  document.body.insertAdjacentHTML(
    "beforeend",
    addedNewUserTemplate()
  );
  const overlay = document.getElementById("new-user-overlay");
  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
  });
  await new Promise(r => setTimeout(r, 3500));
  overlay.classList.remove("is-open");
  await new Promise(r => setTimeout(r, 300));
  overlay.remove();
}


function reRenderContacts() {
  const contactInfo = document.getElementById("contactsinfo");
  const leftSide = document.getElementById("responsiveleftsidecontacts");
  const contactDetails = document.getElementById("responsivecontactsmoto");
  const addContact = document.getElementById("responsiveaddcontactid");
  const editContact = document.getElementById("responsiveeditcontactid");
  if (window.innerWidth <= 900) {
    contactInfo.innerHTML = "";
    if (leftSide) leftSide.style.display = "block";
    if (contactDetails) contactDetails.style.display = "none";
  } else if (contactDetails) {
    contactDetails.style.display = "block";
  }
  activeUserId = null;
  contactsLoad();

  if (addContact) addContact.style.display = "flex";
  if (editContact) editContact.style.display = "none";
}

let lastIsMobile = window.innerWidth <= 900;

window.addEventListener("resize", () => {
  const isMobile = window.innerWidth <= 900;
  if (isMobile !== lastIsMobile) {
    lastIsMobile = isMobile;
    reRenderContacts();  
  }
  updateResponsiveButtons();
});

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

