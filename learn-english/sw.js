// ToolBari School — service worker (scope: /learn-english/)
// LIVE NOW:
//  - Offline support: pages are cached as the student browses; after the
//    first visit, lessons open without a connection (low-data rule).
//  - Notification display for the on-device reminder layer (layer 1).
// SOCKET (not live, nothing faked):
//  - Server PUSH: the 'push' handler below is ready to receive Web Push
//    events, but there is NO sender yet. Going live needs VAPID keys + a
//    sender (Worker + cron). No notification is ever generated here from
//    nothing — reminders fire only from the student's own device logic or
//    from a future real push message.
var CACHE = "school-v2";
var CORE = ["/learn-english/school/", "/learn-english/", "/learn-english/ssc/",
  "/learn-english/hsc/", "/learn-english/parents/", "/learn-english/help/",
  "/learn-english/manifest.json", "/learn-english/icon-192.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { return k !== CACHE ? caches.delete(k) : null; }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(function (hit) {
    var net = fetch(e.request).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) {}
  var title = d.title || "SchoolBari";
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || "পড়ার সময় হয়েছে — আজকের ছোট্ট ধাপটা শেষ করো।",
    icon: "/learn-english/icon-192.png",
    data: { url: d.url || "/learn-english/school/" }
  }));
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var u = (e.notification.data && e.notification.data.url) || "/learn-english/school/";
  e.waitUntil(clients.openWindow(u));
});
