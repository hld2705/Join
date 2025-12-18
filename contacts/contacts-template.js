function contactsLoadTemplate(user) {
  const badgeMarkup = user.badge?.text
    ? `
      <div class="contact-badge avatar-badge"
           style="background:${user.badge.color}">
        ${user.badge.text}
      </div>
    `
    : `
      <img class="contact-badge"
           src="./${user.badge}"
           alt="${user.name}">
    `;

  return `
    <div id="contactfield${user.id}" class="contact-item"
         onclick="contactsRender('${user.id}')">
      ${badgeMarkup}
      <div class="contact-content">
        <p class="contact-name">${user.name}</p>
        <p class="contact-email">${user.email}</p>
      </div>
    </div>
  `;
}

function contactsRenderTemplate(userInfo) {
  const badgeMarkup = userInfo.badge?.text
    ? `
      <div class="contactinfo-badge 
      " style="background:${userInfo.badge.color}">
        ${userInfo.badge.text}
      </div>
    `
    : `
      <img class="contactinfo-badge image-badge" alt="${userInfo.name}" src="${userInfo.badge}">
    `;

  return `
    <div class="contactinfo">
      <span class="picture-name-contactinfo">
        ${badgeMarkup}
        <div class="name-edit-delete-placement">
          <p class="contactinfo-name" id="detailed_name">${userInfo.name}</p>

          <div class="edit-delete-icons-placement">
            <div class="contactinfo-icons-text-placement" onclick="editUser('${userInfo.id}')">
              <svg class="contactinfo-icons" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_361727_4286" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="#D9D9D9"/>
    </mask>
    <g mask="url(#mask0_361727_4286)">
      <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z"/>
    </g>
  </svg>
              <p>Edit</p>
            </div>

            <div class="contactinfo-icons-text-placement" onclick="deleteUser('${userInfo.id}')">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <mask id="mask0_361727_4516" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
    <rect width="24" height="24" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#mask0_361727_4516)">
    <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z"/>
  </g>
</svg>
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
    </div>
  `;
}

function addNewContactTemplate() {
  return `<div class="createnewcontact-overlay" id="closeoverlay" onclick="closeOverlay()">
            <div id="contact-container" class="createnewcontactmaincontainer">
              <div class="createnewcontact-table" onclick="event.stopPropagation()">
                <div class="left-blue-side">
                  <div class="createnewcontact-logo">
                    <img src="./assets/icons/Capa 1.svg">
                  </div>
                  <div class="createnewcontact-text">
                    <h2>Add contact</h2>
                    <p>Tasks are better with a team!</p>
                    <img class="blue-string" src="./assets/Vector 5_rotated.svg">
                  </div>
                </div>
                <div class="white-right-side">
                  <div class="createnewcontact-close" onclick="closeOverlay()">
                    <img class="new-contact-close-icon" src="assets/close.svg">
                  </div>
                  <div class="createnewcontact-inputfield-person-placement">
                    <div class="createnewcontact-person-radius">
                      <img src="./assets/icons/person_white.svg">
                    </div>
                    <div class="createnewcontact-inputfield">
                      <div class="createnewcontact-inputfield-icon" id="input_name_border"> 
<<<<<<< HEAD
                        <input id="name_new_user" type="text" maxlength="25"
=======
                        <input id="name_new_user" type="text" 
>>>>>>> 9dc6faace588788bd3a87af2d2e8d69da7005733
                            placeholder="Name">
                        <img src="./assets/icons/person.svg">
                      </div>
                      <p class="required-mssg" id="required_name_new_user">This field is required!</p>
                      <div class="createnewcontact-inputfield-icon" id="input_email_border">
<<<<<<< HEAD
                        <input id="email_new_user" type="email" maxlength="22"
=======
                        <input id="email_new_user" type="email" 
>>>>>>> 9dc6faace588788bd3a87af2d2e8d69da7005733
                            placeholder="Email">
                        <img src="assets/icons/mail.svg">
                      </div>
                      <p class="required-mssg" id="required_email_new_user">This field is required!</p>
                      <div class="createnewcontact-inputfield-icon" id="input_phone_border">
                        <input id="phone_new_user" type="phone"
                            placeholder="Phone">
                        <img src="assets/icons/call.svg">
                      </div>
                      <p class="required-mssg" id="required_phone_new_user">This field is required!</p>
                                        <div class="createnewcontact-buttons-placement" onclick="closeOverlay()">
                    <div class="createnewcontact-button-cancel">
                      <p>Cancel</p>
                      <img class="cancel-icon-x" src="assets/Vector.svg">
                    </div>
                    <div class="createnewcontact-button-create-contact" onclick="event.stopPropagation(); createContact()">
                      <p>Create contact<p>
                      <img src="assets/check.svg">
                    </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}

function editUserTemplate(user) {
  const badgeMarkup = user.badge?.text
    ? `
        <div class="edit-person-radius avatar-badge"
             style="background:${user.badge.color}">
          ${user.badge.text}
        </div>
      `
    : `
        <div class="edit-person-radius">
          <img alt="${user.name}" src="${user.badge}">
        </div>
      `;

  return `<div class="createnewcontact-overlay" id="closediteoverlay" onclick="closeOverlay()">
            <div id="edit-main-container" class="createnewcontactmaincontainer">
              <div class="createnewcontact-table" onclick="event.stopPropagation()">
                <div class="left-blue-side">
                  <div class="createnewcontact-logo">
                    <img src="./assets/icons/Capa 1.svg">
                  </div>
                  <div class="createnewcontact-text">
                    <h2>Edit contact</h2>
                    <img class="blue-string" src="./assets/Vector 5_rotated.svg">
                  </div>
                </div>

                <div class="white-right-side">
                  <div class="createnewcontact-close" onclick="closeOverlay()">
                    <img src="assets/close.svg">
                  </div>

                  <div class="createnewcontact-inputfield-person-placement">
                    ${badgeMarkup}

                    <div class="createnewcontact-inputfield">
                      <div class="createnewcontact-inputfield-icon" id="input_field_edit_name"> 
<<<<<<< HEAD
                        <input id="edit_name" type="text" value="${user.name}" maxlength="25" 
=======
                        <input id="edit_name" type="text" value="${user.name}"
>>>>>>> 9dc6faace588788bd3a87af2d2e8d69da7005733
                          placeholder="Name">
                        <img src="./assets/icons/person.svg">
                      </div>

                      <p class="required-mssg" id="required_name_edit_user"></p>

                      <div class="createnewcontact-inputfield-icon" id="input_field_edit_email">
<<<<<<< HEAD
                        <input id="edit_email" type="email" value="${user.email}" maxlength="22" 
=======
                        <input id="edit_email" type="email" value="${user.email}" 
>>>>>>> 9dc6faace588788bd3a87af2d2e8d69da7005733
                          placeholder="Email">
                        <img src="./assets/icons/mail.svg">
                      </div>

                      <p class="required-mssg" id="required_email_edit_user"></p>

                      <div class="createnewcontact-inputfield-icon" id="input_field_edit_phone">
                        <input id="edit_phone" type="tel" value="${user.phone}" 
                          placeholder="Phone">
                        <img src="./assets/icons/call.svg">
                      </div>
                      
                      <p class="required-mssg" id="required_phone_edit_user"></p>

                      <div class="createnewcontact-buttons-placement">
                        <div class="editcontact-button-cancel" onclick="deleteUser('${user.id}')">
                          <p>Delete</p>
                        </div>
                        <div class="editcontact-button-create-contact" onclick="saveUser('${user.id}')">
                          <p>Save</p>
                          <img class="check-icon" src="./assets/check.svg">
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}
function addedNewUserTemplate() {
  return `
    <div id="new-user-overlay" class="addednewuserdiv">
      <h1>Contact successfully created</h1>
    </div>`;
}

function editUserOptionsResponsiveTemplate(userId) {
  return `<div class="contactoptions" id="edit_overlay">
   <div class="iconsresponsiveedit" onclick="editUser('${userId}')">
    <img src="./assets/icons/edit.svg">
    <p>Edit</p>
    </div>
    <div class="iconsresponsivedelete" onclick="deleteUser('${userId}')">
    <img src="./assets/icons/delete.svg">
    <p>Delete</p>
    </div>
    </div>`;
}