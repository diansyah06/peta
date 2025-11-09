const CACHE_NAME = 'citycare-cache-v1';
const PRECACHE_URLS = [

];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);


  if ((url.pathname.includes('/v1') || url.pathname.includes('/stories')) && request.method === 'GET') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: true, message: 'Jaringan gagal atau Anda offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // 1. Coba ambil dari jaringan (ini akan mengizinkan proxy webpack bekerja)
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // 2. Jika jaringan gagal (offline), baru sajikan 'app shell' dari cache
          console.log('Network request failed, serving app shell from cache.');
          return await caches.match('index.html');
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      // ...
      return fetch(request)
        .then((res) => {
          // Cek apakah request valid, metode GET, dan URL-nya dimulai dengan 'http'
          if (!res || res.status !== 200 || request.method !== 'GET' || !request.url.startsWith('http')) {
            return res;
          }

          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return res;
        })
      // ...
    })
  );
});

// PUSH: handle incoming push payloads (expect JSON)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Notifikasi',
    body: 'Ada notifikasi baru.',
    icon: '/images/map.png',
    url: '/',
    tag: 'citycare',
    actions: [],
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload.title = data.title || payload.title;
      payload.body = data.body || payload.body;
      payload.icon = data.icon || payload.icon;
      payload.url = data.url || payload.url;
      payload.actions = data.actions || payload.actions;
      payload.tag = data.tag || payload.tag;
      payload.data = data.data || payload.data;
    } catch (e) {
      try {
        payload.body = event.data.text();
      } catch (_) { }
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    tag: payload.tag,
    data: { url: payload.url, extra: payload.data },
    actions: payload.actions,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// Background sync: process offline outbox when connectivity returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-stories') {
    event.waitUntil(syncOutbox());
  }
});

// Outbox sync logic (reads IndexedDB and tries to POST)
async function syncOutbox() {
  try {
    const db = await openOutboxDB();
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const allReq = store.getAll();

    allReq.onsuccess = async () => {
      const items = allReq.result || [];
      for (const item of items) {
        try {
          const formData = new FormData();
          if (item.description) formData.append('description', item.description);
          if (item.photoBlob) formData.append('photo', item.photoBlob, item.photoName || 'photo.jpg');
          if (item.lat) formData.append('lat', item.lat);
          if (item.lon) formData.append('lon', item.lon);

          const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${item.token}`,
            },
            body: formData,
          });

          if (res && res.ok) {
            store.delete(item.id);
          }
        } catch (err) {
          console.error('Sync item failed', item, err);
        }
      }
    };
    await tx.complete;
  } catch (err) {
    console.error('Sync outbox error', err);
  }
}

// Helper: open IndexedDB used by SW (outbox store)
function openOutboxDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('citycare-db', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}