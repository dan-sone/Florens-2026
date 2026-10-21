// Browser regression checks using the generated offline guide and bundled assets.
const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
(async()=>{
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname);if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp'})[ext]||'application/octet-stream');fs.createReadStream(file).pipe(res);}).listen(8766,'127.0.0.1');
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
await page.goto('http://127.0.0.1:8766/offline/guide.html');await page.evaluate(()=>guideReady);await page.click('#tab-sevardheter');
const card=page.locator('[data-place-card="palazzo-medici-riccardi"]');await card.locator('.discovery-heading').click();
assert.equal(await card.locator('[data-action="show"]').count(),0);
assert.equal(await card.locator('.place-description').count(),0);
assert.equal((await card.textContent()).match(/Via Cavour 3/g).length,1);
await page.evaluate(async id=>(await guideReady).markersById.get(id).getElement().click(),await card.getAttribute('data-place-card'));
await page.waitForSelector('#placeSheet:not([hidden])');
assert.equal(await page.locator('.sheet-teaser').textContent(),await card.locator('.discovery-teaser').textContent());
assert.equal(await page.locator('#sheetBody [data-action="show"]').count(),0);
assert.equal(await page.locator('.sheet-copy').innerHTML(),await card.locator('.discovery-body').evaluate(body=>{const copy=body.cloneNode(true);copy.querySelector('.sheet-actions').remove();return copy.innerHTML;}));
await page.click('#sheetClose');await page.click('[data-places-mode="area"]');await page.waitForTimeout(600);
await page.evaluate(async()=>{const g=await guideReady;window.areaFits=[];const fit=g.map.fitBounds.bind(g.map);g.map.fitBounds=(bounds,options)=>{window.areaFits.push(bounds.getCenter());return fit(bounds,{...options,animate:false});};});
const sections=page.locator('[data-discovery-area]');await sections.nth(1).scrollIntoViewIfNeeded();await sections.nth(1).locator('h2').hover();await page.waitForTimeout(150);
assert(await page.evaluate(()=>window.areaFits.length>0));
const before=await page.evaluate(()=>window.areaFits.length);await sections.nth(2).scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert(await page.evaluate(before=>window.areaFits.length>before,before));
assert.deepEqual(errors,[]);console.log('PASS browser: shared card/popup content, action order, hover and scroll area following, no page errors');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
