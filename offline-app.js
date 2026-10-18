/* Production integration. The original guide and its map interactions stay in charge. */
(async()=>{
 window.OFFLINE_IN_APP=true;
 const dialog=document.createElement('dialog');dialog.id='offline-dialog';dialog.setAttribute('aria-labelledby','offline-heading');
 dialog.dataset.state='checking';
 const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
 const downloadIcon=icon('M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4');
 const checkIcon=icon('m6 12 4 4 8-8');
 dialog.innerHTML=`<div class="offline-handle" aria-hidden="true"></div><header><h2 id="offline-heading">Guiden utan internet</h2><button type="button" id="offline-close" aria-label="Stäng">${icon('m7 7 10 10M17 7 7 17')}</button></header><p class="offline-intro">Ta med karta, sevärdheter, bilder och rutter. Allt sparas på den här enheten.</p><section class="offline-state-card" aria-labelledby="offline-state-title"><span class="offline-state-icon">${downloadIcon}${checkIcon}</span><div><h3 id="offline-state-title">Kontrollerar guiden</h3><p id="offline-status" role="status">Kontrollerar sparat paket …</p></div><progress id="offline-progress" max="100" value="0" aria-label="Nedladdning" hidden></progress></section><p id="offline-estimate"></p><div class="offline-actions"><button id="offline-guide" hidden>Klart</button><button id="offline-download">Hämta guiden</button><button id="offline-cancel" hidden>Avbryt hämtningen</button></div><p class="offline-hint">Håll Safari öppet tills hämtningen är klar.</p><p class="offline-ready-hint">Prova gärna i flygplansläge med Wi-Fi avstängt före avresa.</p><details class="offline-settings"><summary>Inställningar och lagring</summary><label class="offline-setting-row"><span>Visa områdets gräns<small>Markerar den del av kartan som sparas.</small></span><input id="offline-show" type="checkbox" role="switch" checked></label><p id="offline-storage"></p><p class="offline-storage-hint">Safari kan rensa sparade webbplatsdata. Kontrollera guiden före avresa.</p><button id="offline-remove" class="offline-destructive">Ta bort nedladdningen</button></details><button id="offline-fit" hidden></button><p id="offline-scope" hidden></p>`;
 const titles={checking:'Kontrollerar guiden',empty:'Ta med guiden',downloading:'Hämtar till din enhet',ready:'Guiden är sparad',update:'En uppdatering finns',error:'Försök igen'};
 function showState(state){dialog.dataset.state=state;document.getElementById('offline-state-title').textContent=titles[state]||titles.checking;}
 window.addEventListener('offline-download-state',event=>showState(event.detail.state));
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
  const state=document.getElementById('offline-status');if(pack&&pack.cacheName!==OFFLINE_CACHE){if(!document.getElementById('offline-download').disabled){showState('update');document.getElementById('offline-remove').hidden=false;state.textContent='Din sparade guide fungerar fortfarande. Hämta den senaste versionen när du har internet.';document.getElementById('offline-download').textContent='Uppdatera guiden';}}
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
 function report(error){showState('error');document.getElementById('offline-status').textContent='Offlinekartan kunde inte öppnas: '+error.message;}
 await refresh();
 const script=document.createElement('script');script.src='offline-download.js';script.onerror=()=>report(Error('Nedladdningsfunktionen kunde inte laddas. Ladda om sidan.'));document.body.append(script);
})().catch(error=>{console.error('Offline:',error);});
