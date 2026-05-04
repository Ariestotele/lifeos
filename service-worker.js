// LifeOS service worker v5.19.7
// HTML navigations: network-first (always fresh when online, cache fallback offline).
// Other assets: cache-first with background refresh.
// IMPORTANT: still bump CACHE on every release -- it's the invalidation key.
const CACHE = 'lifeos-1f985eee';
const CORE = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
];

self.addEventListener('install', e => {
  // Precache core assets. If a CDN asset fails, don't block install.
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(CORE.map(url =>
        c.add(url).catch(err => console.warn('[sw] precache skipped:', url, err))
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Clean up old caches so the app doesn't serve stale shell after a deploy.
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;
  // Skip cross-origin that aren't in our allowlist (e.g. Anthropic API, which must stay network-only)
  const url = new URL(req.url);
  const isCore = CORE.some(c => req.url === c || (c === './' && url.pathname === '/' + (location.pathname.split('/').filter(Boolean).pop() || '')));
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const isSameOrigin = url.origin === location.origin;
  const shouldCache = isSameOrigin || isCore || isFont || url.hostname === 'cdnjs.cloudflare.com';

  if (!shouldCache) {
    // Pass through — network only, don't cache
    return;
  }

  // Network-first for HTML navigations so deploys take effect on the very next load.
  if (req.mode === 'navigate' || (req.destination === 'document')) {
    e.respondWith(
      fetch(req).then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html') || caches.match('./')))
    );
    return;
  }
  // Cache-first for everything else (static assets + fonts + cdn).
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) {
        if (isSameOrigin) {
          fetch(req).then(resp => {
            if (resp && resp.ok) caches.open(CACHE).then(c => c.put(req, resp.clone()));
          }).catch(() => {});
        }
        return hit;
      }
      return fetch(req).then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return resp;
      });
    })
  );
});

// Listen for "skipWaiting" messages so the app can force-update
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
