// Issue #1: exercise production list filters and map grouping without remote assets.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {createRegistry}=require('../place-presentation.js');
const html=fs.readFileSync('index.html','utf8'),content=JSON.parse(fs.readFileSync('places.json')),guide=JSON.parse(fs.readFileSync('guide.json')),taxonomy=JSON.parse(fs.readFileSync('taxonomy.json'));
const ids=['campolmi-filati','mirko-filati','samba-mercerie','ricamo-cucito','merceria-delcor'];
const presentationRegistry=createRegistry(taxonomy),categories=guide.categories.map(c=>presentationRegistry.category(c.id)),placeCategories=categories.filter(c=>c.kind==='place'),bookedIds=guide.bookings.map(b=>b.placeId);
const requirePlace=id=>content.places.find(p=>p.id===id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sub=taxonomy.subcategories.find(s=>s.id==='yarn-haberdashery');assert.equal(sub.categoryId,'shopping');assert.equal(sub.iconId,'yarn');
for(const id of ids){const p=requirePlace(id);assert(p,id);assert.equal(p.category,'shopping');assert.equal(p.subcategory,sub.id);assert.equal(presentationRegistry.iconId(p),'yarn');assert(p.address&&p.position);assert(p.openingHours.sources.length);if(!p.verification.checks.placeLink)assert.notEqual(p.verification.status,'verified','Unverified Apple link must stay explicit: '+id);assert.equal(guide.discoveryAreas.filter(a=>a.placeIds.includes(id)).length,1);assert(!bookedIds.includes(id));assert(!JSON.parse(fs.readFileSync('routes.json')).routes.some(r=>r.segments.some(s=>s.placeIds.includes(id))));}
for(const scheme of ['light','dark'])assert(presentationRegistry.themeCSS().includes('--category-shopping:'+presentationRegistry.category('shopping').colors[scheme]));

// Provide only the DOM boundary used by the real renderer; HTML/icons are production output.
const nodes={placeList:{innerHTML:''},placeCount:{textContent:''},placesPanel:{dataset:{}}},buttons=categories.map(c=>({dataset:{category:c.id},setAttribute(){}}));
let filterClick;
const filterBox={querySelectorAll:()=>buttons,addEventListener(type,handler){assert.equal(type,'click');filterClick=handler;}};
const listCategorySelection=new Set(categories.map(c=>c.id));
const context={content,guide,categories,placeCategories,presentationRegistry,bookedIds,markerPresentation:guide.presentation.placeOverrides,requirePlace,esc,filterBox,listCategorySelection,expandedPlaces:new Set(),placesMode:'overview',renderedPlacesMode:'overview',placesGrouping:'overview',placeIcon:p=>presentationRegistry.symbol(p),categoryIcon:id=>presentationRegistry.categorySymbol(id),placeFacts:()=>'',storyMarkup:()=>'',listActions:()=>'',document:{getElementById:id=>nodes[id],querySelectorAll:()=>[]}};
const visible=html.match(/function placeVisible\(place\)\{[^\n]+/)[0],start=html.indexOf('function renderPlaceList(){'),end=html.indexOf("\ndocument.getElementById('placeList').addEventListener('toggle'",start),handler=html.match(/filterBox\.addEventListener\('click',event=>\{[^\n]+/)[0];
vm.createContext(context);vm.runInContext(visible+'\n'+html.slice(start,end)+'\n'+handler,context);
const selectOnly=category=>{listCategorySelection.clear();listCategorySelection.add(category);};
for(const mode of ['overview','area','reading']){
 context.placesMode=mode;context.placesGrouping=mode==='area'?'area':'overview';
 selectOnly('shopping');vm.runInContext('renderPlaceList()',context);
 const rendered=[...nodes.placeList.innerHTML.matchAll(/data-place-card="([^"]+)"/g)].map(m=>m[1]);
 for(const id of ids){assert(rendered.includes(id),mode+': Shopping omits '+id);assert(nodes.placeList.innerHTML.includes('data-place-card="'+id+'" data-category="shopping"'));}
 assert.equal((nodes.placeList.innerHTML.match(/data-icon="yarn"/g)||[]).length,5);
 filterClick({target:{closest:()=>({dataset:{category:'shopping'}})}});assert.equal((nodes.placeList.innerHTML.match(/data-place-card=/g)||[]).length,0);
 filterClick({target:{closest:()=>({dataset:{category:'shopping'}})}});for(const id of ids)assert(nodes.placeList.innerHTML.includes('data-place-card="'+id+'"'));
 selectOnly('craft');vm.runInContext('renderPlaceList()',context);for(const id of ids)assert(!nodes.placeList.innerHTML.includes('data-place-card="'+id+'"'));
}

// Run the production marker loop with layer doubles; it must add these pins to Shopping.
const layer=()=>({ids:[]}),m=layer(),groups=Object.fromEntries(categories.map(c=>[c.id,layer()])),markersById=new Map();groups.hotel=layer();
const mapContext={content,guide,groups,m,bookedIds,bookedGroup:groups.booked,markersById,markerPresentation:guide.presentation.placeOverrides,presentationRegistry,coordinates:p=>[p.position.latitude,p.position.longitude],openPlaceSheet:()=>{},document:{},L:{divIcon:options=>({options}),marker(coords,options){return {on(){return this;},bindTooltip(){return this;},addTo(group){group.ids.push(this.placeId);return this;},options,coords};}}};
vm.createContext(mapContext);const mapStart=html.indexOf('content.places.forEach(place=>{'),mapEnd=html.indexOf('var layerControl=',mapStart);assert(mapStart>=0&&mapEnd>mapStart);vm.runInContext(html.slice(mapStart,mapEnd),mapContext);
for(const id of ids){assert(groups.shopping.ids.includes(id),'Wrong map layer: '+id);assert(!groups.craft.ids.includes(id));const marker=markersById.get(id),pin=marker.options.icon.options;assert(pin.html.includes('data-icon="yarn"'));assert.deepEqual(pin.iconSize,[35,45]);assert.deepEqual(pin.iconAnchor,[17,42]);assert.deepEqual(marker.coords,[requirePlace(id).position.latitude,requirePlace(id).position.longitude]);}
console.log('PASS: issue #1 — all five shops in Shopping list filters (category/area/reading) and map layer, common yarn icons/colors, unchanged anchors, areas, routes and bookings.');
