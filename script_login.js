let originalLoginHTML;

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

function showPassword() {
  let input = document.getElementById("password");
  let icon = document.getElementById("login-icon");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.add("eye_open_password");
    icon.src = "./assets/icons/glass_eye_open.png";
  } else {
    input.type = "password";
    icon.classList.add("eye_open_password");
    icon.src = "./assets/icons/glass_eye_closed.png";
  }
}

function showPasswordSignup() {
  let input1 = document.getElementById("password_sign_up");
  let icon1 = document.getElementById("signup-icon1");
  let input2 = document.getElementById("confirmation_password_sign_up");
  let icon2 = document.getElementById("signup-icon2");
  if (input1.type === "password" && input2.type === "password") {
    input1.type = input2.type = "text";
    icon1.classList.add("eye_open_password");
    icon1.src = icon2.src = "./assets/icons/glass_eye_open.png";
    icon2.classList.add("eye_open_password");
  } else {
    input1.type = input2.type = "password";
    icon1.classList.add("eye_open_password");
    icon2.classList.add("eye_open_password");
    icon1.src = icon2.src = "./assets/icons/glass_eye_closed.png";}
}


