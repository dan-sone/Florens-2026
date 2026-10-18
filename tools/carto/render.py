import json,math,os,time,hashlib,statistics
from pathlib import Path
import mapnik
from PIL import Image
ROOT=Path('/tmp/florens-carto/style')
OUT=Path.cwd()/'carto-preview';OUT.mkdir(exist_ok=True)
os.chdir(ROOT)
mapnik.register_fonts(str(ROOT/'fonts'),True)
assert 'Noto Sans Regular' in mapnik.FontEngine.face_names()
R=20037508.342789244

def xy(lon,lat,z):
 return int((lon+180)/360*2**z),int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**z)
def box(x,y,z,size=1):
 d=2*R/2**z
 return mapnik.Box2d(-R+x*d,R-(y+size)*d,-R+(x+size)*d,R-y*d)
def render(z,lon,lat):
 x,y=xy(lon,lat,z);mx=x//8*8;my=y//8*8
 m=mapnik.Map(2048,2048);mapnik.load_map(m,str(ROOT/'project.xml'),False);m.buffer_size=128;m.zoom_to_box(box(mx,my,z,8));im=mapnik.Image(2048,2048)
 start=time.monotonic();mapnik.render(m,im);seconds=time.monotonic()-start
 raw=im.tostring('png256');source=OUT/f'carto-z{z}-metatile.png';source.write_bytes(raw)
 image=Image.open(source);tiles=[]
 for tx in range(8):
  for ty in range(8):
   p=OUT/'tile.webp';image.crop((tx*256,ty*256,(tx+1)*256,(ty+1)*256)).save(p,'WEBP',lossless=True,method=4);tiles.append(p.stat().st_size)
 if (OUT/'tile.webp').exists():(OUT/'tile.webp').unlink()
 # A readable 3x3 tile sample at the real, unscaled online map resolution.
 sx=max(0,min(5,x-mx-1));sy=max(0,min(5,y-my-1))
 image.crop((sx*256,sy*256,(sx+3)*256,(sy+3)*256)).save(OUT/f'carto-z{z}-detail.png')
 return {'zoom':z,'renderSeconds':seconds,'metatilePngBytes':len(raw),'tileWebpMedianBytes':statistics.median(tiles),'tileWebpMeanBytes':statistics.mean(tiles),'tileX':x,'tileY':y}
report={'renderer':'Mapnik '+mapnik.mapnik_version_string(),'style':'OpenStreetMap Carto 6.1.0','styleUrl':'https://github.com/openstreetmap-carto/openstreetmap-carto/tree/v6.1.0','dataSource':'https://download.geofabrik.de/europe/italy/centro-latest.osm.pbf','scope':json.load(open('/tmp/florens-carto/scope.json'))['bounds'],'samples':[]}
for z in [15,17,18,19]:
 r=render(z,11.255,43.770);report['samples'].append(r);print('CARTO SAMPLE',json.dumps(r),flush=True)
(OUT/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report),flush=True)
