const fs=require('fs'), vm=require('vm'), assert=require('assert/strict');
vm.runInThisContext(fs.readFileSync('places-validator.js','utf8'));
const schema=JSON.parse(fs.readFileSync('places.schema.v1.json'));
const content=JSON.parse(fs.readFileSync('places.json'));
const validate=PlacesValidator.createValidator(schema);
validate(content);
const script=fs.readFileSync('index.html','utf8');
const config=script.match(/const routeDefinitions=([\s\S]*?);/)[1];
const routes=vm.runInNewContext('('+config+')');
const booked=JSON.parse(script.match(/const bookedIds = (.*);/)[1]);
const ids=new Set(content.places.map(p=>p.id));
for(const id of [...Object.values(routes).flat(2),...booked])assert(ids.has(id),`Unknown place: ${id}`);
assert.equal(content.schemaVersion,1);
for(const mutate of [
 c=>c.places.push(c.places[0]),
 c=>c.places[0].position.latitude=91,
 c=>c.places[0].verification.status='verified',
 c=>c.contentVersion=0,
 c=>c.places[0].website='javascript:alert(1)',
 c=>c.places[0].position.extra=1
]){const bad=structuredClone(content);mutate(bad);assert.throws(()=>validate(bad));}
console.log(`PASS: ${ids.size} unique places, all route/booking references, schema and six invalid-content cases`);
