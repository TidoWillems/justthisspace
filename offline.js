document.addEventListener('DOMContentLoaded', () => {
  const sprueche = {
    de: [
      "Ein Tropfen genügt, um das Ganze zu spiegeln.",
      "Wenn nichts geschieht, geschieht vielleicht genau das.",
      "Selbst Stille kann schwingen.",
      "Vielleicht ist dies schon genug."
    ],
    en: [
      "A single drop may reflect it all.",
      "When nothing happens, something may begin.",
      "Even silence may resonate.",
      "Maybe this is already enough."
    ],
    fr: [
      "Une goutte peut tout refléter.",
      "Quand rien ne se passe, quelque chose commence.",
      "Même le silence résonne.",
      "Peut-être que ceci suffit déjà."
    ]
  };

  const lang = (navigator.language || 'en').slice(0, 2);
  const gruppe = sprueche[lang] || sprueche.en;

  const p = document.createElement('p');
  p.style.opacity = '0';
  p.style.transition = 'opacity 2s ease-in-out';
  p.style.marginTop = '2rem';
  p.style.fontStyle = 'italic';
  document.querySelector('main').appendChild(p);

  let index = 0;

  function zeigeSpruch() {
    p.style.opacity = '0';
    setTimeout(() => {
      p.textContent = gruppe[index];
      p.style.opacity = '0.6';
      index = (index + 1) % gruppe.length;
    }, 1000);
  }

  zeigeSpruch();
  setInterval(zeigeSpruch, 8000);
});
