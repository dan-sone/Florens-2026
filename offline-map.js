/* Original OSM Carto raster tiles, read on demand from small local PMTiles archives. */
window.OfflineMap={
 layer({showBoundary=false}={}){
  const spec=OFFLINE_STYLE;
  if(spec.type!=='raster')throw Error('Kartpaketet använder inte den förväntade OSM Carto-kartan.');
  const packages=new Map(spec.packages.map(p=>[p.key,p])),archives=new Map();
  const base=new URL('./',document.baseURI),cachePromise=caches.open(OFFLINE_CACHE);
  function archive(key){
   if(archives.has(key))return archives.get(key);
   const info=packages.get(key);if(!info)return null;
   const url=new URL(info.path,base).href;let blobPromise;
   const source={getKey:()=>url,async getBytes(offset,length,signal){
    if(signal?.aborted)throw new DOMException('Avbruten','AbortError');
    if(!blobPromise)blobPromise=(async()=>{const response=await (await cachePromise).match(url);if(!response)throw Error('Den sparade kartdelen saknas. Hämta paketet på testsidan.');return response.blob();})();
    const blob=await blobPromise,data=await blob.slice(offset,offset+length).arrayBuffer();
    if(signal?.aborted)throw new DOMException('Avbruten','AbortError');
    return {data};
   }};
   const reader=new pmtiles.PMTiles(source);archives.set(key,reader);return reader;
  }
  const Raster=L.GridLayer.extend({
   createTile(coords,done){
    const tile=document.createElement('img');tile.alt='';tile.setAttribute('role','presentation');
    const controller=new AbortController();tile._offlineAbort=controller;
    const key=coords.z<spec.partitionZoom?'overview':`${coords.x>>(coords.z-spec.partitionZoom)}-${coords.y>>(coords.z-spec.partitionZoom)}`;
    const reader=archive(key);
    if(!reader){queueMicrotask(()=>done(null,tile));return tile;}
    (async()=>{
     const result=await reader.getZxy(coords.z,coords.x,coords.y,controller.signal);
     if(controller.signal.aborted)return;
     if(!result){done(null,tile);return;}
     const objectUrl=URL.createObjectURL(new Blob([result.data],{type:'image/webp'}));tile._offlineUrl=objectUrl;
     tile.onload=()=>done(null,tile);
     tile.onerror=()=>done(Error('Kartbilden kunde inte läsas.'),tile);
     tile.src=objectUrl;
    })().catch(error=>{if(error.name==='AbortError')return;window.dispatchEvent(new CustomEvent('offline-map-error',{detail:error.message}));done(error,tile);});
    return tile;
   },
   onRemove(map){L.GridLayer.prototype.onRemove.call(this,map);archives.clear();}
  });
  const layer=new Raster({tileSize:256,minZoom:spec.minZoom,maxZoom:spec.maxZoom,maxNativeZoom:spec.maxZoom,noWrap:true,bounds:L.latLngBounds(spec.bounds),attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · OpenStreetMap Carto'});
  layer.offlineRaster=true;
  layer.on('tileunload',e=>{e.tile._offlineAbort?.abort();if(e.tile._offlineUrl)URL.revokeObjectURL(e.tile._offlineUrl);});
  layer.on('add',()=>{if(showBoundary)L.rectangle(OFFLINE_SCOPE.bounds,{color:'#267b96',weight:1,dashArray:'7 6',fill:false,interactive:false}).addTo(layer._map);});
  return layer;
 }
};
