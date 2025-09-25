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
              <p class="contactinfo-name" id="detailed_name">${userInfo.name}</p>
              <div class="edit-delete-icons-placement">
                <div class="contactinfo-icons-text-placement" onclick="editUser(${userInfo.id})">
                  <img class="contactinfo-icons" src="/assets/icons/edit.svg">
                  <p>Edit</p>
                </div>
                <div class="contactinfo-icons-text-placement" onclick="deleteUser(${userInfo.id})">
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
        <p id="detailed_email">${userInfo.email}</p>
        <h4><b>Phone</b></h4>
        <a id="detailed_phone">${userInfo.phone}</a>
      </div>`

}

function addNewContactTemplate() {
  return `<div class="createnewcontact-overlay" id="closeoverlay" onclick="closeOverlay()">
            <div class="createnewcontactmaincontainer">
              <div class="createnewcontact-table" onclick="event.stopPropagation()">
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
                  <div class="createnewcontact-close" onclick="closeOverlay()">
                    <img src="assets/close.svg">
                  </div>
                  <div class="createnewcontact-inputfield-person-placement">
                    <div class="createnewcontact-person-radius">
                      <img src="/assets/icons/person_white.svg">
                    </div>
                    <div class="createnewcontact-inputfield">
                      <div class="createnewcontact-inputfield-icon"> 
                        <input id="name_new_user" type="text"
                            placeholder="Name">
                        <img src="assets/icons/person.svg">
                      </div>
                      <div class="createnewcontact-inputfield-icon">
                        <input id="email_new_user" type="email"
                            placeholder="Email">
                        <img src="assets/icons/mail.svg">
                      </div>
                      <div class="createnewcontact-inputfield-icon">
                        <input id="phone_new_user" type="number"
                            placeholder="Phone">
                        <img src="assets/icons/call.svg">
                      </div>
                    </div>
                  </div>
                  <div class="createnewcontact-buttons-placement" onclick="closeOverlay()">
                    <div class="createnewcontact-button-cancel">
                      <button class="button-cancel">Cancel</button>
                      <img src="assets/Vector.svg">
                    </div>
                    <div class="createnewcontact-button-create-contact" onclick="createContact()">
                      <button class="button-create">Create contact</button>
                      <img src="assets/check.svg">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}

function editUserTemplate(user){
  return `<div class="createnewcontact-overlay" id="closeoverlay" onclick="closeOverlay()">
            <div class="createnewcontact-table" onclick="event.stopPropagation()">
              <div class="left-blue-side">
                <div class="createnewcontact-logo">
                  <img src="/assets/icons/Capa 1.svg">
                </div>
                <div class="createnewcontact-text">
                  <h2>Edit contact</h2>
                  <img src="/assets/Vector 5_rotated.svg">
                </div>
              </div>
              <div class="white-right-side">
                <div class="createnewcontact-close" onclick="closeOverlay()">
                  <img src="assets/close.svg">
                </div>
                <div class="createnewcontact-inputfield-person-placement">
                  <div class="edit-person-radius">
                    <img class="" alt="${user.name}" src="${user.badge}"> 
                  </div>
                  <div class="createnewcontact-inputfield">
                    <div class="createnewcontact-inputfield-icon"> 
                      <input id="edit_name" type="text" value="${user.name}"
                            placeholder="Name">
                      <img src="assets/icons/person.svg">
                    </div>
                    <div class="createnewcontact-inputfield-icon">
                      <input id="edit_email" type="email" value="${user.email}"
                            placeholder="Email">
                      <img src="assets/icons/mail.svg">
                    </div>
                    <div class="createnewcontact-inputfield-icon">
                      <input id="edit_phone" type="tel" value="${user.phone}"
                            placeholder="Phone">
                      <img src="assets/icons/call.svg">
                    </div>
                  </div>
                </div>
                <div class="createnewcontact-buttons-placement">
                  <div class="createnewcontact-button-cancel">
                    <button class="button-cancel">Delete</button>
                  </div>
                  <div class="createnewcontact-button-create-contact" onclick="saveUser(${user.id})">
                    <button class="button-create">Save</button>
                    <img src="assets/check.svg">
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}
function addedNewUserTemplate() {
  return `
    <div class="addednewuserdiv">
      <h1>Contact successfully created</h1>
    </div>`;
}

function addThreeDotMenuTemplate(userId){
   return `<div class="threedotsmenu" onclick="editUser(${userId})">
    <img src="/assets/Menu Contact options.svg">
    </div>`
}