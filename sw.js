const CACHE_NAME = 'first-runner-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/coach-ia.html',
  '/como-funciona.html',
  '/early-access.html',
  '/whitepaper.html',
  '/assets/favicon.svg',
  '/assets/fundodosite.png',
  '/assets/hud-ring-1.svg',
  '/assets/hud-ring-2.svg',
  '/assets/hud-ring-base.svg',
  '/assets/hud-pulse-ring.svg',
  '/translations.js',
  '/language-manager.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // Fallback for offline if not in cache
        });
      })
  );
});
