// Basic Service Worker for PWA
const CACHE_NAME = 'alrwan-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch handler to pass the PWA install criteria on Android.
  // It simply passes the network request through without caching everything.
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline content goes here.', {
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});
