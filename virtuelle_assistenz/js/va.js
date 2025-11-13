(function(){
  const portal   = document.getElementById('portal');
  const ring     = document.getElementById('ring');
  const titleBlk = document.getElementById('titleBlock');
  const sceneB = document.getElementById('angebote');
  const cs        = getComputedStyle(document.documentElement);
  const timeline  = parseFloat(cs.getPropertyValue('--timeline')) * 700;
  const travelDur = parseFloat(cs.getPropertyValue('--travelDur')) * 700;
  const softLead  = parseFloat(cs.getPropertyValue('--softLead')) * 700;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function positionPortalToTitle(){
    const tRect = titleBlk.getBoundingClientRect();
    const pRect = portal.getBoundingClientRect();
    const targetCenterY = tRect.top + tRect.height/2;
    const top = targetCenterY - pRect.height/2;
    const vpW = window.innerWidth;
    const left = (vpW/2) - (pRect.width/2);
    portal.style.top  = Math.max(16, top) + 'px';
    portal.style.left = Math.max(16, left) + 'px';
  }

  if (!prefersReduced){
    const boot = () => {
      requestAnimationFrame(()=>{
        positionPortalToTitle();
        setTimeout(positionPortalToTitle, 0); // glättet Layout-Shift auf manchen WebViews
        const resizer = () => positionPortalToTitle();
        window.addEventListener('resize', resizer, { passive:true });

        // Szene B leicht vorher andeuten
        setTimeout(()=>sceneB.classList.add('show-soft'), Math.max(0, timeline - softLead));

        // Move in die Ecke + Toggle-Optik
        setTimeout(()=>{
          // inline-Styles neutralisieren, damit .to-corner greift
          portal.style.top  = '';
          portal.style.left = '';
          portal.style.right = '';

          portal.classList.add('to-corner');
          ring.classList.add('as-toggle');
        }, timeline);

        // Header hochrücken
        setTimeout(()=>{ document.body.classList.add('lift'); }, timeline);

        // Angebote voll sichtbar + Cleanup
        setTimeout(()=>{
          sceneB.classList.remove('show-soft');
          sceneB.classList.add('show');
          window.removeEventListener('resize', resizer);
        }, timeline + travelDur);
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot);
    } else {
      window.addEventListener('load', boot, { once:true });
    }
  } else {
    // Reduced Motion: sofort Endzustand
    portal.classList.add('to-corner');
    ring.classList.add('as-toggle');
    document.body.classList.add('lift');
    sceneB.classList.add('show');
  }
// sanfter Crossfade beim Wechseln der Seite
const links = document.querySelectorAll('a.portal');
links.forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    document.body.classList.add('fade-out');
    setTimeout(()=>{
      window.location.href = link.href;
    }, 400); // Zeit bis zum tatsächlichen Wechsel
  });
});
})();
