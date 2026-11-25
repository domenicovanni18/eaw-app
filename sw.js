/* EAW Einsatzplan – Offline-Helfer: hält die Startseite und die Symbole bereit.
   Die eigentliche App kommt immer frisch von Google (wird hier nicht zwischengespeichert). */
var CACHE = "eaw-app-v2";
var DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-512-maskable.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return; /* Google-App nicht anfassen */
  e.respondWith(
    fetch(e.request).then(function (r) {
      var kopie = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, kopie); });
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); });
    })
  );
});
