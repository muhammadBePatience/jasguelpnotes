/* ==========================================================================
   sw.js — the service worker. This is what makes the site work on the bus.
   ---------------------------------------------------------------------------
   On the first visit it downloads every page, style, script and lecture into
   the browser's cache. After that the site opens instantly and works with no
   signal at all. When a connection is available it quietly fetches fresh
   copies in the background, so the next open is up to date.

   The version stamp and file list below are rewritten by build.js — a new
   version means browsers throw away the old cache and take the new files.
   Don't edit anything between the BUILD markers by hand.
   ========================================================================== */

/* BUILD:VERSION */
const VERSION = '7b35ce61';
/* /BUILD:VERSION */

const CACHE = 'lecturehub-' + VERSION;

/* BUILD:PRECACHE */
const PRECACHE = [
  "./",
  "assets/css/styles.css",
  "assets/favicon.svg",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/icon.svg",
  "assets/js/app.js",
  "assets/js/content.js",
  "assets/js/page-course.js",
  "assets/js/page-help.js",
  "assets/js/page-index.js",
  "assets/js/page-lecture.js",
  "assets/js/page-quiz.js",
  "assets/js/store.js",
  "course.html",
  "files/README.md",
  "help.html",
  "index.html",
  "lecture.html",
  "manifest.webmanifest",
  "mockups/mockup-academic.html",
  "mockups/mockup-dark.html",
  "quiz.html"
];
/* /BUILD:PRECACHE */

/* ---------- install: pull everything down ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll fails the whole install if any single file 404s, so add them
      // individually and tolerate the odd miss.
      .then((cache) => Promise.all(
        PRECACHE.map((url) => cache.add(url).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

/* ---------- activate: drop caches from older builds ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n.startsWith('lecturehub-') && n !== CACHE)
          .map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- fetch: cache first, refresh in the background ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Navigations: serve the cached page, fall back to the dashboard offline.
  //
  // ignoreSearch matters here. Pages are cached as "course.html", but he
  // navigates to "course.html?c=cs240" — without ignoring the query string
  // every real link would miss the cache and dump him on the dashboard.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || fetch(req).catch(() => caches.match('index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const fresh = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => hit);

      return hit || fresh;
    })
  );
});

/* Lets the page ask the worker to activate immediately after an update. */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
