function badgeOverlay() {
  const overlay = document.getElementById('badge-overlay');
  overlay.classList.toggle('show');
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