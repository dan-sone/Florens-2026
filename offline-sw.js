// Production worker: online requests stay fresh; a complete local snapshot is the fallback.
importScripts('./offline-files.js');
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
async function completeCache(base){
 for(const name of [OFFLINE_CACHE,...(await caches.keys()).filter(n=>n.startsWith('florens-offline-pack-')&&n!==OFFLINE_CACHE).reverse()]){const cache=await caches.open(name);if(await cache.match(new URL('offline-ready',base).href))return cache;}
 return null;
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;const url=new URL(event.request.url),base=new URL('./',self.location.href);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
 event.respondWith((async()=>{
  let relative=decodeURIComponent(url.pathname.slice(base.pathname.length));if(relative===''||relative==='index')relative='index.html';if(['offline-map-test','offline/guide'].includes(relative))relative+='.html';
  const cache=await completeCache(base),cached=cache&&await cache.match(new URL(relative,base).href);
  // Offline starts must not wait for a network timeout. navigator.onLine is a hint;
  // the fetch fallback also covers Wi-Fi with no working internet.
  if(self.navigator.onLine===false&&cached)return cached;
  const controller=new AbortController(),timer=cached?setTimeout(()=>controller.abort(),4000):null;
  try{const response=await fetch(event.request,{signal:controller.signal});if(response.ok||!cached)return response;}catch(error){if(!cached)throw error;}finally{clearTimeout(timer);}
  return cached;
 })());
});
