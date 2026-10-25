/* A short introduction, once per tab session across all collection pages. */
(() => {
  const splash = document.querySelector('#welcome-splash');
  if (!splash || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('luxedrive-welcome-v1')) return;
    sessionStorage.setItem('luxedrive-welcome-v1', 'seen');
  } catch { /* The introduction still dismisses when session storage is unavailable. */ }
  splash.hidden = false;
  let closing = false;
  function dismiss() {
    if (closing) return;
    closing = true;
    splash.classList.add('leaving');
    window.removeEventListener('keydown', dismiss);
    splash.removeEventListener('pointerdown', dismiss);
    setTimeout(() => splash.remove(), 400);
  }
  window.addEventListener('keydown', dismiss);
  splash.addEventListener('pointerdown', dismiss);
  setTimeout(dismiss, 1300);
})();
