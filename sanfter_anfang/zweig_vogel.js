document.addEventListener("DOMContentLoaded", () => {
  // 1) Layout-Klasse setzen
  const prefersRight = window.innerWidth >= 768;
  document.body.classList.toggle("layout-right", prefersRight);

  // 2) Zweig-Wiegen
  const zweig = document.getElementById("bg-zweig");
  if (zweig) {
    zweig.classList.add("wiegt");
  }

  // 3) Vogel ein- und sichtbar machen
  const vogel = document.getElementById("bg-vogel");
  if (vogel) {
    setTimeout(() => {
      vogel.style.opacity = "1";
      vogel.classList.add("schwebt");
    }, 400);
  }

  // 4) Sprachwechsel-Flattern
  window.vogelFlatter = () => {
    if (!vogel) return;
    vogel.classList.remove("schwebt");               // Schwebe-Animation kurz anhalten
    vogel.style.transition = "transform 0.3s ease";
    vogel.style.transform += " scale(1.15) rotate(-12deg)";
    setTimeout(() => {
      // Entfernt scale(...) und rotate(...)
      vogel.style.transform = vogel.style.transform.replace(/scale[^)]+\s*rotate[^)]+/, "").trim();
      vogel.classList.add("schwebt");               // Schweben wieder starten
    }, 300);
  };
});
document.addEventListener('DOMContentLoaded', () => {
  const vogel = document.getElementById('bg-vogel');
  const audio = document.getElementById('zwitscher-audio');

  if (vogel && audio) {
    vogel.addEventListener('mousedown', () => {
      if (audio.paused) {
        audio.currentTime = 0;
        audio.play();
      }
    });

    // Optional: auch für Touch
    vogel.addEventListener('touchstart', () => {
      if (audio.paused) {
        audio.currentTime = 0;
        audio.play();
      }
    });
  }
});
