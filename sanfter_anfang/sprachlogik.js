document.addEventListener('DOMContentLoaded', () => {
  const supported = ["de", "en", "fr"];

  function resolveLang() {
    const fromURL = new URLSearchParams(window.location.search).get("lang");
    if (supported.includes(fromURL)) return fromURL;

    const fromStorage = localStorage.getItem("lang");
    if (supported.includes(fromStorage)) return fromStorage;

    const fromBrowser = navigator.language.slice(0, 2);
    return supported.includes(fromBrowser) ? fromBrowser : "en";
  }

  const userLang = resolveLang();
  document.documentElement.lang = userLang;
  localStorage.setItem("lang", userLang);
  window.getLang = () => userLang;

  window.setLang = (lang) => {
    if (!supported.includes(lang)) return;
    localStorage.setItem("lang", lang);
    const url = new URL(window.location);
    url.searchParams.set("lang", lang);
    document.body.classList.add("fade-out");
    setTimeout(() => window.location.href = url.toString(), 300);
  };

  // Navigationstitel übersetzen (wenn IDs vorhanden sind)
  const translations = {
    de: { frage: "Frage", kinder: "Kinder", nichts: "nichts" },
    en: { frage: "Question", kinder: "Children", nichts: "nothing" },
    fr: { frage: "Question", kinder: "Enfants", nichts: "rien" }
  };

  const t = translations[userLang] || translations.en;
  ["frage", "kinder", "pure"].forEach(id => {
    const el = document.getElementById("nav-" + id);
    if (el && t[id]) el.textContent = t[id];
  });

  const langSpans = document.querySelectorAll('#lang-toggle span');
  langSpans.forEach(span => {
    const isActive = span.getAttribute('data-lang') === userLang;
    span.textContent = isActive ? '●' : '○';
    span.classList.toggle('active-lang', isActive);
    span.addEventListener('click', () => {
      setLang(span.getAttribute('data-lang'));

      // Vogel flattert nach Sprachwechsel
      if (typeof vogelFlatter === 'function') vogelFlatter();
    });
  });

  // Sichtbare Sprachbereiche steuern
  const langElements = document.querySelectorAll('[data-lang-content]');
  langElements.forEach(el => {
    const isMatch = el.getAttribute('data-lang-content') === userLang;
    el.style.display = isMatch ? '' : 'none';
  });

  // Varianten im Fließtext rotieren
  const activeSection = document.querySelector(`section[data-lang-content="${userLang}"]`);
  if (activeSection) {
    const variants = Array.from(activeSection.querySelectorAll('.variant'));
    let index = 0;
    if (variants.length > 1) {
      setInterval(() => {
        const prev = variants[index];
        index = (index + 1) % variants.length;
        const next = variants[index];
        prev.classList.remove('opacity-100');
        next.classList.add('opacity-100');
      }, 6000);
    }
  }

  // Varianten in Überschriften rotieren
  const activeHeadline = document.querySelector(`div[data-lang-content="${userLang}"]`);
  if (activeHeadline) {
    const hVariants = Array.from(activeHeadline.querySelectorAll('h1.variant'));
    let hIndex = 0;
    if (hVariants.length > 1) {
      setInterval(() => {
        const prev = hVariants[hIndex];
        hIndex = (hIndex + 1) % hVariants.length;
        const next = hVariants[hIndex];
        prev.classList.remove('opacity-100');
        next.classList.add('opacity-100');
      }, 6000);
    }
  }
});
