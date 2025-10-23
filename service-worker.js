const CACHE_NAME = 'tirta-makmur-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './offline.html',
  './service-worker.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    evt.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() =>
        caches.match(req).then(cacheRes => cacheRes || caches.match('./offline.html'))
      )
    );
    return;
  }

  evt.respondWith(
    caches.match(req).then(cacheRes => {
      return cacheRes || fetch(req).then(netRes => {
        return netRes;
      }).catch(() => { /* fallback nothing */ });
    })
  );
});
