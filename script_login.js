let originalLoginHTML;

window.onload = () => {
    originalLoginHTML = document.getElementById("login").innerHTML;
};

function toggleButton() {
    let checkbox = document.getElementById("requiredcheckbox")
    let button = document.getElementById("signUpButton")
    button.disabled = !checkbox.checked;
    
}

function goBack() {
    document.getElementById("login").innerHTML = originalLoginHTML;
}

async function renderFunc(){
    loadingScreen();
}

async function loadingScreen() {
    let loadingscreen = document.getElementById("loadingscreen");
    loadingscreen.innerHTML = loadingScreenDesktopTemplate();
    await new Promise(resolve => setTimeout(resolve, 2000));
    document.body.style.display = "block";
    loadingscreen.innerHTML = "";
    document.querySelector("header .logo").style.opacity = "1";
}

function loginUserPushedInfo(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    join.push("email", "password");
    
}
