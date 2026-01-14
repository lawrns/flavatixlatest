/**
 * Flavatix PWA Service Worker
 * Handles offline functionality, caching, and background sync
 */

const CACHE_VERSION = 'flavatix-v1.0.0';
const DATA_CACHE_VERSION = 'flavatix-data-v1.0.0';
const SYNC_TAG = 'flavatix-sync';

// Core app shell files to cache
const APP_SHELL_CACHE = [
  '/',
  '/dashboard',
  '/taste',
  '/quick-tasting',
  '/flavor-wheels',
  '/my-tastings',
  '/_next/static/css/app.css',
  '/manifest.json',
  '/favicon.ico'
];

// API routes that should work offline
const OFFLINE_API_ROUTES = [
  '/api/tastings',
  '/api/flavor-wheels/generate'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(APP_SHELL_CACHE).catch((error) => {
        console.error('[ServiceWorker] Failed to cache some resources:', error);
        // Don't fail installation if some resources can't be cached
        return Promise.resolve();
      });
    })
  );

  // Force activation
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('flavatix-') &&
                   cacheName !== CACHE_VERSION &&
                   cacheName !== DATA_CACHE_VERSION;
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Take control of all pages
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    // Handle POST/PUT/DELETE with background sync
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(handleApiWrite(request));
    }
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request));
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncOfflineData());
  }
});

// Handle static resource requests
async function handleStaticRequest(request) {
  try {
    // Try network first for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // Fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // TODO(pwa): Create /public/offline.html page. Currently falls back to plain text.
        // Should show branded offline state with: 1) Flavatix logo, 2) "You're offline" message,
        // 3) Retry button, 4) List of cached pages user can still access.
        return caches.match('/offline.html') ||
               new Response('Offline - Please check your connection', {
                 status: 503,
                 headers: { 'Content-Type': 'text/plain' }
               });
      }
    }

    // For other resources, try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    return new Response('Network error', { status: 500 });
  }
}

// Handle API requests with offline support
async function handleApiRequest(request) {
  const cache = await caches.open(DATA_CACHE_VERSION);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-From-Cache', 'true');

      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }

    // Return error response
    return new Response(
      JSON.stringify({ error: 'Offline - No cached data available' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle API write operations with queueing
async function handleApiWrite(request) {
  try {
    // Try to send the request
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Queue for later if offline
    await queueRequest(request);

    // Register for background sync
    await self.registration.sync.register(SYNC_TAG);

    // Return optimistic response
    return new Response(
      JSON.stringify({
        success: true,
        queued: true,
        message: 'Request queued for sync'
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Queue a request for later sync
async function queueRequest(request) {
  const db = await openDatabase();

  // Clone request and serialize
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };

  // Store in IndexedDB
  const tx = db.transaction('sync-queue', 'readwrite');
  await tx.objectStore('sync-queue').add(requestData);
  await tx.complete;

  console.log('[ServiceWorker] Request queued for sync:', request.url);
}

// Sync offline data when connection restored
async function syncOfflineData() {
  console.log('[ServiceWorker] Syncing offline data...');

  const db = await openDatabase();
  const tx = db.transaction('sync-queue', 'readonly');
  const requests = await tx.objectStore('sync-queue').getAll();

  const results = [];

  for (const requestData of requests) {
    try {
      // Recreate request
      const request = new Request(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });

      // Send request
      const response = await fetch(request);

      if (response.ok) {
        // Remove from queue if successful
        const deleteTx = db.transaction('sync-queue', 'readwrite');
        await deleteTx.objectStore('sync-queue').delete(requestData.id);
        await deleteTx.complete;

        results.push({ url: requestData.url, status: 'success' });
      } else {
        results.push({ url: requestData.url, status: 'failed', error: response.status });
      }
    } catch (error) {
      console.error('[ServiceWorker] Sync failed for:', requestData.url, error);
      results.push({ url: requestData.url, status: 'error', error: error.message });
    }
  }

  // Notify clients about sync results
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'sync-complete',
      results: results
    });
  });

  console.log('[ServiceWorker] Sync complete:', results);
}

// Open IndexedDB for offline queue
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('flavatix-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create sync queue store
      if (!db.objectStoreNames.contains('sync-queue')) {
        const store = db.createObjectStore('sync-queue', {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create offline data store
      if (!db.objectStoreNames.contains('offline-data')) {
        const store = db.createObjectStore('offline-data', {
          keyPath: 'key'
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data.type === 'skip-waiting') {
    self.skipWaiting();
  }

  if (event.data.type === 'clear-cache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('flavatix-'))
            .map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});