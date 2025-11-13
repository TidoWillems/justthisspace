// genug.js – HTML-only Viewer mit API/Hooks
// @genug:version 2025-10-15
(() => {
  const GENUG = window.GENUG = window.GENUG || {};
  GENUG.version = '2025-10-15';

  // Mini-Eventbus
  const bus = (() => {
    const map = new Map();
    return {
      on(evt, fn){ if(!map.has(evt)) map.set(evt,new Set()); map.get(evt).add(fn); },
      emit(evt, payload){ map.get(evt)?.forEach(fn => fn(payload)); }
    };
  })();
  GENUG.on = bus.on; GENUG.emit = bus.emit;

  // Refs
  const els = {
    nav: document.getElementById('nav'),
    search: document.getElementById('search'),
    content: document.getElementById('content'),
    toc: document.getElementById('toc'),
    overlay: document.getElementById('overlay'),
    navBtn: document.getElementById('navToggle'),
    aside: document.querySelector('aside'),
  };
  const q = new URLSearchParams(location.search);
  const BUILD = window.BUILD || 'dev';

  // Footer-Stamp
  (function updateFooterStamp(){
    const el = document.querySelector('footer small');
    if(el && BUILD!=='dev') el.textContent = `© justthis.space — Stand: ${BUILD}`;
  })();

  // THEME
  const THEME_KEY = 'genug-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem(THEME_KEY);
  document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark':'light'));
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur==='light' ? 'dark':'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY,next);
  });

  // Viewport-VH
  (function setVh(){
    const vh = window.innerHeight*0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  })();
  window.addEventListener('resize',()=>{ 
    const vh = window.innerHeight*0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });

  // NAV Controls
  function closeNav(){
    bus.emit('beforeCloseNav');
    document.body.classList.remove('nav-open');
    els.navBtn?.setAttribute('aria-expanded','false');
    els.aside?.removeAttribute('role');
    els.aside?.removeAttribute('aria-modal');
    els.aside?.setAttribute('inert','');
    els.navBtn?.focus?.();
    bus.emit('afterCloseNav');
  }
  function openNav(){
    bus.emit('beforeOpenNav');
    document.body.classList.add('nav-open');
    els.navBtn?.setAttribute('aria-expanded','true');
    els.aside?.setAttribute('role','dialog');
    els.aside?.setAttribute('aria-modal','true');
    els.aside?.removeAttribute('inert');
    els.aside?.scrollTo(0,0); // oben anfangen
    els.aside?.querySelector('a,button,input')?.focus?.();
    bus.emit('afterOpenNav');
  }
  els.navBtn?.addEventListener('click',()=>{
    const open=!document.body.classList.contains('nav-open');
    open?openNav():closeNav();
  });
  els.overlay?.addEventListener('click',closeNav);
  window.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeNav(); });

  // Highlight
  function highlight(file){
    els.nav?.querySelectorAll('a[data-file]').forEach(a =>
      a.classList.toggle('active', a.dataset.file===file)
    );
  }

  // Router
  function go(file){
    const url=new URL(location);
    url.searchParams.set('f',file);
    history.pushState({},'',url);
    load(file); highlight(file);
  }
  window.addEventListener('popstate',()=>{
    const f=new URL(location).searchParams.get('f');
    if(f){ load(f); highlight(f); }
  });

  // Tree
  function buildTree(files){
    const tree=new Map();
    for(const p of files){
      const parts=p.split('/');
      const dir=parts.length>1?parts.slice(0,-1).join('/'):'';
      if(!tree.has(dir)) tree.set(dir,[]);
      tree.get(dir).push(p);
    }
    const ul=document.createElement('ul');
    ul.className='tree';
    const dirs=[...tree.keys()].sort((a,b)=>a.localeCompare(b,'de'));
    for(const dir of dirs){
      const group=document.createElement('li');
      group.innerHTML=`<div class="folder">${dir||'(root)'}</div>`;
      const inner=document.createElement('ul');
      inner.className='tree';
      for(const f of tree.get(dir).sort((a,b)=>a.localeCompare(b,'de'))){
        const li=document.createElement('li');
        li.className='leaf';
        const name=f.split('/').pop();
        li.innerHTML=`<a href="?f=${encodeURIComponent(f)}" data-file="${f}">${name}</a>`;
        li.querySelector('a').addEventListener('click',e=>{
          e.preventDefault(); go(f);
          if(window.matchMedia('(max-width:960px)').matches) closeNav();
        });
        inner.appendChild(li);
      }
      group.appendChild(inner); ul.appendChild(group);
    }
    els.nav.replaceChildren(ul);

    // Suche
    els.search?.addEventListener('input',()=>{
      const term=els.search.value.trim().toLowerCase();
      for(const a of els.nav.querySelectorAll('a[data-file]')){
        const show=a.textContent.toLowerCase().includes(term)||a.dataset.file.toLowerCase().includes(term);
        a.parentElement.style.display=show?'':'none';
      }
    });
    bus.emit('afterBuildTree',{files});
  }

  // TOC
  function buildTocFrom(html){
    const tmp=document.createElement('div'); tmp.innerHTML=html;
    const headers=tmp.querySelectorAll('h1,h2');
    els.toc.replaceChildren();
    if(!headers.length){ els.toc.hidden=true; return html; }
    const frag=document.createDocumentFragment();
    for(const h of headers){
      if(!h.id){ h.id=h.textContent.trim().toLowerCase().replace(/\\s+/g,'-').replace(/[^\\w\\-]+/g,''); }
      const a=document.createElement('a');
      a.href=`#${h.id}`; a.textContent=h.textContent.trim(); frag.appendChild(a);
    }
    els.toc.appendChild(frag); els.toc.hidden=false;
    return tmp.innerHTML;
  }

  // Titel
  function setPageTitle(file, html){
    const tmp=document.createElement('div'); tmp.innerHTML=html;
    const h1=tmp.querySelector('h1');
    const name=(h1?.textContent?.trim())||file.split('/').pop().replace(/_/g,' ');
    document.title=`${name} — Ich bin – und das ist genug`;
  }

  // Load
  async function load(file){
    bus.emit('beforeLoad',{file});
    els.content.innerHTML=`<div class="skeleton" style="width:45%"></div>
    <div class="skeleton" style="width:85%"></div>
    <div class="skeleton" style="width:70%"></div>`;
    try{
      const r=await fetch(file+'?_='+Date.now());
      if(!r.ok) throw new Error(r.status+' '+r.statusText);
      const html=await r.text();
      const withIds=buildTocFrom(html);
      els.content.innerHTML=withIds;
      setPageTitle(file,withIds);
      document.documentElement.scrollTop=0; document.body.scrollTop=0;
      els.content.setAttribute('tabindex','-1'); els.content.focus({preventScroll:true});
      bus.emit('afterLoad',{file,html:withIds});
    }catch(err){
      console.error(err);
      els.content.innerHTML=`<p>⚠️ Konnte <code>${file}</code> nicht laden.</p>`;
      bus.emit('loadError',{file,error:err});
    }
  }

  // Bootstrap
  (function bootstrap(){
    fetch('filelist.json?_='+Date.now())
      .then(r=>r.json())
      .then(list=>{
        const files=list.filter(p=>p.endsWith('.html')&&!p.endsWith('/'));
        buildTree(files);
        const fromQuery=q.get('f');
        let initial=(fromQuery&&files.includes(fromQuery))?fromQuery:null;
        if(!initial){
          if(files.includes('texte/01_das_genug.html')) initial='texte/01_das_genug.html';
          else if(files.includes('README.html')) initial='README.html';
          else initial=files[0];
        }
        highlight(initial); return load(initial);
      })
      .catch(err=>{
        console.error(err);
        els.content.textContent='Fehler beim Laden der Datei-Liste.';
      });
  })();

  // --- Erweiterungen / Plugins ---
  // Scroll-Memory
  (function navScrollMemory(){
    const key='genug-nav-scroll';
    GENUG.on('afterBuildTree',()=>{
      const y=+localStorage.getItem(key)||0;
      if(els.aside) els.aside.scrollTop=y;
    });
    GENUG.on('afterLoad',()=>{
      if(els.aside) localStorage.setItem(key,String(els.aside.scrollTop||0));
    });
  })();

  // Fokus-Falle
  (function focusTrap(){
    const sel='a,button,input,select,textarea,[tabindex]:not([tabindex=\"-1\"])';
    els.aside?.addEventListener('keydown',(e)=>{
      if(e.key!=='Tab') return;
      const items=[...els.aside.querySelectorAll(sel)].filter(n=>!n.disabled);
      if(!items.length) return;
      const first=items[0], last=items[items.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    });
  })();

})();
