// Version 1.1.0. Canonical place identity and coordinates determine every map link.
export function applePlaceLink(place) {
  if(place.verification.checks.placeLink && place.appleMaps.placeId)
    return 'https://maps.apple.com/place?place-id='+encodeURIComponent(place.appleMaps.placeId);
  if(place.verification.checks.placeLink && place.appleMaps.placeUrl)return place.appleMaps.placeUrl;
  const p=place.position;
  if(!p)throw new Error('Platsen saknar position: '+place.id);
  const query=new URLSearchParams({coordinate:p.latitude+','+p.longitude,name:place.name});
  return 'https://maps.apple.com/place?'+query;
}
export function appleDirectionsLink(place,mode) {
  if(!['walking','transit','driving'].includes(mode))throw new Error('Okänt färdsätt: '+mode);
  const position=place.entrance?.position||place.position;
  if(!position)throw new Error('Platsen saknar navigeringsposition: '+place.id);
  const query=new URLSearchParams({destination:position.latitude+','+position.longitude,mode});
  if(!place.entrance && place.verification.checks.placeLink && place.verification.checks.position && place.appleMaps.placeId)
    query.set('destination-place-id',place.appleMaps.placeId);
  return 'https://maps.apple.com/directions?'+query;
}
