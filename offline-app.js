/* Production integration. The original guide and its map interactions stay in charge. */
(async()=>{
 window.OFFLINE_IN_APP=true;
 const dialog=document.createElement('dialog');dialog.id='offline-dialog';dialog.setAttribute('aria-labelledby','offline-heading');
 dialog.innerHTML=`<header><h2 id="offline-heading">Använd guiden offline</h2><button type="button" id="offline-close" aria-label="Stäng">×</button></header><p id="offline-status" role="status">Kontrollerar sparat paket …</p><p id="offline-estimate"></p><progress id="offline-progress" max="100" value="0" hidden></progress><div class="offline-actions"><button id="offline-download">Hämta för offline</button><button id="offline-cancel" hidden>Avbryt</button><button id="offline-remove">Ta bort paketet</button><button id="offline-guide" hidden>Klart</button></div><p><label><input id="offline-show" type="checkbox" checked> Visa offlineområdets gräns</label></p><button id="offline-fit" hidden></button><p id="offline-scope"></p><p id="offline-storage"></p><p class="offline-hint">Håll Safari öppet under hämtningen. Kontrollera sedan guiden i flygplansläge med Wi-Fi avstängt. Safari kan rensa sparade webbplatsdata; kontrollera före avresa.</p>`;
 document.body.append(dialog);const close=()=>dialog.close();document.getElementById('offline-close').onclick=close;document.getElementById('offline-guide').onclick=close;
 const button=document.createElement('button');button.id='offline-open';button.type='button';button.title=button.ariaLabel='Hämta för offline';button.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 button.onclick=()=>dialog.showModal();
 const g=await guideReady;const control=L.control({position:'topright'});control.onAdd=()=>{const box=L.DomUtil.create('div','leaflet-control offline-control');box.append(button);L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);return box;};control.addTo(g.map);
 let local,boundary,sequence=0,fallback=false;
 async function saved(){
  const names=await caches.keys();for(const name of [OFFLINE_CACHE,...names.filter(n=>n.startsWith('florens-offline-pack-')&&n!==OFFLINE_CACHE).reverse()]){
   const cache=await caches.open(name),base=new URL('./',document.baseURI);if(!await cache.match(new URL('offline-ready',base).href))continue;
   const response=await cache.match(new URL('assets/offline/raster/index.json',base).href);if(response)return{cacheName:name,spec:await response.json()};
  }return null;
 }
 async function refresh(){
  const revision=++sequence,pack=await saved();if(revision!==sequence)return;
  button.dataset.ready=pack?'true':'false';button.title=button.ariaLabel=pack?'Offlinekarta sparad':'Hämta för offline';
  const state=document.getElementById('offline-status');if(pack&&pack.cacheName!==OFFLINE_CACHE){state.textContent='En tidigare offlineversion finns sparad. Hämta det nya paketet för att uppdatera.';document.getElementById('offline-download').textContent='Uppdatera offlinepaketet';}
  if(boundary){g.map.removeLayer(boundary);boundary=null;}
  if(pack&&document.getElementById('offline-show').checked)boundary=L.rectangle(pack.spec.bounds,{color:'#267b96',weight:1,dashArray:'7 6',fill:false,interactive:false}).addTo(g.map);
  const useLocal=pack&&(!navigator.onLine||fallback);
  if(useLocal){
   if(!local||local._packageName!==pack.cacheName){if(local)g.map.removeLayer(local);local=OfflineMap.layer(pack);local._packageName=pack.cacheName;}
   g.map.removeLayer(g.onlineBasemap);if(!g.map.hasLayer(local))local.addTo(g.map);button.dataset.mode='offline';
  }else{
   if(local){g.map.removeLayer(local);local=null;}
   if(navigator.onLine&&!g.map.hasLayer(g.onlineBasemap))g.onlineBasemap.addTo(g.map);button.dataset.mode=navigator.onLine?'online':'unavailable';
   if(!navigator.onLine&&!pack)state.textContent='Ingen offlinekarta finns sparad här. Anslut till internet och välj Hämta för offline.';
  }
 }
 window.addEventListener('online',()=>{fallback=false;refresh().catch(report);});window.addEventListener('offline',()=>refresh().catch(report));
 g.onlineBasemap.on('tileerror',()=>{if(!fallback){fallback=true;refresh().catch(report);}});
 window.addEventListener('offline-package-change',()=>refresh().catch(report));
 window.addEventListener('offline-package-status',()=>refresh().catch(report));
 document.getElementById('offline-show').addEventListener('change',()=>refresh().catch(report));
 function report(error){document.getElementById('offline-status').textContent='Offlinekartan kunde inte öppnas: '+error.message;}
 await refresh();
 const script=document.createElement('script');script.src='offline-download.js';script.onerror=()=>report(Error('Nedladdningsfunktionen kunde inte laddas. Ladda om sidan.'));document.body.append(script);
})().catch(error=>{console.error('Offline:',error);});
