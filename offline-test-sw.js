// Scope is limited to the test page and /offline/. Never controls index.html.
importScripts('./offline-files.js','./offline-storage.js');
const packageStorage=OfflineStorage.create(OFFLINE_CACHE,OFFLINE_STORAGE,self.location.href);
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
async function activeCache(base){
 const current=await caches.open(OFFLINE_CACHE);
 if(await current.match(new URL('offline-ready',base).href))return current;
 // An update or failed download must not strand a previously complete pack.
 for(const name of await packageStorage.completeNames())if(name!==OFFLINE_CACHE)return caches.open(name);
 return current;
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const base=new URL('./',self.location.href),relative=decodeURIComponent(url.pathname.slice(base.pathname.length));
  // Static hosts may redirect .html URLs to extensionless document URLs.
  const canonical=['offline-map-test','offline/guide'].includes(relative)?relative+'.html':relative;
  const clean=new URL(canonical,base).href,cache=await activeCache(base);
  const cached=await cache.match(clean);
  const client=event.clientId?await self.clients.get(event.clientId):null;
  const isManager=pathname=>['offline-map-test','offline-map-test.html'].some(path=>pathname===new URL(path,base).pathname);
  const manager=event.request.mode==='navigate'?isManager(url.pathname):client&&isManager(new URL(client.url).pathname);
  // The manager discovers a new manifest online; offline it can still open the old pack.
  // The guide always reads a complete local version, until its replacement is ready.
  if(manager){try{const response=await fetch(event.request);if(response.ok||!cached)return response;}catch(error){if(!cached)throw error;}}
  if(cached)return cached;
  return fetch(event.request);
 })());
});
