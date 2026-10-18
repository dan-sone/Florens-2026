/* Production integration. The original guide and its map interactions stay in charge. */
(async()=>{
 window.OFFLINE_IN_APP=true;
 const dialog=document.createElement('dialog');dialog.id='offline-dialog';dialog.setAttribute('aria-labelledby','offline-heading');
 dialog.dataset.state='checking';
 const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
 const downloadIcon=icon('M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4');
 const checkIcon=icon('m6 12 4 4 8-8');
 dialog.innerHTML=`<div class="offline-handle" aria-hidden="true"></div><header><h2 id="offline-heading">Offlineguide</h2><button type="button" id="offline-close" aria-label="Stäng">${icon('m7 7 10 10M17 7 7 17')}</button></header><p class="offline-intro">Spara karta och guide på den här enheten.</p><section class="offline-state-card" aria-labelledby="offline-state-title"><span class="offline-state-icon">${downloadIcon}${checkIcon}</span><div><h3 id="offline-state-title">Kontrollerar guiden</h3><p id="offline-status" role="status">Kontrollerar sparat paket …</p></div><progress id="offline-progress" max="100" value="0" aria-label="Nedladdning" hidden></progress></section><p id="offline-saved-version" hidden></p><p id="offline-estimate" hidden></p><div class="offline-actions"><button id="offline-guide" hidden>Klart</button><button id="offline-download">Hämta guiden</button><button id="offline-cancel" hidden>Avbryt hämtningen</button></div><p class="offline-hint" hidden>Håll Safari öppet tills hämtningen är klar.</p><p class="offline-ready-hint" hidden>Prova gärna i flygplansläge med Wi-Fi avstängt före avresa.</p><details class="offline-settings" hidden><summary>Inställningar och lagring</summary><label class="offline-setting-row"><span>Visa områdets gräns<small>Markerar den del av kartan som sparas.</small></span><input id="offline-show" type="checkbox" role="switch" checked></label><p id="offline-storage"></p><p class="offline-storage-hint">Safari kan rensa sparade webbplatsdata. Kontrollera guiden före avresa.</p><button id="offline-remove" class="offline-destructive">Ta bort nedladdningen</button></details><button id="offline-fit" hidden></button><p id="offline-scope" hidden></p>`;
 const pageVersion=document.querySelector('meta[name="application-version"]').content;
 let savedPack=null,lastState='checking';
 const savedVersion=()=>savedPack?.version?'version '+savedPack.version:'äldre version';
 const titles={checking:'Kontrollerar',empty:'Inte nedladdad',downloading:'Hämtar',ready:'Nedladdad',update:'Nedladdad',error:'Hämtningen misslyckades'};
 function showState(state){
  lastState=state;const displayState=state==='empty'&&savedPack?'update':state;
  dialog.dataset.state=displayState;
  document.getElementById('offline-state-title').textContent=displayState==='downloading'&&savedPack?'Uppdaterar':displayState==='error'&&savedPack?'Uppdateringen misslyckades':titles[displayState]||titles.checking;
  document.querySelector('.offline-intro').hidden=true;
  const status=document.getElementById('offline-status');
  if(displayState==='ready'||displayState==='update')status.textContent=savedPack?(savedVersion()[0].toUpperCase()+savedVersion().slice(1)):'Kontrollerar sparad version …';
  if(displayState==='empty')status.textContent='';
  const version=document.getElementById('offline-saved-version');
  version.textContent=savedPack&&['downloading','error','checking'].includes(displayState)?'Nedladdad · '+savedVersion():displayState==='update'?'Ny version '+pageVersion:'';
  version.hidden=!version.textContent;
  document.getElementById('offline-download').hidden=displayState==='ready'||displayState==='downloading';
  if(typeof button!=='undefined')button.title=button.ariaLabel=savedPack?'Offlineguide nedladdad · '+savedVersion()+(displayState==='downloading'?' · uppdaterar':''):'Hämta offlineguide';
 }
 window.addEventListener('offline-download-state',event=>showState(event.detail.state));
 document.body.append(dialog);const close=()=>dialog.close();document.getElementById('offline-close').onclick=close;document.getElementById('offline-guide').onclick=close;
 const button=document.createElement('button');button.id='offline-open';button.type='button';button.title=button.ariaLabel='Hämta för offline';button.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 button.onclick=()=>dialog.showModal();
 const g=await guideReady;const control=L.control({position:'topright'});control.onAdd=()=>{const box=L.DomUtil.create('div','leaflet-control offline-control');box.append(button);L.DomEvent.disableClickPropagation(box);L.DomEvent.disableScrollPropagation(box);return box;};control.addTo(g.map);
 let local,boundary,sequence=0,fallback=false;
 const packageStorage=OfflineStorage.create(OFFLINE_CACHE,OFFLINE_STORAGE,document.baseURI);
 async function saved(){
  for(const name of await packageStorage.completeNames()){
   const cache=await caches.open(name),base=new URL('./',document.baseURI);if(!await cache.match(new URL('offline-ready',base).href))continue;
   const response=await cache.match(new URL('assets/offline/raster/index.json',base).href);if(response){
    const document=await cache.match(new URL('index.html',base).href),html=document?await document.text():'';
    const version=html.match(/<meta\b[^>]*name=["']application-version["'][^>]*content=["']([^"']+)["']/i)?.[1]||null;
    return{cacheName:name,spec:await response.json(),version};
   }
  }return null;
 }
 async function refresh(){
  const revision=++sequence,pack=await saved();if(revision!==sequence)return;
  savedPack=pack;button.dataset.ready=pack?'true':'false';button.querySelector('path').setAttribute('d',pack?'m6 12 4 4 8-8':'M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4');showState(lastState);
  const state=document.getElementById('offline-status');if(pack&&pack.cacheName!==OFFLINE_CACHE){if(!document.getElementById('offline-download').disabled&&!['downloading','error','checking'].includes(lastState)){showState('update');document.getElementById('offline-remove').hidden=false;document.getElementById('offline-download').textContent='Uppdatera';}}
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
 const script=document.createElement('script');script.src='offline-download.js?v='+encodeURIComponent(document.querySelector('meta[name="application-version"]').content);script.onerror=()=>report(Error('Nedladdningsfunktionen kunde inte laddas. Ladda om sidan.'));document.body.append(script);
})().catch(error=>{console.error('Offline:',error);});
