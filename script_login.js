let originalLoginHTML;
window.onload = () => {
    originalLoginHTML = document.getElementById("login").innerHTML;
    loadingScreen();
    goBack();
    toggleButton();
};

function toggleButton() {
    let checkbox = document.getElementById("requiredcheckbox")
    let button = document.getElementById("signUpButton")
    button.disabled = !checkbox.checked;
}

function goBack() {
    let signup = document.getElementById("signupPage");
    let login = document.getElementById("login");
    signup.classList.add("d_none");
    login.classList.remove("d_none");
}

document.addEventListener("DOMContentLoaded", () => {
  loadingScreen();
});

async function loadingScreen() {
    const loadingscreen = document.getElementById("loadingscreen");
    loadingscreen.innerHTML = loadingScreenDesktopTemplate();
    await new Promise(resolve => setTimeout(resolve, 2500));
    loadingscreen.style.transition = "opacity 0.5s ease";
    loadingscreen.style.opacity = "0";
    await new Promise(resolve => setTimeout(resolve, 500));
    loadingscreen.remove();
    document.querySelector(".logo").style.opacity = "1";
}

function signUp() {
    let signup = document.getElementById("signupPage");
    let login = document.getElementById("login");
    if(signup.classList.contains("d_none")) {
    login.classList.add("d_none");
    signup.classList.remove("d_none");
    }
}

