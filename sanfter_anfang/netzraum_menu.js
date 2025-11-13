import { setForm } from './netzraum_faeden.js';

export function initNetzraumMenu() {
  const menu = document.createElement('div');
  menu.id = 'netzraum-menu';
  menu.innerHTML = `
    <button data-form="sphere">●</button>
    <button data-form="spirale">⟲</button>
    <button data-form="torus">◎</button>
    <button data-form="random">☁️</button>
  `;

  Object.assign(menu.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    zIndex: 9999,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '6px 8px',
    fontSize: '18px',
    display: 'flex',
    gap: '8px',
    backdropFilter: 'blur(4px)'
  });

  menu.querySelectorAll('button').forEach(btn => {
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.padding = '4px 6px';
    btn.style.fontSize = '20px';
    btn.onclick = () => setForm(btn.dataset.form);
  });

  document.body.appendChild(menu);
}

