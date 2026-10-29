/* ToolBari PWA service worker.

Safe by design: pages are network-first (always fresh when online, cache is
only an offline fallback), same-origin static files are stale-while-revalidate,
and everything cross-origin (ads, APIs, CDNs, downloads) is left untouched.

Bump the cache name to force a clean refresh for every visitor. */

var CACHE = 'toolbari-pwa-v2';

var CORE = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/favicon.png',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) {
        return k.indexOf('toolbari-pwa-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // ads / APIs / downloads untouched

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (r) {
        var cp = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, cp); });
        return r;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match('/index.html'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (m) {
      var fresh = fetch(req).then(function (r) {
        if (r && r.ok) {
          var cp = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, cp); });
        }
        return r;
      }).catch(function () { return m; });
      return m || fresh;
    })
  );
});
