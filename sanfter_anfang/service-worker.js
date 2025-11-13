const CACHE_NAME = 'justthisspace-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/start.html',
  '/style.css',
  '/tailwind.min.css',
  '/sprachlogik.js',
  '/navigation.js',
  '/pure.html',
  '/frage.html',
  '/kinder.html',
  '/sinn.html',
  '/nichts.html',
  '/resonanz.html',
  '/offline.html'
2k
];

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(response =>
        response || caches.match('/offline.html')
      )
    )
  );
});
