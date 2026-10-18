"""Render only scope-intersecting tiles, package by z15 parent for small local reads."""
import concurrent.futures,datetime,hashlib,io,json,math,multiprocessing,os,shutil,sqlite3,subprocess,time
from pathlib import Path
import mapnik
from PIL import Image
ROOT=Path('/tmp/florens-carto/style')
R=20037508.342789244
M=None

def xy(lon,lat,z):
 return int((lon+180)/360*2**z),int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*2**z)
def box(x,y,z,size):
 d=2*R/2**z
 return mapnik.Box2d(-R+x*d,R-(y+size)*d,-R+(x+size)*d,R-y*d)
def init_worker():
 global M
 os.chdir(ROOT);mapnik.register_fonts(str(ROOT/'fonts'))
 M=mapnik.Map(2048,2048);mapnik.load_map(M,str(ROOT/'project.xml'),False);M.buffer_size=128

def render_meta(task):
 z,mx,my,tiles=task;size=min(8,2**z)
 M.resize(size*256,size*256);M.zoom_to_box(box(mx,my,z,size));image=mapnik.Image(size*256,size*256)
 start=time.monotonic();mapnik.render(M,image);result=[]
 for x,y in tiles:
  # Match the standard 256px raster output, then compress its pixels losslessly.
  png=image.view((x-mx)*256,(y-my)*256,256,256).tostring('png256')
  tile=Image.open(io.BytesIO(png));encoded=io.BytesIO();tile.save(encoded,'WEBP',lossless=True,method=4)
  result.append((z,x,y,encoded.getvalue()))
 return result,time.monotonic()-start

def main():
 repo=Path.cwd();out=repo/'assets/offline/raster';temp=Path('/tmp/florens-carto/mbtiles')
 if out.exists():shutil.rmtree(out)
 out.mkdir(parents=True);temp.mkdir(exist_ok=True)
 bounds=json.load(open('/tmp/florens-carto/scope.json'))['bounds'];(s,w),(n,e)=bounds
 tasks={};counts={}
 for z in range(20):
  x0,y1=xy(w,s,z);x1,y0=xy(e,n,z);size=min(8,2**z);counts[z]=(x1-x0+1)*(y1-y0+1)
  for x in range(x0,x1+1):
   for y in range(y0,y1+1):tasks.setdefault((z,x//size*size,y//size*size),[]).append((x,y))
 jobs=[(*key,value) for key,value in sorted(tasks.items())]
 dbs={};package_stats={};start=time.monotonic();done=0
 def database(key):
  if key not in dbs:
   f=temp/(key+'.mbtiles')
   if f.exists():f.unlink()
   db=sqlite3.connect(f);db.execute('PRAGMA journal_mode=OFF');db.execute('PRAGMA synchronous=OFF')
   db.execute('CREATE TABLE metadata (name TEXT,value TEXT)')
   db.execute('CREATE TABLE tiles (zoom_level INTEGER,tile_column INTEGER,tile_row INTEGER,tile_data BLOB,PRIMARY KEY(zoom_level,tile_column,tile_row))')
   dbs[key]=db;package_stats[key]={'minzoom':20,'maxzoom':0,'tileCount':0}
  return dbs[key]
 with concurrent.futures.ProcessPoolExecutor(max_workers=min(2,os.cpu_count() or 2),mp_context=multiprocessing.get_context('spawn'),initializer=init_worker) as pool:
  futures=[pool.submit(render_meta,t) for t in jobs]
  for future in concurrent.futures.as_completed(futures):
   tiles,seconds=future.result()
   for z,x,y,data in tiles:
    key='overview' if z<15 else f'{x>>(z-15)}-{y>>(z-15)}'
    database(key).execute('INSERT INTO tiles VALUES (?,?,?,?)',(z,x,(1<<z)-1-y,data))
    stats=package_stats[key];stats['minzoom']=min(stats['minzoom'],z);stats['maxzoom']=max(stats['maxzoom'],z);stats['tileCount']+=1
   done+=1
   if done%10==0 or done==len(jobs):print('CARTO RENDER PROGRESS',done,'/',len(jobs),'metatiles',round(time.monotonic()-start,1),'seconds',flush=True)
 packages=[];cli=os.environ.get('PMTILES_CLI','/tmp/pmtiles')
 for key,db in sorted(dbs.items()):
  stats=package_stats[key]
  meta={'name':'Florens — OpenStreetMap Carto','format':'webp','type':'baselayer','description':'Self-rendered OSM Carto 6.1.0, lossless raster tiles','attribution':'© OpenStreetMap contributors','bounds':','.join(map(str,[w,s,e,n])),'minzoom':str(stats['minzoom']),'maxzoom':str(stats['maxzoom'])}
  db.executemany('INSERT INTO metadata VALUES (?,?)',meta.items());db.commit();db.close()
  filename=key+'.pmtiles';dest=out/filename
  subprocess.run([cli,'convert',str(temp/(key+'.mbtiles')),str(dest)],check=True)
  subprocess.run([cli,'verify',str(dest)],check=True)
  size=dest.stat().st_size
  if size>20*1024*1024:raise RuntimeError(f'Archive {filename} exceeds the small-file budget: {size}')
  packages.append({'key':key,'path':'assets/offline/raster/'+filename,'bytes':size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),**stats})
 shutil.copy(ROOT/'LICENSE.txt',out/'OSM-Carto-LICENSE.txt')
 index={'version':1,'type':'raster','format':'webp','cartography':'OpenStreetMap Carto','styleVersion':'6.1.0','tileSize':256,'minZoom':0,'maxZoom':19,'partitionZoom':15,'bounds':bounds,'packages':packages,'tileCount':sum(counts.values()),'tilesAtZoom':counts,'totalMapBytes':sum(p['bytes'] for p in packages),'renderSeconds':round(time.monotonic()-start,2),'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':{'url':'https://download.geofabrik.de/europe/italy/centro-latest.osm.pbf','style':'https://github.com/openstreetmap-carto/openstreetmap-carto/tree/v6.1.0','sourceSha256':hashlib.sha256((Path.home()/'.cache/florens-carto/region.osm.pbf').read_bytes()).hexdigest()},'attribution':'© OpenStreetMap contributors · OpenStreetMap Carto'}
 (out/'index.json').write_text(json.dumps(index,indent=2))
 (repo/'carto-preview/full-report.json').write_text(json.dumps(index,indent=2))
 print('CARTO FULL COMPLETE',json.dumps({k:index[k] for k in ['tileCount','totalMapBytes','renderSeconds']}),flush=True)

if __name__=='__main__':main()
