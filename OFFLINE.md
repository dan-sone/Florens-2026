# Florens offline preview

Production `index.html` is unchanged. `offline/guide.html` is a generated copy of its UI, with a local Protomaps/PMTiles basemap and locally hosted dependencies. Do not edit the generated guide by hand.

## Build and review

The `offline-florence-map` branch runs **Build and verify offline preview** in GitHub Actions. It extracts the map, builds the preview, tests it with Chromium and WebKit at iPhone and iPad viewport sizes, and commits generated assets to this branch only after the checks pass. It never deploys or merges production. Browser screenshots/results and a self-hostable site archive are attached to the run. A failed or cancelled run is not a verified preview.

The source of the basemap is Protomaps' 2026-10-16 planet build, format version 4.15.2, OSM replication time 2026-10-16 04:00 UTC. The extraction tool is go-pmtiles 1.31.2. Tiles are MVT vectors in PMTiles v3, zooms 0–15, overzoomed by MapLibre up to the guide's existing zoom 19. Additional zoom does not add information beyond z15. This is a street map, not satellite imagery.

The existing `offline-scope.js` rule engine and `offline-config.json` are unchanged. The current computed rectangle is approximately 4.45 × 4.51 km, contains 77 positioned places and a 450 m margin, with bounds south 43.7413904, west 11.2350214, north 43.7813384, east 11.2912022. The current dataset contains no excluded positioned places; synthetic tests must cover airports/day trips/distant outliers. The engine remains trip-independent: hotel anchor, walking routes, local radius, connected clusters, excluded categories and per-place overrides. A package rebuild is mandatory if the calculated bounds change. Build validation checks the real PMTiles header against the computed bounds, so an outdated extent cannot silently ship.

## iPhone and iPad test

Owner-private HTTPS preview: https://florens-offline-test.soundreed8192.chatgpt.site/offline-map-test.html . Sign in with the owner's ChatGPT account if prompted. This is a separate test host; the GitHub Pages production guide is unchanged.

The preview must be served over HTTPS (or localhost for a desktop test). A GitHub file page, raw.githubusercontent.com, opening an HTML file from Files, and ordinary HTTP to a Mac's LAN IP do not provide a suitable offline app origin.

1. Open the supplied **offline-map-test.html** preview link in Safari, in a normal tab, while online. Do this separately on each device. About 11.2 MB is downloaded; browser storage overhead is additional (about 12–15 MB total observed in Chromium). Allow at least 25 MB free for temporary copies and updates.
2. Tap **Hämta för offline** and keep the page visible until **Redo för offline · alla filer finns lokalt.** appears. A progress bar shows verified bytes. All files are checked with SHA-256 before readiness is recorded. The same checks run when the test page opens again; missing/corrupt files invalidate readiness.
3. Tap **Öppna hela testguiden**. Verify the familiar Karta, Dagar, Sevärdheter and Historia views. The quiet dashed blue rectangle on the map marks the intended saved extent. The basemap's colors and label placement differ from the online raster map; app controls, icons, content and interactions use the existing guide UI.
4. Turn on airplane mode **and turn Wi-Fi off**. Airplane mode alone can leave Wi-Fi enabled. Reload the guide, pan around the entire marked rectangle, and zoom in to read street names. Check Ponte Vecchio, Duomo, Santa Croce, San Miniato and Lisio. Open place cards, switch days and show a route. Open Historia and expand the image sections.
5. Close the tab. Open the **same preview URL** again while still offline. The guide must load without a network connection. Also test portrait and landscape, and repeat on iPad.
6. Return to the test/download page using the **Offlinetest** link. Check that it still reports ready. **Kontrollera paketet** rechecks local checksums without needing a network connection. **Ta bort paketet** deletes only this version of the offline pack; another online download is needed afterward.
7. Optionally use Safari's Share → Add to Home Screen. Open that installed version online and download/check the package **there** before relying on it; do not assume it shares Safari's storage. Use that same icon during the trip.

The map and existing route overlays work offline. Routes remain the guide's existing lines between stops; they are not new street-following routes or an offline turn-by-turn navigation engine. Apple Maps directions, linked websites, ChatGPT and live information need connectivity or their own separately downloaded resources. GPS may work offline if the device has GPS and location permission, but this preview does not guarantee a GPS fix; Wi-Fi-only iPads may lack GPS hardware.

## Safari storage limits

HTTPS and Service Workers are required; MapLibre 5 also needs WebGL2. Use a current iOS/iPadOS Safari. Storage estimates and persistent-storage requests use the Safari 17+ Storage API when available, and are optional on older versions. Private browsing is unsuitable for durable trip storage. Downloads can be interrupted when Safari is suspended or the phone locks; keep the page visible, then retry if needed. There is no background download promise.

Safari storage is best effort unless persistent storage is granted, and even persistence is not a backup against manually clearing website data. Low storage pressure and prolonged inactivity can cause eviction. Home Screen installation can improve persistence heuristics but is not a guarantee. Check **Redo för offline** shortly before departure, in the browser/app you will actually use. Each browser/device/origin needs its own download. Moving between preview domains or later to production does not move the saved package.

Primary reference: https://webkit.org/blog/14403/updates-to-storage-policy/

## Implementation

- Local files only: PMTiles, MapLibre, PMTiles decoder, Leaflet/adapter, existing plugins, icon fonts, Noto glyph subsets, data, schemas, styles and history images. No runtime CDN, external sprites or external glyph service is needed. Bundled normal/Retina Protomaps v4 sprites restore basemap museum, shop, food and service labels independently of the guide’s own pins. The palette uses blue water, green parks, warm buildings and stronger road/text contrast inspired by the online OpenStreetMap map. It is not pixel-identical to OSM’s raster cartography. Zoom to 16–19 for shop names; collision rules hide overlapping labels. Cultural labels are prioritized. Noto glyph ranges cover the Latin/European characters and punctuation used in this Florence map; another destination/language can require additional ranges.
- PMTiles reads the locally cached Blob through a custom byte source. It never relies on cached HTTP range fragments, a tile provider's HTTP cache or unsupported bulk downloading of OpenStreetMap's raster tile service. The archive is about 5.25 MB and is read as a Blob, with slices decoded on demand.
- CacheStorage stores full verified files. A completion marker is written last. Failed first downloads are cleared; cancel, timeout, HTTP failure, truncated/corrupt files and quota errors cannot produce a ready state. Older feature-specific caches are removed only after the new pack completes. Other site caches are never deleted. The Service Worker falls back to an older complete pack if the current version has not completed; the online download page discovers the new manifest without mixing partial guide resources.
- Service Workers control only `offline-map-test.html` and `/offline/`. They do not control production `index.html`, even on the same host. Production code is not registered for offline support in this PR.
- Versioned cache names come from an asset manifest. `offline-files.js` contains the same manifest and is saved with the completed pack so that a cold offline launch has all bootstrap data.
- Build inputs and generated dependencies are locked by `package-lock.json`. Basemap data is a Produced Work distributed with OpenStreetMap attribution; Protomaps supports self-hosted region extraction. Preserve the displayed attribution and the bundled library/font licenses. See https://docs.protomaps.com/basemaps/downloads and https://docs.protomaps.com/pmtiles/cli.

## Reproduce locally

```sh
npm ci
npm run fetch:offline
# Install go-pmtiles 1.31.2, then:
PMTILES_CLI=/path/to/pmtiles npm run extract:offline
npm run check
npx playwright install --with-deps chromium webkit
npm run test:offline
python3 -m http.server 8765
```

Desktop test URL: http://localhost:8765/offline-map-test.html. For an iPhone use an HTTPS host serving the complete built site, not the desktop localhost URL. GitHub Actions supplies a complete preview archive for any static HTTPS host; do not merge this PR merely to obtain a test link.

Browser tests additionally verify rendered museum, shop and food POIs and the local museum sprite with the network disconnected, including a Retina iPad viewport.

Tests use Playwright 1.64.1 with browser offline mode and a disconnected HTTP origin in both Chromium and WebKit; no preview resource can be delivered by the network. Older Playwright WebKit offline emulation has a known defect fixed in 1.64 (https://github.com/microsoft/playwright/issues/42775). Automated WebKit is a useful compatibility check, not a test on physical iPhone/iPad Safari. The physical-device airplane-mode checklist above remains the final acceptance test before production integration.
