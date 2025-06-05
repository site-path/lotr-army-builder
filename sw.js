
const CACHE_NAME = 'middle-earth-armies-builder-v1';
const REPO_PATH = '/lotr-army-builder'; // Define repository path

const urlsToCache = [
  REPO_PATH + '/',
  REPO_PATH + '/index.html',
  REPO_PATH + '/index.tsx',
  REPO_PATH + '/manifest.json',
  REPO_PATH + '/icons/icon-192x192.png',
  REPO_PATH + '/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/react-router-dom@^7.6.1'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll for atomic operation, but be careful as one failure fails all.
        // For production, consider caching individually or handling failures.
        return Promise.all(
          urlsToCache.map(url => {
            // For CDN URLs, create Request objects with no-cors mode if needed,
            // but addAll should generally handle them.
            // For local assets, they are fine.
            const request = (url.startsWith('http') || url.startsWith('https')) ? new Request(url, { mode: 'no-cors' }) : url;
            return cache.add(request).catch(error => {
              console.warn(`Failed to cache ${url}: ${error}`);
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque')) {
              // Log non-cacheable responses but still return them
              if (response) {
                console.warn(`Fetch error for ${event.request.url}: type ${response.type}, status ${response.status}. Won't cache.`);
              } else {
                console.warn(`Fetch error for ${event.request.url}: No response. Won't cache.`);
              }
              return response;
            }
            
            // Check if the request URL is one we intend to cache.
            // This is a stricter check to avoid caching unwanted resources,
            // especially if 'opaque' responses from CDNs are too broad.
            // For this app, we cache specific CDN links explicitly.
            const shouldCache = urlsToCache.includes(event.request.url) || 
                                (event.request.url.startsWith(self.location.origin + REPO_PATH) && !event.request.url.includes('sockjs-node')); // Avoid caching dev server stuff

            if (shouldCache) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          }
        ).catch(error => {
          console.error(`Fetch failed for ${event.request.url}; returning offline page or error`, error);
          // Optionally, return a fallback offline page if one is cached for navigation requests:
          // if (event.request.mode === 'navigate') {
          //   return caches.match(REPO_PATH + '/index.html');
          // }
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});