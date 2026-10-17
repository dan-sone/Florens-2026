/* Shared local vector basemap for the test map and the unchanged guide UI. */
window.OfflineMap={
 layer({showBoundary=false}={}){
  const protocol=new pmtiles.Protocol();maplibregl.addProtocol('pmtiles',protocol.tile);
  const base=new URL('assets/offline/',document.baseURI);
  // A local source avoids HTTP Range requests altogether. CacheStorage is the authority.
  const url=new URL('florence.pmtiles',base).href;
  let blob;
  const source={getKey:()=>url,async getBytes(offset,length,signal){
   if(signal?.aborted)throw new DOMException('Avbruten','AbortError');
   if(!blob){const cache=await caches.open(OFFLINE_CACHE);const response=await cache.match(url);if(!response)throw Error('Offlinekartan saknas. Öppna testsidan och hämta paketet.');blob=await response.blob();}
   return {data:await blob.slice(offset,offset+length).arrayBuffer()};
  }};
  protocol.add(new pmtiles.PMTiles(source));
  const style=JSON.parse(JSON.stringify(OFFLINE_STYLE));
  style.glyphs=new URL('glyphs/{fontstack}/{range}.pbf',base).href.replace(/%7B/g,'{').replace(/%7D/g,'}');
  style.sources.basemap.url='pmtiles://'+url;
  const layer=L.maplibreGL({style,interactive:false,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Protomaps',maxZoom:19});
  layer.on('add',()=>{if(showBoundary)L.rectangle(OFFLINE_SCOPE.bounds,{color:'#267b96',weight:1,dashArray:'7 6',fill:false,interactive:false}).addTo(layer._map);layer.getMaplibreMap().on('error',e=>{console.error('Offlinekarta:',e.error);window.dispatchEvent(new CustomEvent('offline-map-error',{detail:e.error?.message||'Kartfel'}));});});
  return layer;
 }
};
