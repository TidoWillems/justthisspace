document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  const ring1 = document.getElementById('klangring');
  const ring2 = document.getElementById('klangring2');
  if (ring1 && ring2) {
    ring1.style.transform = `translate(${x}px, ${y}px)`;
    ring2.style.transform = `translate(${-x}px, ${-y}px)`;
  }
});
   document.addEventListener("DOMContentLoaded", () => {
      const audio = document.getElementById("bg-audio");
      if (audio) {
        audio.volume = 0.1;
        document.body.addEventListener("click", () => {
          audio.play().catch(() => {});
        }, { once: true });
      }

      // Tropfen generieren
      const count = 15;
      for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.classList.add('tropfen');
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.top = Math.random() * 100 + 'vh';
        drop.style.animationDelay = (Math.random() * 10) + 's';
        drop.style.zIndex = '0';
        document.body.appendChild(drop);
      }
    });
