function contactsLoadTemplate(users, i) {
  return `
      <div class="contact-item" onclick="contactsRender(${users[i].id})">
        <span class="contact-name">
          <img class="contact-badge" alt="${users[i].name}" src="${users[i].badge}"> 
          <p>${users[i].name}</p>
        </span>
        <span class="contact-email">${users[i].email}</span>
      </div>
    `;
}

function contactsRenderTemplate(userInfo){
  return `
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

function addNewContactTemplate() {
  return `<div class="createnewcontact-overlay" onclick="closeOverlay()">
            <div class="createnewcontact-table">
              <div class="left-blue-side">
                <div class="createnewcontact-logo">
                  <img src="/assets/icons/Capa 1.svg">
                </div>
                <div class="createnewcontact-text">
                  <h2>Add contact</h2>
                  <p>Tasks are better with a team!</p>
                  <img src="/assets/Vector 5_rotated.svg">
                </div>
              </div>
              <div class="white-right-side">
                <div>
                  <img src="assets/close.svg">
                </div>
                <div class="createnewcontact-person-radius">
                <img src="/assets/icons/person_white.svg">
                
                </div>
              </div>
            </div>
          </div>`;
}