# Reseguiden

En statisk reseguide med återanvändbart kartgränssnitt. `index.html` innehåller presentation och interaktion. Resans innehåll läses från tre JSON-filer:

| Innehåll | Schema | Ansvar |
| --- | --- | --- |
| `places.json` | `places.schema.v1.json` | Platser, positioner, länkar och verifieringsstatus |
| `routes.json` | `routes.schema.v1.json` | Delsträckor, färdsätt och ordnade plats-id |
| `guide.json` | `guide.schema.v1.json` | Titel, destination, tidszon, kartutsnitt, resdagar, program, bokningar och presentation |

Varje innehållsfil har `schemaVersion`, `contentVersion` och `updatedAt`. SchemaVersion ändras när datakontraktet ändras. ContentVersion ändras när innehållet i just den filen ändras. Versionerna är oberoende mellan filerna.

Koordinater och adresser lagras i platsregistret. Rutter och bokningar hänvisar till plats-id. Resdagar hänvisar till rutt-id. Programmet består av strukturerade textdelar, fetstil, kursiv text och platsknappar; rå HTML används inte i programmet.

Kartan visar samma delsträckor som tidigare. Linjerna mellan platserna är inte beräknade gatuvägar. `walk` visas heldraget och övriga färdsätt streckat.

`guide.json` styr dagsvalens etiketter och datum, automatisk dagsvisning i resans tidszon, kategorifilter, permanenta markörer och befintliga ikon- och popupinställningar. Bokade markörer bestäms av `bookings`.

## Kontrollera innehållet

Kör `npm ci` och `npm run check`. Kontroll sker också vid laddning i webbläsaren och automatiskt i GitHub. Samtliga scheman, unika id:n, länkar mellan filerna, nödvändiga positioner, bokningsdatum och kategorier kontrolleras. Geografisk riktighet och företagsidentitet kräver separat källverifiering; strukturellt godkända data blir inte automatiskt verifierade.

Valideringskoden ligger i `tools/validator-entry.js`. Efter ändringar där: kör `npm run build` och spara den genererade `places-validator.js`. Trots filnamnet validerar den alla tre innehållsfilerna med deras egna scheman.

## Nästa resa

Kopiera guiden till en separat katalog eller ett separat repository och ersätt de tre innehållsfilerna. Återanvänd index, scheman och valideringskod. Ange den nya resans plats-id, rutter, datum, tidszon och kartutsnitt. Behåll Florensguidens egna filer separat.

## Version och verifiering, 10 oktober 2026

| Fil | Schemaversion | Innehåll/programversion |
| --- | ---: | ---: |
| places.json | 1 | 3 |
| routes.json | 1 | 2 |
| guide.json | 1 | 3 |
| index.html | – | 1.2.0 |
| valideringskod | – | 1.1.0 |
| verification-report.v2.md | – | Rapportversion 2 |

[Verifieringsrapport version 2](verification-report.v2.md) listar samtliga 69 platser, koordinatändringar, källor, öppettider, kontrollerade delsträckor och kvarstående osäkerheter. 66 poster uppfyller de fyra registerkontrollerna. Giannini, Cosi – Chiantigiana och Passamaneria Toscana är markerade `unresolved`. Exakt entrépunkt är inte separat verifierad för alla platser.

`tools/map-links.js` skapar platskort och navigeringslänkar från kanoniska data. Verifierat företags-id används där det finns. Annars används en namngiven koordinatpunkt med reservation. Adressflaggor i presentationen påverkar inte längre navigeringsmålet. En senare verifierad `entrance.position` prioriteras för navigering.

Vid ändrad position måste motsvarande navigeringskontroll återställas och genomföras på nytt. Valideringen kräver källstöd för markerade kontroller, samma Apple-id i URL och register, samt att navigeringskällans destination stämmer med aktuell punkt. Den kontrollerar inte fysiska verkligheten eller dagsaktuella öppettider automatiskt.

## Listvyer – programversion 1.2.0

Karta, Schema och Sevärdheter använder samma validerade JSON-innehåll. Schema visar bokningar i resans tidszon, planerat program och valbara ruttstopp. Sevärdheter visar samtliga platser i alfabetisk ordning, beskrivning, adress, boknings-/osäkerhetsstatus och samma navigeringsmål som kartan. Kategorifiltren följer kartans lager; hotellet är fortsatt permanent. Visa på kartan öppnar rätt markör och aktiverar dess lager vid behov. Vyn kan länkas med `#schema` eller `#sevardheter` och bevaras vid uppdatering.

Innehåll och scheman har inte ändrats: platser 3, rutter 2 och guide 3; samtliga schemaversion 1.

Mobil- och surfplatteflöden kan regressionstestas med `node tools/check-list-views.cjs` i en miljö med Playwright och Chromium. `BROWSER_EXECUTABLE_PATH` kan ange en befintlig Chromium-installation. Testet kontrollerar dagar/bokningar, platser, delade URL:er, synkroniserade filter, marköröppning, vy efter omladdning och tangentbordsnavigering.
