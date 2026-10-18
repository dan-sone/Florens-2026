(async()=>{
 const inApp=!!window.OFFLINE_IN_APP;
 const $=id=>document.getElementById((inApp?'offline-':'')+id),mb=n=>(n/1e6).toFixed(1)+' MB';
 const base=new URL('./',location.href),key=new URL('offline-ready',base).href;
 const cache=await caches.open(OFFLINE_CACHE);let aborter,mapLayer,boundary;
 const map=inApp?null:L.map('map').setView([43.765,11.26],14);
 const fail=(message,state='error')=>{
  let text=message;
  if(inApp&&state==='error'){
   console.warn('Offline:',message);
   if(/Hämtning misslyckades|Failed to fetch|Load failed|NetworkError/i.test(message))text='Hämtningen kunde inte slutföras. Kontrollera internetanslutningen och försök igen.';
   else if(/Ofullständig fil|Fel filstorlek|Kontrollsumman|Skadad lokal fil/.test(message))text='Nedladdningen blev inte komplett. Försök igen med en stabil internetanslutning.';
   else if(message.startsWith('Offline kunde inte starta:'))text='Guiden kunde inte förberedas för offline. Öppna den direkt i Safari och försök igen.';
  }
  $('status').textContent=text;
  if(inApp){window.dispatchEvent(new CustomEvent('offline-download-state',{detail:{state}}));if(state==='error')$('download').textContent='Försök igen';}
 };
 window.addEventListener('offline-map-error',e=>fail('Kartan kunde inte visas: '+e.detail));
 const total=OFFLINE_FILES.reduce((sum,f)=>sum+f.bytes,0);
 $('estimate').textContent=inApp?mb(total).replace('.',',')+' på den här enheten':'Hela paketet: '+mb(total)+' (gatukarta '+mb(OFFLINE_FILES.filter(f=>f.path.endsWith('.pmtiles')).reduce((sum,f)=>sum+f.bytes,0))+').';
 async function storage(){const e=await navigator.storage?.estimate?.();$('storage').textContent=e?(inApp?'Sparat på webbplatsen: '+mb(e.usage||0).replace('.',','):'Webbplatsens lagring: '+mb(e.usage||0)+'. Uppskattat ledigt: '+mb(Math.max(0,(e.quota||0)-(e.usage||0)))+'.'):'';}
 async function ready(){
  if(!await cache.match(key)||!await cache.match(new URL('offline-files.js',base).href))return false;
  // Confirm every file is still present; a stale marker alone is not readiness.
  for(const file of OFFLINE_FILES){const url=new URL(file.path,base).href,response=await cache.match(url);if(!response){await cache.delete(key);return false;}const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==file.sha256){await cache.delete(key);await cache.delete(url);return false;}}
  return true;
 }
 async function render(){
  if(inApp){window.dispatchEvent(new CustomEvent('offline-package-change',{detail:{ready:true}}));return;}
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
 async function refresh(){const ok=await ready();$('guide').hidden=!ok;window.dispatchEvent(new CustomEvent('offline-package-status',{detail:{ready:ok}}));$('download').textContent=inApp?(ok?'Kontrollera nedladdningen':'Hämta guiden'):(ok?'Kontrollera paketet':'Hämta för offline');$('remove').hidden=inApp&&!ok;fail(inApp?(ok?'Redo för offline. Guiden finns sparad på den här enheten.':'Hämta guiden så kan du använda den i flygplansläge.'):(ok?'Redo för offline · alla filer finns lokalt.':'Ingen komplett offlinekarta sparad.'),ok?'ready':'empty');if(ok)await render();await storage();}
 let offlineAvailable=false;
 function within(promise,message){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(message)),15000);})]).finally(()=>clearTimeout(timer));}
 async function start(){
  $('download').disabled=true;fail('Kontrollerar att guiden kan sparas …','checking');
  try{
   if(!isSecureContext)throw Error('Sidan saknar säker HTTPS-anslutning. Öppna testlänken direkt i Safari.');
   if(!('serviceWorker' in navigator))throw Error('Den här visningen tillåter inte Service Workers. Öppna länken direkt i Safari, utanför ChatGPT:s webbvisning.');
   const registrations=await within(Promise.all(inApp?[navigator.serviceWorker.register('./offline-sw.js',{scope:'./'})]:[navigator.serviceWorker.register('./offline-test-sw.js',{scope:'./offline-map-test'}),navigator.serviceWorker.register('./offline-test-sw.js',{scope:'./offline/'})]),'Testvärden svarade inte när offlinetjänsten skulle registreras.');
   // Wait for the registrations themselves, not serviceWorker.ready, which may
   // wait forever if a host rewrites the document URL outside the requested scope.
   await within(Promise.all(registrations.map(registration=>new Promise((resolve,reject)=>{
    const worker=registration.installing||registration.waiting||registration.active;
    if(!worker){reject(Error('Offlinetjänsten saknar aktiv worker.'));return;}
    const check=()=>{if(worker.state==='activated')resolve();else if(worker.state==='redundant')reject(Error('Webbläsaren avvisade offlinetjänsten.'));};
    worker.addEventListener('statechange',check);check();
   }))), 'Offlinetjänsten kunde inte aktiveras inom 15 sekunder.');
   if(!navigator.serviceWorker.controller)await within(new Promise(resolve=>{const check=()=>{if(navigator.serviceWorker.controller){navigator.serviceWorker.removeEventListener('controllerchange',check);resolve();}};navigator.serviceWorker.addEventListener('controllerchange',check);check();}), 'Testvärden aktiverade offlinetjänsten men lät den inte styra testsidan.');
   offlineAvailable=true;await refresh();$('download').disabled=false;
  }catch(e){offlineAvailable=false;fail('Offline kunde inte starta: '+e.message+' [Sida: '+location.pathname+'; inbäddad: '+(window.top!==window.self?'ja':'nej')+']');$('download').disabled=true;}
 }
 $('download').onclick=async()=>{
  if(!offlineAvailable)return;
  aborter=new AbortController();$('download').disabled=true;$('remove').disabled=true;$('cancel').hidden=false;$('progress').hidden=false;$('guide').hidden=true;fail('Förbereder hämtningen …','downloading');let received=0,documents;
  const wasReady=await ready();
  try{
   const estimate=await navigator.storage?.estimate?.();
   if(!wasReady&&estimate&&estimate.quota-estimate.usage<total*1.3)throw Error('Otillräckligt lagringsutrymme. Frigör utrymme och försök igen.');
   async function save(file){
    if(aborter.signal.aborted)throw new DOMException('Avbruten','AbortError');
    const url=new URL(file.path,base).href;let response=await cache.match(url);
    if(!response){let timeout;const touch=()=>{clearTimeout(timeout);timeout=setTimeout(()=>aborter.abort(),60000);};touch();try{
     if(file.path.endsWith('.html')){
      if(typeof documents?.[file.path]!=='string')throw Error('Sidan saknas i offlinepaketet: '+file.path);
      response=new Response(documents[file.path],{headers:{'Content-Type':'text/html; charset=utf-8'}});
     }else response=await fetch(url,{cache:'no-store',signal:aborter.signal});
     if(!response.ok||response.type==='opaque')throw Error('Hämtning misslyckades: '+file.path+' ('+response.status+')');
     // Reset the timeout as data arrives: a slow, progressing transfer may finish.
     const reader=response.body.getReader(),chunks=[];let length=0;
     for(;;){const next=await reader.read();if(next.done)break;touch();length+=next.value.byteLength;if(length>file.bytes){await reader.cancel();throw Error('Fel filstorlek: '+file.path);}chunks.push(next.value);}
     if(length!==file.bytes)throw Error('Ofullständig fil: '+file.path);
     const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
     const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
     if(hash!==file.sha256)throw Error('Kontrollsumman stämmer inte: '+file.path);
     if(aborter.signal.aborted)throw new DOMException('Avbruten','AbortError');
     await cache.put(url,new Response(bytes,{headers:{'Content-Type':response.headers.get('Content-Type')||'application/octet-stream'}}));
    }finally{clearTimeout(timeout);}}
    else{const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==file.sha256)throw Error('Skadad lokal fil: '+file.path);}
    if(aborter.signal.aborted)throw new DOMException('Avbruten','AbortError');received+=file.bytes;$('progress').value=received/total*100;fail((inApp?'Hämtar ':'Sparar och verifierar ')+mb(received)+' / '+mb(total)+' …','downloading');
   }
   // HTML depends on this verified copy. Then use three bounded workers to avoid
   // one round-trip per file without holding the whole package in memory.
   const documentFile=OFFLINE_FILES.find(f=>f.path==='assets/offline/documents.json');
   await save(documentFile);documents=(await (await cache.match(new URL(documentFile.path,base).href)).json()).documents;
   const queue=OFFLINE_FILES.filter(f=>f!==documentFile);let cursor=0,firstError;
   const workers=Array.from({length:3},async()=>{try{while(cursor<queue.length)await save(queue[cursor++]);}catch(error){if(!firstError)firstError=error;aborter.abort();}});
   await Promise.allSettled(workers);if(firstError)throw firstError;
   const bootstrap='const OFFLINE_CACHE='+JSON.stringify(OFFLINE_CACHE)+';\nconst OFFLINE_FILES='+JSON.stringify(OFFLINE_FILES)+';\nconst OFFLINE_STYLE='+JSON.stringify(OFFLINE_STYLE)+';\nconst OFFLINE_SCOPE='+JSON.stringify(OFFLINE_SCOPE)+';\n';
   await cache.put(new URL('offline-files.js',base).href,new Response(bootstrap,{headers:{'Content-Type':'application/javascript'}}));
   await cache.put(key,new Response('complete')); 
   const persistent=await navigator.storage?.persist?.().catch(()=>false);
   await refresh();if(!inApp)$('storage').textContent+=' '+(persistent?'Beständig lagring beviljad.':'Safari kan rensa sparade data; kontrollera före avresa.');
   // Remove only this feature's older versions, after a complete successful update.
   for(const name of await caches.keys())if(name.startsWith('florens-offline-pack-')&&name!==OFFLINE_CACHE)await caches.delete(name);
  }catch(e){if(!wasReady){await cache.delete(key);for(const file of OFFLINE_FILES)await cache.delete(new URL(file.path,base).href);}fail(e.name==='AbortError'?'Hämtningen avbröts eller tog för lång tid. Försök igen med sidan öppen.':e.name==='QuotaExceededError'?'Lagringsutrymmet räckte inte. Frigör utrymme och försök igen.':e.message);$('guide').hidden=!await ready();}
  finally{$('download').disabled=false;$('remove').disabled=false;$('cancel').hidden=true;$('progress').hidden=true;await storage();}
 };
 $('cancel').onclick=()=>aborter?.abort();
 $('remove').onclick=async()=>{if(inApp){for(const name of await caches.keys())if(name.startsWith('florens-offline-pack-')&&name!==OFFLINE_CACHE)await caches.delete(name);for(const request of await cache.keys())await cache.delete(request);window.dispatchEvent(new CustomEvent('offline-package-change',{detail:{ready:false}}));await refresh();}else{await cache.delete(key);for(const f of OFFLINE_FILES)await cache.delete(new URL(f.path,base).href);location.reload();}};
 $('show').onchange=e=>{if(boundary){if(e.target.checked)boundary.addTo(map);else map.removeLayer(boundary);}};
 $('fit').onclick=()=>map?.fitBounds(OFFLINE_SCOPE.bounds,{padding:[25,25]});
 await start();
})().catch(e=>{const status=document.getElementById(window.OFFLINE_IN_APP?'offline-status':'status');if(status)status.textContent='Offlinefunktionen kunde inte starta: '+e.message;console.error(e);});
