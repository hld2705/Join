window.onload = function () {
  const fullNav = document.getElementById("togglednone");
  const loginNav = document.getElementById("loginnav"); 
  const isNonLogin = window.location.search.includes("nonlogin=true");

  if (isNonLogin) {
    if (fullNav) fullNav.style.display = "none";
    if (loginNav) {
      loginNav.style.display = "flex";
      loginNav.style.cursor = "default";
    }
  } else {
    if (loginNav) {
      loginNav.style.display = "none";
      loginNav.style.cursor = "default";
    }
    if (fullNav) fullNav.style.display = "flex";
  }
};
