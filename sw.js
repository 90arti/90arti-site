// 90Artı web bildirimleri
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: '90Artı', body: e.data ? e.data.text() : '' }; }
  const fid = d.data && d.data.fid;
  e.waitUntil(self.registration.showNotification(d.title || '90Artı', {
    body: d.body || '', icon: '/img/icon-192.png', badge: '/img/favicon.png', tag: fid ? 'm' + fid + ':' + (d.title || '') : undefined,
    data: { url: (d.data && d.data.url) || (fid ? '/match/' + fid : '/') },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) { c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
