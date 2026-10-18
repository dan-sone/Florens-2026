const assert=require('node:assert/strict'),{create}=require('../offline-storage.js');
function backend(){const stores=new Map();return{stores,keys:async()=>[...stores.keys()],open:async name=>{if(!stores.has(name)){const entries=new Map();stores.set(name,{entries,match:async url=>entries.get(String(url)),put:async(url,value)=>entries.set(String(url),value)});}return stores.get(name);},delete:async name=>stores.delete(name)}}
(async()=>{
 const data=backend(),base='https://example.test/first/',otherBase='https://example.test/second/',config={prefix:'trip-guide-first-offline-pack-',legacyPrefixes:['legacy-offline-pack-']},current=config.prefix+'new';
 const old=await data.open('legacy-offline-pack-old');await old.put(base+'offline-ready','complete');
 const other=await data.open('legacy-offline-pack-other');await other.put(otherBase+'offline-ready','complete');
 const second=await data.open('trip-guide-second-offline-pack-old');await second.put(otherBase+'offline-ready','complete');
 const storage=create(current,config,base,data);assert.deepEqual(await storage.completeNames(),['legacy-offline-pack-old']);assert.equal((await storage.previousCaches()).length,1);
 assert(data.stores.has('legacy-offline-pack-old'),'Incomplete update retains old snapshot');
 const fresh=await data.open(current);await fresh.put(base+'offline-ready','complete');assert.deepEqual(await storage.completeNames(),[current,'legacy-offline-pack-old']);
 await storage.removeOlder();assert(!data.stores.has('legacy-offline-pack-old'));assert(data.stores.has('legacy-offline-pack-other'),'Legacy cache for another URL is retained');assert(data.stores.has('trip-guide-second-offline-pack-old'),'Another trip is retained');assert(data.stores.has(current));
 console.log('PASS: offline namespace migration, complete-snapshot fallback, cleanup after success, isolation between trips and URL scopes');
})().catch(e=>{console.error(e);process.exitCode=1});
