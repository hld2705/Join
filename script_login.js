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