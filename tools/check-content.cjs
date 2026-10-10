const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(fs.readFileSync('places-validator.js','utf8'));
const schemas={},documents={};
for(const name of ['places','routes','guide']){schemas[name]=JSON.parse(fs.readFileSync(name+'.schema.v1.json'));documents[name]=JSON.parse(fs.readFileSync(name+'.json'));}
const validate=d=>PlacesValidator.validateTrip(schemas,d);
validate(documents);
const cases=[
 d=>d.places.places.push(d.places.places[0]),
 d=>d.places.places[0].position.latitude=91,
 d=>d.places.places[0].verification.status='verified',
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
const next=structuredClone(documents);next.guide.id='next-trip';next.guide.title='Nästa resa';next.guide.destination={name:'Annan stad',searchSuffix:'Annan stad'};next.guide.map.center={latitude:59.3,longitude:18.1};next.guide.days.forEach((day,i)=>{day.id='day-'+(i+1);day.date='2027-01-'+(13+i)});next.guide.bookings.forEach(b=>b.startsAt=b.startsAt.replace('2026-10','2027-01'));validate(next);
assert(!/Florens|Firenze|2026-10|hotel-la-scaletta|routeDefinitions/.test(fs.readFileSync('index.html','utf8')));
console.log(`PASS: three schemas; ${documents.places.places.length} places, ${documents.routes.routes.length} routes, ${documents.guide.days.length} days, ${documents.guide.bookings.length} bookings; ${cases.length} invalid-input cases; independent versions and reusable trip content`);
