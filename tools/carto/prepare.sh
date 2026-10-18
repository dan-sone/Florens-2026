#!/usr/bin/env bash
set -euo pipefail
CARTO_CACHE="$HOME/.cache/florens-carto"
mkdir -p "$CARTO_CACHE" /tmp/florens-carto
node - <<'JS'
const fs=require('fs'),vm=require('vm');global.window=global;vm.runInThisContext(fs.readFileSync('offline-scope.js','utf8'));const s=OfflineScope.compute(require('./places.json').places,require('./routes.json').routes,require('./offline-config.json'));fs.writeFileSync('/tmp/florens-carto/scope.json',JSON.stringify(s));
JS
if [ ! -d /tmp/florens-carto/style ]; then
 git clone --depth 1 --branch v6.1.0 https://github.com/openstreetmap-carto/openstreetmap-carto.git /tmp/florens-carto/style
fi
if [ ! -s "$CARTO_CACHE/region.osm.pbf" ]; then
 curl --fail --location --retry 3 https://download.geofabrik.de/europe/italy/centro-latest.osm.pbf -o "$CARTO_CACHE/region.osm.pbf"
fi
CARTO_EXTRACT_BOUNDS=$(node -e "const s=require('/tmp/florens-carto/scope.json').bounds;console.log([s[0][1]-.14,s[0][0]-.1,s[1][1]+.14,s[1][0]+.1].join(','))")
if [ ! -s "$CARTO_CACHE/region.dump" ]; then
 osmium extract --overwrite --strategy=smart --bbox "$CARTO_EXTRACT_BOUNDS" "$CARTO_CACHE/region.osm.pbf" -o /tmp/florens-carto/extract.osm.pbf
 osm2pgsql --output flex --style /tmp/florens-carto/style/openstreetmap-carto-flex.lua --database gis --cache 1800 --number-processes 2 /tmp/florens-carto/extract.osm.pbf
 psql gis -f /tmp/florens-carto/style/indexes.sql
 psql gis -f /tmp/florens-carto/style/functions.sql
 psql gis -f /tmp/florens-carto/style/common-values.sql
 # Regional render has no Antarctic features. Keep the expected empty schemas.
 psql gis -c 'CREATE TABLE icesheet_polygons (way geometry(Geometry,3857)); CREATE TABLE icesheet_outlines (way geometry(Geometry,3857),ice_edge boolean);'
 for source in simplified_water_polygons water_polygons; do
  if [ "$source" = simplified_water_polygons ]; then
   CARTO_WATER_ARCHIVE=simplified-water-polygons-split-3857
  else
   CARTO_WATER_ARCHIVE=water-polygons-split-3857
  fi
  if [ ! -s "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip" ]; then
   curl --fail --location --retry 3 "https://osmdata.openstreetmap.de/download/$CARTO_WATER_ARCHIVE.zip" -o "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip"
  fi
  mkdir -p /tmp/florens-carto/water
  unzip -q -o "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip" -d /tmp/florens-carto/water
  # Use the exact ocean data, spatially filtered to the regional render buffer.
  /usr/bin/python3 tools/carto/import-water.py "$source" "/tmp/florens-carto/water/$CARTO_WATER_ARCHIVE/$source.shp"
  rm -rf /tmp/florens-carto/water
 done
 pg_dump --format=custom gis -f "$CARTO_CACHE/region.dump"
else
 pg_restore --dbname gis --no-owner "$CARTO_CACHE/region.dump"
fi
mkdir -p /tmp/florens-carto/style/fonts
for face in Regular Bold Italic; do
 curl --fail --location --retry 3 "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-$face.ttf" -o "/tmp/florens-carto/style/fonts/NotoSans-$face.ttf"
done
for family in NotoSansSymbols NotoSansSymbols2; do
 curl --fail --location --retry 3 "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/$family/$family-Regular.ttf" -o "/tmp/florens-carto/style/fonts/$family-Regular.ttf"
done
cd /tmp/florens-carto/style
/tmp/carto-cli/node_modules/.bin/carto -a '3.1.0' project.mml > project.xml
