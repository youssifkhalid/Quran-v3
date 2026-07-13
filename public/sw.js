const CACHE = 'sakeenah-v2';
const STATIC = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
];

// Install: cache shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for HTML; cache-first for assets; network-first for API
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET & cross-origin API calls we need fresh
  if (request.method !== 'GET') return;
  if (url.hostname === 'api.aladhan.com' || url.hostname === 'api.alquran.cloud') {
    // Network-first with fallback
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for font/static assets
  if (url.hostname === 'fonts.gstatic.com' || request.destination === 'font' || request.destination === 'image') {
    e.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request).then((res) => {
        caches.open(CACHE).then((c) => c.put(request, res.clone()));
        return res;
      }))
    );
    return;
  }

  // Stale-while-revalidate for navigation
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        }).catch(() => cached);
        return cached ?? fetchPromise;
      })
    )
  );
});

// Push notifications for prayer times
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'سكينة', {
      body: data.body ?? 'حان وقت الصلاة',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag ?? 'prayer',
      renotify: true,
      dir: 'rtl',
      lang: 'ar',
      vibrate: [200, 100, 200],
      data: { url: data.url ?? '/prayer' },
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
