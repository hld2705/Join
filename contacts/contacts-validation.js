function removeEditTitle(){
  let editNameInputField = document.getElementById("edit_name");
  let editEmailInputField = document.getElementById("edit_email");
  if(editEmailInputField && editNameInputField){
    document.getElementById("input_field_edit_name").classList.remove("submit");
    document.getElementById("input_field_edit_email").classList.remove("submit");
    document.getElementById("required_name_edit_user").innerHTML = "";
    document.getElementById("required_email_edit_user").innerHTML = "";
  }

}

function validateEditUser() {
  const name = document.getElementById('edit_name').value.trim();
  const email = document.getElementById('edit_email').value.trim();
  const phone = document.getElementById('edit_phone').value.trim();
  let valid = true;
  if (!name) {
    document.getElementById("input_field_edit_name").classList.add("submit");
    document.getElementById("required_name_edit_user").innerHTML = "This field is required!";
    valid = false;
  } else {
    removeEditTitle();
  }
  if (!email) {
    document.getElementById("input_field_edit_email").classList.add("submit");
    document.getElementById("required_email_edit_user").innerHTML = "This field is required!";
    valid = false;
  } else {
    removeEditTitle();
  }
  return valid;
}

function removeTitle(){
  let inputNameBorder = document.getElementById("input_name_border");
  let inputEmailBorder = document.getElementById("input_email_border");
  let nameValidation = document.getElementById("required_name_new_user");
  let emailValidation = document.getElementById("required_email_new_user");
  if(inputNameBorder && inputEmailBorder){
    inputNameBorder.classList.remove("submit");
    inputEmailBorder.classList.remove("submit");
    nameValidation.innerHTML = "";
    emailValidation.innerHTML = "";
  }
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

  let valid = true;

  if (!name) {
    nameBorder.classList.add("submit");
    nameVal.innerHTML = "*This field is required!";
    valid = false;
  } else if (name.length < 3) {
    nameBorder.classList.add("submit");
    nameVal.innerHTML = "*Name must be at least 3 letters!";
    valid = false;
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    nameBorder.classList.add("submit");
    nameVal.innerHTML = "*Only letters allowed!";
    valid = false;
  } else {
    removeTitle();
  }

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
    emailVal.innerHTML = "*Email must contain the fameous .com!";
    valid = false;
  }else {
    removeTitle();
  }
  
  if (!phone) {
    phoneBorder.classList.add("submit");
    phoneVal.innerHTML = "*This field is required!";
    valid = false;
  } else if (!/^\+?[0-9]+$/.test(phone)) {
    phoneBorder.classList.add("submit");
    phoneVal.innerHTML = "*Only numbers and optional + allowed!";
    valid = false;
  } else if (phone.replace("+", "").length < 10) {
    phoneBorder.classList.add("submit");
    phoneVal.innerHTML = "*Must be at least 10 digits!";
    valid = false;
  } else {
    removeTitle();
  }

  return valid;
}
