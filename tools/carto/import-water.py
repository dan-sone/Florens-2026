import json,math,subprocess,sys,os
from pathlib import Path
name,filename=sys.argv[1:]
(s,w),(n,e)=json.loads((Path(os.environ.get('CARTO_WORK_DIR','/tmp/trip-guide-carto'))/'scope.json').read_text())['bounds']
x=lambda l:l*20037508.342789244/180
y=lambda l:math.log(math.tan((90+l)*math.pi/360))*20037508.342789244/math.pi
# Low-zoom world ocean polygons are small enough to retain globally.
args=[] if name=='simplified_water_polygons' else ['-spat',str(x(w-.14)),str(y(s-.1)),str(x(e+.14)),str(y(n+.1))]
subprocess.run(['ogr2ogr','-f','PostgreSQL','-lco','GEOMETRY_NAME=way','-nln',name,*args,'PG:dbname=gis',filename],check=True)
