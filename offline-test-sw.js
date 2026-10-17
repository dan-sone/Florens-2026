// Scope is limited to the test page and /offline/. Never controls index.html.
importScripts('./offline-files.js');
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 const base=new URL('./',self.location.href),relative=decodeURIComponent(url.pathname.slice(base.pathname.length));
 const known=OFFLINE_FILES.some(f=>f.path===relative)||['offline-files.js','offline-manifest.json'].includes(relative);
 if(!known)return;
 event.respondWith((async()=>{
  const cache=await caches.open(OFFLINE_CACHE);
  const clean=new URL(relative,base).href;
  const cached=await cache.match(clean);
  if(cached)return cached;
  // Only explicit downloads populate the cache. No partial/opaque successes.
  return fetch(event.request);
 })());
});
