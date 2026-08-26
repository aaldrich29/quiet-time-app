/* Quiet Time — Service Worker v3 (relative paths for GH Pages) */

const CACHE = 'quiet-time-v3';
const ASSETS = [
  '.',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  flushOverdue(event);

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, clone);
            }
          });
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

/* ─── Scheduled alerts ───────────────────────────────────────────────
   The page hands us the deadline for the current item. If the page is still
   awake it will fire the notification itself; if it gets frozen, this fires
   instead. Both use the same tag, so at most one notification is ever shown.
   A service worker can be shut down at any time, so we also flush any overdue
   alert whenever the worker is woken for something else.                     */

let pending = null;   // { id, at, title, body, tag }
let pendingTimer = null;

function clearPending() {
  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
  pending = null;
}

async function fireAlert(alert) {
  await self.registration.showNotification(alert.title, {
    body: alert.body,
    tag: alert.tag || 'quiet-time-alert',
    renotify: true,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
  });
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clients.forEach((c) => c.postMessage({ type: 'alert-fired', id: alert.id }));
}

function armPending() {
  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
  if (!pending) return;
  const delay = Math.max(0, pending.at - Date.now());
  pendingTimer = setTimeout(() => {
    const alert = pending;
    clearPending();
    if (alert) fireAlert(alert);
  }, delay);
}

function flushOverdue(event) {
  if (pending && pending.at <= Date.now()) {
    const alert = pending;
    clearPending();
    const p = fireAlert(alert);
    if (event && event.waitUntil) event.waitUntil(p);
  }
}

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'schedule-alert') {
    pending = { id: data.id, at: data.at, title: data.title, body: data.body, tag: data.tag };
    armPending();
  } else if (data.type === 'cancel-alert') {
    if (!pending || pending.id === data.id || data.id == null) clearPending();
  }
  flushOverdue(event);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      if ('focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  })());
});
