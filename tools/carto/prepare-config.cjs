// Derive renderer inputs and isolated build storage from trip data.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
function derive(guide,places,routes,config,cacheRoot){
 const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'offline-scope.js'),'utf8'),sandbox);
 const scope=sandbox.window.OfflineScope.compute(places.places,routes.routes,config);
 if(!scope.bounds)throw Error('No offline scope');
 if(!config.mapSource?.regionUrl)throw Error('Configure mapSource.regionUrl in offline-config.json');
 const digest=crypto.createHash('sha256').update(JSON.stringify({source:config.mapSource.regionUrl,bounds:scope.bounds,style:'6.1.0'})).digest('hex').slice(0,16);
 return{tripId:guide.id,title:guide.title,center:guide.map.center,sourceUrl:config.mapSource.regionUrl,scope,cacheDir:path.join(cacheRoot,guide.id+'-'+digest)};
}
if(require.main===module){
 const work=path.resolve(process.argv[2]||process.env.CARTO_WORK_DIR||'/tmp/trip-guide-carto');
 const data=derive(require(root+'/guide.json'),require(root+'/places.json'),require(root+'/routes.json'),require(root+'/offline-config.json'),process.env.CARTO_CACHE_ROOT||path.join(os.homedir(),'.cache/trip-guide-carto'));
 fs.mkdirSync(work,{recursive:true});fs.mkdirSync(data.cacheDir,{recursive:true});fs.writeFileSync(path.join(work,'scope.json'),JSON.stringify(data.scope));fs.writeFileSync(path.join(work,'build.json'),JSON.stringify(data,null,2));
 console.log(data.cacheDir);
}
module.exports={derive};
