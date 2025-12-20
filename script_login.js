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
button.classList.toggle("disabled", !(checkbox && checkbox.checked));
}

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

document.addEventListener("input", e => {
    const input = e.target;
    if (!input.matches("input")) return;

    const wrapper = input.closest(".userinputcustom");
    if (!wrapper) return;

    const value = input.value.trim();

    if (value !== "") {
        wrapper.classList.remove("submit");

        const errorMsg = wrapper.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains("required-mssg")) {
            errorMsg.classList.remove("show");
        }
    }
});