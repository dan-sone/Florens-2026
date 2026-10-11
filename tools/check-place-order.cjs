// Run the production list renderer in a local DOM; no remote map assets needed.
const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const html=fs.readFileSync('index.html','utf8');const start=html.indexOf('function renderPlaceList(){');const end=html.indexOf("\ndocument.getElementById('placeList').addEventListener('toggle'",start);const renderer=html.slice(start,end);
 const guide=JSON.parse(fs.readFileSync('guide.json')),content=JSON.parse(fs.readFileSync('places.json'));
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{const page=await browser.newPage();await page.setContent('<section id="placesPanel"><div id="placeFilters"></div><div class="places-view-mode"><button data-places-mode="overview"></button><button data-places-mode="area"></button><button data-places-mode="reading"></button></div><p id="placeCount"></p><div id="placeList"></div></section>');
 const result=await page.evaluate(({renderer,guide,content})=>{
  const bookedIds=guide.bookings.map(b=>b.placeId),markerPresentation=guide.presentation.placeOverrides,filterBox=document.getElementById('placeFilters'),groups={},m={hasLayer:()=>true},expandedPlaces=new Set();let placesMode='overview',renderedPlacesMode='overview',placesGrouping='overview';
  const requirePlace=id=>content.places.find(p=>p.id===id),placeVisible=p=>p.category!=='hotel',esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const placeIcon=()=>'',categoryIcon=()=>'',placeFacts=()=>'',storyMarkup=()=>'',listActions=()=>'';
  const run=new Function('guide','content','bookedIds','markerPresentation','filterBox','groups','m','expandedPlaces','requirePlace','placeVisible','esc','placeIcon','categoryIcon','placeFacts','storyMarkup','listActions',`let placesMode='overview',renderedPlacesMode='overview',placesGrouping='overview';${renderer};return (mode,group)=>{placesMode=mode;placesGrouping=group;renderPlaceList()}`)(guide,content,bookedIds,markerPresentation,filterBox,groups,m,expandedPlaces,requirePlace,placeVisible,esc,placeIcon,categoryIcon,placeFacts,storyMarkup,listActions);
  return ['overview','area','reading'].flatMap(mode=>(mode==='reading'?['overview','area']: [mode]).map(group=>{run(mode,group);return {mode,group,open:document.querySelectorAll('[data-place-card][open]').length,subheadings:document.querySelectorAll('.discovery-subgroup').length,sections:[...document.querySelectorAll('.discovery-area')].map(section=>({category:section.dataset.discoveryCategory,area:section.dataset.discoveryArea,ids:[...section.querySelectorAll('[data-place-card]')].map(card=>card.dataset.placeCard)}))}}));
 },{renderer,guide,content});
 const eligible=content.places.filter(p=>p.category!=='hotel'),map=new Map(content.places.map(p=>[p.id,p])),booked=new Set(guide.bookings.map(b=>b.placeId)),ranks=new Map(guide.categories.map((c,i)=>[c.id,i]));const rank=p=>ranks.get(booked.has(p.id)?'booked':p.category);
 for(const view of result){const ids=view.sections.flatMap(s=>s.ids);assert.equal(new Set(ids).size,67);assert.deepEqual([...ids].sort(),eligible.map(p=>p.id).sort());assert.equal(view.subheadings,0);if(view.mode==='reading')assert.equal(view.open,67);
  for(const section of view.sections){if(section.area)assert.deepEqual([...section.ids].sort(),guide.discoveryAreas.find(a=>a.id===section.area).placeIds.filter(id=>id!=='hotel-la-scaletta').sort());for(let i=1;i<section.ids.length;i++){const a=map.get(section.ids[i-1]),b=map.get(section.ids[i]);assert(rank(a)<=rank(b));if(rank(a)===rank(b)){assert(a.subcategory.localeCompare(b.subcategory,'sv')<=0);if(a.subcategory===b.subcategory)assert(a.name.localeCompare(b.name,'sv')<=0);}}}
 }
 console.log('PASS: production renderer sorts category, subcategory and Swedish alphabetical names in category/area and both reading views; all 67 places, original groups and no extra headings.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
