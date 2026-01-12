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
 return data
  ? Object.entries(data).map(([key, user]) => ({
      ...user,
      id: String(key)
    }))
  : [];
}

function letterSeparatorTemplate(letter) {
  return `
    <div class="letter-separationline-container">
      <h2 class="letter-header">${letter}</h2>
      <img class="separationline" src="./assets/Vector 10.svg">
    </div>
  `;
}

function renderContact(container, user, current) {
  const letter = user.name.charAt(0).toUpperCase();
  if (letter !== current.value) {
    current.value = letter;
    container.innerHTML += letterSeparatorTemplate(letter);
  }
  container.innerHTML += contactsLoadTemplate(user);
}

async function contactsLoad() {
  const container = document.getElementById("contactsjs");
  if (!container) return;
  container.innerHTML = "";
  const editBtn = document.getElementById("responsiveeditcontactid");
  if (editBtn) editBtn.style.display = "none";

  const usersRaw = await fetchData();
  const users = (Array.isArray(usersRaw) ? usersRaw : [])
    .filter(user => user && user.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  const current = { value: "" };
  for (let i = 0; i < users.length; i++) {
    renderContact(container, users[i], current);
  }}

function openContactDetailsView(userId) {
  const left = document.getElementById("responsiveleftsidecontacts");
  const details = document.getElementById("responsivecontactsmoto");
  const prevId = activeUserId;
  activeUserId = userId;
  userHighlight(prevId, userId);
  if (window.innerWidth <= 900) {
    if (left) left.style.display = "none";
    if (details) details.style.display = "block";
  }
}

async function contactsRender(userId) {
  const contactInfo = document.getElementById("contactsinfo");
  openContactDetailsView(userId);
  const users = await fetchData();
  const userInfo = users.find(u => String(u.id) === String(userId));
  if (!userInfo) return;
  contactInfo.classList.remove("is-open");
  contactInfo.innerHTML = contactsRenderTemplate(userInfo);
  setTimeout(() => contactInfo.classList.add("is-open"), 50);
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

function toggleButton(button, display) {
  if (!button) return;
  button.style.display = display;
}

function updateResponsiveButtons() {
  const addButton = document.getElementById("responsiveaddcontactid");
  const editButton = document.getElementById("responsiveeditcontactid");
  if (window.innerWidth > 900) {
    toggleButton(addButton, "none");
    toggleButton(editButton, "none");
    return;
  }
  if (activeUserId) {
    toggleButton(addButton, "none");
    toggleButton(editButton, "block");
  } else {
    toggleButton(addButton, "flex");
    toggleButton(editButton, "none");
  }}

function editUserOptionsResponsive() {
  let userId = activeUserId;
  let responsiveEditContactId = document.getElementById("responsiveeditcontactid");
  document.getElementById("responsiveeditcontact-overlay-container").style.display = "block";
  if (window.innerWidth >= 900) {
    responsiveEditContactId.style.display = "none";
  } else {
    responsiveEditContactId.style.display = "block";
  }
  document.getElementById("responsiveeditcontact-overlay-container").innerHTML =
    editUserOptionsResponsiveTemplate(userId);
}

document.addEventListener("click", function (e) {
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

function closeOverlayContainers() {
  const contact = document.getElementById("contact-container");
  const edit = document.getElementById("edit-main-container");
  if (contact) contact.classList.remove("is-open");
  if (edit) edit.classList.remove("is-open");
}

function closeOverlay() {
  closeOverlayContainers();

  setTimeout(() => {
    document.getElementById("closeoverlay")?.remove();
    document.getElementById("closediteoverlay")?.remove();
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
  await FIREBASE_USERS.child(String(userId)).remove();
  activeUserId = null;
  document.getElementById("contactsinfo").innerHTML = "";
  closeOverlay();
  contactsLoad();
}

async function updateUserData(userId, name, email, phone) {
  await FIREBASE_USERS.child(userId).update({
    name,
    email,
    phone,
    badge: {
      text: getInitials(name),
      color: getRandomColor()
    }
  });
}

async function saveUser(userId) {
  if (!validateEditUser()) return;
  const name = document.getElementById("edit_name").value.trim();
  const email = document.getElementById("edit_email").value.trim();
  const phone = document.getElementById("edit_phone").value.trim();
  await updateUserData(userId, name, email, phone);
  await contactsLoad();
  contactsRender(userId);
  updateDetailsPanel({ name, email, phone });
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

async function saveNewContact(name, email, phone) {
  const entry = firebase.database().ref("users").push();
  const id = entry.key;
  await entry.set({
    id,
    name,
    email,
    phone,
    badge: {
      text: getInitials(name),
      color: getRandomColor()
    }
  });
  await entry.set(userObj);
  join.users.push(userObj);
  return id;
}

async function createContact() {
  if (!validateAddNewUser()) return;
  const name = document.getElementById("name_new_user").value.trim();
  const email = document.getElementById("email_new_user").value.trim();
  const phone = document.getElementById("phone_new_user").value.trim();
  const id = await saveNewContact(name, email, phone);
  activeUserId = id;
  userHighlight(id, id);
  await contactsRender(id);
  closeOverlay();
  await addedNewUser();
  await contactsLoad();
  await loadData();
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

function updateContactsLayout() {
  const info = document.getElementById("contactsinfo");
  const left = document.getElementById("responsiveleftsidecontacts");
  const details = document.getElementById("responsivecontactsmoto");
  if (window.innerWidth <= 900) {
    info.innerHTML = "";
    if (left) left.style.display = "block";
    if (details) details.style.display = "none";
  } else {
    if (details) details.style.display = "block";
  }
}

function reRenderContacts() {
  updateContactsLayout();
  activeUserId = null;
  contactsLoad();
  const add = document.getElementById("responsiveaddcontactid");
  const edit = document.getElementById("responsiveeditcontactid");
  if (add) add.style.display = "flex";
  if (edit) edit.style.display = "none";
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

