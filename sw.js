/* Offline cache for the toolkit. Paths are relative to this file so a subpath host works. */
var CACHE = "ovpt-static-v3";
var PRECACHE = [
  "index.html",
  "manifest.webmanifest",
  "LICENSE",
  "README.md",
  "THIRD_PARTY_LICENSES.md",
  "shared/styles.css",
  "shared/shell.js",
  "icons/favicon-32.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "career-pathway-translator/index.html",
  "career-pathway-translator/styles.css",
  "career-pathway-translator/app.js",
  "career-pathway-translator/engine.js",
  "career-pathway-translator/data/meta.js",
  "career-pathway-translator/data/moc.js",
  "career-pathway-translator/data/occupations.js",
  "career-pathway-translator/data/phrases.js",
  "career-pathway-translator/vendor/debriefed/LICENSE",
  "career-pathway-translator/vendor/debriefed/manifest.json",
  "scam-guardian/index.html",
  "scam-guardian/styles.css",
  "scam-guardian/app.js",
  "scam-guardian/engine.js",
  "scam-guardian/data/rules.js",
  "scam-guardian/data/model.js",
  "scam-guardian/vendor/tesseract/tesseract.min.js",
  "scam-guardian/vendor/tesseract/worker.min.js",
  "scam-guardian/vendor/tesseract/eng.traineddata.gz",
  "scam-guardian/vendor/tesseract/core/tesseract-core-lstm.wasm.js",
  "scam-guardian/vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js",
  "scam-guardian/vendor/tesseract/core/tesseract-core-relaxedsimd-lstm.wasm.js",
  "scam-guardian/vendor/scram/LICENSE",
  "shared/local-model.js",
  "ai-tutor/index.html",
  "ai-tutor/styles.css",
  "ai-tutor/app.js",
  "ai-tutor/data/content.js",
  "ai-tutor/retrieve.js",
  "docs/agent-security-practices.md",
  "transition-companion/index.html",
  "transition-companion/styles.css",
  "transition-companion/app.js",
  "transition-companion/data/plan.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(PRECACHE);
  }).then(function () {
    if (!self.registration.active) return self.skipWaiting();
    return undefined;
  }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key !== CACHE;
    }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "skip-waiting") self.skipWaiting();
});

function indexFallback(url) {
  if (!url.pathname.endsWith("/")) return Promise.resolve(undefined);
  return caches.open(CACHE).then(function (cache) {
    return cache.match(new URL("index.html", url.href).href);
  });
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url;
  try { url = new URL(request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith("/sw.js")) {
    event.respondWith(fetch(request).catch(function () {
      return caches.match(request);
    }));
    return;
  }

  event.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (cached) {
      if (cached) return cached;
      return indexFallback(url).then(function (indexHit) {
        if (indexHit) return indexHit;
        return fetch(request).then(function (response) {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        }).catch(function () {
          return indexFallback(url).then(function (fallback) {
            return fallback || new Response("This file is not in the offline copy yet. Open it once while online.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
          });
        });
      });
    });
  }));
});
