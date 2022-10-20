var CACHE_NAME = 'ct-20221021-v1';
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
  event.waitUntil(self.skipWaiting());
})), self.addEventListener("activate", (function(event) {
  event.waitUntil(self.clients.claim()); //即座に更新
    var cacheAllowlist = [CACHE_NAME];
    event.waitUntil(caches.keys().then((function(cacheNames) {
        return Promise.all(cacheNames.map((function(cacheName) {
            if (-1 === cacheAllowlist.indexOf(cacheName)&&-1 !== cacheName.indexOf("ct")) return caches.delete(cacheName)
        })))
    })))
})), self.addEventListener("fetch", (function(event) {
   if (!(event.request.url.indexOf('http') === 0)) {return;}
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
