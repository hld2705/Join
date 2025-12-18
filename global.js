function badgeOverlay() {
  const overlay = document.getElementById("badge-overlay");
  const helpIcon = document.querySelector(".user-info-help");
  const mobileHelp = document.getElementById("mobile-help-link");

  overlay.classList.toggle("show");

  if (innerWidth < 900) {
    helpIcon.style.display = "none";

    if (!mobileHelp) {
      const link = document.createElement("a");
      link.href = "./help.html";
      link.id = "mobile-help-link";
      link.textContent = "Help";
      overlay.prepend(link);
    }
  } else {
    helpIcon.style.display = "block";
    if (mobileHelp) mobileHelp.remove();
  }
  updateHelpLink();
}

window.addEventListener("resize", updateHelpLink, () => {
  const overlay = document.getElementById("badge-overlay");
  const helpIcon = document.querySelector(".user-info-help");
  const mobileHelp = document.getElementById("mobile-help-link");

  if (innerWidth >= 900) {
    helpIcon.style.display = "block";
    if (mobileHelp) mobileHelp.remove();
  } else {
    helpIcon.style.display = "none";
    if (!mobileHelp) {
      const link = document.createElement("a");
      link.href = "./help.html";
      link.id = "mobile-help-link";
      link.textContent = "Help";
      overlay.prepend(link);
    }
  }
});

function updateHelpLink() {
  const overlay = document.getElementById("badge-overlay");
  const helpIcon = document.querySelector(".user-info-help");
  const mobileHelp = document.getElementById("mobile-help-link");
  if (innerWidth >= 900) {
    helpIcon.style.display = "block";
    if (mobileHelp) mobileHelp.remove();
  } else {
    helpIcon.style.display = "none";
    if (!mobileHelp) {
      const link = document.createElement("a");
      link.href = "./help.html";
      link.id = "mobile-help-link";
      link.textContent = "Help";
      overlay.prepend(link);
    }
  }
}

document.addEventListener('click', function (event) {
  const overlay = document.getElementById('badge-overlay');
  if (!overlay) return;
  if (
    !event.target.closest('#badge-overlay') &&
    !event.target.closest('.user-info')
  ) {
    overlay.classList.remove('show');
  }
});


// Input Border Blue


document.addEventListener("focus", handleFocus, true);
document.addEventListener("blur", handleBlur, true);

function handleFocus(event) {
    const el = event.target;
    if (!isInput(el)) return;

    el.classList.add("bordercolor-blue");
}

function handleBlur(event) {
    const el = event.target;
    if (!isInput(el)) return;

    el.classList.remove("bordercolor-blue");
}

function isInput(el) {
    return el.matches("input[type='text'], input[type='email'], input[type='date'], input[type='password'], input[type='phone'], input[type='tel'], textarea");
}


window.addEventListener("DOMContentLoaded", () => {
dynamicUserHeaderBadge();
});

function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("uid");
}

async function getCurrentUser() {
  const uid = getUserId();
  if (!uid) return null;

  const snapshot = await firebase
    .database()
    .ref("users/" + uid)
    .once("value");

  return snapshot.val();
}

async function dynamicUserHeaderBadge(){
  const user = await getCurrentUser();
  if (!user || !user.badge) return;

  let userInfo = document.getElementById("user-info-id");
  userInfo.innerHTML += `<div class="user-info">
        <a class="user-info-help" href="./help.html" onclick="event.preventDefault(); navigate('./help.html')> <img class="Hilfe" src="./assets/help.svg" alt="help"> </a>
        <div id="header-badge" class="profil" style="background:${user.badge.color}" onclick="badgeOverlay()">
        <p class="avatar-text">${user.badge.text}</p>
        </div>
        <div id="navbar" class="navbar">
          <a href="legal_notice.html">Legal Notice</a>
          <a href="privacy_policy.html">Privacy Policy</a>
          <a href="index.html" id="logout-link">Log out</a>
        </div>
      </div>`
}

function navigate(path) {
  const uid = getUserId();
  if (!uid) {
    window.location.href = "/index.html";
    return;
  }
  window.location.href = `${path}?uid=${uid}`;
}