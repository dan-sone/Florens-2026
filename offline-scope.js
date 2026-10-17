window.OfflineScope={compute(places,routes,config){
const c=config,valid=places.filter(p=>Number.isFinite(p.position?.latitude)&&Number.isFinite(p.position?.longitude));
const distance=(a,b)=>{const k=Math.PI/180;return 6371*Math.hypot((a.latitude-b.latitude)*k,(a.longitude-b.longitude)*k*Math.cos((a.latitude+b.latitude)*k/2))};
const anchor=valid.find(p=>c.anchorCategories.includes(p.category))||valid[0];
if(!anchor)return {included:[],excluded:[],bounds:null};
const routeIds=new Set(routes.flatMap(r=>r.segments.filter(s=>c.localRouteModes.includes(s.mode)).flatMap(s=>s.placeIds)));
const included=new Set();const reasons={};
const local=p=>distance(anchor.position,p.position)<=c.localRadiusKm;
for(const p of valid)if(c.overrides[p.id]==='include'||(c.overrides[p.id]!=='exclude'&&!c.excludeCategories.includes(p.category)&&local(p)&&(c.anchorCategories.includes(p.category)||routeIds.has(p.id)))){included.add(p.id);reasons[p.id]=c.overrides[p.id]==='include'?'Manuellt inkluderad':'Basplats eller promenadrutt';}
let change=true;
while(change){change=false;for(const p of valid)if(!included.has(p.id)&&c.overrides[p.id]!=='exclude'&&!c.excludeCategories.includes(p.category)&&local(p)&&valid.some(q=>included.has(q.id)&&distance(q.position,p.position)<=c.clusterRadiusKm)){included.add(p.id);reasons[p.id]='Sammanhängande stadsområde';change=true;}}
for(const p of valid){if(c.overrides[p.id]==='include'){included.add(p.id);reasons[p.id]='Manuellt inkluderad';}if(c.overrides[p.id]==='exclude')included.delete(p.id);}
const selected=valid.filter(p=>included.has(p.id));
const excluded=valid.filter(p=>!included.has(p.id)).map(p=>({id:p.id,name:p.name,reason:c.overrides[p.id]==='exclude'?'Manuellt utesluten':c.excludeCategories.includes(p.category)?'Utesluten kategori':!local(p)?'Utanför lokalt område':'Utanför sammanhängande område'}));
if(!selected.length)return {included:[],excluded,bounds:null};
const lats=selected.map(p=>p.position.latitude),lons=selected.map(p=>p.position.longitude),pad=c.marginMeters/111320;
return {included:selected.map(p=>({id:p.id,name:p.name,position:p.position,reason:reasons[p.id]})),excluded,bounds:[[Math.min(...lats)-pad,Math.min(...lons)-pad/Math.cos(Math.max(...lats)*Math.PI/180)],[Math.max(...lats)+pad,Math.max(...lons)+pad/Math.cos(Math.max(...lats)*Math.PI/180)]]};
}};