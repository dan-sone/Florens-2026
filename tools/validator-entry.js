export {applePlaceLink,appleDirectionsLink} from './map-links.js';
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
  for(const place of places.places){
    const {verification:v,appleMaps:a}=place;
    if(a.placeUrl){const u=new URL(a.placeUrl);if(u.hostname!=='maps.apple.com')throw new Error('Platslänk måste gå till Apple Kartor: '+place.id);if(a.placeId&&u.searchParams.get('place-id')!==a.placeId)throw new Error('Plats-id och platslänk skiljer sig: '+place.id);}
    if(v.checkedAt && v.sources.some(source=>new Date(source.checkedAt)>new Date(v.checkedAt)))throw new Error('Kontrolldatum föregår källkontrollen: '+place.id);
    for(const [check,passed] of Object.entries(v.checks))if(passed&&!v.sources.some(source=>source.supports.includes(check)))throw new Error('Verifieringskälla saknas för '+check+': '+place.id);
    if(v.checks.navigation){
      const point=place.entrance?.position||place.position;
      const target=point.latitude+','+point.longitude;
      if(!v.sources.some(source=>source.supports.includes('navigation') && new URL(source.url).searchParams.get('destination')===target))throw new Error('Navigeringskontrollen avser en annan position: '+place.id);
    }
    if(v.status==='verified' && !v.sources.some(source=>source.supports.includes('placeLink') && source.url===a.placeUrl))throw new Error('Verifierat platskort saknar motsvarande källa: '+place.id);
  }
  const routeIds=unique(routes.routes,'rutt');
  const dayIds=unique(guide.days,'dag');unique(guide.days,'datum','date');
  unique(guide.bookings,'bokning');const categories=unique(guide.categories,'kategori');
  if(dayIds.has(guide.defaultSelection.id))throw new Error('Standardvalet delar id med en dag');
  const requirePlace=(id,position=false)=>{const p=placeMap.get(id);if(!p)throw new Error('Okänt plats-id: '+id);if(position&&!p.position)throw new Error('Platsen saknar position: '+id);return p;};
  if(documents.stories){
    createValidator(schemas.stories)(documents.stories);
    unique(documents.stories.stories,'berättelse','placeId');
    for(const story of documents.stories.stories)requirePlace(story.placeId);
  }
  for(const route of routes.routes){unique(route.segments,'delsträcka');for(const segment of route.segments)segment.placeIds.forEach(id=>requirePlace(id,true));}
  const checkProgram=program=>{for(const paragraph of program)for(const node of paragraph.nodes)if(node.type==='place')requirePlace(node.placeId);};
  checkProgram(guide.defaultSelection.program);
  for(const day of guide.days){for(const id of day.routeIds)if(!routeIds.has(id))throw new Error('Okänt rutt-id: '+id);checkProgram(day.program);}
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:guide.timeZone,year:'numeric',month:'2-digit',day:'2-digit'});
  const dates=new Set(guide.days.map(d=>d.date));
  for(const booking of guide.bookings){requirePlace(booking.placeId,true);const parts=formatter.formatToParts(new Date(booking.startsAt));const value=type=>parts.find(p=>p.type===type).value;const date=value('year')+'-'+value('month')+'-'+value('day');if(!dates.has(date))throw new Error('Bokningen ligger utanför resdagarna: '+booking.id);}
  unique(guide.flights||[],'flyg');
  for(const flight of guide.flights||[]){
    if(!dayIds.has(flight.dayId))throw new Error('Okänd resdag för flyget: '+flight.id);
    if(new Date(flight.arrival.at)<=new Date(flight.departure.at))throw new Error('Flygets ankomst måste vara efter avgång: '+flight.id);
    for(const endpoint of [flight.departure,flight.arrival]){
      const f=new Intl.DateTimeFormat('sv-SE',{timeZone:endpoint.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
      const parts=f.formatToParts(new Date(endpoint.at));const value=type=>parts.find(p=>p.type===type).value;
      const local=value('year')+'-'+value('month')+'-'+value('day')+'T'+value('hour')+':'+value('minute')+':'+value('second');
      if(local!==endpoint.at.slice(0,19))throw new Error('Flygets tidszon och lokala tid skiljer sig: '+flight.id);
    }
    if(flight.departure.at.slice(0,10)!==guide.days.find(d=>d.id===flight.dayId).date)throw new Error('Flygets avgång ligger på annan resdag: '+flight.id);
  }
  guide.persistentPlaceIds.forEach(id=>requirePlace(id,true));
  Object.keys(guide.presentation.placeOverrides).forEach(id=>requirePlace(id));
  const booked=new Set(guide.bookings.map(b=>b.placeId));
  if(booked.size&&!categories.has('booked'))throw new Error('Bokningsfiltret saknas');
  for(const p of places.places)if(!guide.persistentPlaceIds.includes(p.id)&&!booked.has(p.id)&&!categories.has(p.category))throw new Error('Kategorifilter saknas: '+p.category);
  return documents;
}
