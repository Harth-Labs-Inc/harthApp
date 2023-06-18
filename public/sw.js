importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.3.0/workbox-sw.js"
);
workbox.setConfig({ debug: false });

self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
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
    badge: "/icons/icon-150x150.png",
    openUrl: "/",
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
    badge: "/icons/icon-150x150.png",
    data: {
      url: data.openUrl,
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

// StaleWhileRevalidate
// get requests
routing.registerRoute(
  ({ request }) => request.method === "GET",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "GET-cache",
  })
);
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
