(function () {
  if (!window.firebase) return;
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyDaAKocqkIROo_InISQbRjsoG8z1JCK3g0",
      authDomain: "join-gruppenarbeit-75ecf.firebaseapp.com",
      databaseURL: "https://join-gruppenarbeit-75ecf-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "join-gruppenarbeit-75ecf",
      storageBucket: "join-gruppenarbeit-75ecf.appspot.com",
      messagingSenderId: "180158531840",
      appId: "1:180158531840:web:c894124a7d6eb515364be5",
      measurementId: "G-5R563MH52P"
    });
  }
})();

/**
 * forces new values as soon as the resize eventlistener takes place under 900px
 */
function handleNonLoginUI() {
    const isNonLogin = sessionStorage.getItem("nonlogin") === "true";
    const isMobile = window.innerWidth < 900;
    applyNonLoginUI(isNonLogin, isMobile);
    document.body.classList.add("ui-ready");
}

/** 
 * @param {String} isNonLogin 
 * Is extracted from the guest flag and the nonlogin?=true tag that is being forwarded
 *
 * @param {onsize} isMobile 
 * If the window is under 900px and the user logged in as guest
 * an onsize eventlistener gets the needed information, triggering the buttons to dissapear, and also to align themselfs
 */

function applyNonLoginUI(isNonLogin, isMobile) {
    const fullNav = document.getElementById("togglednone");
    const loginNav = document.getElementById("loginnav");
    const footPriv = document.getElementById("footerresponsive_privacy_policy");
    const footLegal = document.getElementById("footerresponsive_legal_notice");
    const priv = document.getElementById("privacy_policy_footer");
    const legal = document.getElementById("legal_notice_footer");
    if (fullNav) fullNav.style.display = isNonLogin ? "none" : "flex";
    if (loginNav) { loginNav.style.display = isNonLogin ? (isMobile ? "flex" : "block") : "none"; loginNav.style.alignItems = isMobile ? "center" : "flex-start"; }
    if (footPriv) { footPriv.style.display = isNonLogin ? (isMobile ? "flex" : "block") : "none"; footPriv.style.justifyContent = "space-between"; footPriv.style.paddingRight = "0px"; }
    if (footLegal) footLegal.style.display = isNonLogin ? (isMobile ? "flex" : "block") : "none";
    if (priv) priv.style.display = isNonLogin ? "none" : (isMobile ? "none" : "block");
    if (legal) legal.style.display = isNonLogin ? "none" : (isMobile ? "none" : "block");
}

document.addEventListener("DOMContentLoaded", handleNonLoginUI);
window.addEventListener("resize", handleNonLoginUI);

function removeSessionLogin(){
  sessionStorage.removeItem("nonlogin");
}
