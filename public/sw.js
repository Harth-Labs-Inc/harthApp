importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.3.0/workbox-sw.js"
);
workbox.setConfig({ debug: false });

self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

self.addEventListener("message", function (event) {
  if (event.data === "ping") {
    event.source.postMessage("pong");
  }
});
self.addEventListener("push", function (event) {
  console.log("sw push event fired event: ", event);
  var data = {
    title: "New!",
    content: "Something new happened!",
    dir: "ltr",
    lang: "en-US",
    vibrate: [100, 50, 200],
    tag: "chat-notification",
    icon: "/icons/icon-150x150.png",
    badge: "/icons/icon-96x96.png",
    openUrl: "https://www.harth.social/",
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  var options = {
    body: data.content,
    dir: "ltr",
    lang: "en-US",
    vibrate: [100, 50, 200],
    tag: "chat-notification",
    icon: "/icons/icon-150x150.png",
    badge: "/icons/icon-96x96.png",
    data: {
      url: "https://www.harth.social/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

const { precaching, routing, strategies } = workbox;

// Precache and route any assets you need
precaching.precacheAndRoute([]);

// CacheFirst
//
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
    request.url.includes("topic-message-attachments"),
  new workbox.strategies.CacheFirst({
    cacheName: "aws-message-image-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);
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

// Cache html files
workbox.routing.registerRoute(
  /\.html$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "html-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

// StaleWhileRevalidate

// Cache CSS files
routing.registerRoute(
  /\.css$/,
  new strategies.StaleWhileRevalidate({
    cacheName: "css-cache",
  })
);
// Cache json files
workbox.routing.registerRoute(
  /\.json$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "json-cache",
  })
);
// Cache js files
workbox.routing.registerRoute(
  /\.js$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "js-cache",
  })
);
