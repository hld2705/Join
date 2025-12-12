/*function removeEditTitle() {
  let inputNameBorder = document.getElementById("input_field_edit_name");
  let inputEmailBorder = document.getElementById("input_field_edit_email");
  let nameValidation = document.getElementById("required_name_edit_user");
  let emailValidation = document.getElementById("required_email_edit_user");
  if (inputNameBorder && inputEmailBorder) {
    inputNameBorder.classList.remove("submit");
    inputEmailBorder.classList.remove("submit");
    nameValidation.innerHTML = "";
    emailValidation.innerHTML = "";
  }
}*/

function validateEditUser() {
  const name = document.getElementById('edit_name').value.trim();
  const email = document.getElementById('edit_email').value.trim();
  const phone = document.getElementById('edit_phone').value.trim();

  const nameBorder = document.getElementById("input_field_edit_name");
  const emailBorder = document.getElementById("input_field_edit_email");
  const phoneBorder = document.getElementById("input_field_edit_phone");

  const nameVal = document.getElementById("required_name_edit_user");
  const emailVal = document.getElementById("required_email_edit_user");
  const phoneVal = document.getElementById("required_phone_edit_user");

  let valid = true;

  // Name validation
  if (!name) {
    nameBorder.classList.add("submit");
    nameVal.innerHTML = "*This field is required!";
    valid = false;
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    nameBorder.classList.add("submit");
    nameVal.innerHTML = "*Only letters allowed!";
    valid = false;
  } else if (name.length < 3) {
    nameBorder.classList.add("submit");
    nameVal.innerHTML = "*Name must be at least 3 letters!";
    valid = false;
  } else {
    nameBorder.classList.remove("submit");
    nameVal.innerHTML = "";
  }

  // Email validation
  if (!email) {
    emailBorder.classList.add("submit");
    emailVal.innerHTML = "*This field is required!";
    valid = false;
  } else if (email.length < 5) {
    emailBorder.classList.add("submit");
    emailVal.innerHTML = "*Email must be at least 5 characters!";
    valid = false;
  } else if (!email.includes("@")) {
    emailBorder.classList.add("submit");
    emailVal.innerHTML = "*Email must contain @!";
    valid = false;
  } else if (!email.includes(".com")) {
    emailBorder.classList.add("submit");
    emailVal.innerHTML = "*Email must contain the famous .com!";
    valid = false;
  } else {
    emailBorder.classList.remove("submit");
    emailVal.innerHTML = "";
  }

  // Phone validation
  if (!phone) {
    phoneBorder.classList.add("submit");
    phoneVal.innerHTML = "*This field is required!";
    valid = false;
  } else if (!/^\+?[0-9]+$/.test(phone)) {
    phoneBorder.classList.add("submit");
    phoneVal.innerHTML = "Only numbers and optional + allowed!";
    valid = false;
  } else if (phone.replace("+", "").length < 10) {
    phoneBorder.classList.add("submit");
    phoneVal.innerHTML = "*Must be at least 10 digits!";
    valid = false;
  } else {
    phoneBorder.classList.remove("submit");
    phoneVal.innerHTML = "";
  }

  return valid;
}


function validateAddNewUser() {
  let name = document.getElementById("name_new_user").value.trim();
  let email = document.getElementById("email_new_user").value.trim();
  let phone = document.getElementById("phone_new_user").value.trim();
  let nameBorder = document.getElementById("input_name_border");
  let emailBorder = document.getElementById("input_email_border");
  let phoneBorder = document.getElementById("input_phone_border");
  let nameVal = document.getElementById("required_name_new_user");
  let emailVal = document.getElementById("required_email_new_user");
  let phoneVal = document.getElementById("required_phone_new_user");

  if (!name) {
    nameBorder.classList.add("submit");
    nameVal.style.visibility = "visible";
    valid = false;
  } else if (name.length < 3) {
    nameBorder.classList.add("submit");
    nameVal.style.visibility = "visible";
    nameVal.innerHTML = "*Name must be at least 3 letters!";
    valid = false;
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    nameBorder.classList.add("submit");
    nameVal.style.visibility = "visible";
    nameVal.innerHTML = "*Only letters allowed!";
    valid = false;
  } else {
    nameVal.style.visibility = "hidden";
    nameBorder.classList.remove("submit");
  }

  if (!email) {
    emailBorder.classList.add("submit");
    emailVal.style.visibility = "visible";
    valid = false;
  } else if (email.length < 5) {
    emailBorder.classList.add("submit");
    emailVal.style.visibility = "visible";
    emailVal.innerHTML = "*Email must be at least 5 characters!";
    valid = false;
  } else if (!email.includes("@")) {
    emailBorder.classList.add("submit");
    emailVal.style.visibility = "visible";
    emailVal.innerHTML = "*Email must contain @!";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailBorder.classList.add("submit");
    emailVal.style.visibility = "visible";
    emailVal.innerHTML = "*Please enter a valid email address!";
    valid = false;
  } else {
   emailVal.style.visibility = "hidden";
    emailBorder.classList.remove("submit");
  }

  if (!phone) {
    phoneBorder.classList.add("submit");
    phoneVal.style.visibility = "visible";
    valid = false;
  } else if (!/^\+?[0-9]+$/.test(phone)) {
    phoneBorder.classList.add("submit");
    phoneVal.style.visibility = "visible";
    phoneVal.innerHTML = "*Only numbers and optional + allowed!";
    valid = false;
  } else if (phone.replace("+", "").length < 10) {
    phoneBorder.classList.add("submit");
    phoneVal.style.visibility = "visible";
    phoneVal.innerHTML = "*Must be at least 10 digits!";
    valid = false;
  } else {
   phoneVal.style.visibility = "hidden";
   phoneBorder.classList.remove("submit");
  }

  return valid;
}
