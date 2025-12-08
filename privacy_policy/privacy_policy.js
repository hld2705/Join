function handleNonLoginUI() {
  const fullNav = document.getElementById("togglednone");
  const loginNav = document.getElementById("loginnav");
  const footerResponsivePrivacy = document.getElementById("footerresponsive_privacy_policy");
  const footerResponsiveLegal = document.getElementById("footerresponsive_legal_notice");
  const privacyFooter = document.getElementById("privacy_policy_footer");
  const legalFooter = document.getElementById("legal_notice_footer");
  const isNonLogin = window.location.search.includes("nonlogin=true");
  const isMobile = window.innerWidth < 780;

  if (isNonLogin) {
    if (fullNav) fullNav.style.display = "none";
    if (loginNav) {
      loginNav.style.display = isMobile ? "flex" : "block";
      loginNav.style.alignItems = isMobile ? "center" : "flex-start";
    }
    if (footerResponsivePrivacy) {
      footerResponsivePrivacy.style.display = isMobile ? "flex" : "block";
      footerResponsivePrivacy.style.justifyContent = "space-between";
      footerResponsivePrivacy.style.paddingRight = "20px";
    }
    if (footerResponsiveLegal) {
      footerResponsiveLegal.style.display = isMobile ? "flex" : "block";
    }
    if (privacyFooter) privacyFooter.style.display = "none";
    if (legalFooter) legalFooter.style.display = "none";
  } else {
    if (fullNav) fullNav.style.display = "flex";
    if (loginNav) loginNav.style.display = "none";
    if (footerResponsivePrivacy) footerResponsivePrivacy.style.display = "none";
    if (footerResponsiveLegal) footerResponsiveLegal.style.display = "none";
    if (isMobile) {
      if (privacyFooter) privacyFooter.style.display = "none";
      if (legalFooter) legalFooter.style.display = "none";
    } else {
      if (privacyFooter) privacyFooter.style.display = "block";
      if (legalFooter) legalFooter.style.display = "block";
    }
  }
}

window.onload = handleNonLoginUI;
window.addEventListener("resize", handleNonLoginUI);
