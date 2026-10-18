const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(fs.readFileSync('places-validator.js','utf8'));
const schemas={},documents={};
for(const name of ['places','routes','guide','stories','history','taxonomy','app-config']){documents[name]=JSON.parse(fs.readFileSync(name+'.json'));assert.equal(documents[name].$schema,'./'+name+'.schema.v'+documents[name].schemaVersion+'.json');schemas[name]=JSON.parse(fs.readFileSync(documents[name].$schema));}
const validate=d=>PlacesValidator.validateTrip(schemas,d);
validate(documents);
const cases=[
 d=>d['app-config'].bookingCategoryId='missing-category',
 d=>d['app-config'].assistantQuestionTemplate='No placeholders',
 d=>d.places.places[0].category=d['app-config'].bookingCategoryId,
 d=>d.taxonomy.categories.push(d.taxonomy.categories[0]),
 d=>d.taxonomy.subcategories.push(d.taxonomy.subcategories[0]),
 d=>d.taxonomy.categories[0].colors.light='red',
 d=>d.taxonomy.categories[0].iconId='missing-icon',
 d=>d.taxonomy.subcategories[0].categoryId='missing-category',
 d=>d.taxonomy.subcategories[0].iconId='missing-icon',
 d=>d.taxonomy.icons.church=['<script>'],
 d=>d.places.places[1].subcategory='ice-cream',
 d=>d.places.places[0].subcategory='not-defined',

 d=>d.places.places[0].subcategory='',
 d=>d.places.places[0].subcategory='x'.repeat(81),
 d=>d.places.places[0].focus='',
 d=>d.places.places[0].focus='x'.repeat(161),
 d=>d.guide.discoveryAreas.push(d.guide.discoveryAreas[0]),
 d=>d.guide.discoveryAreas[0].placeIds[0]='unknown-place',
 d=>d.guide.discoveryAreas[1].placeIds.push(d.guide.discoveryAreas[0].placeIds[0]),
 d=>d.guide.discoveryAreas[0].placeIds.shift(),

 d=>delete d.history.chapters[1].images[0].credit,
 d=>delete d.history.chapters[1].images[0].licenseUrl,
 d=>d.history.chapters[1].images[0].src='../unsafe.webp',
 d=>d.history.chapters[1].images[0].afterParagraph=4,
 d=>d.history.chapters[1].images[0].alt='',
 d=>d.history.chapters[1].images[0].caption='',

 d=>d.history.chapters.push(d.history.chapters[0]),
 d=>d.history.chapters[0].placeIds[0]='unknown-place',
 d=>d.history.chapters[0].placeIds.push(d.history.chapters[0].placeIds[0]),
 d=>d.history.chapters[0].sources=[],
 d=>d.history.chapters[0].sources[0].url='javascript:alert(1)',
 d=>d.history.schemaVersion=3,
 d=>d.history.contentVersion=0,
 d=>d.stories.stories=d.stories.stories.filter(s=>s.placeId!==d.history.chapters[0].placeIds[0]),

 d=>d.places.schemaVersion=1,
 d=>d.places.places.find(p=>p.openingHours.status==='published').openingHours.sources=[],
 d=>d.places.places.find(p=>p.openingHours.status==='published').openingHours.weekly[0].intervals[0].opens='25:00',
 d=>d.places.places.find(p=>p.openingHours.status==='published').openingHours.weekly[0].intervals[0].closes=d.places.places.find(p=>p.openingHours.status==='published').openingHours.weekly[0].intervals[0].opens,
 d=>d.places.places[0].openingHours.timeZone='invalid',
 d=>d.places.places.find(p=>p.specialties).specialties.sources=[],
 d=>d.places.places.find(p=>p.specialties).specialties.sources[0].url='javascript:alert(1)',
 d=>d.places.places.find(p=>p.openingHours.weekly.some(r=>r.validUntil)).openingHours.weekly.find(r=>r.validUntil).validUntil='2020-01-01',
 d=>d.places.places.find(p=>p.openingHours.exceptions.length).openingHours.exceptions[0].status='changed',

 d=>d.stories.stories.push(d.stories.stories[0]),
 d=>d.stories.stories[0].placeId='unknown-place',
 d=>d.stories.stories[0].sources=[],
 d=>d.stories.stories[0].sources[0].url='javascript:alert(1)',
 d=>d.stories.schemaVersion=2,
 d=>d.guide.flights.push(d.guide.flights[0]),
 d=>d.guide.flights[0].dayId='unknown',
 d=>d.guide.flights[0].arrival.at=d.guide.flights[0].departure.at,
 d=>d.guide.flights[0].departure.timeZone='Europe/London',
 d=>d.guide.flights[0].departure.at='2026-10-12T10:05:00+02:00',
 d=>d.guide.flights[0].departure.airportCode='?',
 d=>d.guide.flights[0].bookingReference='private',

 d=>d.places.places[0].appleMaps.placeId='I123',
 d=>d.places.places[0].appleMaps.placeUrl='https://example.com/place?place-id='+d.places.places[0].appleMaps.placeId,
 d=>d.places.places[0].position.longitude+=0.001,
 d=>d.places.places[0].verification.sources=d.places.places[0].verification.sources.filter(s=>!s.supports.includes('navigation')),

 d=>d.places.places.push(d.places.places[0]),
 d=>d.places.places[0].position.latitude=91,
 d=>{d.places.places[0].verification.status='verified';d.places.places[0].verification.checks.navigation=false},
 d=>d.routes.contentVersion=0,
 d=>d.places.places[0].website='javascript:alert(1)',
 d=>d.places.places[0].position.extra=1,
 d=>d.routes.routes[0].segments[0].placeIds[0]='missing-place',
 d=>d.routes.routes[0].segments[0].mode='fly',
 d=>d.routes.routes.push(d.routes.routes[0]),
 d=>d.routes.routes[0].segments.push(d.routes.routes[0].segments[0]),
 d=>d.guide.days[0].routeIds=['missing-route'],
 d=>d.guide.days[1].date=d.guide.days[0].date,
 d=>d.guide.days[1].id=d.guide.days[0].id,
 d=>d.guide.bookings[0].placeId='missing-place',
 d=>d.guide.bookings[0].startsAt='2027-01-01T12:00:00+01:00',
 d=>d.guide.defaultSelection.program[0].nodes.push({type:'place',placeId:'missing-place',text:'Unknown'}),
 d=>d.guide.presentation.placeOverrides.unknown=d.guide.presentation.placeOverrides['hotel-la-scaletta'],
 d=>d.guide.timeZone='not-a-timezone',
 d=>d.guide.categories=d.guide.categories.filter(c=>c.id!=='craft'),
 d=>d.guide.defaultSelection.id=d.guide.days[0].id,
 d=>d.guide.days[0].program[0].nodes.push({type:'html',text:'<script>'}),
 d=>d.routes.schemaVersion=2,
 d=>d.guide.contentVersion=0
];
for(const mutate of cases){const bad=structuredClone(documents);mutate(bad);assert.throws(()=>validate(bad));}
// Independent content versions do not change schema compatibility.
const independent=structuredClone(documents);independent.guide.contentVersion=7;independent.routes.contentVersion=3;validate(independent);
// A different trip uses the same schemas and renderer contract.
const next=structuredClone(documents);next.guide.id='next-trip';next.guide.title='Nästa resa';next.guide.destination={name:'Annan stad',searchSuffix:'Annan stad'};next.guide.map.center={latitude:59.3,longitude:18.1};next.guide.days.forEach((day,i)=>{day.id='day-'+(i+1);day.date='2027-01-'+(13+i)});next.guide.bookings.forEach(b=>b.startsAt=b.startsAt.replace('2026-10','2027-01'));next.guide.flights=[];validate(next);
assert(!/Florens|Firenze|2026-10|hotel-la-scaletta|routeDefinitions/.test(fs.readFileSync('index.html','utf8')));
console.log(`PASS: seven schemas; ${documents.places.places.length} places, ${documents.routes.routes.length} routes, ${documents.guide.days.length} days, ${documents.guide.bookings.length} bookings, ${documents.stories.stories.length} stories; ${documents.history.chapters.length} history chapters; ${cases.length} invalid-input cases; independent versions and reusable trip content`);

for(const place of documents.places.places){
 const url=new URL(PlacesValidator.applePlaceLink(place));assert.equal(url.hostname,'maps.apple.com');assert.equal(url.pathname,'/place');
 if(place.verification.checks.placeLink){assert.equal(url.searchParams.get('place-id'),place.appleMaps.placeId)}else{assert.equal(url.searchParams.get('coordinate'),place.position.latitude+','+place.position.longitude);assert.equal(url.searchParams.get('name'),place.name)}
 for(const mode of ['walking','transit','driving']){const u=new URL(PlacesValidator.appleDirectionsLink(place,mode));assert.equal(u.pathname,'/directions');assert.equal(u.searchParams.get('mode'),mode);assert.equal(u.searchParams.get('destination'),place.position.latitude+','+place.position.longitude);if(place.verification.checks.placeLink&&place.verification.checks.position)assert.equal(u.searchParams.get('destination-place-id'),place.appleMaps.placeId);else assert(!u.searchParams.has('destination-place-id'));}
}
assert.throws(()=>PlacesValidator.appleDirectionsLink(documents.places.places[0],'flying'));
const entrance=structuredClone(documents.places.places[0]);entrance.entrance={position:{latitude:43.7,longitude:11.2}};const toEntrance=new URL(PlacesValidator.appleDirectionsLink(entrance,'walking'));assert.equal(toEntrance.searchParams.get('destination'),'43.7,11.2');assert(!toEntrance.searchParams.has('destination-place-id'));
console.log(`PASS: all ${documents.places.places.length} place links and ${documents.places.places.length*3} navigation links, coordinate fallbacks, entrance preference, place-id/source/position consistency`);

const legacy=structuredClone(documents);legacy.guide.categories.forEach(c=>c.label=documents.taxonomy.categories.find(t=>t.id===c.id).label);Object.values(legacy.guide.presentation.placeOverrides).forEach(p=>{delete p.markerGeometry;p.icon=null});legacy.guide.schemaVersion=1;legacy.guide.$schema='./guide.schema.v1.json';delete legacy.guide.discoveryAreas;delete legacy.guide.flights;delete legacy.guide.defaultSelection.summary;legacy.guide.days.forEach(d=>delete d.summary);PlacesValidator.validateTrip({...schemas,guide:JSON.parse(fs.readFileSync('guide.schema.v1.json'))},legacy);console.log('PASS: flight validation and legacy guide schema v1 compatibility');

const legacyHistory=structuredClone(documents);legacyHistory.history.schemaVersion=1;legacyHistory.history.$schema='./history.schema.v1.json';legacyHistory.history.chapters.forEach(c=>delete c.images);PlacesValidator.validateTrip({...schemas,history:JSON.parse(fs.readFileSync('history.schema.v1.json'))},legacyHistory);console.log('PASS: legacy history schema v1 compatibility');
for(const chapter of documents.history.chapters)for(const image of chapter.images||[])assert(fs.statSync(image.src).size>0,'Missing history image: '+image.src);

const previousGuide=structuredClone(documents);previousGuide.guide.categories.forEach(c=>c.label=documents.taxonomy.categories.find(t=>t.id===c.id).label);Object.values(previousGuide.guide.presentation.placeOverrides).forEach(p=>{delete p.markerGeometry;p.icon=null});previousGuide.guide.schemaVersion=3;previousGuide.guide.$schema='./guide.schema.v3.json';delete previousGuide.guide.discoveryAreas;PlacesValidator.validateTrip({...schemas,guide:JSON.parse(fs.readFileSync('guide.schema.v3.json'))},previousGuide);console.log('PASS: discovery areas cover every place exactly once and guide schema v3 compatibility');

const previousPlaces=structuredClone(documents);previousPlaces.places.schemaVersion=2;previousPlaces.places.$schema='./places.schema.v2.json';previousPlaces.places.places.forEach(p=>{delete p.focus;delete p.subcategory;});PlacesValidator.validateTrip({...schemas,places:JSON.parse(fs.readFileSync('places.schema.v2.json'))},previousPlaces);console.log('PASS: places schema v2 compatibility');

const v3Places=structuredClone(documents);v3Places.places.schemaVersion=3;v3Places.places.$schema='./places.schema.v3.json';v3Places.places.places.forEach(p=>delete p.subcategory);PlacesValidator.validateTrip({...schemas,places:JSON.parse(fs.readFileSync('places.schema.v3.json'))},v3Places);console.log('PASS: places schema v3 compatibility');


// Florence-specific regression for issue #1, using production filter and marker code.
require('./check-textile-shops.cjs');

const v5=structuredClone(documents);for(const name of ['places','guide']){v5[name].schemaVersion=5;v5[name].$schema='./'+name+'.schema.v5.json';}
PlacesValidator.validateTrip({...schemas,places:JSON.parse(fs.readFileSync('places.schema.v5.json')),guide:JSON.parse(fs.readFileSync('guide.schema.v5.json'))},v5);
console.log('PASS: legacy place and guide schema v5 compatibility');
