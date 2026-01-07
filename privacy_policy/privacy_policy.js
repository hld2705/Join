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

function handleNonLoginUI() {
  const isNonLogin = window.location.search.includes("nonlogin=true"),
        isMobile = window.innerWidth < 900,
        fullNav = document.getElementById("togglednone"),
        loginNav = document.getElementById("loginnav"),
        footPriv = document.getElementById("footerresponsive_privacy_policy"),
        footLegal = document.getElementById("footerresponsive_legal_notice"),
        priv = document.getElementById("privacy_policy_footer"),
        legal = document.getElementById("legal_notice_footer");
  if (fullNav) fullNav.style.display = isNonLogin ? "none" : "flex";
  if (loginNav) { loginNav.style.display = isNonLogin ? (isMobile ? "flex" : "block") : "none"; loginNav.style.alignItems = isMobile ? "center" : "flex-start"; }
  if (footPriv) { footPriv.style.display = isNonLogin ? (isMobile ? "flex" : "block") : "none"; footPriv.style.justifyContent = "space-between"; footPriv.style.paddingRight = "20px"; }
  if (footLegal) footLegal.style.display = isNonLogin ? (isMobile ? "flex" : "block") : "none";
  if (priv) priv.style.display = isNonLogin ? "none" : (isMobile ? "none" : "block");
  if (legal) legal.style.display = isNonLogin ? "none" : (isMobile ? "none" : "block");
}


window.onload = handleNonLoginUI;
window.addEventListener("resize", handleNonLoginUI);
