/* IKJ Field — service worker: keeps the app working without internet. */
const VERSION = '1.5.1';
const CACHE = 'ikj-field-' + VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'})))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ikj-field-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      return (await c.match('./index.html')) || (await c.match('./')) || fetch(req);
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    return (await c.match(req, {ignoreSearch: true})) || fetch(req);
  })());
});
