// Build-only network access. The delivered application has no CDN dependencies.
const fs=require('node:fs'),path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const root='assets/offline';
const jobs=[['https://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-glyphicons.css',root+'/vendor/glyphicons.css'],['https://cdn.jsdelivr.net/gh/python-visualization/folium/folium/templates/leaflet.awesome.rotate.min.css',root+'/vendor/rotate.css'],['https://raw.githubusercontent.com/notofonts/latin-greek-cyrillic/main/OFL.txt',root+'/licenses/Noto-OFL.txt']];
for(const ext of ['eot','svg','ttf','woff'])jobs.push([`https://netdna.bootstrapcdn.com/bootstrap/3.0.0/fonts/glyphicons-halflings-regular.${ext}`,`${root}/fonts/glyphicons-halflings-regular.${ext}`]);
for(const n of [0,256,512,768,8192,8448,12288,65280])jobs.push([`https://protomaps.github.io/basemaps-assets/fonts/Noto%20Sans%20Regular/${n}-${n+255}.pbf`,`${root}/glyphs/Noto Sans Regular/${n}-${n+255}.pbf`]);
(async()=>{for(const [url,dest] of jobs){const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(url+' '+response.status);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,new Uint8Array(await response.arrayBuffer()));}console.log('Offline fonts and compatibility styles downloaded');})().catch(e=>{console.error(e);process.exitCode=1;});
