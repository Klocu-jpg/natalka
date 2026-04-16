// Service Worker for Push Notifications + PWA caching

const CACHE_NAME = "loveapp-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.png",
  "/manifest.json",
];

// Install — pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  event.waitUntil(clients.claim());
});

// Fetch — network first, fallback to cache (skip /~oauth and supabase API)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache auth/oauth or API requests
  if (
    url.pathname.startsWith("/~oauth") ||
    url.hostname.includes("supabase") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  let data = { title: "LoveApp", body: "Nowa wiadomość! 💕" };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/favicon.png",
    badge: "/favicon.png",
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || "loveapp-notification",
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: { url: data.url || "/" },
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Click on notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});