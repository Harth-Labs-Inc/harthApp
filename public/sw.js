const staticVersion = "1.1.2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== staticVersion) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (
    event.request.method === "POST" ||
    requestUrl.pathname.endsWith("/sw.js")
  ) {
    return;
  }

  if (requestUrl.pathname.match(/\.(css|js|html|woff2)$/i)) {
    event.respondWith(
      caches.open(staticVersion).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
            .catch((error) => {
              console.error("Fetch failed:", error);
              return response;
            });
          return response || fetchPromise;
        });
      })
    );
  }
});
self.addEventListener("message", function (event) {
  if (event.data === "ping") {
    event.source.postMessage("pong");
  }
  if (event.data && event.data.type === "UPDATE_VERSION") {
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        event.ports[0].postMessage({ type: "FORCE_UPDATE" });
      });
  }
});
self.addEventListener("push", function (event) {
  var data = {
    title: "New!",
    content: "Something new happened!",
    dir: "ltr",
    lang: "en-US",
    vibrate: [100, 50, 200],
    badge: "/icons/notification-android.png",
    icon: "/icons/notification-android.png",
    data: { url: "https://www.harth.social/" },
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  var options = {
    body: data.content,
    dir: "ltr",
    lang: "en-US",
    vibrate: [100, 50, 200],
    badge: "/icons/notification-android.png",
    icon: data.creatorImage || "/icons/notification-android.png",
    data: {
      url: data.openUrl,
    },
    tag: data.harthID,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  }
});
