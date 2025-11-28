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

function toggleButton() {
  const checkbox = document.getElementById('requiredcheckbox');
  const button = document.getElementById('signUpButton');
  if (!button) return;
  button.disabled = !(checkbox && checkbox.checked);
}

function goBack() {
  const signup = document.getElementById('signupPage');
  const login = document.getElementById('login');
  const headerwriting = document.getElementById('headerwritingdiv');
  if (!signup || !login || !headerwriting) return;

  headerwriting.classList.remove('d_none');
  signup.classList.add('d_none');
  login.classList.remove('d_none');
}

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

function signUp() {
  const signup = document.getElementById('signupPage');
  const login = document.getElementById('login');
  const headerwriting = document.getElementById('headerwritingdiv');
  if (!signup || !login || !headerwriting) return;

  if (signup.classList.contains('d_none')) {
    login.classList.add('d_none');
    signup.classList.remove('d_none');
  }
  if (!headerwriting.classList.contains('d_none')) {
    headerwriting.classList.add('d_none');
  }
}

function requiredLogin() {
  let [email, password] = document.querySelectorAll('.userinputcustom');
  let reqText = document.getElementById('required-message');

  if (!email.value || !password.value) reqText.style.display = "block";
  if (!email.value) email.classList.add('required-text');
  else email.classList.remove('required-text');

  if (!password.value) password.classList.add('required-text');
  else password.classList.remove('required-text');

  email.addEventListener('input', () => {
    email.classList.remove('required-text');
    if (reqText) reqText.style.display = "none";
  });
  password.addEventListener('input', () => {
    password.classList.remove('required-text');
    if (reqText) reqText.style.display = "none"
  })
};
