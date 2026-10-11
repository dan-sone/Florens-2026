/* Shared presentation for map pins, cards, filters and place headings. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PlacePresentation=factory();})(globalThis,function(){
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function createRegistry(data){
  const categories=new Map(data.categories.map(c=>[c.id,c])),subcategories=new Map(data.subcategories.map(s=>[s.id,s]));
  const category=id=>{const c=categories.get(id);if(!c)throw Error('Okänd kategori: '+id);return c;};
  const subcategory=place=>{const s=subcategories.get(place.subcategory);return s&&s.categoryId===place.category?s:null;};
  const iconId=place=>subcategory(place)?.iconId||category(place.category).iconId;
  const paths=id=>{if(!data.icons[id])throw Error('Okänd ikon: '+id);return data.icons[id].map(d=>'<path d="'+escape(d)+'"/>').join('');};
  const icon=id=>'<svg class="place-symbol" data-icon="'+escape(id)+'" viewBox="0 0 24 24" aria-hidden="true">'+paths(id)+'</svg>';
  const symbol=place=>icon(iconId(place)),categorySymbol=id=>icon(category(id).iconId);
  const themeCSS=()=>':root{'+data.categories.map(c=>'--category-'+c.id+':'+c.colors.light).join(';')+'}@media(prefers-color-scheme:dark){:root{'+data.categories.map(c=>'--category-'+c.id+':'+c.colors.dark).join(';')+'}}'+data.categories.map(c=>'[data-category="'+c.id+'"]{--category-color:var(--category-'+c.id+')}').join('');
  const markerOptions=(place,geometry={},booked=false)=>{
   const iconSize=geometry.iconSize||[35,45],iconAnchor=geometry.iconAnchor||[17,42],popupAnchor=geometry.popupAnchor||[1,-34],w=iconSize[0],h=iconSize[1],x=iconAnchor[0],y=iconAnchor[1],r=Math.min(x,w-x)-1,cy=r+1,id=iconId(place);
   const shape='M '+x+' '+y+' C '+(x-5)+' '+(y-9)+' 1 '+(cy+8)+' 1 '+cy+' A '+r+' '+r+' 0 1 1 '+(w-1)+' '+cy+' C '+(w-1)+' '+(cy+8)+' '+(x+5)+' '+(y-9)+' '+x+' '+y+' Z';
   const badge=booked?'<g class="pin-booked"><circle cx="'+(w-6)+'" cy="6" r="5"/><path d="M '+(w-9)+' 6 l 2 2 4 -4"/></g>':'';
   const html='<svg class="registry-pin-svg" data-icon="'+id+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><path class="pin-shape" d="'+shape+'"/><svg class="pin-glyph" x="'+(x-8)+'" y="'+(cy-8)+'" width="16" height="16" viewBox="0 0 24 24">'+paths(id)+'</svg>'+badge+'</svg>';
   return {className:'registry-pin',html,iconSize,iconAnchor,popupAnchor};
  };
  const compare=(a,b,order)=>{const ranks=new Map(order.map((c,i)=>[typeof c==='string'?c:c.id,i]));return (ranks.get(a.category)??99)-(ranks.get(b.category)??99)||(subcategory(a)?.label||'Övrigt').localeCompare(subcategory(b)?.label||'Övrigt','sv')||a.name.localeCompare(b.name,'sv')||a.id.localeCompare(b.id);};
  return {category,subcategory,iconId,icon,symbol,categorySymbol,themeCSS,markerOptions,compare};
 }
 return {createRegistry};
});
