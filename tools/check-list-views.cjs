// UI integration checks; requires Playwright with Chromium installed.
const fs=require('fs'),http=require('http'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const executablePath=process.env.BROWSER_EXECUTABLE_PATH;
 const server=http.createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;const file=path==='/'?'index.html':path.slice(1);if(!fs.existsSync(file)){res.writeHead(404);return res.end()};res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/plain');res.end(fs.readFileSync(file))}).listen(8765,'127.0.0.1');
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,ignoreHTTPSErrors:true});
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
 const guide=JSON.parse(fs.readFileSync('guide.json'));
 assert.equal(await page.locator('[data-flight]').count(),guide.flights.length);
 for(const flight of guide.flights){const card=page.locator('[data-flight="'+flight.id+'"]');assert.equal(await card.count(),1);assert.equal(await card.locator('xpath=..').getAttribute('data-day'),flight.dayId);const text=await card.textContent();for(const value of [flight.flightNumber,flight.operator,flight.departure.airportCode,flight.arrival.airportCode,flight.departure.at.slice(11,16),flight.arrival.at.slice(11,16)])assert(text.includes(value));}
 assert((await page.locator('[data-flight="outbound-stockholm-vienna"]').textContent()).includes('30 min'));
 for(const flight of guide.flights){const text=await page.locator('[data-flight="'+flight.id+'"]').textContent();if(flight.departure.terminal)assert(text.includes(flight.operator+' · Terminal '+flight.departure.terminal));else assert(!text.includes('Terminal'));}
 assert(await page.locator('[data-day="sat"]').evaluate(e=>Boolean(e.querySelector('.list-program').compareDocumentPosition(e.querySelector('[data-flight]'))&Node.DOCUMENT_POSITION_FOLLOWING)));
 assert((await page.locator('[data-day="tue"] .list-program').textContent()).includes('upptäck Florens'));
 assert.equal(await page.locator('[data-day="tue"] .list-program [data-place="serre-torrigiani-in-piazzetta"]').count(),1);
 await page.locator('[data-day="tue"] .list-program [data-place="serre-torrigiani-in-piazzetta"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'karta');await page.waitForSelector('#placeSheet');assert((await page.locator('#sheetTitle').textContent()).includes('Serre Torrigiani'));await page.click('#tab-schema');assert(await page.locator('#placeSheet').isHidden());
 await page.locator('[data-flight="return-florence-stockholm"]').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/return-flight-check.png'});
 await page.locator('#schemaPanel h1').scrollIntoViewIfNeeded();
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
 await page.locator('[data-place-card="beppa-fioraia"] [data-show-place]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'karta');await page.waitForSelector('#placeSheet');assert((await page.locator('#sheetTitle').textContent()).includes('Beppa Fioraia'));
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
   for(const place of g.content.places){g.openPlaceSheet(place.id);await frame();bounds();for(const mode of ['walking','transit','driving'])if(document.querySelector('[data-action="'+mode+'"]').href!==PlacesValidator.appleDirectionsLink(place,mode))throw new Error('Wrong navigation');if(document.querySelector('[data-action="maps"]').href!==PlacesValidator.applePlaceLink(place))throw new Error('Wrong map link');if(Boolean(document.querySelector('[data-action="website"]'))!==Boolean(place.website))throw new Error('Missing website');if(place.website&&document.querySelector('[data-action="website"]').href!==place.website)throw new Error('Wrong website');if(document.querySelector('[data-action="ask"]').dataset.askPlace!==place.id)throw new Error('Wrong ChatGPT target');const more=document.querySelector('#sheetBody .sheet-more');if(document.getElementById('sheetGrab').hidden!==!more)throw new Error('Empty more-info choice');if(more&&more.querySelector('summary').textContent!=='Mer om platsen')throw new Error('Misleading information label');if(document.querySelectorAll('#sheetBody > details').length>1)throw new Error('Multiple information sections');if(document.querySelectorAll('#sheetBody .story-copy details:not(.story-sources)').length)throw new Error('Nested story disclosure');}
   for(const story of g.storyContent.stories){g.openPlaceSheet(story.placeId);document.querySelector('#sheetBody [data-story]').open=true;document.querySelector('#sheetBody .sheet-more').open=true;await frame();bounds();const text=document.querySelector('#sheetBody .story-copy').textContent;if(!text.includes(story.title)||!text.includes(story.lookFor)||!story.paragraphs.every(p=>text.includes(p)))throw new Error('Story text mismatch');}
   g.closePlaceSheet(false);g.setView('sevardheter');
   if(document.querySelectorAll('#placeList [data-story]').length!==g.storyContent.stories.length)throw new Error('Missing list story');
   for(const story of g.storyContent.stories){const details=document.querySelector('#placeList [data-story="'+story.placeId+'"]');details.open=true;if(!details.textContent.includes(story.lookFor))throw new Error('List story mismatch');}
   await frame();const panel=document.getElementById('placesPanel');if(panel.scrollWidth>panel.clientWidth+1)throw new Error('List overflow');
  });
 }
 await page.setViewportSize({width:390,height:844});
 // Real pointer capture, touch swipes and keyboard alternative on the grab handle.
 await page.evaluate(async()=>{const g=await guideReady;g.setView('karta');g.openPlaceSheet('orsanmichele');});
 await page.waitForTimeout(300);
 const grab=page.locator('#sheetGrab'),sheet=page.locator('#placeSheet');
 if(await sheet.getAttribute('data-level')==='expanded'){await grab.focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);}
 const compact=(await sheet.boundingBox()).height;
 async function mouseDrag(delta){const r=await grab.boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+delta,{steps:8});await page.mouse.up();await page.waitForTimeout(450);}
 await mouseDrag(-150);assert.equal(await sheet.getAttribute('data-level'),'expanded');assert((await sheet.boundingBox()).height>compact+50);assert(await page.locator('#sheetBody [data-story]').evaluate(e=>e.open));
 await mouseDrag(150);assert.equal(await sheet.getAttribute('data-level'),'compact');assert(!await page.locator('#sheetBody [data-story]').evaluate(e=>e.open));
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 async function touchDrag(delta,target=grab){const r=await target.boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let step=1;step<=8;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+delta*step/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(450);}
 await touchDrag(-150);assert.equal(await sheet.getAttribute('data-level'),'expanded');
 // Scrolling the content must not collapse the sheet.
 const body=await page.locator('#sheetBody').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:body.x+body.width/2,y:body.y+body.height-30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:body.x+body.width/2,y:body.y+30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await sheet.getAttribute('data-level'),'expanded');
 await touchDrag(150);assert.equal(await sheet.getAttribute('data-level'),'compact');
 assert((await grab.boundingBox()).height>=48);
 await touchDrag(-150,page.locator('#sheetTitle'));assert.equal(await sheet.getAttribute('data-level'),'expanded');
 await touchDrag(150,page.locator('#sheetTitle'));assert.equal(await sheet.getAttribute('data-level'),'compact');
 await grab.tap();await page.waitForTimeout(300);assert.equal(await sheet.getAttribute('data-level'),'expanded');
 await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await grab.focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);assert.equal(await sheet.getAttribute('data-level'),'compact');
 await cdp.detach();
 await page.evaluate(async()=>{document.documentElement.style.fontSize='32px';const g=await guideReady;g.setView('karta');g.showPlaceOnMap('san-miniato-al-monte');});
 await page.waitForSelector('#placeSheet');
 if(!await page.locator('#sheetBody [data-story]').evaluate(e=>e.open))await page.locator('#sheetBody [data-story] summary').first().click();
 await page.waitForTimeout(300);
 assert.equal(await page.locator('#sheetBody').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
 assert(await page.locator('.sheet-actions').evaluate(e=>{const rects=[...e.children].map(b=>b.getBoundingClientRect());return rects.every(r=>r.width>=44&&r.height>=44&&Math.abs(r.top-rects[0].top)<1&&r.right<=innerWidth&&r.left>=0);}));
 assert.equal(await page.locator('#sheetBody .story-sources > summary').textContent(),'Läs vidare');
 const rect=await page.locator('#placeSheet').boundingBox();assert(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=391&&rect.y+rect.height<=845);
 assert(await page.locator('#sheetBody').evaluate(e=>e.scrollHeight>e.clientHeight));
 await page.screenshot({path:'/tmp/place-sheet-large-text.png'});
 await page.keyboard.press('Escape');assert(await page.locator('#placeSheet').isHidden());
 await page.evaluate(async()=>{document.documentElement.style.fontSize='16px';const g=await guideReady;g.showPlaceOnMap('orsanmichele');});await page.waitForSelector('#placeSheet');
 if(!await page.locator('#sheetBody [data-story]').evaluate(e=>e.open))await page.locator('#sheetBody [data-story] summary').first().click();
 await page.waitForTimeout(300);
 await page.screenshot({path:'/tmp/place-sheet-story.png'});
 await page.click('#sheetClose');assert(await page.locator('#placeSheet').isHidden());
 // Real marker click, keyboard close and no duplicate popup.
 await page.evaluate(async()=>{const g=await guideReady;g.map.setView(g.markersById.get('orsanmichele').getLatLng(),16,{animate:false});});
 await page.evaluate(async()=>{const g=await guideReady;g.markersById.get('orsanmichele').getElement().click();});await page.waitForSelector('#placeSheet');
 assert.equal(await page.locator('.leaflet-popup').count(),0);
 await page.keyboard.press('Escape');assert(await page.locator('#placeSheet').isHidden());
 assert.deepEqual(errors,[]);console.log('PASS: existing map/list/flight flows, 69 sheets and 13 shared stories at five mobile/tablet sizes, 200% text, mouse/touch drag in both directions, touch tap and keyboard toggle, no empty information choices, bounds/vertical scroll, marker click and keyboard close, unchanged canonical navigation');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
