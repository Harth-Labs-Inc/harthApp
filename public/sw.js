importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.3.0/workbox-sw.js"
);

const { precaching, routing, strategies } = workbox;

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", function (event) {
  if (event.data === "ping") {
    event.source.postMessage("pong");
  }
});
self.addEventListener("push", function (event) {
  var data = {
    title: "New!",
    content: "Something new happened!",
    openUrl: "/",
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  var options = {
    body: data.content,
    data: {
      url: data.openUrl,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

const { NetworkOnly } = workbox.strategies;

// Precache and route any assets you need
precaching.precacheAndRoute([]);

// Cache CSS files
routing.registerRoute(
  /\.css$/,
  new strategies.CacheFirst({
    cacheName: "css-cache",
  })
);
// Cache font files
workbox.routing.registerRoute(
  /\.(woff|woff2|ttf|otf)$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "font-cache",
  })
);
// Cache image files
workbox.routing.registerRoute(
  /\.(png|jpg|jpeg|gif|svg)$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "image-cache",
  })
);
// Cache html files
workbox.routing.registerRoute(
  /\.html$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "html-cache",
  })
);
// Cache json files
workbox.routing.registerRoute(
  /\.json$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "json-cache",
  })
);
// Cache api responses when network fails
// workbox.routing.registerRoute(
//   /\/api\/endpoint/,
//   new workbox.strategies.NetworkFirst({
//     cacheName: "api-cache",
//   })
// );
// Cache js files
// workbox.routing.registerRoute(
//   /\.js$/i,
//   new workbox.strategies.CacheFirst({
//     cacheName: "js-cache",
//   })
// );
