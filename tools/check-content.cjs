const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(fs.readFileSync('places-validator.js','utf8'));
const schemas={},documents={};
for(const name of ['places','routes','guide','stories']){documents[name]=JSON.parse(fs.readFileSync(name+'.json'));assert.equal(documents[name].$schema,'./'+name+'.schema.v'+documents[name].schemaVersion+'.json');schemas[name]=JSON.parse(fs.readFileSync(documents[name].$schema));}
const validate=d=>PlacesValidator.validateTrip(schemas,d);
validate(documents);
const cases=[
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
console.log(`PASS: four schemas; ${documents.places.places.length} places, ${documents.routes.routes.length} routes, ${documents.guide.days.length} days, ${documents.guide.bookings.length} bookings, ${documents.stories.stories.length} stories; ${cases.length} invalid-input cases; independent versions and reusable trip content`);

for(const place of documents.places.places){
 const url=new URL(PlacesValidator.applePlaceLink(place));assert.equal(url.hostname,'maps.apple.com');assert.equal(url.pathname,'/place');
 if(place.verification.checks.placeLink){assert.equal(url.searchParams.get('place-id'),place.appleMaps.placeId)}else{assert.equal(url.searchParams.get('coordinate'),place.position.latitude+','+place.position.longitude);assert.equal(url.searchParams.get('name'),place.name)}
 for(const mode of ['walking','transit','driving']){const u=new URL(PlacesValidator.appleDirectionsLink(place,mode));assert.equal(u.pathname,'/directions');assert.equal(u.searchParams.get('mode'),mode);assert.equal(u.searchParams.get('destination'),place.position.latitude+','+place.position.longitude);if(place.verification.checks.placeLink&&place.verification.checks.position)assert.equal(u.searchParams.get('destination-place-id'),place.appleMaps.placeId);else assert(!u.searchParams.has('destination-place-id'));}
}
assert.throws(()=>PlacesValidator.appleDirectionsLink(documents.places.places[0],'flying'));
const entrance=structuredClone(documents.places.places[0]);entrance.entrance={position:{latitude:43.7,longitude:11.2}};const toEntrance=new URL(PlacesValidator.appleDirectionsLink(entrance,'walking'));assert.equal(toEntrance.searchParams.get('destination'),'43.7,11.2');assert(!toEntrance.searchParams.has('destination-place-id'));
console.log('PASS: all 69 place links and 207 navigation links, coordinate fallbacks, entrance preference, place-id/source/position consistency');

const legacy=structuredClone(documents);legacy.guide.schemaVersion=1;legacy.guide.$schema='./guide.schema.v1.json';delete legacy.guide.flights;PlacesValidator.validateTrip({...schemas,guide:JSON.parse(fs.readFileSync('guide.schema.v1.json'))},legacy);console.log('PASS: flight validation and legacy guide schema v1 compatibility');
