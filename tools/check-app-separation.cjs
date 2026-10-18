// Load the real application twice: current content and a second destination with
// completely renamed category identifiers. No browser or network is required.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const names=['places','routes','guide','stories','history','taxonomy','app-config'];
const original=Object.fromEntries(names.map(name=>[name,JSON.parse(read(name+'.json'))]));
const codeFiles=['index.html','offline-app.js','offline-download.js','offline-map.js','offline-storage.js','offline-sw.js','offline-test-sw.js','tools/prepare-offline.cjs','tools/extract-offline.cjs','tools/carto/prepare-config.cjs','tools/carto/prepare.sh','tools/carto/render.py','tools/carto/render-full.py','tools/carto/import-water.py'];
for(const file of codeFiles){const text=read(file);assert(!/florens|florence|firenze|centro-latest|43\.7\d|11\.2\d/i.test(text),'Destination literal in '+file);for(const place of original.places.places)if(place.id.length>8)assert(!text.includes("'"+place.id+"'")&&!text.includes('"'+place.id+'"'),'Place literal in '+file);}
const html=read('index.html'),main=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(code=>code.includes('const guideReady ='));
async function load(documents,label){
 const dom=new JSDOM(html,{url:'https://example.test/'+label+'/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 try{
  w.SVGSVGElement.prototype.createSVGRect=()=>({});w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  const map=w.document.querySelector('.folium-map');Object.defineProperties(map,{clientWidth:{value:390},clientHeight:{value:844}});
  w.fetch=async url=>{const name=new URL(url,w.location.href).pathname.split('/').pop(),stem=name.replace(/\.json$/,'');const data=documents[stem]||JSON.parse(read(name));return{ok:true,json:async()=>structuredClone(data)}};
  for(const file of ['assets/offline/vendor/leaflet/leaflet.js','assets/offline/vendor/awesome/leaflet.awesome-markers.js','assets/offline/vendor/locate.js','places-validator.js','place-presentation.js'])w.eval(read(file));
  w.eval(main+';window.testReady=guideReady;');const g=await w.testReady;g.setView('sevardheter');
  assert.equal(w.document.title,documents.guide.title);assert.equal(g.markersById.size,documents.places.places.filter(p=>p.position).length);
  for(const place of documents.places.places.filter(p=>!documents.guide.persistentPlaceIds.includes(p.id)))assert(w.document.querySelector('[data-place-card="'+place.id+'"]'),'Missing list card: '+place.id);
  for(const category of documents.guide.categories)assert(w.document.querySelector('#placeFilters [data-category="'+category.id+'"]'),'Missing configured category');
  const first=documents.places.places.find(p=>!documents.guide.persistentPlaceIds.includes(p.id));g.showPlaceOnMap(first.id);assert(g.markersById.get(first.id));
  console.log('PASS app startup:',label,'title, all markers, configurable layers, list content, place selection');g.map.remove();
 }finally{w.close();}
}
(async()=>{
 await load(original,'current');
 const next=structuredClone(original),map=new Map(next.taxonomy.categories.map((c,i)=>[c.id,'category-'+i]));
 next.guide.id='second-trip';next.guide.title='Second destination';next.guide.destination={name:'Second city',searchSuffix:'Second city'};next.guide.map.center={latitude:59.3,longitude:18.1};
 next.taxonomy.categories.forEach(c=>c.id=map.get(c.id));next.taxonomy.subcategories.forEach(s=>s.categoryId=map.get(s.categoryId));next.guide.categories.forEach(c=>c.id=map.get(c.id));next.places.places.forEach(p=>p.category=map.get(p.category));next['app-config'].bookingCategoryId=map.get(next['app-config'].bookingCategoryId);
 await load(next,'second');
 const {derive}=require('./carto/prepare-config.cjs'),config=JSON.parse(read('offline-config.json'));
 const first=derive(original.guide,original.places,original.routes,config,'/tmp/build-cache');
 const shifted=structuredClone(next.places);shifted.places.forEach(p=>{if(p.position){p.position.latitude+=10;p.position.longitude+=10;}});
 const secondConfig=structuredClone(config);secondConfig.anchorCategories=config.anchorCategories.map(id=>map.get(id)||id);secondConfig.mapSource.regionUrl='https://example.test/another-region.osm.pbf';
 const second=derive(next.guide,shifted,next.routes,secondConfig,'/tmp/build-cache');assert.equal(second.title,next.guide.title);assert.equal(second.sourceUrl,secondConfig.mapSource.regionUrl);assert.notEqual(first.cacheDir,second.cacheDir);assert.notDeepEqual(first.scope.bounds,second.scope.bounds);
 console.log('PASS renderer inputs: second destination, shifted bounds, configured data source and independent cache');
})().catch(e=>{console.error(e);process.exitCode=1});
