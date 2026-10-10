import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export function createValidator(schema) {
  const ajv = new Ajv2020({allErrors:true, strict:true, strictRequired:false, strictTypes:false});
  addFormats(ajv);
  const validate = ajv.compile(schema);
  return data => {
    if (!validate(data)) throw new Error('Ogiltigt innehåll: '+ajv.errorsText(validate.errors));
    if(data.places) unique(data.places,'plats');
    return data;
  };
}
function unique(items,label,key='id') {
  const ids=new Set();
  for(const item of items){if(ids.has(item[key]))throw new Error('Dubblett av '+label+': '+item[key]);ids.add(item[key]);}
  return ids;
}
export function validateTrip(schemas,documents) {
  for(const name of ['places','routes','guide'])createValidator(schemas[name])(documents[name]);
  const {places,routes,guide}=documents;
  const placeMap=new Map(places.places.map(p=>[p.id,p]));
  const routeIds=unique(routes.routes,'rutt');
  const dayIds=unique(guide.days,'dag');unique(guide.days,'datum','date');
  unique(guide.bookings,'bokning');const categories=unique(guide.categories,'kategori');
  if(dayIds.has(guide.defaultSelection.id))throw new Error('Standardvalet delar id med en dag');
  const requirePlace=(id,position=false)=>{const p=placeMap.get(id);if(!p)throw new Error('Okänt plats-id: '+id);if(position&&!p.position)throw new Error('Platsen saknar position: '+id);return p;};
  for(const route of routes.routes){unique(route.segments,'delsträcka');for(const segment of route.segments)segment.placeIds.forEach(id=>requirePlace(id,true));}
  const checkProgram=program=>{for(const paragraph of program)for(const node of paragraph.nodes)if(node.type==='place')requirePlace(node.placeId);};
  checkProgram(guide.defaultSelection.program);
  for(const day of guide.days){for(const id of day.routeIds)if(!routeIds.has(id))throw new Error('Okänt rutt-id: '+id);checkProgram(day.program);}
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:guide.timeZone,year:'numeric',month:'2-digit',day:'2-digit'});
  const dates=new Set(guide.days.map(d=>d.date));
  for(const booking of guide.bookings){requirePlace(booking.placeId,true);const parts=formatter.formatToParts(new Date(booking.startsAt));const value=type=>parts.find(p=>p.type===type).value;const date=value('year')+'-'+value('month')+'-'+value('day');if(!dates.has(date))throw new Error('Bokningen ligger utanför resdagarna: '+booking.id);}
  guide.persistentPlaceIds.forEach(id=>requirePlace(id,true));
  Object.keys(guide.presentation.placeOverrides).forEach(id=>requirePlace(id));
  const booked=new Set(guide.bookings.map(b=>b.placeId));
  if(booked.size&&!categories.has('booked'))throw new Error('Bokningsfiltret saknas');
  for(const p of places.places)if(!guide.persistentPlaceIds.includes(p.id)&&!booked.has(p.id)&&!categories.has(p.category))throw new Error('Kategorifilter saknas: '+p.category);
  return documents;
}
