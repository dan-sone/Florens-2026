const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');let fault=null,delay=0,networkBlocked=false,prettyUrls=false;
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pbf':'application/x-protobuf','.woff2':'font/woff2','.woff':'font/woff'};
const server=http.createServer(async(req,res)=>{
 if(networkBlocked){req.socket.destroy();return;}
 const url=new URL(req.url,'http://localhost');let relative=decodeURIComponent(url.pathname).slice(1);
 if(prettyUrls&&relative.endsWith('.html')){res.writeHead(308,{Location:'/'+relative.slice(0,-5)+url.search}).end();return;}
 if(prettyUrls&&['offline-map-test','offline/guide','index'].includes(relative))relative+='.html';
 const file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(relative===fault){if(delay)await new Promise(r=>setTimeout(r,delay));res.writeHead(503).end('Injected download failure');return;}
 try{let data=fs.readFileSync(file);if(prettyUrls&&path.extname(file)==='.html')data=Buffer.from(data.toString('utf8').replace('</body>','<!-- injected by test host --></body>'));res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404).end();}
});
const results=[];
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 fs.mkdirSync(path.join(root,'test-results/offline'),{recursive:true});
 const engines=process.env.OFFLINE_ENGINES?.split(',')||['chromium','webkit'];
 for(const name of engines){
  const options={headless:true};if(name==='chromium'){options.args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'];if(process.env.CHROMIUM_EXECUTABLE)options.executablePath=process.env.CHROMIUM_EXECUTABLE;}
  const browser=await ({chromium,webkit}[name]).launch(options);
  // Both browser offline emulation and a severed origin: no HTTP cache fallback.
  const setOffline=async(ctx,value)=>{networkBlocked=value;await ctx.setOffline(value);};
  for(const [device,viewport] of Object.entries({iphone:{width:390,height:844},ipad:{width:1194,height:834}})){
   prettyUrls=device==='ipad';
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:device==='ipad'?2:1});
   const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
   page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon'))errors.push(m.text());});
   await page.goto(base+'/offline-map-test.html');if(prettyUrls)assert.equal(new URL(page.url()).pathname,'/offline-map-test','Host redirected the manager to its extensionless URL');await page.waitForFunction(()=>document.querySelector('#status').textContent==='Ingen komplett offlinekarta sparad.');
   const downloadStart=Date.now();await page.click('#download');await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Redo för offline'),null,{timeout:90000});
   console.log('CARTO_LOCAL_DOWNLOAD',name,device,Date.now()-downloadStart,'ms');await page.waitForFunction(()=>[...document.querySelectorAll('.leaflet-tile')].some(i=>i.complete&&i.naturalWidth===256));
   assert.equal(errors.length,0,errors.join('\n'));const counts=await page.evaluate(async()=>({files:OFFLINE_FILES.length,stored:(await (await caches.open(OFFLINE_CACHE)).keys()).length}));assert.equal(counts.stored,counts.files+2);if(prettyUrls){assert((await page.content()).includes('injected by test host'),'Live HTML was modified by the host');assert(!(await page.evaluate(async()=>(await (await caches.open(OFFLINE_CACHE)).match(new URL('offline-map-test.html',location.href).href)).text())).includes('injected by test host'),'Cached HTML is the unmodified canonical package document');}
   await setOffline(context,true);failed.length=0;
   await page.reload();await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Redo för offline'));
   await page.waitForTimeout(1500);await page.screenshot({path:path.join(root,`test-results/offline/${name}-${device}-map.png`)});
   await page.click('#guide');await page.waitForFunction(()=>document.querySelector('[data-view="sevardheter"]'));
   await page.waitForFunction(()=>typeof guideReady!=='undefined');await page.evaluate(()=>guideReady);await page.waitForTimeout(2500);await page.screenshot({path:path.join(root,`test-results/offline/${name}-${device}-guide.png`)});
   // The original Carto labels and POIs are baked into lossless raster pixels.
   await page.evaluate(async()=>{const g=await guideReady;g.map.eachLayer(l=>{if(l.offlineRaster)window.testBasemap=l;});g.map.setView([43.770,11.255],18,{animate:false});});
   await page.waitForFunction(()=>!window.testBasemap.isLoading()&&[...document.querySelectorAll('.leaflet-tile')].filter(i=>i.complete&&i.naturalWidth===256).length>=4);
   assert.equal(await page.evaluate(()=>OFFLINE_STYLE.cartography),'OpenStreetMap Carto');
   const colors=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.drawImage([...document.querySelectorAll('.leaflet-tile')].find(i=>i.complete&&i.naturalWidth===256),0,0);const p=ctx.getImageData(0,0,256,256).data,s=new Set();for(let i=0;i<p.length;i+=4)s.add(p.slice(i,i+3).join(','));return s.size;});
   assert(colors>100,'Decoded raster includes detailed original cartography');
   await page.screenshot({path:path.join(root,`test-results/offline/${name}-${device}-poi-detail.png`)});
   const panStart=Date.now();await page.evaluate(async()=>{(await guideReady).map.setView([43.760,11.270],19,{animate:false});});
   await page.waitForFunction(()=>!window.testBasemap.isLoading());
   const panMs=Date.now()-panStart;assert(panMs<5000,'Stored raster pan finishes promptly');
   console.log('CARTO_OFFLINE_PAN',name,device,panMs,'ms');

   // Exercise the existing navigation and its data offline, including lazy history images.
   for(const view of ['sevardheter','schema','historia','karta']){const button=page.locator(`[data-view="${view}"]`).first();if(await button.count())await button.click();await page.waitForTimeout(300);if(view==='historia'){await page.locator('.history-card').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));await page.locator('.history-image img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));await page.waitForFunction(()=>[...document.querySelectorAll('.history-image img')].every(i=>i.complete&&i.naturalWidth>0));}}
   await page.evaluate(async()=>{const g=await guideReady;g.showDayRoute('fri');});await page.waitForTimeout(600);assert(await page.evaluate(async()=>{const g=await guideReady;return g.map.hasLayer(g.dayRoutes.fri);}));await page.evaluate(async()=>{const g=await guideReady;g.showPlaceOnMap('duomo-santa-reparata');g.openPlaceSheet('duomo-santa-reparata');});await page.waitForTimeout(700);assert((await page.locator('#sheetTitle').textContent()).includes('Duomo'));await page.evaluate(async()=>{(await guideReady).closePlaceSheet(false);});
   await page.reload();await page.waitForTimeout(2000);assert.equal(await page.title(),'Florens 2026');assert.equal(errors.length,0,errors.join('\n')+'\n'+failed.join('\n'));assert.deepEqual(failed,[],'No failed requests offline');
   // Close the page and create a new one to verify a cold navigation, not just memory.
   await page.goto(base+'/offline-map-test.html');await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Redo för offline'));await page.evaluate(async()=>{const current=await caches.open(OFFLINE_CACHE),previousName=OFFLINE_CACHE+'-previous',previous=await caches.open(previousName);for(const req of await current.keys()){let response=await current.match(req);if(new URL(req.url).pathname.endsWith('/offline-files.js'))response=new Response((await response.text()).replace(OFFLINE_CACHE,previousName),{headers:{'Content-Type':'application/javascript'}});await previous.put(req,response);}await caches.delete(OFFLINE_CACHE);});await page.reload();await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Redo för offline'));
   await page.close();const cold=await context.newPage();const coldStart=Date.now();await cold.goto(base+(prettyUrls?'/offline/guide':'/offline/guide.html'));assert.equal(await cold.evaluate(async()=>(await guideReady).markersById.size),77);await cold.waitForFunction(()=>[...document.querySelectorAll('.leaflet-tile')].some(i=>i.complete&&i.naturalWidth===256));const coldMs=Date.now()-coldStart;assert(coldMs<5000,'Cold offline map displays promptly');console.log('CARTO_OFFLINE_COLD',name,device,coldMs,'ms');await cold.close();
   const production=await context.newPage();await setOffline(context,false);await production.goto(base+'/index.html',{waitUntil:'commit'});assert(await production.evaluate(()=>!navigator.serviceWorker.controller||!navigator.serviceWorker.controller.scriptURL.endsWith('/offline-test-sw.js')),'Legacy test workers never control the production guide');await production.close();
   results.push(`${name}/${device}: ${prettyUrls?'extensionless host redirects and transformed live HTML, ':''}complete download, original Carto raster rendering, offline map/guide reload, cold navigation, existing views, decoded detailed raster tiles with baked-in labels and POIs, no failed offline requests, production isolation, previous-version fallback`);
   console.log('PASS',name,device);await context.close();
  }
  prettyUrls=false;
  // A host can activate a worker without ever controlling the document.
  // Initialization must time out visibly while the other controls remain wired.
  {
   const ctx=await browser.newContext(),p=await ctx.newPage();
   await ctx.addInitScript(()=>Object.defineProperty(navigator,'serviceWorker',{value:{register:async()=>({active:{state:'activated',addEventListener(){}}}),controller:null,addEventListener(){},removeEventListener(){}}}));
   await p.goto(base+'/offline-map-test.html');
   await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('lät den inte styra testsidan'),null,{timeout:25000});
   assert(await p.locator('#download').isDisabled());
   const before=await p.locator('.leaflet-map-pane').getAttribute('style');await p.click('#fit');await p.waitForTimeout(400);
   assert.notEqual(await p.locator('.leaflet-map-pane').getAttribute('style'),before,'Map controls remain responsive during failed initialization');
   results.push(`${name}/startup: bounded failure, visible diagnostic, responsive controls`);console.log('PASS',name,'startup');await ctx.close();
  }
  // Error handling uses a fresh device store for each failure.
  for(const test of ['network','cancel','quota','missing','integrity']){
   const ctx=await browser.newContext(),p=await ctx.newPage();
   if(test==='quota')await ctx.addInitScript(()=>{const put=Cache.prototype.put;Cache.prototype.put=function(req,res){if(String(req).endsWith('.pmtiles'))throw new DOMException('Test quota','QuotaExceededError');return put.call(this,req,res);};});
   await p.goto(base+'/offline-map-test.html');await p.waitForFunction(()=>document.querySelector('#status').textContent==='Ingen komplett offlinekarta sparad.');
   if(test==='network'||test==='cancel'){fault=require('../assets/offline/raster/index.json').packages[0].path;delay=test==='cancel'?3000:0;}
   await p.click('#download');
   if(test==='cancel'){await p.waitForTimeout(100);await p.click('#cancel');}
   if(['missing','integrity'].includes(test)){
    await p.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Redo för offline'),null,{timeout:90000});
    if(test==='missing'){await p.evaluate(async()=>{await (await caches.open(OFFLINE_CACHE)).delete(new URL('places.json',location.href).href);});await p.reload();await p.waitForFunction(()=>document.querySelector('#status').textContent==='Ingen komplett offlinekarta sparad.');assert(await p.locator('#guide').isHidden());}
    else{await p.evaluate(async()=>{await (await caches.open(OFFLINE_CACHE)).put(new URL('places.json',location.href).href,new Response('{}'));});await setOffline(ctx,true);await p.reload();await p.waitForFunction(()=>document.querySelector('#status').textContent==='Ingen komplett offlinekarta sparad.');assert(await p.locator('#guide').isHidden());await setOffline(ctx,false);await p.click('#download');await p.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Redo för offline'),null,{timeout:90000});}
   }else{
    await p.waitForFunction(()=>!document.querySelector('#download').disabled);assert(await p.locator('#guide').isHidden());assert(!(await p.evaluate(async()=>!!await (await caches.open(OFFLINE_CACHE)).match(new URL('offline-ready',location.href).href))));
    fault=null;delay=0;
    if(test==='network'){await p.click('#download');await p.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Redo för offline'),null,{timeout:90000});}
   }
   fault=null;delay=0;results.push(`${name}/${test}: passed`);console.log('PASS',name,test);await ctx.close();
  }
  networkBlocked=false;await browser.close();
 }
 fs.writeFileSync(path.join(root,'test-results/offline/results.json'),JSON.stringify(results,null,2));console.log(results.join('\n'));
})().catch(e=>{console.error(e);process.exit(1);}).finally(()=>server.close());
