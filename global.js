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