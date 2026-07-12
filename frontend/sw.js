// EcoSphere AI - Service Worker (PWA & Offline Mode Support)

const CACHE_NAME = 'ecosphere-ai-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/environmental.html',
  '/social.html',
  '/governance.html',
  '/gamification.html',
  '/insights.html',
  '/reports.html',
  '/innovations.html',
  '/admin.html',
  '/auth.html',
  '/styles.css',
  '/dashboard.css',
  '/environmental.css',
  '/social.css',
  '/governance.css',
  '/gamification.css',
  '/insights.css',
  '/reports.css',
  '/innovations.css',
  '/admin.css',
  '/auth.css',
  '/app.js',
  '/dashboard.js',
  '/environmental.js',
  '/social.js',
  '/governance.js',
  '/gamification.js',
  '/insights.js',
  '/reports.js',
  '/innovations.js',
  '/admin.js',
  '/auth.js',
  '/avatar-voice.js',
  '/globe.js',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching Application Shell and Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Network-first for JS/CSS (ensures code updates are immediate), Cache-first for HTML/images (offline support)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isScript = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if (isScript || url.pathname.endsWith('.html') || url.pathname === '/') {
    // Network-first: always try to get the latest code/pages, fallback to cache if offline
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, cloned));
        return networkResponse;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for other assets like images
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(e.request);
      })
    );
  }
});
