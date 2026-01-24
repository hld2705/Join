let activeUserId = null;
let lastIsMobile = window.innerWidth <= 900;
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

/** Fetches all users from Firebase.
 * @async
 * @returns {Promise<Array<Object>>}
 */
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

/** Renders a single contact entry including letter grouping.
 * @param {HTMLElement} container
 * @param {Object} user
 * @param {Object} current
 */
function renderContact(container, user, current) {
  const letter = user.name.charAt(0).toUpperCase();
  if (letter !== current.value) {
    current.value = letter;
    container.innerHTML += letterSeparatorTemplate(letter);
  }
  container.innerHTML += contactsLoadTemplate(user);
}

/** Loads and renders the contact list.
 * @returns {Promise<void>}
 */
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
  }
}

/** Opens the contact details view and updates active user state.
 * @param {string} userId
 */
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

/** Renders contact details for a selected user.
 * @async
 * @param {string} userId
 * @returns {Promise<void>}
 */
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

/** Highlights the selected contact in the list.
 * @param {string|null} previousId
 * @param {string} newId
 */
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

/** Toggles button display state. */
function toggleButton(button, display) {
  if (!button) return;
  button.style.display = display;
}

/** Updates responsive add/edit button visibility. */
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
  }
}

/** Opens responsive edit user options overlay. */
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

/** Handles outside click closing of edit overlay. */
document.addEventListener("click", function (e) {
  let overlay = document.getElementById("edit_overlay");
  if (overlay && !e.target.closest("#edit_overlay")) {
    overlay.remove();
  }
  updateResponsiveButtons();
});

/** Opens add new contact overlay. */
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

/** Closes add and edit overlay containers. */
function closeOverlayContainers() {
  const contact = document.getElementById("contact-container");
  const edit = document.getElementById("edit-main-container");
  if (contact) contact.classList.remove("is-open");
  if (edit) edit.classList.remove("is-open");
}

/** Closes overlays and removes overlay elements. */
function closeOverlay() {
  closeOverlayContainers();
  setTimeout(() => {
    document.getElementById("closeoverlay")?.remove();
    document.getElementById("closediteoverlay")?.remove();
  }, 250);
}

/** Opens the edit user overlay with user data.
 * @async
 * @param {string} userId
 * @returns {Promise<void>}
 */
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

/** Deletes a user from Firebase and refreshes contact list.
 * @async
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function deleteUser(userId) {
  await FIREBASE_USERS.child(String(userId)).remove();
  activeUserId = null;
  document.getElementById("contactsinfo").innerHTML = "";
  closeOverlay();
  contactsLoad();
}

/** Updates user data in Firebase.
 * @async
 * @param {string} userId
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {Promise<void>}
 */
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

/** Saves edited user data and refreshes UI.
 * @async
 * @param {string} userId
 * @returns {Promise<void>}
 */
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

/** Updates displayed contact detail fields. */
function updateDetailsPanel(user) {
  const nameNode = document.getElementById('detailed_name');
  const emailNode = document.getElementById('detailed_email');
  const phoneNode = document.getElementById('detailed_phone');
  if (nameNode) nameNode.textContent = user.name;
  if (emailNode) emailNode.textContent = user.email;
  if (phoneNode) phoneNode.textContent = user.phone;
}

/** Returns initials from a full name. */
function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
}

/** Returns a random badge color. */
function getRandomColor() {
  const colors = ["#2A3647", "#29ABE2", "#FF7A00", "#9327FF", "#FC71FF", "#fccc59", "#442c8c", "#fc4444"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Creates a user object for Firebase. */
function createUserObject(id, name, email, phone) {
  return {
    id,
    name,
    email,
    phone,
    badge: {
      text: getInitials(name),
      color: getRandomColor()
    }
  };
}

/** Saves a new contact to Firebase.
 * @async
 * @returns {Promise<string>}
 */
async function saveNewContact(name, email, phone) {
  const entry = firebase.database().ref("users").push();
  const userObj = createUserObject(entry.key, name, email, phone);
  await entry.set(userObj);
  join.users.push(userObj);
  return userObj.id;
}

/**
 * Creates a new contact and refreshes contact list.
 * @async
 * @returns {Promise<void>}
 */
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

/** Shows temporary new user confirmation overlay. */
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

/** Updates contact layout based on screen size. */
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

/** Re-renders contacts when layout breakpoint changes. */
function reRenderContacts() {
  updateContactsLayout();
  activeUserId = null;
  contactsLoad();
  const add = document.getElementById("responsiveaddcontactid");
  const edit = document.getElementById("responsiveeditcontactid");
  if (add) add.style.display = "flex";
  if (edit) edit.style.display = "none";
}

/**Event listener on resize, constantly checking the inner width of the window */
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
window.editUserOptionsResponsive = editUserOptionsResponsive;
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
