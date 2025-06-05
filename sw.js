const CACHE_NAME = 'middle-earth-armies-builder-v1';
const REPO_PATH = '.'; // Adjusted for relative pathing

const urlsToCache = [
  // REPO_PATH + '/', // Removed ambiguous root cache, rely on explicit index.html
  REPO_PATH + '/index.html',
  REPO_PATH + '/index.tsx', // Browser will fetch this, but likely fail to parse TSX/JSX without transpilation
  REPO_PATH + '/public/manifest.json',
  REPO_PATH + '/public/icons/icon-192x192.png',
  REPO_PATH + '/public/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/react-router-dom@^7.6.1'
  // Note: App.tsx and other components are imported by index.tsx and will be fetched by the browser.
  // The service worker will cache them on successful fetch if they are same-origin or explicitly whitelisted.
  // However, they also need transpilation.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Filter out any potentially problematic entries before adding
        const validUrlsToCache = urlsToCache.filter(url => url !== null && url !== undefined);
        return Promise.all(
          validUrlsToCache.map(url => {
            const request = (url.startsWith('http')) ? new Request(url, { mode: 'no-cors' }) : url;
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
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque')) {
              if (response) {
                console.warn(`Fetch error for ${event.request.url}: type ${response.type}, status ${response.status}. Won't cache.`);
              } else {
                console.warn(`Fetch error for ${event.request.url}: No response. Won't cache.`);
              }
              return response;
            }
            
            const isSameOrigin = event.request.url.startsWith(self.location.origin);
            const isWhitelistedCdn = urlsToCache.some(cdnUrl => typeof cdnUrl === 'string' && event.request.url.startsWith(cdnUrl) && cdnUrl.startsWith('http'));
            
            const shouldCache = (isSameOrigin && !event.request.url.includes('sockjs-node')) || isWhitelistedCdn;

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
          // Fallback for navigation requests:
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