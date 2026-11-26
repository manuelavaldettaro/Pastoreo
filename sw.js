// Pastoreo Tubicha Mini — funciona sin señal.
// Al publicar una versión nueva de la app, cambiá el número de VERSION.
const VERSION = 'pastoreo-v4';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Los datos van siempre por internet a la planilla (la app ya guarda su copia).
  if (url.hostname.endsWith('script.google.com') || url.hostname.endsWith('googleusercontent.com')) return;
  // Tipografías: se guardan la primera vez.
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(caches.open(VERSION).then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { c.put(e.request, n.clone()); return n; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // App: responde al instante con lo guardado y se actualiza en segundo plano.
  e.respondWith(caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }).then(r => {
    const red = fetch(e.request).then(n => { if (n.ok) c.put(e.request, n.clone()); return n; }).catch(() => r || c.match('index.html'));
    return r || red;
  })));
});
