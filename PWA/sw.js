self.addEventListener('fetch', function(e) {
  // インストール促す
})

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')//workboxインポート

// ファイルのキャッシュ
workbox.precaching.precacheAndRoute([
  {
    url: '../index.html',
    revision: '210316'
  },
  {
    url: '../style.css',
    revision: '210316'
  },
  { 
　url: '../script.js',
    revision: '210316'
  },
  { 
　url: '../materialize.min.css',
    revision: '210316'
  },
  { 
　url: '../materialize.min.js',
    revision: '210316'
  },
  { 
　url: '../alarm.mp3',
    revision: '210316'
  },
  { 
　url: '../fabicon/fabicon.ico',
    revision: '210316'
  },
])
