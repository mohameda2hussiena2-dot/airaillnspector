const CACHE_NAME = 'ai-rail-static-v1';
const API_CACHE_NAME = 'ai-rail-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/AI Rail Inspector logo2.png',
  '/AI Rail Inspector logo2-1.png',
  '/leader.jpeg',
  '/mohamed_abdallah.jpg',
  '/nora_shehata.jpg',
  '/fares_sabry.jpeg',
  '/shahd_ahmed.jpeg',
  '/mohamed_raouf.jpeg',
  '/adel_kadry.jpeg',
  '/abdelrahman_ali.jpeg',
  '/philopateer_george.jpeg',
  '/peter_hany.jpeg',
  '/mohamed_montaser.jpeg',
  '/haneen_alaa.jpeg',
  '/salma_khaled.jpeg',
  '/nasef_mohamed.jpg',
  '/roshan.png',
  '/dr_ibrahim_shoaib.png'
];

// --- IndexedDB Helper for SW offline queue ---
function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ai-rail-offline-db', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('offline-requests')) {
        db.createObjectStore('offline-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function saveOfflineRequest(url, method, body, headers) {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline-requests', 'readwrite');
      const store = tx.objectStore('offline-requests');
      store.add({
        url,
        method,
        body,
        headers,
        timestamp: Date.now()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

function getOfflineRequests() {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline-requests', 'readonly');
      const store = tx.objectStore('offline-requests');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function deleteOfflineRequest(id) {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline-requests', 'readwrite');
      const store = tx.objectStore('offline-requests');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

// --- Replay Queue ---
async function replayOfflineRequests() {
  let requests;
  try {
    requests = await getOfflineRequests();
  } catch (err) {
    console.error('Failed to read offline queue from IndexedDB:', err);
    return;
  }
  
  if (requests.length === 0) return;
  
  console.log(`[SW] Found ${requests.length} offline operations to replay.`);
  
  for (const req of requests) {
    try {
      const headers = { ...req.headers };
      // Ensure content-type is correctly restored if body is present
      if (req.body && !headers['content-type'] && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(req.url, {
        method: req.method,
        headers: headers,
        body: req.body
      });
      
      if (res.ok) {
        await deleteOfflineRequest(req.id);
        console.log(`[SW] Successfully replayed offline action to ${req.url}`);
        
        // Notify clients about replay success
        const clientsList = await self.clients.matchAll();
        clientsList.forEach(client => {
          client.postMessage({
            type: 'OFFLINE_REPLAY_SUCCESS',
            url: req.url,
            method: req.method,
            timestamp: Date.now()
          });
        });
      } else {
        console.warn(`[SW] Replay returned status ${res.status} for ${req.url}. Leaving in queue.`);
      }
    } catch (err) {
      console.error(`[SW] Replay fetch failed for ${req.url}. Retrying later.`, err);
      // Stay in queue for retry
      break; 
    }
  }
}

// SW Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning: some static assets could not be cached on installation', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// SW Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Rule 1: Handle API requests
  if (requestUrl.pathname.startsWith('/api/')) {
    const isMutation = ['POST', 'PUT', 'DELETE'].includes(event.request.method);
    
    if (isMutation) {
      // POST/PUT/DELETE: Try network, if fails, buffer queue, return mock status
      event.respondWith(
        fetch(event.request.clone()).then((res) => {
          // If successful, attempt to clear any existing queue backlog
          if (res.ok) {
            event.waitUntil(replayOfflineRequests());
          }
          return res;
        }).catch(async (err) => {
          console.warn(`[SW] API Mutation ${event.request.method} failed. Queueing offline request.`, err);
          
          try {
            const bodyText = await event.request.clone().text();
            
            // Re-map request headers to string-string record
            const headers = {};
            for (const [key, value] of event.request.headers.entries()) {
              headers[key] = value;
            }
            
            await saveOfflineRequest(event.request.url, event.request.method, bodyText, headers);
            
            // Return synthetic offline response to keeping UI happy
            const offlineResponseData = {
              success: true,
              isOfflineQueued: true,
              message: "Server unavailable. Operation recorded and queued for background synchronization.",
              id: `offline-${Date.now()}`
            };
            
            // Notify clients of connection drop / queue trigger
            const clientsList = await self.clients.matchAll();
            clientsList.forEach(client => {
              client.postMessage({
                type: 'OFFLINE_REQUEST_QUEUED',
                url: event.request.url,
                method: event.request.method,
                timestamp: Date.now()
              });
            });
            
            return new Response(JSON.stringify(offlineResponseData), {
              status: 202,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (queuingError) {
            console.error('[SW] Critical offline queuing error:', queuingError);
            return new Response(JSON.stringify({ error: "Offline synchronization failed" }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        })
      );
    } else {
      // GET API Request: Network-First with Cache Fallback
      event.respondWith(
        fetch(event.request.clone()).then((networkResponse) => {
          if (networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => {
          console.log(`[SW] Network down. Loading cached GET response for: ${requestUrl.pathname}`);
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback for missing api caches
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
      );
    }
    return;
  }

  // Rule 2: Non-API (Static UI or Media asset): Stale-While-Revalidate
  // This allows the app to load instantly from cache, whilst updating the cache in the background.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Suppress network down logs for local assets
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Periodic replay trigger on sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'replay-offline-sync') {
    event.waitUntil(replayOfflineRequests());
  }
});

// Handle incoming messages from Client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_NOW') {
    event.waitUntil(replayOfflineRequests());
  } else if (event.data && event.data.type === 'ONLINE') {
    event.waitUntil(replayOfflineRequests());
  }
});
