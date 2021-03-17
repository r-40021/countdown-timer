// キャッシュファイルの指定
var CACHE_NAME = '210317';
var urlsToCache = [
    '/r-40021.github.io/countdown-timer/index.html',
    '/r-40021.github.io/countdown-timer/style.css',
    '/r-40021.github.io/countdown-timer/script.js',
    '/r-40021.github.io/countdown-timer/materialize.min.css',
    '/r-40021.github.io/countdown-timer/materialize.min.js',
    '/r-40021.github.io/countdown-timer/alarm.mp3',
    '/r-40021.github.io/countdown-timer/fabicon/fabicon.ico',
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});
