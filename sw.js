var CACHE_NAME = 'ct-20210612';
var urlsToCache = [
  './index.html',
  './dist/style.css',
  './dist/main.min.js',
  './alarm.mp3',
  './favicon/favicon.ico',
  './favicon/site.webmanifest',
  './favicon/android-chrome-192x192.png'
];
self.addEventListener("install", (function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then((function(cache) {
        return console.log("Opened cache"), cache.addAll(urlsToCache)
    })))
})), self.addEventListener("activate", (function(event) {
    var cacheAllowlist = [CACHE_NAME];
    event.waitUntil(caches.keys().then((function(cacheNames) {
        return Promise.all(cacheNames.map((function(cacheName) {
            if (-1 === cacheAllowlist.indexOf(cacheName)&&-1 !== cacheName.indexOf("ct")) return caches.delete(cacheName)
        })))
    })))
})), self.addEventListener("fetch", (function(event) {
    event.respondWith(caches.match(event.request).then((function(response) {
        if (response) return response;
        var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then((function(response) {
            if (!response || 200 !== response.status || "basic" !== response.type) return response;
            var responseToCache = response.clone();
            return caches.open(CACHE_NAME).then((function(cache) {
                cache.put(event.request, responseToCache)
            })), response
        }))
    })))
}));
