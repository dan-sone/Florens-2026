(async()=>{
 const $=id=>document.getElementById(id),mb=n=>(n/1e6).toFixed(1)+' MB';
 const base=new URL('./',location.href),key=new URL('offline-ready',base).href;
 const cache=await caches.open(OFFLINE_CACHE);let aborter,mapLayer,boundary;
 const map=L.map('map').setView([43.765,11.26],14);
 const fail=message=>{$('status').textContent=message};
 window.addEventListener('offline-map-error',e=>fail('Kartan kunde inte visas: '+e.detail));
 const total=OFFLINE_FILES.reduce((sum,f)=>sum+f.bytes,0);
 $('estimate').textContent='Hela paketet: '+mb(total)+' (gatukarta '+mb(OFFLINE_FILES.find(f=>f.path.endsWith('.pmtiles')).bytes)+').';
 async function storage(){const e=await navigator.storage?.estimate?.();$('storage').textContent=e?'Webbplatsens lagring: '+mb(e.usage||0)+'. Uppskattat ledigt: '+mb(Math.max(0,(e.quota||0)-(e.usage||0)))+'.':'';}
 async function ready(){
  if(!await cache.match(key)||!await cache.match(new URL('offline-files.js',base).href))return false;
  // Confirm every file is still present; a stale marker alone is not readiness.
  for(const file of OFFLINE_FILES){const url=new URL(file.path,base).href,response=await cache.match(url);if(!response){await cache.delete(key);return false;}const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==file.sha256){await cache.delete(key);await cache.delete(url);return false;}}
  return true;
 }
 async function render(){
  const [places,routes,config]=await Promise.all(['places.json','routes.json','offline-config.json'].map(async f=>(await (await caches.open(OFFLINE_CACHE)).match(new URL(f,base).href)).json()));
  const scope=OfflineScope.compute(places.places,routes.routes,config);
  if(JSON.stringify(scope.bounds)!==JSON.stringify(OFFLINE_SCOPE.bounds))throw Error('Kartpaketet matchar inte det beräknade området. Bygg om paketet.');
  if(!mapLayer){mapLayer=OfflineMap.layer().addTo(map);
   boundary=L.rectangle(scope.bounds,{color:'#267b96',weight:2,dashArray:'7 6',fillOpacity:.04,interactive:false}).addTo(map);
   for(const p of scope.included)L.circleMarker([p.position.latitude,p.position.longitude],{radius:5,color:'#a64c35',fillOpacity:.8}).bindPopup(L.DomUtil.create('span')).addTo(map).getPopup().setContent(document.createTextNode(p.name));
   const byId=new Map(scope.included.map(p=>[p.id,p]));
   for(const r of routes.routes)for(const s of r.segments){let line=[];const flush=()=>{if(line.length>1)L.polyline(line,{color:'#39788b',weight:3,dashArray:s.mode==='walk'?null:'4 6'}).addTo(map);line=[];};for(const id of s.placeIds){const p=byId.get(id);if(p)line.push([p.position.latitude,p.position.longitude]);else flush();}flush();}
  }
  map.fitBounds(scope.bounds,{paddingTopLeft:[15,Math.min(innerHeight*.52,360)],paddingBottomRight:[15,25]});
  $('scope').textContent=scope.included.length+' platser. Streckad blå gräns = sparat område. Rutter visar guidens befintliga förbindelser mellan stopp.';
 }
 async function refresh(){const ok=await ready();$('guide').hidden=!ok;$('download').textContent=ok?'Kontrollera paketet':'Hämta för offline';fail(ok?'Redo för offline · alla filer finns lokalt.':'Ingen komplett offlinekarta sparad.');if(ok)await render();await storage();}
 try{
  if(!isSecureContext||!('serviceWorker' in navigator))throw Error('Öppna sidan via HTTPS i Safari.');
  await Promise.all([navigator.serviceWorker.register('./offline-test-sw.js',{scope:'./offline-map-test.html'}),navigator.serviceWorker.register('./offline-test-sw.js',{scope:'./offline/'})]);
  await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  await refresh();
 }catch(e){fail(e.message);$('download').disabled=true;}
 $('download').onclick=async()=>{
  aborter=new AbortController();$('download').disabled=true;$('remove').disabled=true;$('cancel').hidden=false;$('progress').hidden=false;let received=0;
  const wasReady=await ready();
  try{
   const estimate=await navigator.storage?.estimate?.();
   if(!wasReady&&estimate&&estimate.quota-estimate.usage<total*1.3)throw Error('Otillräckligt lagringsutrymme. Frigör utrymme och försök igen.');
   for(const file of OFFLINE_FILES){
    const url=new URL(file.path,base).href;let response=await cache.match(url);
    if(!response){const timeout=setTimeout(()=>aborter.abort(),60000);try{response=await fetch(url,{cache:'no-store',signal:aborter.signal});if(!response.ok||response.type==='opaque')throw Error('Hämtning misslyckades: '+file.path+' ('+response.status+')');const bytes=await response.arrayBuffer();if(bytes.byteLength!==file.bytes)throw Error('Ofullständig fil: '+file.path);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==file.sha256)throw Error('Kontrollsumman stämmer inte: '+file.path);await cache.put(url,new Response(bytes,{headers:{'Content-Type':response.headers.get('Content-Type')||'application/octet-stream'}}));}finally{clearTimeout(timeout);}}
    else{const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==file.sha256)throw Error('Skadad lokal fil: '+file.path);}
    if(aborter.signal.aborted)throw new DOMException('Avbruten','AbortError');received+=file.bytes;$('progress').value=received/total*100;fail('Sparar och verifierar '+mb(received)+' / '+mb(total)+' …');
   }
   const bootstrap='const OFFLINE_CACHE='+JSON.stringify(OFFLINE_CACHE)+';\nconst OFFLINE_FILES='+JSON.stringify(OFFLINE_FILES)+';\nconst OFFLINE_STYLE='+JSON.stringify(OFFLINE_STYLE)+';\nconst OFFLINE_SCOPE='+JSON.stringify(OFFLINE_SCOPE)+';\n';
   await cache.put(new URL('offline-files.js',base).href,new Response(bootstrap,{headers:{'Content-Type':'application/javascript'}}));
   await cache.put(key,new Response('complete')); 
   const persistent=await navigator.storage?.persist?.().catch(()=>false);
   await refresh();$('storage').textContent+=' '+(persistent?'Beständig lagring beviljad.':'Safari kan rensa sparade data; kontrollera före avresa.');
   // Remove only this feature's older versions, after a complete successful update.
   for(const name of await caches.keys())if(name.startsWith('florens-offline-pack-')&&name!==OFFLINE_CACHE)await caches.delete(name);
  }catch(e){if(!wasReady){await cache.delete(key);for(const file of OFFLINE_FILES)await cache.delete(new URL(file.path,base).href);}fail(e.name==='AbortError'?'Hämtningen avbröts eller tog för lång tid. Försök igen med sidan öppen.':e.name==='QuotaExceededError'?'Lagringsutrymmet räckte inte. Frigör utrymme och försök igen.':e.message);$('guide').hidden=!await ready();}
  finally{$('download').disabled=false;$('remove').disabled=false;$('cancel').hidden=true;$('progress').hidden=true;await storage();}
 };
 $('cancel').onclick=()=>aborter?.abort();
 $('remove').onclick=async()=>{await cache.delete(key);for(const f of OFFLINE_FILES)await cache.delete(new URL(f.path,base).href);location.reload();};
 $('show').onchange=e=>{if(boundary){if(e.target.checked)boundary.addTo(map);else map.removeLayer(boundary);}};
 $('fit').onclick=()=>map.fitBounds(OFFLINE_SCOPE.bounds,{padding:[25,25]});
})().catch(e=>{document.getElementById('status').textContent='Offlinefunktionen kunde inte starta: '+e.message;console.error(e);});
