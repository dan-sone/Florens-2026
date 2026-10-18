// Run after npm ci. Builds the canonical offline snapshot from the guide source.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');process.chdir(root);
const out='assets/offline',vendor=out+'/vendor';fs.mkdirSync(vendor,{recursive:true});fs.mkdirSync('offline',{recursive:true});
function copy(src,dest){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(src,dest,{recursive:true});}
const modules={'leaflet/dist':'leaflet','jquery/dist/jquery.min.js':'jquery.js','bootstrap/dist/js/bootstrap.bundle.min.js':'bootstrap.js','bootstrap/dist/css/bootstrap.min.css':'bootstrap.css','@fortawesome/fontawesome-free/css/all.min.css':'fontawesome/css/all.min.css','@fortawesome/fontawesome-free/webfonts':'fontawesome/webfonts','leaflet.awesome-markers/dist':'awesome','leaflet.locatecontrol/dist/L.Control.Locate.min.js':'locate.js','leaflet.locatecontrol/dist/L.Control.Locate.min.css':'locate.css','maplibre-gl/dist/maplibre-gl.js':'maplibre.js','maplibre-gl/dist/maplibre-gl.css':'maplibre.css','@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js':'maplibre-leaflet.js','pmtiles/dist/pmtiles.js':'pmtiles.js'};
for(const [src,dest] of Object.entries(modules))copy('node_modules/'+src,vendor+'/'+dest);
for(const name of ['leaflet','jquery','bootstrap','@fortawesome/fontawesome-free','leaflet.awesome-markers','leaflet.locatecontrol','maplibre-gl','@maplibre/maplibre-gl-leaflet','pmtiles','@protomaps/basemaps']){const dir='node_modules/'+name;for(const file of fs.readdirSync(dir).filter(f=>/^license|^copying/i.test(f)))copy(dir+'/'+file,out+'/licenses/'+name.replaceAll('/','-')+'-'+file);}
let html=fs.readFileSync('index.html','utf8');
const replacements=[[/https:\/\/cdn.jsdelivr.net\/npm\/leaflet@1.9.3\/dist\//g,'leaflet/'],[/https:\/\/code.jquery.com\/jquery-3.7.1.min.js/g,'jquery.js'],[/https:\/\/cdn.jsdelivr.net\/npm\/bootstrap@5.2.2\/dist\/js\/bootstrap.bundle.min.js/g,'bootstrap.js'],[/https:\/\/cdn.jsdelivr.net\/npm\/bootstrap@5.2.2\/dist\/css\/bootstrap.min.css/g,'bootstrap.css'],[/https:\/\/cdn.jsdelivr.net\/npm\/@fortawesome\/fontawesome-free@6.2.0\/css\/all.min.css/g,'fontawesome/css/all.min.css'],[/https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/Leaflet.awesome-markers\/2.0.2\//g,'awesome/'],[/https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/leaflet-locatecontrol\/0.66.2\/L.Control.Locate.min./g,'locate.'],[/https:\/\/netdna.bootstrapcdn.com\/bootstrap\/3.0.0\/css\/bootstrap-glyphicons.css/g,'glyphicons.css'],[/https:\/\/cdn.jsdelivr.net\/gh\/python-visualization\/folium\/folium\/templates\/leaflet.awesome.rotate.min.css/g,'rotate.css']];
for(const [pattern,value] of replacements)html=html.replace(pattern,vendor+'/'+value);
html=html.replace('<head>','<head><base href="../">');
const setup=`<script src="${vendor}/pmtiles.js"></script><script src="offline-map.js"></script>`;
html=html.replace(/<script src="offline-app\.js(?:\?[^" ]*)?" defer><\/script>/,'');
if(!html.includes('src="offline-map.js"'))html=html.replace('<script src="place-presentation',setup+'<script src="place-presentation');
html=html.replace(/var tile_layer_670938deb8b58c2d30ad3e7204f24def = L.tileLayer\([\s\S]*?\n            \);/,`var tile_layer_670938deb8b58c2d30ad3e7204f24def = OfflineMap.layer({showBoundary:true});`);
html=html.replace('if(navigator.onLine) tile_layer_670938deb8b58c2d30ad3e7204f24def.addTo','tile_layer_670938deb8b58c2d30ad3e7204f24def.addTo');
html=html.replace("const version=new URL(window.location.href).searchParams.get('v') || Date.now().toString();","const version='offline';");
html=html.replace('</body>','<a href="offline-map-test.html" style="position:fixed;top:calc(env(safe-area-inset-top) + 8px);left:8px;z-index:1100;background:#ffffffe8;padding:7px;border-radius:8px;font:12px -apple-system,sans-serif">Offlinetest</a></body>');
fs.writeFileSync('offline/guide.html',html);
global.window=global;vm.runInThisContext(fs.readFileSync('offline-scope.js','utf8'));
const scope=OfflineScope.compute(require(root+'/places.json').places,require(root+'/routes.json').routes,require(root+'/offline-config.json'));
const rasterPath=out+'/raster/index.json';
if(!fs.existsSync(rasterPath))throw Error('Build the OSM Carto raster package before preparing this offline guide.');
const raster=JSON.parse(fs.readFileSync(rasterPath,'utf8'));
if(raster.type!=='raster'||raster.format!=='webp'||raster.styleVersion!=='6.1.0')throw Error('Unexpected raster cartography');
if(JSON.stringify(raster.bounds)!==JSON.stringify(scope.bounds))throw Error('Scope changed: rebuild the Carto raster package');
let addressed=0;
for(const pack of raster.packages){
 const bytes=fs.readFileSync(pack.path),header=bytes.subarray(0,127);
 if(header.toString('ascii',0,7)!=='PMTiles'||header[7]!==3||header[99]!==4)throw Error('Expected raster WebP PMTiles v3: '+pack.path);
 if(bytes.length!==pack.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==pack.sha256)throw Error('Raster package checksum: '+pack.path);
 if(bytes.length>20*1024*1024)throw Error('Raster chunk exceeds the small-file budget');
 addressed+=Number(header.readBigUInt64LE(72));
}
if(addressed!==raster.tileCount)throw Error('Raster tile count does not match its index');
copy(out+'/raster/OSM-Carto-LICENSE.txt',out+'/licenses/OSM-Carto-LICENSE.txt');
fs.writeFileSync(out+'/scope.json',JSON.stringify(scope,null,2));
fs.writeFileSync(out+'/style.json',JSON.stringify(raster));
// Copy bootstrap globals before the shared map adapter in the generated guide.
let guide=fs.readFileSync('offline/guide.html','utf8');
if(!/src="offline-files\.js(?:\?|")/.test(guide))guide=guide.replace('<script src="offline-map.js">','<script src="offline-files.js"></script><script src="offline-map.js">');
fs.writeFileSync('offline/guide.html',guide);
// Deliver byte-exact documents independently of hosts that decorate HTML pages.
fs.writeFileSync(out+'/documents.json',JSON.stringify({version:1,documents:Object.fromEntries(['index.html','offline-map-test.html','offline/guide.html'].map(p=>[p,fs.readFileSync(p,'utf8')]))}));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}
const local=['index.html','offline-app.js','offline-app.css','offline-map-test.html','offline/guide.html','offline-download.js','offline-map.js','offline-scope.js','offline-config.json','place-presentation.js','places-validator.js','place-sheet.css','ui-theme.css',...fs.readdirSync('.').filter(p=>p.endsWith('.json')&&!p.startsWith('package')&&!p.startsWith('offline-manifest')),...walk('assets')];
const unused=p=>p===out+'/florence.pmtiles'||p.startsWith(out+'/glyphs/')||p.startsWith(out+'/sprites/')||/\/vendor\/maplibre(?:-leaflet)?\.(?:js|css)$/.test(p);
const files=[...new Set(local)].filter(p=>!unused(p)).filter(p=>p.includes('/licenses/')||!p.endsWith('.map')&&!p.endsWith('.ts')&&!p.endsWith('README.md')&&!p.endsWith('LICENSE')&&!p.endsWith('LICENSE.txt')).sort().map(p=>{const data=fs.readFileSync(p);return {path:p,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};});
const id=crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0,16);
const cache='florens-offline-pack-'+id;
fs.writeFileSync('offline-files.js','const OFFLINE_CACHE='+JSON.stringify(cache)+';\nconst OFFLINE_FILES='+JSON.stringify(files)+';\nconst OFFLINE_STYLE='+fs.readFileSync(out+'/style.json','utf8')+';\nconst OFFLINE_SCOPE='+JSON.stringify(scope)+';\n');
fs.writeFileSync('offline-manifest.json',JSON.stringify({id,cache,source:raster.source,cartography:raster.cartography,bounds:scope.bounds,zoom:[raster.minZoom,raster.maxZoom],files,totalBytes:files.reduce((s,f)=>s+f.bytes,0)},null,2));
console.log('Offline package:',id,files.length,'files',files.reduce((s,f)=>s+f.bytes,0),'bytes');
