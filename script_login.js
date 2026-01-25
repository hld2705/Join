let originalLoginHTML;

/**To ensure that the whole system runns as bug free as possible, all storages are being deleted upon entering index.html */
sessionStorage.removeItem("guest", "true");
sessionStorage.removeItem("nonlogin", "true");

/**Forces preload of certain functions in orded to keep things running without errors */
document.addEventListener('DOMContentLoaded', () => {
  const loginEl = document.getElementById('login');
  if (loginEl) originalLoginHTML = loginEl.innerHTML;
  loadingScreen();
  goBack();
  toggleButton();
  const cb = document.getElementById('requiredcheckbox');
  if (cb) cb.addEventListener('change', toggleButton);
});

/**
 * Enables or disables the signup button based on the required checkbox state.
 */
function toggleButton() {
  const checkbox = document.getElementById('requiredcheckbox');
  const button = document.getElementById('signUpButton');
  if (!button) return;

  button.classList.toggle("disabled", !(checkbox && checkbox.checked));
}

/**
 * Switches the view back to the login screen.
 */
function goBack() {
  const signup = document.getElementById('signupPage');
  const login = document.getElementById('login');
  const headerwriting = document.getElementById('headerwritingdiv');
  const headerResp = document.querySelector('.headerwritingresponsive');
  if (!signup || !login || !headerwriting) return;
  headerwriting.classList.remove('d_none');
  signup.classList.add('d_none');
  login.classList.remove('d_none');

  if (headerResp) headerResp.style.display = "flex";
}

/**
 * Displays the loading screen, fades it out, and removes it from the DOM.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadingScreen() {
  const loadingscreen = document.getElementById('loadingscreen');
  if (!loadingscreen) return;
  loadingscreen.innerHTML = loadingScreenDesktopTemplate();
  await new Promise(r => setTimeout(r, 300));
  loadingscreen.style.transition = 'opacity 0.5s ease';
  loadingscreen.style.opacity = '0';
  await new Promise(r => setTimeout(r, 500));

  loadingscreen.remove();
}

/**A timeout on the logo is added for smoother transitions */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("logo").classList.add("main-logo-small");
  }, 200);
});

/**
 * Switches the view from login to signup screen.
 */
function signUp() {
  const signup = document.getElementById('signupPage');
  const login = document.getElementById('login');
  const headerwriting = document.getElementById('headerwritingdiv');
  const headerResp = document.querySelector('.headerwritingresponsive');
  if (!signup || !login || !headerwriting) return;
  if (signup.classList.contains('d_none')) {
    login.classList.add('d_none');
    signup.classList.remove('d_none');
  }
  if (!headerwriting.classList.contains('d_none')) {
    headerwriting.classList.add('d_none');
  }
  if (headerResp) headerResp.style.display = "none";
}

/**Eventlisteners to fire the correct functions in order */
document.getElementById("login-icon").addEventListener("click", togglePassword);
document.getElementById("password").addEventListener("input", handlePasswordInput);

/**
 * Toggles the visibility of the login password input.
 */
function togglePassword() {
  let input = document.getElementById("password");
  let icon = document.getElementById("login-icon");

  if (input.type === "password") {
    input.type = "text";
    icon.src = "./assets/icons/visibility.svg";
  } else {
    input.type = "password";
    icon.src = "./assets/icons/visibility_off.svg";
  }
}

/**Changes the very symbol of "lock" to visibility_off i.e. non visible password*/
function handlePasswordInput() {
  let icon = document.getElementById("login-icon");
  let input = document.getElementById("password");
  icon.src = "./assets/icons/visibility_off.svg";
  if (!input.value) {
    input.type = "password";
    icon.src = "./assets/icons/lock.svg";
  }
  if (!input.value) {
    input.type = "password";
    icon.src = "./assets/icons/lock.svg";
  }
}

/**
 * Toggles password visibility for multiple inputs and icons.
 *
 * @param {HTMLInputElement[]} inputs
 * @param {HTMLImageElement[]} icons
 * @param {boolean} show
 */
function togglePasswordVisibility(inputs, icons, show) {
  inputs.forEach(input => input.type = show ? "text" : "password");
  icons.forEach(icon => {
    icon.classList.add("eye_open_password");
    icon.src = show
      ? "./assets/icons/visibility.svg"
      : "./assets/icons/visibility_off.svg";
  });
}

/**Diffenret eventlisteners to trigger the functions needed for the possibility of viewing once password */
document.getElementById("signup-icon1").addEventListener("click", toggleSignupPassword);
document.getElementById("signup-icon2").addEventListener("click", toggleSignupPassword);
document.getElementById("password_sign_up").addEventListener("input", handleSignupPasswordInput);
document.getElementById("confirmation_password_sign_up").addEventListener("input", handleSignupPasswordInput);

/**
 * Toggles the visibility of signup password and confirmation inputs.
 */
function toggleSignupPassword() {
  let p1 = document.getElementById("password_sign_up");
  let p2 = document.getElementById("confirmation_password_sign_up");
  let i1 = document.getElementById("signup-icon1");
  let i2 = document.getElementById("signup-icon2");
  let show = p1.type === "password";
  p1.type = p2.type = show ? "text" : "password";
  i1.src = i2.src = show
    ? "./assets/icons/visibility.svg"
    : "./assets/icons/visibility_off.svg";
}

/**
 * changes the "eye" icon
 */
function handleSignupPasswordInput() {
  let p1 = document.getElementById("password_sign_up");
  let p2 = document.getElementById("confirmation_password_sign_up");
  let i1 = document.getElementById("signup-icon1");
  let i2 = document.getElementById("signup-icon2");
  if (!p1.value && !p2.value) {
    p1.type = p2.type = "password";
    i1.src = i2.src = "./assets/icons/lock.svg";
  } else {
    i1.src = i2.src = "./assets/icons/visibility_off.svg";
  }
}

/**
 * Marks the session as a non-login entry.
 */
function nonLoginEntry() {
  sessionStorage.setItem("nonlogin", "true");
}

/** Checks if an email address is valid.
 * @param {string} email
 * @returns {boolean}
 * important notice, same function is also icluded in the script-helper.js, this function is needed on both scripts in order for the validation-
 * -to work properly.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}