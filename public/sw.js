importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.3.0/workbox-sw.js"
);
workbox.setConfig({ debug: false });

self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    clients.claim(),
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            [
              "css-cache",
              "js-cache",
              "version-cache",
              "html-cache",
              "json-cache",
            ].includes(cacheName)
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
self.addEventListener("message", function (event) {
  if (event.data === "ping") {
    event.source.postMessage("pong");
  }
  if (event.data && event.data.type === "UPDATE_VERSION") {
    const cachesToDelete = [
      "html-cache",
      "css-cache",
      "json-cache",
      "js-cache",
      "version-cache",
    ];

    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cachesToDelete.includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
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
    badge: "/icons/icon-96x96.png",
    icon: "/icons/icon-150x150.png",
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
    badge: "/icons/icon-96x96.png",
    icon: data.creatorImage || "/icons/icon-150x150.png",
    data: {
      url: data.openUrl,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  }
});

const { precaching, routing, strategies } = workbox;
precaching.precacheAndRoute([]);

// CacheFirst -- images / fonts
// Cache font files
workbox.routing.registerRoute(
  /\.(woff|woff2|ttf|otf)$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "font-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);
// Cache image files
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === "image" &&
    request.url.includes("community-profile-images"),
  new workbox.strategies.CacheFirst({
    cacheName: "aws-profile-icon-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);
workbox.routing.registerRoute(
  /\.(png|jpg|jpeg|gif|svg)$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);
// Stale while revalidate
// Cache CSS files
routing.registerRoute(
  /\.css$/,
  new strategies.StaleWhileRevalidate({
    cacheName: "css-cache",
  })
);
// Cache js files
workbox.routing.registerRoute(
  /\.js$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "js-cache",
  })
);
// network first
// Cache html files
workbox.routing.registerRoute(
  /\.html$/i,
  new workbox.strategies.NetworkFirst({
    cacheName: "html-cache",
  })
);
// Cache json files
workbox.routing.registerRoute(
  /\.json$/i,
  new workbox.strategies.NetworkFirst({
    cacheName: "json-cache",
  })
);
workbox.routing.registerRoute(
  /version\.txt$/,
  new workbox.strategies.NetworkFirst({
    cacheName: "version-cache",
  })
);
