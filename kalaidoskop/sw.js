const VER = (new URL(self.location)).searchParams.get('v') || 'v1';
const CACHE = `kalanf-${VER}`;
const ASSETS = [
  './',
  './index.html',
  './assets/css/kalanf.css',
  './assets/js/app.js',
  './manifest.webmanifest'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      // HTML nicht cachen (sonst „klebt“ die Seite); nur Assets
      if (req.url.endsWith('.css') || req.url.endsWith('.js') || req.url.endsWith('.webmanifest')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
