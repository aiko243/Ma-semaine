// Service worker de Daily Journal : alertes + ouverture rapide et hors ligne.
// - Fichiers de l'appli : réseau d'abord (toujours la dernière version), copie locale si pas de réseau.
// - Polices et bibliothèques Firebase (adresses versionnées) : copie locale d'abord.
// - Les échanges avec le serveur de synchro ne passent jamais par ici.
const CACHE = 'dj-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

const LIBS = /^https:\/\/(www\.gstatic\.com\/firebasejs\/|fonts\.googleapis\.com\/|fonts\.gstatic\.com\/)/;

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const net = await Promise.race([
          fetch(req),
          new Promise((_, rej) => setTimeout(() => rej(new Error('lent')), 4000))
        ]);
        if (net && net.ok) cache.put(req, net.clone());
        return net;
      } catch (err) {
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') {
          const home = await cache.match('./') || await cache.match('./index.html');
          if (home) return home;
        }
        return fetch(req);
      }
    })());
    return;
  }

  if (LIBS.test(req.url)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      const net = await fetch(req);
      if (net && (net.ok || net.type === 'opaque')) cache.put(req, net.clone());
      return net;
    })());
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    if (list.length) return list[0].focus();
    return self.clients.openWindow('./');
  }));
});
