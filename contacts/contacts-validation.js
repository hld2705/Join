function validateEditUser() {
  return validateName(
    document.getElementById("edit_name").value.trim(),
    document.getElementById("input_field_edit_name"),
    document.getElementById("required_name_edit_user")
  ) && validateEmail(
    document.getElementById("edit_email").value.trim(),
    document.getElementById("input_field_edit_email"),
    document.getElementById("required_email_edit_user")
  ) && validatePhone(
    document.getElementById("edit_phone").value.trim(),
    document.getElementById("input_field_edit_phone"),
    document.getElementById("required_phone_edit_user")
  );}

function showError(border, messageEl, message) {
  border.classList.add("submit");
  messageEl.style.visibility = "visible";
  if (message) messageEl.innerHTML = message;
}

function hideError(border, messageEl) {
  border.classList.remove("submit");
  messageEl.style.visibility = "hidden";
}

function validateName(name, border, messageEl) {
  if (!name)
    return showError(border, messageEl), false;

  if (name.length < 3)
    return showError(border, messageEl, "*Name must be at least 3 letters!"), false;

  if (!/^[\p{L}\s\-']+$/u.test(name))
    return showError(border, messageEl, "*Only letters allowed!"), false;

  hideError(border, messageEl);
  return true;
}

function validateEmail(email, border, messageEl) {
  if (!email)
    return showError(border, messageEl), false;

  if (email.length < 5)
    return showError(border, messageEl, "*Email must be at least 5 characters!"), false;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return showError(border, messageEl, "*Please enter a valid email address!"), false;

  hideError(border, messageEl);
  return true;
}

function validatePhone(phone, border, messageEl) {
  const cleaned = phone.replace(/\s+/g, "");
  if (!cleaned)
    return showError(border, messageEl), false;
  if (!/^\+?[0-9]+$/.test(cleaned))
    return showError(border, messageEl, "*Only numbers, spaces and optional + allowed!"), false;
  if (cleaned.replace("+", "").length < 10)
    return showError(border, messageEl, "*Must be at least 10 digits!"), false;
  hideError(border, messageEl);
  return true;
}

function validateAddNewUser() {
  return validateName(
    document.getElementById("name_new_user").value.trim(),
    document.getElementById("input_name_border"),
    document.getElementById("required_name_new_user")
  ) && validateEmail(
    document.getElementById("email_new_user").value.trim(),
    document.getElementById("input_email_border"),
    document.getElementById("required_email_new_user")
  ) && validatePhone(
    document.getElementById("phone_new_user").value.trim(),
    document.getElementById("input_phone_border"),
    document.getElementById("required_phone_new_user")
  );}