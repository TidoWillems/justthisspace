(() => {
  const root = document.documentElement;
  const body  = document.body;

  // Intro weich einblenden
  requestAnimationFrame(() => {
    document.querySelector('.intro')?.classList.add('shown');
  });

  // === Scroll-Offset (für fixierte Top-Controls / Tool-Leiste) =================
  const controlsEl = document.querySelector('.controls');
  function setScrollOffset() {
    const h = (controlsEl?.getBoundingClientRect().height || 0) + 12; // etwas Luft
    document.documentElement.style.setProperty('--scroll-offset', `${h}px`);
  }
  setScrollOffset();
  addEventListener('resize', setScrollOffset, { passive: true });
  addEventListener('orientationchange', setScrollOffset, { passive: true });
  addEventListener('load', setScrollOffset, { passive: true });
  setTimeout(setScrollOffset, 0); // nach erstem Layout-Flush
  // ============================================================================

  // --- Service Worker (robust für Root + Subpfade, optional ?refresh=xyz) ---
  if ('serviceWorker' in navigator) {
    const bust = new URLSearchParams(location.search).get('refresh') || 'v3';
    const dir  = location.pathname.endsWith('/')
               ? location.pathname
               : location.pathname.replace(/[^/]+$/, '');
    const swUrl = new URL('sw.js?v=' + encodeURIComponent(bust), location.origin + dir).toString();
    navigator.serviceWorker.register(swUrl, { scope: dir }).catch(()=>{});
  }

  // --- Theme Toggle ---
  const themeBtn   = document.getElementById('themeToggle');
  const icon       = document.getElementById('themeIcon');
  const savedTheme = localStorage.getItem('kalanf-theme');

  const applyTheme = (mode, persist = true) => {
    if (mode === 'light') {
      root.classList.add('light','light-set');
      root.classList.remove('dark-set');
      if (icon) icon.textContent = '🌙';
    } else {
      root.classList.remove('light');
      root.classList.add('dark-set');
      if (icon) icon.textContent = '☀️';
    }
    if (persist) localStorage.setItem('kalanf-theme', mode);
  };

  if (savedTheme === 'light') applyTheme('light', false);
  else if (savedTheme === 'dark') applyTheme('dark', false);
  else {
    const prefersLight = matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark', false);
  }

  themeBtn?.addEventListener('click', () => {
    const isLight = root.classList.contains('light');
    applyTheme(isLight ? 'dark' : 'light');
  });

  // --- Font Size ---
  const fontDec  = document.getElementById('fontDec');
  const fontInc  = document.getElementById('fontInc');
  const clamp    = (v,min,max)=>Math.min(max,Math.max(min,v));
  const getSize  = ()=>parseFloat(getComputedStyle(root).getPropertyValue('--base-size')) || 16;
  const setSize  = (px)=>root.style.setProperty('--base-size', px+'px');
  const savedFont = localStorage.getItem('kalanf-font');
  if (savedFont) setSize(parseFloat(savedFont));

  fontDec?.addEventListener('click', ()=>{
    const s = clamp(getSize()-1, 12, 22);
    setSize(s); localStorage.setItem('kalanf-font', s); setScrollOffset();
  });
  fontInc?.addEventListener('click', ()=>{
    const s = clamp(getSize()+1, 12, 22);
    setSize(s); localStorage.setItem('kalanf-font', s); setScrollOffset();
  });

  // --- PWA Install Button (nur falls nicht standalone) ---
  let deferredPrompt = null;
  const installBtn   = document.getElementById('installBtn');
  const isStandalone = matchMedia('(display-mode: standalone)').matches || (navigator.standalone === true);

  if (!isStandalone && installBtn) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.hidden = false;
      setTimeout(setScrollOffset, 0); // Leiste kann höher werden
    }, { once:true });

    installBtn.addEventListener('click', async ()=>{
      if (!deferredPrompt) return;
      installBtn.disabled = true;
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        installBtn.hidden   = true;
        installBtn.disabled = false;
        setTimeout(setScrollOffset, 0);
      }
    });

    window.addEventListener('appinstalled', () => {
      installBtn.hidden = true;
      setTimeout(setScrollOffset, 0);
    });
  }

  // --- „Man sagt:“ markieren + per-Section Controls ---
  const sections = Array.from(document.querySelectorAll('main section'))
    .filter(s => !s.classList.contains('intro'));

  sections.forEach((sec)=>{
    const ps  = Array.from(sec.querySelectorAll('p'));
    const man = ps.find(p=>{
      const strong = p.querySelector('strong');
      const text   = (strong ? strong.textContent : p.textContent).trim();
      return /^Man sagt:/.test(text);
    });
    if (man) man.setAttribute('data-mansagt','1');

    const ctrl = document.createElement('div'); ctrl.className = 'sec-ctrl';

    const btnMS   = document.createElement('button');
    btnMS.type='button'; btnMS.textContent='📜';
    btnMS.title='„Man sagt:“ in diesem Abschnitt ein/aus';
    btnMS.setAttribute('aria-label','„Man sagt:“ in diesem Abschnitt ein/aus');
    btnMS.addEventListener('click', ()=>{ if (man) man.hidden = !man.hidden; });

    const btnTOC  = document.createElement('button');
    btnTOC.type='button'; btnTOC.textContent='⤴︎';
    btnTOC.title='Zum Inhaltsverzeichnis';
    btnTOC.setAttribute('aria-label','Zum Inhaltsverzeichnis');
    btnTOC.addEventListener('click', ()=>document.getElementById('tocWrap')
      ?.scrollIntoView({behavior:'smooth',block:'start'}));

    const btnShare = document.createElement('button');
    btnShare.type='button'; btnShare.textContent='🔗';
    btnShare.title='Link zu diesem Abschnitt';
    btnShare.setAttribute('aria-label','Link zu diesem Abschnitt');
    btnShare.addEventListener('click', async ()=>{
      const h = sec.querySelector('h2'); if (!h || !h.id) return;
      const url = location.origin + location.pathname + '#' + h.id;
      if (navigator.share) { try { await navigator.share({ title:h.textContent.trim(), url }); } catch(e){} }
      else { try { await navigator.clipboard.writeText(url); } catch(e){} }
    });

    ctrl.append(btnMS, btnTOC, btnShare);
    sec.appendChild(ctrl);
  });

  // --- Globaler „Man sagt:“ Toggle ---
  const toggleAll = document.getElementById('toggleAllManSagt');
  const savedHide = localStorage.getItem('kalanf-hide-mansagt');
  if (savedHide === '1') body.classList.add('hide-mansagt');
  toggleAll?.addEventListener('click', ()=>{
    body.classList.toggle('hide-mansagt');
    localStorage.setItem('kalanf-hide-mansagt',
      body.classList.contains('hide-mansagt') ? '1' : '0');
  });

  // --- Zufalls-Sprung ---
  document.getElementById('randomJump')?.addEventListener('click', ()=>{
    const sec = sections[Math.floor(Math.random()*sections.length)];
    if (!sec) return;
    sec.scrollIntoView({behavior:'smooth',block:'start'});
    sec.classList.add('reveal');
  });

  // --- Share global ---
  document.getElementById('shareBtn')?.addEventListener('click', async ()=>{
    const url = location.href;
    if (navigator.share) { try{ await navigator.share({title:document.title, url}); }catch(e){} }
    else { try{ await navigator.clipboard.writeText(url); }catch(e){} }
  });

  // --- Print/Download ---
  document.getElementById('printBtn')?.addEventListener('click', ()=>window.print());
  document.getElementById('downloadBtn')?.addEventListener('click', ()=>{
    const html='<!doctype html>\n'+document.documentElement.outerHTML;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const ts=new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.href=url; a.download=`kalanf-${ts}.html`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  });

  // --- Reveal on scroll ---
  if ('IntersectionObserver' in window) {
    const io=new IntersectionObserver((ents)=>
      ents.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('reveal'); }),
      { threshold:.08 }
    );
    document.querySelectorAll('section,#tocWrap').forEach(s=>io.observe(s));
  } else {
    document.querySelectorAll('section,#tocWrap').forEach(s=>s.classList.add('reveal'));
  }

  // --- Back to top ---
  const backTop=document.getElementById('backTop');
  const onScroll=()=>{ if (scrollY>600) backTop?.classList.add('show'); else backTop?.classList.remove('show'); };
  addEventListener('scroll', onScroll, {passive:true});
  backTop?.addEventListener('click', ()=>document.getElementById('top')?.scrollIntoView({behavior:'smooth'}));
  onScroll();

  // --- TOC + Permalinks + Suche + A–Z + Sort Toggle ---
  const toc         = document.getElementById('toc');
  const tocToggle   = document.getElementById('tocToggle');
  const search      = document.getElementById('tocSearch');
  const lettersWrap = document.getElementById('azLetters');
  const sortToggle  = document.getElementById('sortToggle');
  const focusSearch = document.getElementById('focusSearch');

  const slugify = (s)=> s.toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu,'')
    .replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,120);

  // H2s einsammeln + Permalinks bauen
  const heads = Array.from(document.querySelectorAll('main section h2'));
  heads.forEach((h)=>{
    const title = h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim();
    let id = h.id || slugify(title);
    let base=id, n=2;
    while (document.getElementById(id)) { if (h.id===id) break; id = base+'-'+(n++); }
    h.id=id;

    const pl=document.createElement('a');
    pl.href='#'+id; pl.className='permalink';
    pl.title='Link zu diesem Abschnitt kopieren'; pl.textContent='¶';
    pl.setAttribute('aria-label','Link zu diesem Abschnitt kopieren');
    pl.addEventListener('click',(e)=>{
      e.preventDefault();
      const url=location.origin+location.pathname+'#'+id;
      navigator.clipboard.writeText(url).catch(()=>{});
      history.replaceState(null,'','#'+id);
    });
    h.appendChild(pl);
  });

  // TOC Items (Originalreihenfolge)
  const tocItems = heads
    .filter(h=>!h.closest('section')?.classList.contains('intro'))
    .map(h=>({ id:h.id, title: (h.childNodes[0]? h.childNodes[0].textContent.trim() : h.textContent.trim()) }));

  let isAlpha = false;
  const renderTOC = ()=>{
    if (!toc) return;
    toc.innerHTML='';
    const items = isAlpha ? [...tocItems].sort((a,b)=>a.title.localeCompare(b.title)) : tocItems;
    items.forEach(({id,title})=>{
      const li=document.createElement('li');
      const a =document.createElement('a'); a.href='#'+id; a.textContent=title;
      const copy=document.createElement('button');
      copy.type='button'; copy.className='copylink'; copy.textContent='⎘';
      copy.title='Link kopieren'; copy.setAttribute('aria-label','Link kopieren');
      copy.addEventListener('click', async (ev)=>{
        ev.preventDefault();
        const url=location.origin+location.pathname+'#'+id;
        try { await navigator.clipboard.writeText(url); } catch(e){}
      });
      li.append(a,copy); toc.appendChild(li);
    });
  };
  renderTOC();

  // Sort Toggle
  sortToggle?.addEventListener('click', ()=>{ isAlpha=!isAlpha; renderTOC(); });

  // Suche + / Fokus + Esc Clear
  document.addEventListener('keydown', (e)=>{
    if (e.key==='/'){ e.preventDefault(); search?.focus(); }
    else if (e.key==='Escape' && document.activeElement===search){
      search.value=''; search.dispatchEvent(new Event('input')); search.blur();
    }
  });
  focusSearch?.addEventListener('click', ()=>search?.focus());
  search?.addEventListener('input', ()=>{
    const q=(search.value||'').trim().toLowerCase();
    const lis=Array.from(toc?.querySelectorAll('li')||[]);
    lis.forEach(li=>{
      const txt=li.querySelector('a')?.textContent.toLowerCase() || '';
      li.style.display = !q || txt.includes(q) ? '' : 'none';
    });
  });

  // A–Z Index
  if (lettersWrap) {
    const initials = new Set(tocItems.map(it=> (it.title[0]||'').toUpperCase()).filter(Boolean));
    const letters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');
    letters.forEach(ch=>{
      const b=document.createElement('button');
      b.textContent=ch;
      if (!initials.has(ch)) b.classList.add('dim');
      b.addEventListener('click', ()=>{
        if (!search) return;
        search.value = ch;
        search.dispatchEvent(new Event('input'));
        lettersWrap.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
      });
      lettersWrap.appendChild(b);
    });
  }

  // Aktives TOC-Item beim Scrollen hervorheben
  const idToLi = ()=>{
    const map=new Map();
    toc?.querySelectorAll('li>a').forEach(a=> map.set(a.getAttribute('href')?.slice(1), a.parentElement));
    return map;
  };
  const liMap=idToLi();

  const obs=new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      const id=e.target.id;
      const li=liMap.get(id);
      if (!li) return;
      if (e.isIntersecting) li.classList.add('active'); else li.classList.remove('active');
    });
  }, { rootMargin:'-40% 0px -55% 0px', threshold:0 });

  heads.forEach(h=>obs.observe(h));

  // TOC-Highlight bei Hash-Wechsel
  window.addEventListener('hashchange', ()=>{
    const id = location.hash.replace('#','');
    document.querySelectorAll('#toc li').forEach(li=>li.classList.remove('active'));
    const a = document.querySelector(`#toc li a[href="#${CSS.escape(id)}"]`);
    a?.closest('li')?.classList.add('active');
  });
  if (location.hash) window.dispatchEvent(new Event('hashchange'));

  // JS aktiv → Fallbackklasse entfernen
  document.documentElement.classList.remove('no-js');
})();
