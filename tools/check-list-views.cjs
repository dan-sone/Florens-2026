// UI integration checks; requires Playwright with Chromium installed.
const fs=require('fs'),http=require('http'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const executablePath=process.env.BROWSER_EXECUTABLE_PATH;
 const server=http.createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;const file=path==='/'?'index.html':path.slice(1);if(!fs.existsSync(file)){res.writeHead(404);return res.end()};res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':file.endsWith('.js')?'text/javascript':'text/plain');res.end(fs.readFileSync(file))}).listen(8765,'127.0.0.1');
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},ignoreHTTPSErrors:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cache=new Map();
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,async route=>{
  const url=route.request().url();
  if(url.includes('tile.openstreetmap.org'))return route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});
  if(!cache.has(url))cache.set(url,new Promise((resolve,reject)=>require('child_process').execFile('curl',['-sSL','--fail','--max-time','30',url],{encoding:'buffer',maxBuffer:5000000},(e,data)=>e?reject(e):resolve(data))));
  try{await route.fulfill({status:200,body:await cache.get(url),contentType:url.endsWith('.css')?'text/css':url.endsWith('.js')?'text/javascript':undefined})}catch(e){await route.abort()}
 });
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'load',timeout:60000});
 await page.evaluate(()=>guideReady);
 assert.deepEqual(await page.locator('#viewTabs button').allTextContents(),['Karta','Schema','Sevärdheter']);
 await page.click('#tab-schema');assert(await page.locator('#schemaPanel').isVisible());
 assert.equal(await page.locator('.day-section').count(),5);assert.equal(await page.locator('[data-booking]').count(),5);
 assert((await page.locator('#schemaPanel').textContent()).includes('19:45'));assert((await page.locator('#schemaPanel').textContent()).includes('15.30'));
 const bookings=JSON.parse(fs.readFileSync('guide.json')).bookings;for(const b of bookings)assert.equal(await page.locator('[data-booking="'+b.id+'"]').count(),1);
 assert.equal(await page.locator('#schemaPanel').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 await page.screenshot({path:'/tmp/schema-list-check.png'});
 await page.click('#tab-sevardheter');assert.equal(await page.locator('[data-place-card]').count(),69);
 assert.equal(await page.locator('[data-place-card="beppa-fioraia"] .list-actions a').nth(0).getAttribute('href'),PlacesLink());
 function PlacesLink(){const u=new URL('https://maps.apple.com/directions');u.searchParams.set('destination','43.76279,11.26097');u.searchParams.set('mode','walking');u.searchParams.set('destination-place-id','IE09241B81B7B5B19');return u.href;}
 await page.locator('[data-category="craft"]').click();assert.equal(await page.locator('[data-place-card="scuola-del-cuoio"]').count(),0);
 await page.click('#tab-karta');assert.equal(await page.locator('.leaflet-control-layers-overlays input').nth(2).isChecked(),false);
 await page.locator('.leaflet-control-layers').hover();await page.locator('.leaflet-control-layers-overlays input').nth(2).check();
 await page.click('#tab-sevardheter');assert.equal(await page.locator('[data-place-card]').count(),69);
 await page.screenshot({path:'/tmp/places-list-check.png'});
 assert.equal(await page.locator('#placesPanel').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 // Each list navigation target must equal the map's canonical URL generator.
 const validLinks=await page.evaluate(async()=>{const g=await guideReady;for(const card of document.querySelectorAll('[data-place-card]')){const p=g.placesById.get(card.dataset.placeCard);const links=card.querySelectorAll('.list-actions a');for(const [i,mode]of ['walking','transit','driving'].entries())if(links[i].href!==PlacesValidator.appleDirectionsLink(p,mode))return false;if(links[3].href!==PlacesValidator.applePlaceLink(p))return false}return true});assert(validLinks);
 await page.locator('[data-place-card="beppa-fioraia"] [data-show-place]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'karta');await page.waitForSelector('.navactions');assert((await page.locator('.leaflet-popup').textContent()).includes('Beppa Fioraia'));
 await page.click('#tab-schema');await page.reload({waitUntil:'load'});await page.evaluate(()=>guideReady);assert.equal(await page.locator('body').getAttribute('data-view'),'schema');
 await page.click('#tab-sevardheter');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#tab-schema').getAttribute('aria-selected'),'true');
 await page.setViewportSize({width:1024,height:768});await page.click('#tab-sevardheter');assert.equal(await page.locator('#placesPanel').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 assert.deepEqual(errors,[]);console.log('PASS list views: mobile/tablet layout, all five days/bookings, all 69 places and shared navigation URLs, category filters synchronized both ways, show marker, hash/refresh persistence, keyboard tabs');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
