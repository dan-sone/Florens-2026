// PMTILES_CLI=/path/to/pmtiles node tools/extract-offline.cjs [planet URL]
const fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
process.chdir(require('node:path').resolve(__dirname,'..'));global.window=global;vm.runInThisContext(fs.readFileSync('offline-scope.js','utf8'));
const config=require('../offline-config.json');
const source=process.argv[2]||config.mapSource?.vectorArchiveUrl;if(!source)throw Error('Configure mapSource.vectorArchiveUrl or pass the archive URL');
const scope=OfflineScope.compute(require('../places.json').places,require('../routes.json').routes,require('../offline-config.json'));
if(!scope.bounds)throw Error('No offline scope');const [[s,w],[n,e]]=scope.bounds;
execFileSync(process.env.PMTILES_CLI||'pmtiles',['extract',source,'assets/offline/vector.next.pmtiles',`--bbox=${w},${s},${e},${n}`,'--maxzoom=15','--download-threads=4'],{stdio:'inherit'});
fs.renameSync('assets/offline/vector.next.pmtiles','assets/offline/vector.pmtiles');
execFileSync(process.execPath,['tools/prepare-offline.cjs'],{stdio:'inherit'});
