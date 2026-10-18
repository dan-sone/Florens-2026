// Reusable OSM-like palette and local basemap POIs; no trip-specific content.
const {layers,namedFlavor}=require('@protomaps/basemaps');
module.exports=()=>{
 const flavor={...namedFlavor('light'),background:'#f2efe9',earth:'#f2efe9',water:'#a9d3df',park_a:'#cce9ad',park_b:'#b9df99',wood_a:'#b4d6a5',wood_b:'#a9ce98',pedestrian:'#eee5d8',buildings:'#d4c7ba',school:'#f1edcf',hospital:'#f4dfdf',industrial:'#e5dce7',minor_a:'#ffffff',minor_b:'#ffffff',minor_service:'#ffffff',other:'#e4d7c5',major:'#f8e7a6',highway:'#f5cf92',link:'#fff1bd',minor_casing:'#c7bdaf',minor_service_casing:'#c7bdaf',major_casing_early:'#c4aa80',major_casing_late:'#c4aa80',bridges_minor:'#ffffff',bridges_major:'#f8e7a6',roads_label_minor:'#5b534b',roads_label_major:'#5b534b',address_label:'#786c5d',ocean_label:'#447e93'};
 const styleLayers=layers('basemap',flavor,{lang:'en'});
 const groups={
  culture:['museum','attraction','theatre','artwork','gallery','archaeological_site','castle','memorial','place_of_worship','viewpoint','city_gate','tower'],
  shops:['supermarket','convenience','books','beauty','electronics','clothes','shoes','wine','leather','watches','fashion_accessories','deli','tea','department_store','cosmetics','health_food','pastry','variety_store','photo','bag','kitchen','herbalist','craft','hardware','confectionery','collector','interior_decoration','bookbinder','pottery','toys','mall','shoemaker','copyshop','alcohol','chocolate','sports','handicraft','gift','stationery','bakery','perfumery','tobacco','jewelry','optician','newsagent','hairdresser','butcher','art'],
  food:['restaurant','fast_food','cafe','bar','pub','ice_cream','bar;restaurant'],
  nature:['park','garden','forest','beach','peak','zoo','marina'],
  services:['hotel','guest_house','pharmacy','toilets','drinking_water','post_office','library','university','school','bank','atm','bus_stop','station','ferry_terminal','taxi','information']
 };
 const inside=k=>['in',['get','kind'],['literal',groups[k]]];
 for(const l of styleLayers){
  if(l.layout?.['text-font'])l.layout['text-font']=['Noto Sans Regular'];
  if(l.id==='buildings'){l.paint['fill-opacity']=.72;l.paint['fill-outline-color']='#b9aa99';}
  if(l.id==='pois'){
   const minZoom=['coalesce',['get','min_zoom'],17];
   // Keep the tile source's importance ranking. Never pull all minor POIs
   // forward to the same zoom: that turns city centres into a wall of symbols.
   const threshold=['case',['<=',minZoom,14],minZoom,inside('nature'),minZoom,['min',19,['+',minZoom,1]]];
   l.filter=['all',['any',...Object.keys(groups).map(inside)],['any',['has','name'],['has','name:en']],['>=',['zoom'],threshold]];
   const icons=['aerodrome','animal','artwork','attraction','bar','beach','beauty','bench','books','building','bus_stop','cafe','clothes','convenience','drinking_water','electronics','fast_food','ferry_terminal','forest','garden','library','marina','museum','park','peak','post_office','restaurant','school','stadium','supermarket','theatre','toilets','university','zoo'];
   l.layout['icon-image']=['case',['in',['get','kind'],['literal',icons]],['get','kind'],inside('shops'),'convenience',inside('food'),'cafe',['==',['get','kind'],'station'],'train_station',inside('culture'),'attraction','building'];
   l.layout['symbol-sort-key']=['+',['case',inside('culture'),0,inside('nature'),20,inside('shops'),30,inside('food'),40,50],['coalesce',['get','min_zoom'],17]];
   l.layout['text-field']=['coalesce',['get','name'],['get','name:en']];
   l.layout['text-size']=['interpolate',['linear'],['zoom'],14,10.5,17,11,19,12.5];
   l.layout['icon-size']=.75;l.layout['icon-padding']=6;l.layout['text-padding']=6;l.layout['text-optional']=false;
   l.paint['icon-opacity']=.8;
   l.paint['text-color']=['case',inside('culture'),'#74617f',inside('shops'),'#477b8b',inside('food'),'#916b48',inside('nature'),'#4b7551','#6b6670'];
   l.paint['text-halo-color']='#fffdf8';l.paint['text-halo-width']=1.3;
  }
 }
 return {version:8,glyphs:'./glyphs/{fontstack}/{range}.pbf',sprite:'./sprites/light',sources:{basemap:{type:'vector',url:'pmtiles://PACKAGE_URL',attribution:'© OpenStreetMap contributors · Protomaps'}},layers:styleLayers};
};
