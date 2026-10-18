/* Cache ownership comes from generated trip configuration, never a destination name. */
(function(root){
 function create(cacheName,configuration,base,backend=root.caches){
  const origin=new URL('./',base),key=path=>new URL(path,origin).href;
  const prefix=configuration.prefix,legacy=configuration.legacyPrefixes||[];
  const candidate=name=>name===cacheName||[prefix,...legacy].some(value=>name.startsWith(value));
  async function names(){const all=await backend.keys();return[cacheName,...all.filter(name=>name!==cacheName&&candidate(name)).reverse()];}
  async function completeNames(){
   const complete=[];for(const name of await names())if(await(await backend.open(name)).match(key('offline-ready')))complete.push(name);
   return complete;
  }
  async function previousCaches(){return Promise.all((await completeNames()).filter(name=>name!==cacheName).map(name=>backend.open(name)));}
  async function removeOlder(){
   for(const name of await names())if(name!==cacheName){
    const cache=await backend.open(name);
    // Legacy names may be shared by other guides on this origin. Check the URL scope.
    if(await cache.match(key('offline-ready'))||await cache.match(key('assets/offline/documents.json'))||await cache.match(key('index.html')))await backend.delete(name);
   }
  }
  return{completeNames,previousCaches,removeOlder};
 }
 const api={create};root.OfflineStorage=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof self==='object'?self:globalThis);
