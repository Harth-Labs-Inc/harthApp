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
workbox.routing.registerRoute(
  /\/api\/endpoint/,
  new workbox.strategies.NetworkFirst({
    cacheName: "api-cache",
  })
);
// Cache js files
workbox.routing.registerRoute(
  /\.js$/i,
  new workbox.strategies.CacheFirst({
    cacheName: "js-cache",
  })
);

// if (!self.define) {
//   const singleRequire = (name) => {
//     if (name !== "require") {
//       name = name + ".js";
//     }
//     let promise = Promise.resolve();
//     if (!registry[name]) {
//       promise = new Promise(async (resolve) => {
//         if ("document" in self) {
//           const script = document.createElement("script");
//           script.src = name;
//           document.head.appendChild(script);
//           script.onload = resolve;
//         } else {
//           importScripts(name);
//           resolve();
//         }
//       });
//     }
//     return promise.then(() => {
//       if (!registry[name]) {
//         throw new Error(`Module ${name} didn’t register its module`);
//       }
//       return registry[name];
//     });
//   };

//   const require = (names, resolve) => {
//     Promise.all(names.map(singleRequire)).then((modules) =>
//       resolve(modules.length === 1 ? modules[0] : modules)
//     );
//   };

//   const registry = {
//     require: Promise.resolve(require),
//   };

//   self.define = (moduleName, depsNames, factory) => {
//     if (registry[moduleName]) {
//       // Module is already loading or loaded.
//       return;
//     }
//     registry[moduleName] = Promise.resolve().then(() => {
//       let exports = {};
//       const module = {
//         uri: location.origin + moduleName.slice(1),
//       };
//       return Promise.all(
//         depsNames.map((depName) => {
//           switch (depName) {
//             case "exports":
//               return exports;
//             case "module":
//               return module;
//             default:
//               return singleRequire(depName);
//           }
//         })
//       ).then((deps) => {
//         const facValue = factory(...deps);
//         if (!exports.default) {
//           exports.default = facValue;
//         }
//         return exports;
//       });
//     });
//   };
// }
// define("./sw.js", ["./workbox-32092201"], function (workbox) {
//   "use strict";

//   self.addEventListener("activate", function (event) {
//     event.waitUntil(self.clients.claim());
//   });
//   self.addEventListener("message", function (event) {
//     if (event.data === "ping") {
//       event.source.postMessage("pong");
//     }
//   });
//   importScripts();
//   self.skipWaiting();
//   workbox.clientsClaim();
//   workbox.registerRoute(
//     /.*/i,
//     new workbox.NetworkOnly({
//       cacheName: "dev",
//       plugins: [],
//     }),
//     "GET"
//   );
// });
// //# sourceMappingURL=sw.js.map
