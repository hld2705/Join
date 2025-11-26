function confirmationSignTemplate(){
    let login = document.getElementById("signupPage");
    login.innerHTML = `<div id="signedup"class="buttonlogin" style="cursor:default"><p>You Signed Up successfully!</p></div>`
}

function loadingScreenDesktopTemplate(){
    return`<div class="loadingscreen">
    <div>
    <a href="index.html"></a></div>
    </div>`
}

function errorMessageTemplate(){
    return`<div class="errormessagetemplate" id="errorWindow">
            <div>
            <p>Name and/or password are required</p>   
            </div>
            <div>
            <button id="buttonErrorMessage" class="buttonlogin" onclick="goBackLogin()">Ok</button>
            </div>    
    </div>
    `
}

