// Service Worker for Push Notifications + PWA caching

const CACHE_NAME = "nasza-przestrzen-v1";

// Install
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Push notification handler
self.addEventListener("push", (event) => {
  let data = { title: "Love App", body: "Nowa wiadomość! 💕" };

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
    vibrate: [200, 100, 200],
    tag: "nudge-notification",
    renotify: true,
    data: { url: data.url || "/" },
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
