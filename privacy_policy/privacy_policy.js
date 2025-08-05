window.onload = function () {
  let url = window.location.href;
  if (url.includes("nonlogin=true")) {
    let fullNav = document.getElementById("togglednone");
    let loginNav = document.getElementById("loginnav");

    if (fullNav) fullNav.style.display = "none";
    if (loginNav) loginNav.style.display = "flex";
  }
};