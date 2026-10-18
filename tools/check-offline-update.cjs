// Exercise the real downloader and storage helper with verified in-memory files.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
async function scenario(mode){
 const elements=new Map(),stores=new Map(),origin='https://example.test/app/',storageSpec={tripId:'sample',prefix:'trip-guide-sample-offline-pack-',legacyPrefixes:['legacy-pack-']},cacheName=storageSpec.prefix+'new',oldName='legacy-pack-old';let requests=0;
 const contents={'assets/offline/documents.json':JSON.stringify({documents:{'index.html':'new guide'}}),'index.html':'new guide','map.pmtiles':'unchanged map'};
 const files=Object.entries(contents).map(([path,text])=>({path,bytes:Buffer.byteLength(text),sha256:crypto.createHash('sha256').update(text).digest('hex')}));
 function cache(){const entries=new Map();return{match:async key=>entries.get(String(key))?.clone(),put:async(key,r)=>entries.set(String(key),r.clone()),delete:async key=>entries.delete(String(key)),keys:async()=>[...entries.keys()]};}
 const current=cache();stores.set(cacheName,current);
 if(mode!=='first'){const old=cache();stores.set(oldName,old);await old.put(origin+'offline-ready',new Response('complete'));for(const[p,text]of Object.entries(contents))await old.put(origin+p,new Response(p.endsWith('.json')?'old documents':text));}
 const preferences=new Map(),worker={state:'activated',addEventListener(){}};
 const context={URL,Response,AbortController,DOMException,Uint8Array,Promise,Error,JSON,Math,Array,String,Date,setTimeout,clearTimeout,crypto:crypto.webcrypto,console:{warn(){},error(){}},CustomEvent:class{constructor(type,args){this.type=type;this.detail=args.detail;}},location:{href:origin+'index.html',pathname:'/app/index.html'},isSecureContext:true,OFFLINE_CACHE:cacheName,OFFLINE_STORAGE:storageSpec,OFFLINE_FILES:files,OFFLINE_STYLE:{},OFFLINE_SCOPE:{},localStorage:{getItem:key=>preferences.get(key)||null,setItem:(k,v)=>preferences.set(k,v),removeItem:k=>preferences.delete(k)},document:{getElementById:id=>{if(!elements.has(id))elements.set(id,{hidden:false,disabled:false,checked:true});return elements.get(id);}},caches:{open:async name=>{if(!stores.has(name))stores.set(name,cache());return stores.get(name);},keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)},navigator:{onLine:true,serviceWorker:{controller:{},register:async()=>({active:worker})},storage:{estimate:async()=>({quota:1e8,usage:0}),persist:async()=>true}},fetch:async url=>{requests++;if(mode==='failure')throw Error('Failed to fetch');return new Response(contents[new URL(url).pathname.slice(5)]);}};
 context.window=context;context.OFFLINE_IN_APP=true;context.addEventListener=()=>{};context.dispatchEvent=()=>{};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'offline-storage.js'),'utf8'),context);await vm.runInContext(fs.readFileSync(path.join(root,'offline-download.js'),'utf8'),context);
 if(mode==='first'){assert.equal(requests,0);assert(!await current.match(origin+'offline-ready'));}
 if(mode==='success'){assert(await current.match(origin+'offline-ready'));assert.equal(requests,1,'Only changed documents are fetched');assert(!stores.has(oldName));assert.equal(preferences.get('/app/:sample:offline-enabled'),'1');}
 if(mode==='failure'){assert(!await current.match(origin+'offline-ready'));assert(stores.has(oldName));assert(await stores.get(oldName).match(origin+'offline-ready'));}
 console.log('PASS offline update:',mode,'network requests:',requests);
}
(async()=>{for(const mode of ['first','success','failure'])await scenario(mode);})().catch(e=>{console.error(e);process.exitCode=1;});
