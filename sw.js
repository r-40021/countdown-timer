var CACHE_NAME = 'ct-20210508';
var urlsToCache = [
  '/countdown-timer/index.html',
  '/countdown-timer/style.css',
  '/countdown-timer/script.js',
  '/countdown-timer/materialize.min.css',
  '/countdown-timer/materialize.min.js',
  '/countdown-timer/alarm.mp3',
  '/countdown-timer/favicon/favicon.ico',
  '/countdown-timer/js/all.min.js',
  '/countdown-timer/push.min.js',
  '/countdown-timer/push.min.js.map',
  '/countdown-timer/nosleep.min.js'
];
self.addEventListener("install", (function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then((function(cache) {
        return console.log("Opened cache"), cache.addAll(urlsToCache)
    })))
})), self.addEventListener("activate", (function(event) {
    var cacheAllowlist = [CACHE_NAME];
    event.waitUntil(caches.keys().then((function(cacheNames) {
        return Promise.all(cacheNames.map((function(cacheName) {
            if (-1 === cacheAllowlist.indexOf(cacheName)) return caches.delete(cacheName)
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
