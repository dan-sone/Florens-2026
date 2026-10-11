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

 await page.click('#tab-historia');

 const historyData=JSON.parse(fs.readFileSync('history.json'));
 assert(!(await page.locator('#historyPanel').textContent()).includes('Läs berättelsen'));
 for(const chapter of historyData.chapters){const card=page.locator('[data-history-chapter="'+chapter.id+'"]');for(const id of chapter.placeIds)assert.equal(await card.locator('[data-show-place="'+id+'"]').count(),1);}
 const first=page.locator('[data-history-chapter]').first();
 await first.locator('.history-heading').tap();assert(await first.evaluate(e=>e.open));
 await first.locator('.history-heading').tap();assert(!(await first.evaluate(e=>e.open)));
 await first.locator('.history-heading').focus();await page.keyboard.press('Enter');assert(await first.evaluate(e=>e.open));
 await page.keyboard.press('Enter');assert(!(await first.evaluate(e=>e.open)));
 await page.evaluate(()=>document.querySelectorAll('.history-reading').forEach(d=>d.open=true));
 for(const chapter of historyData.chapters)for(const image of chapter.images||[]){
  const figure=page.locator('[data-history-chapter="'+chapter.id+'"] .history-image');
  const img=figure.locator('img');await img.scrollIntoViewIfNeeded();
  await img.evaluate(e=>e.decode());assert.equal(await img.getAttribute('alt'),image.alt);
  assert.deepEqual(await img.evaluate(e=>[e.naturalWidth,e.naturalHeight]),[image.width,image.height]);
  assert((await figure.textContent()).includes(image.caption));assert((await figure.textContent()).includes(image.credit));
  assert.equal(await figure.locator('a').first().getAttribute('href'),image.sourceUrl);
  assert.equal(await figure.locator('a').last().getAttribute('href'),image.licenseUrl);
  assert.equal(await img.evaluate(e=>getComputedStyle(e).objectFit),'contain');
  await page.screenshot({path:'/tmp/history-image-'+chapter.id+'.png'});
 }
 assert.equal(await page.locator('.history-image').count(),3);
 for(const chapter of historyData.chapters)for(const id of chapter.placeIds){
  await page.locator('[data-history-chapter="'+chapter.id+'"] [data-show-place="'+id+'"]').click();
  assert.equal(await page.locator('body').getAttribute('data-view'),'karta');
  await page.waitForFunction(async id=>(await guideReady).markersById.get(id).getElement().classList.contains('is-selected'),id);
  assert(await page.locator('#placeSheet').isVisible());
  assert.equal(await page.locator('#sheetTitle').textContent(),await page.evaluate(async id=>(await guideReady).placesById.get(id).name,id));
  assert.equal(await page.locator('.is-selected').count(),1);
  await page.click('#tab-historia');assert(await page.locator('[data-history-chapter="'+chapter.id+'"]').evaluate(e=>e.open));
 }
 for(const colorScheme of ['dark','light']){
  await page.emulateMedia({colorScheme});await page.waitForTimeout(250);
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:768,height:1024}]){
   await page.setViewportSize(size);
   await page.evaluate(()=>{document.querySelectorAll('#historyPanel details').forEach(d=>d.open=true);document.querySelectorAll('#historyPanel figcaption,#historyPanel .history-image-credit,#historyPanel h1,#historyPanel h2,#historyPanel h3,#historyPanel p,#historyPanel summary,#historyPanel .list-action,#historyPanel .history-place-name,#historyPanel .sheet-action[data-action=show]').forEach(e=>{if(!e.dataset.fontBefore)e.dataset.fontBefore=getComputedStyle(e).fontSize;e.style.fontSize=parseFloat(e.dataset.fontBefore)*2+'px';});});
   assert.equal(await page.locator('#historyPanel').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  }
  await page.evaluate(()=>document.querySelectorAll('#historyPanel [data-font-before]').forEach(e=>e.style.fontSize=''));await page.waitForTimeout(250);
  const ratios=await page.evaluate(()=>{
   const luminance=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2];};
   return ['.history-place-name','.sheet-action[data-action=show]','.history-heading','.history-card p'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);const bg=s.backgroundColor==='rgba(0, 0, 0, 0)'?getComputedStyle(e.closest('.list-card')).backgroundColor:s.backgroundColor;const raw=e.matches('.sheet-action')?s.backgroundColor:e.closest('.history-place-link')?getComputedStyle(e.closest('.history-place-link')).backgroundColor:bg;const parts=raw.match(/[\d.]+/g).map(Number),base=bg.match(/[\d.]+/g).map(Number),alpha=parts[3]??1;const resolved='rgb('+parts.slice(0,3).map((v,i)=>v*alpha+base[i]*(1-alpha)).join(',')+')';const a=luminance(s.color),b=luminance(resolved);return {selector,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}});
  });for(const r of ratios)assert(r.ratio>=4.5,JSON.stringify({colorScheme,...r}));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.querySelectorAll('#historyPanel details').forEach(d=>d.open=false);document.getElementById('listView').scrollTop=0});await page.waitForTimeout(250);await page.screenshot({path:'/tmp/history-'+colorScheme+'.png'});
 }
 await page.evaluate(()=>document.getElementById('listView').scrollTop=500);
 const before=await page.locator('#listView').evaluate(e=>e.scrollTop);
 await page.locator('#tab-historia').focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('body').getAttribute('data-view'),'sevardheter');
 await page.click('#tab-historia');assert.equal(await page.locator('#listView').evaluate(e=>e.scrollTop),before);
 assert.deepEqual(errors,[]);console.log('PASS: history view at 200% text across mobile/tablet/landscape, light/dark text and button contrast >=4.5, keyboard navigation and reading-position restoration.');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
