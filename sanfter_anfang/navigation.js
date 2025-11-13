// navigation.js — robust für Unterordner + keine Kollision mit Vogel-Interaktionen
document.addEventListener('DOMContentLoaded', initNavigation);

function initNavigation() {
  const navigateTo = (href) => {
    document.body.classList.add('fade-out');
    setTimeout(() => (location.href = href), 300);
  };

  // Basispfad (z.B. "/sanfter_anfang/")
  const base = location.pathname.replace(/[^/]*$/, '');
  // Dateiname der aktuellen Seite
  const currentFile = (location.pathname.split('/').pop() || 'start.html').toLowerCase();

  // Home-Button bleibt im Ordner
  const home = document.getElementById('home-button');
  if (home) home.addEventListener('click', () => navigateTo(base + 'start.html'));

  // Menü-Items aktiv setzen (Vergleich nur per Dateiname)
  const items = document.querySelectorAll('#swipe-menu .menu-item');
  items.forEach((item) => {
    const hrefAttr = item.getAttribute('href') || '';
    const targetFile = hrefAttr.split('/').pop().toLowerCase();
    const isActive = targetFile === currentFile;

    item.classList.toggle('menu-item-active', isActive);
    if (item.textContent.trim() === '○' || item.textContent.trim() === '●') {
      item.textContent = isActive ? '●' : '○';
    }
    item.toggleAttribute('aria-current', isActive);
  });

  // Klicks + Dot-Umschaltung
  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      items.forEach((i) => {
        if (i.textContent.trim() === '○' || i.textContent.trim() === '●') i.textContent = '○';
        i.classList.remove('menu-item-active');
        i.removeAttribute('aria-current');
      });
      if (item.textContent.trim() === '○' || item.textContent.trim() === '●') item.textContent = '●';
      item.classList.add('menu-item-active');
      item.setAttribute('aria-current', 'page');
      navigateTo(item.href); // Browser macht absolute URL relativ zum aktuellen Dokument
    });
  });

  // — Swipe-Navigation: blockt kurz nach Vogel-Touch/Drag —
  let swipeStartX = 0;
  let swipeStartTime = 0;
  const onBirdArea = (el) => el && (el.id === 'bg-vogel' || (el.closest && el.closest('#bg-vogel')));

  document.body.addEventListener('touchstart', (e) => {
    // blocke, wenn auf dem Vogel, beim Ziehen oder im „Grace“-Fenster
    if (onBirdArea(e.target)) return;
    if (window.isBirdDragging) return;
    if (performance.now() < (window._justTouchedBirdUntil || 0)) return;

    swipeStartX = e.touches[0].clientX;
    swipeStartTime = performance.now();
  }, { passive: true });

  document.body.addEventListener('touchend', (e) => {
    if (window.isBirdDragging) return;
    if (performance.now() < (window._justTouchedBirdUntil || 0)) return;
    if (onBirdArea(e.target)) return;

    const diff = swipeStartX - e.changedTouches[0].clientX;
    const dt = performance.now() - swipeStartTime;

    const MIN_SWIPE_PX = 60;
    const MAX_SWIPE_MS = 800;
    if (Math.abs(diff) > MIN_SWIPE_PX && dt < MAX_SWIPE_MS) {
      const list = Array.from(items);
      const activeIdx = list.findIndex((i) => i.classList.contains('menu-item-active'));
      let newIdx = activeIdx + (diff > 0 ? 1 : -1);
      if (newIdx < 0) newIdx = list.length - 1;
      if (newIdx >= list.length) newIdx = 0;
      list[newIdx].click();
    }
  }, { passive: true });

  // Service Worker relativ registrieren → Scope = Ordner
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then((reg) => console.log('SW ok:', reg.scope))
      .catch((err) => console.error('SW Fehler:', err));
  }
}
