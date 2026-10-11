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
 assert.deepEqual(await page.locator('#viewTabs button').allTextContents(),['Karta','Dagar','Sevärdheter','Historia']);
 assert.equal(await page.locator('.leaflet-control-zoom').count(),0);assert.equal(await page.locator('.leaflet-top.leaflet-left .leaflet-control').count(),0);assert.equal(await page.locator('.leaflet-top.leaflet-right .leaflet-control').count(),5);assert.equal(await page.locator('[data-place-card="pasticceria-cosi-chiantigiana"]').count(),0);assert(!(await page.locator('#schemaPanel').textContent()).includes('Cosi'));


 await page.click('#tab-historia');assert(await page.locator('#historyPanel').isVisible());
 const historyData=JSON.parse(fs.readFileSync('history.json'));
 assert.equal(await page.locator('[data-history-chapter]').count(),historyData.chapters.length);
 for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:768,height:1024}])for(const colorScheme of ['light','dark']){
  await page.setViewportSize(size);await page.emulateMedia({colorScheme});
  await page.evaluate(()=>{document.querySelectorAll('#historyPanel details').forEach(d=>d.open=true)});
  assert.equal(await page.locator('#historyPanel').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  assert.equal(await page.locator('#viewTabs').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  assert(await page.locator('#viewTabs button').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44&&e.getBoundingClientRect().left>=0&&e.getBoundingClientRect().right<=innerWidth)));
 }
 for(const chapter of historyData.chapters){const card=page.locator('[data-history-chapter="'+chapter.id+'"]');for(const p of chapter.paragraphs)assert((await card.textContent()).includes(p));for(const id of chapter.placeIds)assert.equal(await card.locator('[data-show-place="'+id+'"]').count(),1);}
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'light'});
 await page.locator('#historyPanel h1').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/history-light.png'});
 await page.locator('[data-history-chapter="changing-city"] .history-map-links [data-show-place="giardino-delle-rose"]').click();
 assert.equal(await page.locator('body').getAttribute('data-view'),'karta');await page.waitForFunction(()=>document.getElementById('sheetTitle').textContent.includes('Rosenträdgården'));assert((await page.locator('#sheetTitle').textContent()).includes('Rosenträdgården'));
 await page.click('#tab-historia');assert(await page.locator('[data-history-chapter="changing-city"]').evaluate(e=>e.open));
 await page.reload({waitUntil:'load'});await page.evaluate(()=>guideReady);assert.equal(await page.locator('body').getAttribute('data-view'),'historia');
 await page.emulateMedia({colorScheme:'dark'});await page.waitForTimeout(250);await page.screenshot({path:'/tmp/history-dark.png'});await page.emulateMedia({colorScheme:'light'});
 await page.click('#tab-schema');assert(await page.locator('#schemaPanel').isVisible());
 assert.equal(await page.locator('.day-section[open]').count(),0);assert.equal(await page.locator('.schedule-chevron').first().evaluate(e=>getComputedStyle(e).transform),'none');
 const firstDay=page.locator('.day-section').first();
 await firstDay.locator('.schedule-heading').tap();assert(await firstDay.evaluate(e=>e.open));
 await firstDay.locator('.schedule-heading').tap();assert(!(await firstDay.evaluate(e=>e.open)));
 await firstDay.locator('.schedule-heading').focus();await page.keyboard.press('Enter');assert(await firstDay.evaluate(e=>e.open));
 await page.keyboard.press('Enter');assert(!(await firstDay.evaluate(e=>e.open)));
 for(const colorScheme of ['light','dark']){
  await page.emulateMedia({colorScheme});await page.waitForTimeout(250);
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(size);
   await page.evaluate(()=>document.querySelectorAll('.schedule-heading h2,.schedule-teaser').forEach(e=>{e.style.fontSize=parseFloat(getComputedStyle(e).fontSize)*2+'px'}));
   assert.equal(await page.locator('#schemaPanel').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
   await page.evaluate(()=>document.querySelectorAll('.schedule-heading h2,.schedule-teaser').forEach(e=>e.style.fontSize=''));
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.schedule-heading').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:'/tmp/schedule-collapsed-'+colorScheme+'.png'});
 }
 await page.emulateMedia({colorScheme:'light'});
 await page.evaluate(()=>document.querySelectorAll('.day-section').forEach(d=>d.open=true));
 assert.equal(await page.locator('.day-section').count(),5);assert.equal(await page.locator('[data-booking]').count(),5);
 assert((await page.locator('#schemaPanel').textContent()).includes('19:45'));assert((await page.locator('#schemaPanel').textContent()).includes('15.30'));
 const bookings=JSON.parse(fs.readFileSync('guide.json')).bookings;for(const b of bookings)assert.equal(await page.locator('[data-booking="'+b.id+'"]').count(),1);
 const guide=JSON.parse(fs.readFileSync('guide.json'));
 assert.equal(await page.locator('[data-flight]').count(),guide.flights.length);
 for(const flight of guide.flights){const card=page.locator('[data-flight="'+flight.id+'"]');assert.equal(await card.count(),1);assert.equal(await card.evaluate(e=>e.closest('[data-day]').dataset.day),flight.dayId);const text=await card.textContent();for(const value of [flight.flightNumber,flight.operator,flight.departure.airportCode,flight.arrival.airportCode,flight.departure.at.slice(11,16),flight.arrival.at.slice(11,16)])assert(text.includes(value));}
 assert((await page.locator('[data-flight="outbound-stockholm-vienna"]').textContent()).includes('30 min'));
 for(const flight of guide.flights){const text=await page.locator('[data-flight="'+flight.id+'"]').textContent();if(flight.departure.terminal)assert(text.includes(flight.operator+' · Terminal '+flight.departure.terminal));else assert(!text.includes('Terminal'));}
 assert(await page.locator('[data-day="sat"]').evaluate(e=>Boolean(e.querySelector('.list-program').compareDocumentPosition(e.querySelector('[data-flight]'))&Node.DOCUMENT_POSITION_FOLLOWING)));
 assert((await page.locator('[data-day="tue"] .list-program').textContent()).includes('upptäck Florens'));
 assert.equal(await page.locator('[data-day="tue"] .list-program [data-place="serre-torrigiani-in-piazzetta"]').count(),1);
 await page.locator('[data-day="tue"] .list-program [data-place="serre-torrigiani-in-piazzetta"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'karta');await page.waitForSelector('#placeSheet');await page.waitForFunction(()=>document.getElementById('sheetTitle').textContent.includes('Serre Torrigiani'));assert((await page.locator('#sheetTitle').textContent()).includes('Serre Torrigiani'));await page.click('#tab-schema');assert(await page.locator('#placeSheet').isHidden());assert(await page.locator('[data-day="tue"]').evaluate(e=>e.open));
 await page.locator('[data-flight="return-florence-stockholm"]').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/return-flight-check.png'});
 await page.locator('#schemaPanel h1').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('#schemaPanel').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 await page.screenshot({path:'/tmp/schema-list-check.png'});
 await page.click('#tab-sevardheter');assert.equal(await page.locator('[data-place-card]').count(),JSON.parse(fs.readFileSync('places.json')).places.filter(p=>p.category!=='hotel').length);
 assert.equal(await page.locator('[data-place-card="beppa-fioraia"] .list-actions a').nth(0).getAttribute('href'),PlacesLink());
 function PlacesLink(){const u=new URL('https://maps.apple.com/directions');u.searchParams.set('destination','43.76279,11.26097');u.searchParams.set('mode','walking');u.searchParams.set('destination-place-id','IE09241B81B7B5B19');return u.href;}
 await page.locator('#placeFilters [data-category="craft"]').click();assert.equal(await page.locator('[data-place-card="scuola-del-cuoio"]').count(),0);
 await page.click('#tab-karta');assert.equal(await page.locator('.leaflet-control-layers-overlays input').nth(2).isChecked(),true);
 await page.locator('.leaflet-control-layers').hover();await page.locator('.leaflet-control-layers-overlays input').nth(2).uncheck();
 await page.click('#tab-sevardheter');assert.equal(await page.locator('[data-place-card="scuola-del-cuoio"]').count(),0);await page.locator('#placeFilters [data-category="craft"]').click();assert.equal(await page.locator('[data-place-card]').count(),67);
 await page.screenshot({path:'/tmp/places-list-check.png'});
 assert.equal(await page.locator('#placesPanel').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 // Each list navigation target must equal the map's canonical URL generator.
 const validLinks=await page.evaluate(async()=>{const g=await guideReady;for(const card of document.querySelectorAll('[data-place-card]')){const p=g.placesById.get(card.dataset.placeCard);const links=card.querySelectorAll('.list-actions a');if(links[0].href!==PlacesValidator.appleDirectionsLink(p,'walking'))return false;if(links[1].href!==PlacesValidator.applePlaceLink(p))return false}return true});assert(validLinks);
 await page.locator('[data-place-card="beppa-fioraia"] .discovery-heading').click();await page.locator('[data-place-card="beppa-fioraia"] [data-show-place]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'karta');await page.waitForSelector('#placeSheet');await page.waitForFunction(()=>document.getElementById('sheetTitle').textContent.includes('Beppa Fioraia'));assert((await page.locator('#sheetTitle').textContent()).includes('Beppa Fioraia'));
 await page.click('#tab-schema');await page.reload({waitUntil:'load'});await page.evaluate(()=>guideReady);assert.equal(await page.locator('body').getAttribute('data-view'),'schema');
 await page.click('#tab-sevardheter');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#tab-schema').getAttribute('aria-selected'),'true');
 await page.setViewportSize({width:1024,height:768});await page.click('#tab-sevardheter');assert.equal(await page.locator('#placesPanel').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 // Every place card and every story must remain inside the screen, including landscape
 // and large-text layouts. Story text is identical in the sheet and the list.
 const sizes=[{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1024,height:768},{width:768,height:1024}];
 for(const size of sizes){
  await page.setViewportSize(size);
  await page.evaluate(async()=>{
   const g=await guideReady;g.setView('karta');
   const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const bounds=()=>{const sheet=document.getElementById('placeSheet'),body=document.getElementById('sheetBody'),r=sheet.getBoundingClientRect();if(r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1||body.scrollWidth>body.clientWidth+1)throw new Error('Sheet overflow '+innerWidth+'×'+innerHeight+' '+document.getElementById('sheetTitle').textContent);const buttons=[...body.querySelectorAll('.sheet-action')].map(e=>e.getBoundingClientRect());for(const b of buttons)if(b.width<44||b.height<44||Math.abs(b.top-buttons[0].top)>1||b.left<0||b.right>innerWidth+1)throw new Error('Action row does not fit');};
   for(const place of g.content.places){g.openPlaceSheet(place.id);await frame();bounds();if(document.querySelector('#sheetBody [data-action="walking"]').href!==PlacesValidator.appleDirectionsLink(place,'walking'))throw new Error('Wrong navigation');if(document.querySelector('#sheetBody [data-action="transit"],#sheetBody [data-action="driving"]'))throw new Error('Duplicate transport buttons');if(document.querySelector('#sheetBody [data-action="maps"]').href!==PlacesValidator.applePlaceLink(place))throw new Error('Wrong map link');if(Boolean(document.querySelector('#sheetBody [data-action="website"]'))!==Boolean(place.website))throw new Error('Missing website');if(place.website&&document.querySelector('#sheetBody [data-action="website"]').href!==place.website)throw new Error('Wrong website');if(document.querySelector('#sheetBody [data-action="ask"]').dataset.askPlace!==place.id)throw new Error('Wrong ChatGPT target');if(document.getElementById('sheetGrab').hidden)throw new Error('Missing grab handle');if(document.querySelector('#sheetBody .sheet-more'))throw new Error('Extra read-more section');if(document.querySelectorAll('.selected-place-halo').length!==0||!g.markersById.get(place.id).getElement().classList.contains('is-selected'))throw new Error('Selected place missing');if(document.querySelectorAll('#sheetBody .story-copy details:not(.story-sources)').length)throw new Error('Nested story disclosure');}
   for(const story of g.storyContent.stories){g.openPlaceSheet(story.placeId);await frame();bounds();const text=document.querySelector('#sheetBody .story-copy').textContent;if(!text.includes(story.title)||!text.includes(story.lookFor)||!story.paragraphs.every(p=>text.includes(p)))throw new Error('Story text mismatch');}
   g.closePlaceSheet(false);g.setView('sevardheter');
   if(document.querySelectorAll('#placeList .story-copy').length!==g.storyContent.stories.length)throw new Error('Missing list story');
   for(const story of g.storyContent.stories){const details=document.querySelector('#placeList [data-place-card="'+story.placeId+'"]');details.open=true;if(!details.textContent.includes(story.lookFor))throw new Error('List story mismatch');}
   await frame();const panel=document.getElementById('placesPanel');if(panel.scrollWidth>panel.clientWidth+1)throw new Error('List overflow');
  });
 }
 await page.setViewportSize({width:390,height:844});

 await page.setViewportSize({width:390,height:844});
 await page.evaluate(async()=>{const g=await guideReady;g.setView('karta');g.closePlaceSheet(false);g.map.setView([g.guide.map.center.latitude,g.guide.map.center.longitude],14,{animate:false});});
 for(const id of ['orsanmichele','beppa-fioraia','mio-concept-store']){
   const before=await page.evaluate(async id=>{const g=await guideReady;g.closePlaceSheet(false);const marker=g.markersById.get(id);if(!g.map.hasLayer(marker))marker.addTo(g.map);const other=[...g.markersById.values()].filter(m=>m!==marker&&m.getElement()?.isConnected);const style=m=>{const e=m.getElement(),s=getComputedStyle(e);return {opacity:s.opacity,filter:s.filter,scale:s.scale,transform:s.transform};};window.pinOthers=other;window.pinBefore=other.map(style);window.pinStyle=style;const e=marker.getElement().querySelector('.pin-face'),r=e.getBoundingClientRect(),a=marker.options.icon.options.iconAnchor;return {center:g.map.getCenter(),point:g.map.latLngToContainerPoint(marker.getLatLng()),tip:{x:r.x+a[0],y:r.y+a[1]},anchor:a};},id);
   await page.evaluate(async id=>(await guideReady).openPlaceSheet(id),id);await page.waitForTimeout(300);
   const after=await page.evaluate(async id=>{const g=await guideReady,m=g.markersById.get(id),e=m.getElement().querySelector('.pin-face'),r=e.getBoundingClientRect(),a=m.options.icon.options.iconAnchor;return {center:g.map.getCenter(),point:g.map.latLngToContainerPoint(m.getLatLng()),tip:{x:r.x+a[0]*1.25,y:r.y+a[1]*1.25},origin:getComputedStyle(e).transformOrigin,othersSame:JSON.stringify(window.pinBefore)===JSON.stringify(window.pinOthers.map(window.pinStyle))};},id);
   assert.deepEqual(after.center,before.center);assert.deepEqual(after.point,before.point);assert(Math.abs(after.tip.x-before.tip.x)<1&&Math.abs(after.tip.y-before.tip.y)<1);assert.equal(after.origin,before.anchor[0]+'px '+before.anchor[1]+'px');assert(after.othersSame);
   await page.locator('#sheetGrab').focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(async()=>(await guideReady).map.getCenter()),before.center);
   await page.evaluate(async()=>(await guideReady).closePlaceSheet(false));await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(async()=>(await guideReady).map.getCenter()),before.center);
 }
 console.log('PASS: selected pin tip and map center unchanged on selection/expansion/close; other pin styles unchanged; standard and shopping anchors');
 // Real pointer capture, touch swipes and keyboard alternative on the grab handle.
 await page.evaluate(async()=>{const g=await guideReady;g.setView('karta');g.openPlaceSheet('orsanmichele');});
 await page.waitForTimeout(300);
 const grab=page.locator('#sheetGrab'),sheet=page.locator('#placeSheet');
 if(await sheet.getAttribute('data-level')==='expanded'){await grab.focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);}
 const compact=(await sheet.boundingBox()).height;
 async function mouseDrag(delta){const r=await grab.boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+delta,{steps:8});await page.mouse.up();await page.waitForTimeout(450);}
 assert(await sheet.evaluate(e=>e.classList.contains('has-overflow')));assert.notEqual(await page.locator('#sheetBody').evaluate(e=>getComputedStyle(e).maskImage),'none');
 await page.screenshot({path:'/tmp/place-sheet-fade.png'});
 await mouseDrag(-150);assert.equal(await sheet.getAttribute('data-level'),'expanded');assert((await sheet.boundingBox()).height>compact+50);assert.equal(await page.locator('#sheetBody').evaluate(e=>getComputedStyle(e).maskImage),'none');
 await mouseDrag(150);assert(await sheet.isHidden());assert.equal(await page.locator('.selected-place-halo').count(),0);
 await page.evaluate(async()=>{(await guideReady).openPlaceSheet('orsanmichele');});await page.waitForTimeout(300);
 let cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 async function touchDrag(delta,target=grab){const r=await target.boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let step=1;step<=8;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+delta*step/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(450);}
 await touchDrag(-150);assert.equal(await sheet.getAttribute('data-level'),'expanded');
 // Scrolling the content must not collapse the sheet.
 const body=await page.locator('#sheetBody').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:body.x+body.width/2,y:body.y+body.height-30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:body.x+body.width/2,y:body.y+30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await sheet.getAttribute('data-level'),'expanded');
 await touchDrag(150);assert(await sheet.isHidden());
 await page.evaluate(async()=>{(await guideReady).openPlaceSheet('orsanmichele');});await page.waitForTimeout(300);
 assert((await grab.boundingBox()).height>=48);
 await touchDrag(-150,page.locator('#sheetTitle'));assert.equal(await sheet.getAttribute('data-level'),'expanded');
 await touchDrag(150,page.locator('#sheetTitle'));assert(await sheet.isHidden());
 await page.evaluate(async()=>{(await guideReady).openPlaceSheet('orsanmichele');});await page.waitForTimeout(300);
 await grab.tap();await page.waitForTimeout(300);assert.equal(await sheet.getAttribute('data-level'),'expanded');
 await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await grab.focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);assert.equal(await sheet.getAttribute('data-level'),'compact');
 await cdp.detach();
 // A downward swipe also dismisses short cards and the route information sheet.
 await page.evaluate(async()=>{const g=await guideReady;g.openPlaceSheet(g.content.places.find(p=>!g.storyContent.stories.some(s=>s.placeId===p.id)).id);});await page.waitForTimeout(300);await mouseDrag(100);assert(await sheet.isHidden());
 await page.evaluate(async()=>{const g=await guideReady;Object.values(g.dayRoutes)[0].getLayers()[0].fire('click');});await page.waitForTimeout(300);assert.equal(await page.locator('#sheetTitle').textContent(),'Om rutten');assert(await grab.isVisible());assert.equal(await page.locator('.selected-place-halo').count(),0);await mouseDrag(100);assert(await sheet.isHidden());
 await page.evaluate(async()=>{document.documentElement.style.fontSize='32px';const g=await guideReady;g.setView('karta');g.showPlaceOnMap('san-miniato-al-monte');});
 await page.waitForSelector('#placeSheet');
 await grab.focus();await page.keyboard.press('Enter');
 await page.waitForTimeout(300);
 assert.equal(await page.locator('#sheetBody').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
 assert(await page.locator('#sheetBody .sheet-actions').evaluate(e=>{const rects=[...e.children].map(b=>b.getBoundingClientRect());return rects.every(r=>r.width>=44&&r.height>=44&&Math.abs(r.top-rects[0].top)<1&&r.right<=innerWidth&&r.left>=0);}));
 assert.equal(await page.locator('#sheetBody .story-sources > summary').textContent(),'Läs vidare');
 const rect=await page.locator('#placeSheet').boundingBox();assert(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=391&&rect.y+rect.height<=845);
 assert(await page.locator('#sheetBody').evaluate(e=>e.scrollHeight>e.clientHeight));
 await page.screenshot({path:'/tmp/place-sheet-large-text.png'});
 await page.keyboard.press('Escape');assert(await page.locator('#placeSheet').isHidden());
 await page.evaluate(async()=>{document.documentElement.style.fontSize='16px';const g=await guideReady;g.showPlaceOnMap('orsanmichele');});await page.waitForSelector('#placeSheet');
 await grab.focus();await page.keyboard.press('Enter');
 await page.waitForTimeout(300);
 await page.screenshot({path:'/tmp/place-sheet-story.png'});
 await page.click('#sheetClose');assert(await page.locator('#placeSheet').isHidden());
 // Real marker click, keyboard close and no duplicate popup.
 await page.evaluate(async()=>{const g=await guideReady;g.map.setView(g.markersById.get('orsanmichele').getLatLng(),16,{animate:false});});
 await page.evaluate(async()=>{const g=await guideReady;g.markersById.get('orsanmichele').getElement().click();});await page.waitForSelector('#placeSheet');
 assert.equal(await page.locator('.leaflet-popup').count(),0);
 await page.keyboard.press('Escape');assert(await page.locator('#placeSheet').isHidden());

 // Days/routes are opened from the second map button; dragging down closes.
 cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 await page.evaluate(async()=>{const g=await guideReady;g.closePlaceSheet(false);g.setView('karta');g.chooseDay('thu');});
 const daySheet=page.locator('#guide'),dayHandle=page.locator('#dayGuideGrab');
 assert(await daySheet.isHidden());await page.locator('#routeToggle').tap();await page.waitForTimeout(300);
 assert.equal(await daySheet.getAttribute('data-level'),'expanded');assert.equal(await page.locator('#dayGuideContent').evaluate(e=>e.inert),false);
 await page.selectOption('#routeSelect','wed');assert.equal(await daySheet.getAttribute('data-level'),'expanded');
 await touchDrag(130,dayHandle);assert(await daySheet.isHidden());await page.locator('#routeToggle').tap();await page.waitForTimeout(300);
 for(const size of sizes){await page.setViewportSize(size);await page.waitForTimeout(250);const r=await daySheet.boundingBox();assert(r.x>=0&&r.x+r.width<=size.width+1&&r.y>=0&&r.y+r.height<=size.height+1);assert((await dayHandle.boundingBox()).height>=44);}
 await page.setViewportSize({width:390,height:844});await dayHandle.focus();await page.keyboard.press('Enter');assert(await daySheet.isHidden());
 await page.locator('#routeToggle').tap();await page.selectOption('#routeSelect','thu');await page.waitForTimeout(300);await page.screenshot({path:'/tmp/day-guide-expanded.png'});
 await page.evaluate(async()=>{const g=await guideReady;g.showPlaceOnMap('beppa-fioraia');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const selected=g.markersById.get('beppa-fioraia').getElement();const other=[...document.querySelectorAll('.leaflet-marker-icon')].find(e=>e!==selected);if(!document.getElementById('sheetBody').textContent.includes('peposo')||!document.getElementById('sheetBody').textContent.includes('12:30–14:30'))throw new Error('Missing hours/specialty');});
 await page.waitForTimeout(300);assert.equal(await page.locator('.is-selected > .pin-face').evaluate(e=>getComputedStyle(e).transform),'matrix(1.25, 0, 0, 1.25, 0, 0)');assert(await page.locator('.registry-pin:not(.is-selected)').first().evaluate(e=>Number(getComputedStyle(e).opacity)===1));
 await page.evaluate(async()=>{const g=await guideReady;g.closePlaceSheet(false);if(document.querySelector('.is-selected'))throw new Error('Pin state not cleared');g.setView('sevardheter');});
 assert((await page.locator('[data-place-card="beppa-fioraia"]').textContent()).includes('peposo'));
 console.log('PASS: day-guide touch up/down, tap and keyboard, native day selection, persistent state, compact height and screen bounds; structured hours/specialties in map and list; selected pin scaling/reset; other pins unchanged');
 // Appearance follows OS changes live; every surface shares the same theme.
 const positions=await page.evaluate(async()=>[...(await guideReady).markersById].map(([id,m])=>[id,m.getLatLng().lat,m.getLatLng().lng]));
 for(const colorScheme of ['dark','light']){
  await page.emulateMedia({colorScheme});
  for(const size of sizes){
   await page.setViewportSize(size);
   await page.evaluate(async()=>{const g=await guideReady;g.closePlaceSheet(false);g.setView('karta');g.chooseDay(g.guide.defaultSelection.id);});
   await page.waitForTimeout(100);
   await page.evaluate(()=>{for(const id of ['viewTabs','guide']){const r=document.getElementById(id).getBoundingClientRect();if(r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1)throw new Error('Navigation overflow '+id);}for(const b of document.querySelectorAll('#viewTabs button,.leaflet-bar a,.leaflet-bar button,.leaflet-control-layers-toggle')){const r=b.getBoundingClientRect();if(r.width<44||r.height<44||r.left<0||r.right>innerWidth+1)throw new Error('Small navigation target');}});
   await page.evaluate(async()=>{(await guideReady).showPlaceOnMap('orsanmichele');});await page.waitForTimeout(300);
   assert.equal(await page.locator('.leaflet-tile-pane').evaluate(e=>getComputedStyle(e).filter==='none'),colorScheme==='light');
   for(const view of ['schema','sevardheter']){await page.evaluate(async view=>(await guideReady).setView(view),view);assert.equal(await page.locator('#listView').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);}
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(async()=>{const g=await guideReady;g.setView('schema');});
  // Check ordinary text and action labels against their opaque backgrounds.
  const ratios=await page.evaluate(()=>{
   const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
   return ['#listView','.list-card','.list-action','.list-card [data-action="walking"]','.list-card [data-action="maps"]'].map(selector=>{const s=getComputedStyle(document.querySelector(selector)),a=luminance(s.color),b=luminance(s.backgroundColor);return {selector,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}});
  });for(const r of ratios)assert(r.ratio>=4.5,JSON.stringify({colorScheme,...r}));
  await page.locator('#schemaPanel h1').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/navigation-'+colorScheme+'-schema.png'});
  await page.evaluate(async()=>{const g=await guideReady;g.setView('karta');g.chooseDay('wed');});await page.waitForTimeout(200);await page.screenshot({path:'/tmp/navigation-'+colorScheme+'-map.png'});
  await page.evaluate(async()=>{(await guideReady).showPlaceOnMap('orsanmichele');});await page.waitForTimeout(300);await grab.focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);await page.locator('#sheetTitle').focus();await page.screenshot({path:'/tmp/navigation-'+colorScheme+'-place.png'});
 }
 assert.deepEqual(await page.evaluate(async()=>[...(await guideReady).markersById].map(([id,m])=>[id,m.getLatLng().lat,m.getLatLng().lng])),positions);
 await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce',contrast:'more'});assert.equal(await page.locator('#viewTabs').evaluate(e=>getComputedStyle(e).backdropFilter),'none');assert.equal(await page.locator('#tab-karta').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 await page.emulateMedia({colorScheme:'light',reducedMotion:'no-preference',contrast:'no-preference'});
 assert.deepEqual(errors,[]);console.log('PASS: existing map/list/flight flows, all marked place sheets and all shared stories at five mobile/tablet sizes, 200% text, drag up to expand/down to close, touch tap and keyboard toggle, route sheet dismissal, fading overflow, bounds/vertical scroll, marker click and keyboard close, unchanged canonical navigation');console.log('PASS: live OS light/dark switching for map, cards, lists and controls at five screen sizes; text contrast >=4.5; 44px navigation targets; reduced motion/high contrast; marker coordinates unchanged');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
