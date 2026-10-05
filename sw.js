/*
 * studytool 共用 Service Worker（离线缓存）
 * 所有工具页面（index.html / mistake-book.html / repeat-player.html 等）
 * 只要通过同目录的 pwa-register.js 注册本文件，即可离线使用。
 *
 * 更新方式：修改任意工具页面后，把下面的 CACHE 版本号 +1，
 * 用户下次联网打开时会自动刷新缓存。
 */
var CACHE = 'studytool-cache-v3';

self.addEventListener('install', function (event) {
  /* 不预缓存固定列表：各页面首次访问时自动入缓存（stale-while-revalidate） */
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  /* 只处理同源 http/https 请求；IndexedDB、blob、data 请求不经过这里 */
  if (url.origin !== self.location.origin) return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* 页面导航：网络优先，断网时回退缓存，再回退导航页 */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* 静态资源（js/css/图片等）：缓存优先 + 后台更新 */
  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
