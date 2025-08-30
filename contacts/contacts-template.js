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
      contacts.innerHTML += `<h2 class="letter-header">${currentLetter}</h2>
                            <img src="/assets/Vector 10.svg">`;
    }
    contacts.innerHTML += `
      <div class="contact-item">

        <span class="contact-name">
        <img class="contact-badge" alt="${users[i].name}" src="${users[i].badge}"> <p>${users[i].name}</p>
        </span>

        <span class="contact-email">${users[i].email}</span>
      </div>
    `;
  }
}

  window.contactsLoad = contactsLoad;