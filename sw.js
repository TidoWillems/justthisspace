const CACHE_NAME = 'jts-v1';

// Wichtige Shell-Dateien, damit die Startseite offline geht
const OFFLINE_URLS = [
  './',
  './index.html',
  './style.css',
  './favicon.svg',
  './favicon.png',
  './icon_192x192.png',
  './icon_512x512.png',
  './das_ist_alles.html',
  './genug/index.html',
  './bruno/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
