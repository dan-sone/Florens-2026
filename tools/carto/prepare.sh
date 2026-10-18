#!/usr/bin/env bash
set -euo pipefail
CARTO_WORK_DIR="${CARTO_WORK_DIR:-/tmp/trip-guide-carto}"
export CARTO_WORK_DIR
CARTO_CACHE=$(node tools/carto/prepare-config.cjs "$CARTO_WORK_DIR")
mkdir -p "$CARTO_CACHE" "$CARTO_WORK_DIR"
CARTO_REGION_URL=$(node -e "console.log(require(process.env.CARTO_WORK_DIR+'/build.json').sourceUrl)")
if [ ! -d "${CARTO_WORK_DIR}/style" ]; then
 git clone --depth 1 --branch v6.1.0 https://github.com/openstreetmap-carto/openstreetmap-carto.git "${CARTO_WORK_DIR}/style"
fi
if [ ! -s "$CARTO_CACHE/region.osm.pbf" ]; then
 curl --fail --location --retry 3 "$CARTO_REGION_URL" -o "$CARTO_CACHE/region.osm.pbf.part"
 mv "$CARTO_CACHE/region.osm.pbf.part" "$CARTO_CACHE/region.osm.pbf"
fi
CARTO_EXTRACT_BOUNDS=$(node -e "const s=require(process.env.CARTO_WORK_DIR+'/scope.json').bounds;console.log([s[0][1]-.14,s[0][0]-.1,s[1][1]+.14,s[1][0]+.1].join(','))")
if [ ! -s "$CARTO_CACHE/region.dump" ]; then
 osmium extract --overwrite --strategy=smart --bbox "$CARTO_EXTRACT_BOUNDS" "$CARTO_CACHE/region.osm.pbf" -o "${CARTO_WORK_DIR}/extract.osm.pbf"
 osm2pgsql --output flex --style "${CARTO_WORK_DIR}/style/openstreetmap-carto-flex.lua" --database gis --cache 1800 --number-processes 2 "${CARTO_WORK_DIR}/extract.osm.pbf"
 psql gis -f "${CARTO_WORK_DIR}/style/indexes.sql"
 psql gis -f "${CARTO_WORK_DIR}/style/functions.sql"
 psql gis -f "${CARTO_WORK_DIR}/style/common-values.sql"
 # Regional render has no Antarctic features. Keep the expected empty schemas.
 psql gis -c 'CREATE TABLE icesheet_polygons (way geometry(Geometry,3857)); CREATE TABLE icesheet_outlines (way geometry(Geometry,3857),ice_edge boolean);'
 for source in simplified_water_polygons water_polygons; do
  if [ "$source" = simplified_water_polygons ]; then
   CARTO_WATER_ARCHIVE=simplified-water-polygons-split-3857
  else
   CARTO_WATER_ARCHIVE=water-polygons-split-3857
  fi
  if [ ! -s "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip" ]; then
   curl --fail --location --retry 3 "https://osmdata.openstreetmap.de/download/$CARTO_WATER_ARCHIVE.zip" -o "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip.part"
   mv "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip.part" "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip"
  fi
  mkdir -p "${CARTO_WORK_DIR}/water"
  unzip -q -o "$CARTO_CACHE/$CARTO_WATER_ARCHIVE.zip" -d "${CARTO_WORK_DIR}/water"
  # Use the exact ocean data, spatially filtered to the regional render buffer.
  /usr/bin/python3 tools/carto/import-water.py "$source" "${CARTO_WORK_DIR}/water/$CARTO_WATER_ARCHIVE/$source.shp"
  rm -rf "${CARTO_WORK_DIR}/water"
 done
 pg_dump --format=custom gis -f "$CARTO_CACHE/region.dump.part"
 mv "$CARTO_CACHE/region.dump.part" "$CARTO_CACHE/region.dump"
else
 pg_restore --dbname gis --no-owner "$CARTO_CACHE/region.dump"
fi
mkdir -p "${CARTO_WORK_DIR}/style/fonts"
for face in Regular Bold Italic; do
 curl --fail --location --retry 3 "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-$face.ttf" -o "${CARTO_WORK_DIR}/style/fonts/NotoSans-$face.ttf"
done
for family in NotoSansSymbols NotoSansSymbols2; do
 curl --fail --location --retry 3 "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/$family/$family-Regular.ttf" -o "${CARTO_WORK_DIR}/style/fonts/$family-Regular.ttf"
done
cd "${CARTO_WORK_DIR}/style"
/tmp/carto-cli/node_modules/.bin/carto -a '3.0.22' project.mml > project.xml
