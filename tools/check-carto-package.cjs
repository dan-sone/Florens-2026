// Check every addressed tile, including XYZ/TMS conversion and partition edges.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {PMTiles}=require('pmtiles');
const spec=require('../assets/offline/raster/index.json');
const readers=new Map(spec.packages.map(p=>{const bytes=fs.readFileSync(p.path);return[p.key,new PMTiles({getKey:()=>p.path,async getBytes(offset,length){return{data:bytes.buffer.slice(bytes.byteOffset+offset,bytes.byteOffset+offset+length)}}})]}));
const xy=(lon,lat,z)=>[Math.floor((lon+180)/360*2**z),Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*2**z)];
(async()=>{let count=0;const [[s,w],[n,e]]=spec.bounds;for(let z=0;z<=spec.maxZoom;z++){const[x0,y1]=xy(w,s,z),[x1,y0]=xy(e,n,z);for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const key=z<spec.partitionZoom?'overview':`${x>>(z-spec.partitionZoom)}-${y>>(z-spec.partitionZoom)}`,r=readers.get(key);assert(r,`Missing archive ${key}`);const t=await r.getZxy(z,x,y);assert(t,`Missing tile ${z}/${x}/${y}`);const b=Buffer.from(t.data);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');count++;}}assert.equal(count,spec.tileCount);console.log('CARTO_COVERAGE',count,'valid WebP tiles; all scope tiles at zooms 0–'+spec.maxZoom);})().catch(e=>{console.error(e);process.exit(1)});
