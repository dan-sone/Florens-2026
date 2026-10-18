// PMTILES_CLI=/path/to/pmtiles node tools/extract-offline.cjs [planet URL]
const fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
process.chdir(require('node:path').resolve(__dirname,'..'));global.window=global;vm.runInThisContext(fs.readFileSync('offline-scope.js','utf8'));
const scope=OfflineScope.compute(require('../places.json').places,require('../routes.json').routes,require('../offline-config.json'));
if(!scope.bounds)throw Error('No offline scope');const [[s,w],[n,e]]=scope.bounds;
execFileSync(process.env.PMTILES_CLI||'pmtiles',['extract',process.argv[2]||'https://build.protomaps.com/20261016.pmtiles','assets/offline/florence.next.pmtiles',`--bbox=${w},${s},${e},${n}`,'--maxzoom=15','--download-threads=4'],{stdio:'inherit'});
fs.renameSync('assets/offline/florence.next.pmtiles','assets/offline/florence.pmtiles');
execFileSync(process.execPath,['tools/prepare-offline.cjs'],{stdio:'inherit'});
