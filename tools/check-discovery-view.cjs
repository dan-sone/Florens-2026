// UI integration checks; requires Playwright with Chromium installed.
const fs=require('fs'),http=require('http'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const executablePath=process.env.BROWSER_EXECUTABLE_PATH;
 const server=http.createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;const file=path==='/'?'index.html':path.slice(1);if(!fs.existsSync(file)){res.writeHead(404);return res.end()};res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'text/plain');res.end(fs.readFileSync(file))}).listen(8765,'127.0.0.1');
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,ignoreHTTPSErrors:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cache=new Map();
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,async route=>{
  const url=route.request().url();
  if(url.includes('tile.openstreetmap.org'))return route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#dce2e6"/></svg>'});
  if(!cache.has(url))cache.set(url,new Promise((resolve,reject)=>require('child_process').execFile('curl',['-sSL','--fail','--max-time','30',url],{encoding:'buffer',maxBuffer:5000000},(e,data)=>e?reject(e):resolve(data))));
  try{await route.fulfill({status:200,body:await cache.get(url),contentType:url.endsWith('.css')?'text/css':url.endsWith('.js')?'text/javascript':undefined})}catch(e){await route.abort()}
 });
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'load',timeout:60000});
 await page.evaluate(()=>guideReady);

 await page.click('#tab-sevardheter');
 const guide=JSON.parse(fs.readFileSync('guide.json')),places=JSON.parse(fs.readFileSync('places.json')).places;
 const ordered=guide.discoveryAreas.flatMap(a=>a.placeIds).filter(id=>id!=='hotel-la-scaletta');const booked=new Set(guide.bookings.map(b=>b.placeId));const byId=new Map(places.map(p=>[p.id,p]));const expected=guide.categories.flatMap(c=>ordered.filter(id=>(booked.has(id)?'booked':byId.get(id).category)===c.id));
 assert.deepEqual(await page.locator('[data-place-card]').evaluateAll(es=>es.map(e=>e.dataset.placeCard)),expected);
 assert.equal(await page.locator('.discovery-area').count(),5);assert.equal(await page.locator('[data-place-card="hotel-la-scaletta"]').count(),0);assert.equal(await page.locator('.discovery-card[open]').count(),0);
 const first=page.locator('.discovery-card').first();
 await first.locator('.discovery-heading').tap();assert(await first.evaluate(e=>e.open));
 await first.locator('.discovery-heading').tap();assert(!(await first.evaluate(e=>e.open)));
 await first.locator('.discovery-heading').focus();await page.keyboard.press('Enter');assert(await first.evaluate(e=>e.open));
 await page.keyboard.press('Enter');assert(!(await first.evaluate(e=>e.open)));
 const craft=page.locator('[data-place-card="giulio-giannini-e-figlio"]');await craft.locator('.discovery-heading').tap();
 await page.click('#placeFilters [data-category="craft"]');assert.equal(await craft.count(),0);
 await page.click('#placeFilters [data-category="craft"]');assert(await craft.evaluate(e=>e.open));
 await craft.locator('[data-show-place]').scrollIntoViewIfNeeded();const beforeMap=await page.locator('#listView').evaluate(e=>e.scrollTop);await craft.locator('[data-show-place]').click();await page.waitForFunction(()=>document.getElementById('sheetTitle').textContent.includes('Giulio Giannini'));
 await page.click('#tab-sevardheter');assert(await craft.evaluate(e=>e.open));assert.equal(await page.locator('#listView').evaluate(e=>e.scrollTop),beforeMap);
 assert.equal(await page.locator('[data-place-card="cuculia"]').getAttribute('data-category'),'booked');
 assert.equal(await page.locator('#placeList .place-story').count(),0);
 for(const colorScheme of ['light','dark']){
  await page.emulateMedia({colorScheme});await page.waitForTimeout(250);
  const colors=await page.evaluate(()=>{const luminance=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};return [...document.querySelectorAll('#placeFilters button')].map((b,i)=>{const s=getComputedStyle(b),legend=getComputedStyle(document.querySelectorAll('.leaflet-control-layers-overlays label')[i].querySelector('span'));const a=luminance(s.color),bg=luminance(s.backgroundColor);return {key:b.dataset.category,button:s.color,legend:legend.color,dot:getComputedStyle(b.querySelector('.place-symbol')).color,contrast:(Math.max(a,bg)+.05)/(Math.min(a,bg)+.05)}})});
  for(const c of colors){assert.equal(c.button,c.legend,JSON.stringify(colors));assert.equal(c.dot,c.legend);assert(c.contrast>=4.5,JSON.stringify(c));}
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:768,height:1024}]){
   await page.setViewportSize(size);
   await page.evaluate(()=>{document.querySelectorAll('.discovery-card').forEach(d=>d.open=true);document.querySelectorAll('#placesPanel h1,#placesPanel h2,#placesPanel h3,#placesPanel p,#placesPanel .discovery-category,#placesPanel .list-action,#placeFilters button,.places-view-mode button').forEach(e=>{e.dataset.fontBefore=getComputedStyle(e).fontSize;e.style.fontSize=parseFloat(e.dataset.fontBefore)*2+'px'});});
   assert.equal(await page.locator('#placesPanel').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,JSON.stringify({size,colorScheme,bounds:await page.evaluate(()=>[document.getElementById('placesPanel'),...document.querySelectorAll('#placesPanel *')].filter(e=>e.scrollWidth>e.clientWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,70),width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right,scroll:e.scrollWidth,client:e.clientWidth})))}));
   await page.evaluate(()=>document.querySelectorAll('#placesPanel [data-font-before]').forEach(e=>e.style.fontSize=''));
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.querySelectorAll('.discovery-card').forEach(d=>d.open=false);document.getElementById('listView').scrollTop=0});await page.waitForTimeout(250);await page.screenshot({path:'/tmp/discovery-'+colorScheme+'.png'});
 }
 const allText=await page.locator('#placeList').textContent();for(const p of places.filter(p=>p.category!=='hotel')){assert(allText.includes(p.name));assert.equal(await page.locator('[data-place-card="'+p.id+'"] .discovery-teaser').textContent(),p.focus);}
 const icons=await page.evaluate(async()=>{const g=await guideReady;return [...document.querySelectorAll('[data-place-card]')].every(card=>{const config=g.markersById.get(card.dataset.placeCard).options.icon.options,icon=card.querySelector('.discovery-heading>.place-symbol');return config.icon?icon.classList.contains((config.prefix||'glyphicon')+'-'+config.icon):icon.classList.contains('fa-shopping-bag')});});assert(icons);
 assert.deepEqual(await page.locator('.places-view-mode button').allTextContents(),['Kategori','Område','Läsvy']);
 await page.click('.places-view-mode [data-places-mode="area"]');
 assert.equal(await page.locator('[data-discovery-area]').count(),8);
 assert.deepEqual(await page.locator('[data-place-card]').evaluateAll(es=>es.map(e=>e.dataset.placeCard)),ordered);
 const areaCard=page.locator('[data-place-card="palazzo-pitti"]');await areaCard.locator('.discovery-heading').tap();assert(await areaCard.evaluate(e=>e.open));
 await page.click('.places-view-mode [data-places-mode="overview"]');assert(await areaCard.evaluate(e=>e.open));
 await page.click('.places-view-mode [data-places-mode="area"]');assert(await areaCard.evaluate(e=>e.open));
 await page.reload({waitUntil:'load'});await page.evaluate(()=>guideReady);assert.equal(await page.locator('[data-discovery-area]').count(),8);
 for(const colorScheme of ['light','dark']){
  await page.emulateMedia({colorScheme});await page.waitForTimeout(250);await page.setViewportSize({width:320,height:568});
  await page.evaluate(()=>document.querySelectorAll('#placesPanel h1,#placesPanel h2,#placesPanel p,.places-view-mode button,#placeFilters button').forEach(e=>{e.dataset.originalSize=getComputedStyle(e).fontSize;e.style.fontSize=parseFloat(e.dataset.originalSize)*2+'px'}));
  assert.equal(await page.locator('#placesPanel').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  await page.evaluate(()=>document.querySelectorAll('[data-original-size]').forEach(e=>e.style.fontSize=''));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.getElementById('listView').scrollTop=0);
  await page.screenshot({path:'/tmp/place-areas-'+colorScheme+'.png'});
 }
 await page.click('.places-view-mode [data-places-mode="reading"]');assert.equal(await page.locator('.discovery-card[open]').count(),67);
 await page.locator('.discovery-heading').first().tap();assert.equal(await page.locator('.discovery-card[open]').count(),67);
 await page.click('#placeFilters [data-category="craft"]');assert.equal(await page.locator('.discovery-card:not([open])').count(),0);
 await page.click('#placeFilters [data-category="craft"]');assert.equal(await page.locator('.discovery-card[open]').count(),67);
 await page.locator('[data-place-card="giulio-giannini-e-figlio"] [data-show-place]').click();await page.waitForFunction(()=>document.getElementById('sheetTitle').textContent.includes('Giulio Giannini'));await page.click('#tab-sevardheter');assert.equal(await page.locator('.discovery-card[open]').count(),67);
 await page.reload({waitUntil:'load'});await page.evaluate(()=>guideReady);assert.equal(await page.locator('.discovery-card[open]').count(),67);assert.equal(await page.locator('[data-discovery-area]').count(),8);
 await page.click('.places-view-mode [data-places-mode="overview"]');assert.equal(await page.locator('.discovery-card[open]').count(),0);
 await page.locator('.discovery-heading').first().scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/compact-place-cards.png'});
 assert.deepEqual(errors,[]);console.log('PASS: category order and all 67 visitor places, hotel exclusion, focus text, map icons, category/area/reading modes and remembered grouping; touch/keyboard disclosure; filter/map state; canonical category colors and contrast; 200% text at four screen sizes in light/dark');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
