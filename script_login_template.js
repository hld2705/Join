
/**
 * @returns signup confirmation that the user is now succesfully signed in
 */
function confirmationSignTemplate(){
    let login = document.getElementById("signupPage");
    login.innerHTML += 
    `
    <div id="signedup"class="signedupconfirmationcontainerdarkoverlay" style="cursor:default">
        <div class="signedupconfirmationcontainer" id="signedupconfirmationid">
            <p>You Signed Up successfully!</p>
        </div>
    </div>
    `
}

/**
 * 
 * @returns template loading screen desktop animation
 */
function loadingScreenDesktopTemplate(){
    return`<div class="loadingscreen">
    <div>
    <a href="index.html"></a></div>
    </div>`
}
