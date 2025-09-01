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

    contacts.innerHTML += `
      <div class="contact-item" onclick="contactsRender(${users[i].id})">
        <span class="contact-name">
          <img class="contact-badge" alt="${users[i].name}" src="${users[i].badge}"> 
          <p>${users[i].name}</p>
        </span>
        <span class="contact-email">${users[i].email}</span>
      </div>
    `;
  }
}

window.contactsLoad = contactsLoad;
window.contactsRender = contactsRender;

function contactsRender(userId) {
  let contactInfo = document.getElementById("contactsinfo");
  let userInfo = join.users.find(u => u.id === userId);

  if (!userInfo) return;

  contactInfo.innerHTML += `
      <div class="contactinfo">
        <span class="picture-name-contactinfo">
          <img class="contactinfo-badge" alt="${userInfo.name}" src="${userInfo.badge}">
          <div>
              <p class="contactinfo-name">${userInfo.name}</p>
              <div class="edit-delete-icons-placement">
                <div class="contactinfo-icons-text-placement">
                  <img class="contactinfo-icons" src="/assets/icons/edit.svg">
                  <p>Edit</p>
                </div>
                <div class="contactinfo-icons-text-placement">
                  <img class="contactinfo-icons" src="/assets/icons/delete.svg">
                  <p>Delete</p>
                </div>
              </div>
          </div>
        </span>
      </div>
      <div class="contact-information">
        <p>Contact Information</p>
      </div>
      <div class="contact-email-phone">
        <h4><b>Email</b></h4>
        <p>${userInfo.email}</p>
        <h4><b>Phone</b></h4>
        ${userInfo.phone}
      </div>`

}