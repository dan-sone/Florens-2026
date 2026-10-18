# Florens offline guide

The ordinary `index.html` guide includes an offline download button in the existing map controls. The reusable `offline-scope.js` engine and `offline-config.json` are unchanged. Online the original OpenStreetMap layer is used; without connectivity the saved Carto package is selected automatically, including when connectivity changes while the guide is open. The same guide URL works after closing and reopening offline. `offline/guide.html` remains a generated test snapshot; do not edit it by hand.

## Original cartography

The basemap is self-rendered **OpenStreetMap Carto 6.1.0**, with its official colors, labels, symbols and scale rules. Mapnik renders 8×8 metatiles with a label buffer, then crops the standard 256px tiles. Lossless WebP tiles are stored in PMTiles v3 archives, partitioned by z15 parent tile (plus one overview archive), each below 20 MiB. All zooms 0–19 are present; there is no vector overzoom. Leaflet reads only visible tiles through a local CacheStorage Blob source; no WebGL is needed.

This is the same cartographic design as the guide's standard OpenStreetMap layer. A pixel-identical live image is not promised: source data dates, style releases, renderer/font versions and label placement at metatile boundaries can differ from the public live service. The snapshot does not update during the trip. Basemap symbols/labels are baked into the map, just like the original raster layer; the guide's own place pins and cards stay interactive.

Data comes from Geofabrik's Centro Italy OSM extract. Ocean geometry comes from osmdata.openstreetmap.de. No tiles are bulk-downloaded from tile.openstreetmap.org: its policy forbids offline prefetching. The renderer uses the official Carto source and fonts. Preserve OpenStreetMap attribution and the included CC0 Carto license. Source URLs, input SHA-256, package hashes, sizes, tile counts and render time are recorded in `assets/offline/raster/index.json`.

## Coverage and reusable scope

The existing general rule engine remains trip-independent: hotel anchor, walking routes, local radius, connected clusters, excluded categories, per-place overrides and margins. Florence currently contains 77 positioned places with a 450 m margin, over approximately 4.45 × 4.51 km. The bounds are south 43.7413904, west 11.2350214, north 43.7813384, east 11.2912022. Synthetic tests cover distant outliers, excluded categories and overrides. A rebuild is required when these calculated bounds change; the build rejects a mismatched package. `check-carto-package.cjs` reads every tile intersecting the scope at every zoom, validating partitions, XYZ/TMS addressing and WebP payloads.

## iPhone and iPad test

1. Open the ordinary HTTPS guide directly in **Safari**, in a normal tab, online. In **Karta**, tap the download-arrow button among the map controls. Each device/browser/origin needs its own download. Files, GitHub source pages, raw GitHub URLs and ordinary HTTP LAN addresses are unsuitable for Service Workers.
2. Tap **Hämta för offline**. Keep Safari visible and the device awake until **Redo för offline · alla filer finns lokalt.** appears. The displayed package size is exact for that build; browser overhead and temporary copies require extra free space. Allow at least twice the displayed size when updating an existing package. Three bounded downloads run concurrently. Progress counts verified bytes. A progressing transfer may continue; 60 seconds without incoming data aborts it. Cancel, HTTP errors, wrong file size, wrong SHA-256 and quota failures cannot create a complete package.
3. Tap **Klart** to close the download panel. Check the familiar Karta, Dagar, Sevärdheter and Historia views. The dashed blue rectangle marks the saved scope. Check labels, shops, museums and original icons around Piazza della Signoria at zooms 17–19.
4. Turn on airplane mode **and turn Wi-Fi off**. Reload. Pan over the whole marked rectangle and zoom 0–19. Check Duomo, Ponte Vecchio, Santa Croce, San Miniato and Lisio. Open place cards and history pictures, switch days and show routes.
5. Close the tab and reopen the same ordinary guide URL offline. Repeat portrait/landscape and on iPad. The guide must load without a connection.
6. Tap the download-arrow button to reopen the offline panel. A green dot indicates a saved package. A newer available package is offered as **Uppdatera offlinepaketet**. **Kontrollera paketet** checks local hashes. **Ta bort paketet** removes this version; downloading is required again afterward.
7. Optional: Share → Add to Home Screen. Open that installed app online and download/check **there** before relying on it. Do not assume it shares Safari's stored package.

Routes are the guide's existing lines between stops, not new street-following routing or turn-by-turn navigation. Apple Maps links, websites, ChatGPT and live information need connectivity or their own downloaded resources. GPS depends on hardware and permission; Wi-Fi-only iPads may lack GPS.

## Safari limits

HTTPS, Service Workers, CacheStorage and WebP support are required. Current iOS/iPadOS Safari supports these. No WebGL requirement remains. Automated Playwright WebKit is a compatibility check, not a physical-device Safari test. The Carto test version passed the owner's physical-device test before production integration. The ordinary guide integration additionally has dedicated automated tests for the root/index URL, online/offline switching, cold offline starts, recovery and deleting/re-downloading in the same page. Repeat the checklist on each device after downloading on the ordinary host.

Safari may suspend downloads when the app goes into the background or the phone locks. Keep the page open until ready; no background download is promised. Private browsing is unsuitable for durable storage. Storage estimates/persistence requests are optional and used where available. Safari can evict website data under storage pressure or after prolonged inactivity, and manually clearing website data deletes the package. Home Screen installation may improve persistence heuristics but does not replace a pre-departure airplane-mode check. Moving to another preview domain or production does not move the download.

Primary references: https://webkit.org/blog/14403/updates-to-storage-policy/ and https://operations.osmfoundation.org/policies/tiles/

## Integrity and isolation

All guide assets, data, schemas, scripts, CSS, fonts, history images and raster archives are local. Every file has a byte count and SHA-256. Canonical HTML is delivered inside a verified JSON package, so a host's live HTML decorations cannot corrupt the offline copy. A completion marker is written last. On failure all parallel workers settle before partial files are removed. An older complete package remains usable until the replacement completes. Missing/corrupt files invalidate readiness.

The production `offline-sw.js` controls this repository's guide directory. Online requests stay fresh; a complete local snapshot is used when requests fail or the device is offline. The separate legacy test workers control only the `offline-map-test` prefix and `/offline/`. Versioned caches use the manifest's content hash. Only older caches belonging to this feature are removed after a successful update. Packages downloaded on the private test host do not transfer to the ordinary guide host; download once again there.

## Build and verify

`Render original OSM Carto preview` builds regional data and original map tiles on the experimental branch. `Build and verify offline preview` prepares the local guide from those archives, checks content/scope/full tile coverage and runs Chromium and WebKit at iPhone/iPad sizes, including Retina, extensionless hosting and modified live HTML. Tests sever both the browser connection and HTTP origin. They cover cold starts, panning, guide views/routes/images, update fallback, network errors, cancellation, storage quota, missing/corrupt assets and production isolation. Screenshots and results are attached to the Actions run. A failed/cancelled run is not a verified version.

```sh
npm ci
npm run fetch:offline
# Raster packages are committed. Rebuild them with the Carto workflow if scope changes.
npm run build:offline
npm run check
node tools/check-offline-scope.cjs
node tools/check-carto-package.cjs
npx playwright install --with-deps chromium webkit
npm run test:offline
```

Full rendering additionally requires Ubuntu/PostgreSQL/PostGIS/osm2pgsql/Mapnik/CartoCSS and go-pmtiles 1.31.2, as pinned in `.github/workflows/carto-render.yml`. Cached regional inputs are keyed by the scope inputs. The Florence renderer currently imports Centro Italy and uses empty Antarctic tables; other destinations require selecting their regional raw source and any relevant external datasets. The rule engine itself is reusable without changes.
