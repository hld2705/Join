function confirmationSign(){
    let login = document.getElementById("login");
    login.innerHTML = `<div class="buttonlogin" style="cursor:default"><p>You Signed Up successfully!</p></div>`
}

function logIn() {
    let login = document.getElementById("login");
    login.innerHTML = `
    <div id="signupPage">
        <div class="signuppage" style="margin-bottom: 30px;">
            <div>
      <img style="cursor: pointer;" class="back-arrow" src="/assets/icons/arrow-left-line.svg" onclick="goBack()">
            </div>
                <div style="display:flex; justify-content: center; align-items:center; flex-direction: column;">
      <h1 style="font-size: 61px;">Signup</h1>
      <img src="/assets/icons/Vector 5.svg">
                </div>
        </div>
        <div>
        <div class="userinput">
                <div class="userinputcustom"><input class="inputfield" id="email" type="email" placeholder="Name"
                        required> <img src="/assets/icons/person.svg"></div>
                <div class="userinputcustom"><input class="inputfield" id="email" type="email" placeholder="Email"
                        required> <img src="/assets/icons/mail.svg"></div>
                <div class="userinputcustom"><input class="inputfield" id="password" type="password"
                        placeholder="Password" required> <img src="/assets/icons/lock.svg"></div>
                <div class="userinputcustom"><input class="inputfield" id="password" type="password"
                        placeholder="Confirm Password" required> <img src="/assets/icons/lock.svg"></div>
            </div>
        </div>
        <div style="display:flex; justify-content: center; align-items:center; flex-direction:column;">
        <div style="margin-bottom: 15px;">
        <input type="checkbox" id="requiredcheckbox" onclick="toggleButton()" required>I accept the <a style="text-decoration:none; color:rgba(41, 171, 226, 1);"href="#">Privacy policy</a>
        </div>
        <button class="buttonlogin" id="signUpButton"onclick="confirmationSign()" disabled>Sign Up</button>
        </div>
    </div>`;
}

function loadingScreenDesktopTemplate(){
    return`<div class="loadingscreen">
    <div>
    <a href="index.html"><img class="logoanimation" src="assets/icons/Capa 2.svg"></a></div>
    </div>`
}

