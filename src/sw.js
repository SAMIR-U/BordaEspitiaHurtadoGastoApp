const CACHE_NAME = 'expense-tracker-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/expenses.js',
    '/pages/dashboard.html',
    '/pages/expenses.html',
    '/pages/budget.html',
    '/pages/profile.html',
    '/pages/offline.html',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// INSTALL
self.addEventListener('install', event => {
    console.log('SW: Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cacheando App Shell...');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// ACTIVATE
self.addEventListener('activate', event => {
    console.log('SW: Activando...');

    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => {
                            console.log(
                                'SW: Eliminando caché:',
                                key
                            );

                            return caches.delete(key);
                        })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// FETCH
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .catch(() => {
                        return caches.match('/pages/offline.html');
                    });
            })
    );
});