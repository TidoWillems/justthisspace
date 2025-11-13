// zweig_vogel_drag.js — Drag, Randomflug & „Grace“-Fenster gegen Swipe-Kollisionen
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand  = (min, max) => min + Math.random() * (max - min);
  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- State ---
  let dragging = false;
  let pointerId = null;
  const pos = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };
  const field = { xMin: -150, xMax: 0, yMin: 0, yMax: 0 };

  let intervalId = null;
  let fadeA = null, fadeB = null;

  // kurzes Grace-Fenster nach Vogel-Touch, um versehentliche Swipes zu blocken
  const BIRD_TOUCH_GRACE_MS = 600;
  function markBirdTouch() {
    window.isBirdDragging = true;
    window._justTouchedBirdUntil = performance.now() + BIRD_TOUCH_GRACE_MS;
  }
  function clearBirdTouch() {
    window.isBirdDragging = false;
  }

  function applyTransformVars(vogel) {
    vogel.style.setProperty('--vogel-x', pos.x + 'px');
    vogel.style.setProperty('--vogel-y', pos.y + 'px');
  }
  function updateField() {
    field.xMax = window.innerWidth + 150;
    field.yMax = window.innerHeight;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const body  = document.body;
    const zweig = $('#bg-zweig');
    const vogel = $('#bg-vogel');
    if (!vogel) return;

    // Audio: vorhandenes <audio id="zwitscher-audio"> bevorzugen
    let audio = $('#zwitscher-audio');
    if (!audio) {
      audio = new Audio('zwitscher.mp3'); // relativ zum SA-Ordner
      audio.id = 'zwitscher-audio';
      audio.preload = 'auto';
      document.body.appendChild(audio);
    }

    // Basis
    updateField();
    window.addEventListener('resize', () => {
      updateField();
      pos.x = clamp(pos.x, field.xMin, field.xMax);
      pos.y = clamp(pos.y, field.yMin, field.yMax);
      applyTransformVars(vogel);
    }, { passive: true });

    // Startposition
    pos.x = rand(0, window.innerWidth);
    pos.y = rand(0, window.innerHeight);
    applyTransformVars(vogel);

    // Grund-Animationen
    if (zweig) {
      zweig.classList.add('wiegt');
      // falls CSS überschrieben → Animation hart setzen
      zweig.style.animation = 'wiegen 8s ease-in-out infinite';
      zweig.style.transformOrigin = 'bottom left';
    }
    vogel.classList.add('schwebt');

    // Layout-Flag
    body.classList.toggle('layout-right', window.innerWidth >= 768);

    // Sprachwechsel-Flattern
    window.vogelFlatter = () => {
      vogel.classList.remove('flatter');
      void vogel.offsetWidth; // reflow zum retriggern
      vogel.classList.add('flatter');
    };

    // --- Pointer-Drag (Maus & Touch vereint) ---
    function onPointerDown(e) {
      if (e.button != null && e.button !== 0) return; // nur linker Button
      dragging = true;
      markBirdTouch();

      pointerId = e.pointerId ?? null;
      vogel.setPointerCapture?.(pointerId);

      const rect = vogel.getBoundingClientRect();
      const cx = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
      const cy = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);
      offset.x = cx - rect.left;
      offset.y = cy - rect.top;

      // leiser Sound nur bei Interaktion (iOS)
      try { audio.currentTime = 0; audio.play().catch(()=>{}); } catch {}

      e.preventDefault();
      e.stopPropagation();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const cx = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
      const cy = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);

      pos.x = clamp(cx - offset.x, field.xMin, field.xMax);
      pos.y = clamp(cy - offset.y, field.yMin, field.yMax);
      applyTransformVars(vogel);
      e.stopPropagation();
    }

    function onPointerUp() {
      dragging = false;
      clearBirdTouch();
      pointerId = null;
    }

    vogel.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup',   onPointerUp,   { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });

    // Tap ohne Drag → kurzer Chirp
    vogel.addEventListener('click', () => {
      if (!dragging) {
        try { if (audio.paused) { audio.currentTime = 0; audio.play(); } } catch {}
      }
    }, { passive: true });

    // --- Zufallsflug (transform/opacity, kein Reflow) ---
    function clearFlightTimers() {
      clearInterval(intervalId);
      clearTimeout(fadeA); clearTimeout(fadeB);
      intervalId = fadeA = fadeB = null;
    }

    function randomFlight() {
      if (dragging || REDUCE_MOTION) return;

      // a) ausblenden
      vogel.style.transition = 'opacity 2000ms ease';
      vogel.style.opacity = '0';

      fadeA = setTimeout(() => {
        // b) Offscreen-Start
        const startX = Math.random() < 0.5 ? field.xMin : field.xMax;
        const startY = rand(field.yMin, field.yMax);
        pos.x = startX; pos.y = startY;
        applyTransformVars(vogel);

        // c) Ziel + einblenden
        const destX = rand(field.xMin, field.xMax);
        const destY = rand(field.yMin, field.yMax);
        const flyMs = 3500 + Math.random() * 1500;

        vogel.style.transition = `transform ${flyMs}ms ease-in-out, opacity 1200ms ease-in-out`;

        fadeB = setTimeout(() => {
          vogel.style.opacity = '1';
          pos.x = destX; pos.y = destY;
          applyTransformVars(vogel);
        }, 100);
      }, 2000);
    }

    function scheduleFlights(firstDelay = 8000, every = 20000) {
      if (REDUCE_MOTION) return;
      setTimeout(() => {
        randomFlight();
        intervalId = setInterval(randomFlight, every);
      }, firstDelay);
    }
    scheduleFlights(8000, 20000);

    // Sichtbarkeit: pausieren/neu starten
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearFlightTimers();
      } else {
        scheduleFlights(2000, 20000);
      }
    });

    // Aufräumen
    window.addEventListener('pagehide', clearFlightTimers, { passive: true });
    window.addEventListener('beforeunload', clearFlightTimers, { passive: true });
  });
})();
