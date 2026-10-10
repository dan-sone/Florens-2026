# Reseguiden

En statisk reseguide med återanvändbart kartgränssnitt. `index.html` innehåller presentation och interaktion. Resans innehåll läses från tre JSON-filer:

| Innehåll | Schema | Ansvar |
| --- | --- | --- |
| `places.json` | `places.schema.v1.json` | Platser, positioner, länkar och verifieringsstatus |
| `routes.json` | `routes.schema.v1.json` | Delsträckor, färdsätt och ordnade plats-id |
| `guide.json` | `guide.schema.v2.json` | Titel, destination, tidszon, kartutsnitt, resdagar, program, bokningar, flyg och presentation |

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
| guide.json | 2 | 4 |
| index.html | – | 1.3.0 |
| valideringskod | – | 1.3.0 |
| verification-report.v2.md | – | Rapportversion 2 |

[Verifieringsrapport version 2](verification-report.v2.md) listar samtliga 69 platser, koordinatändringar, källor, öppettider, kontrollerade delsträckor och kvarstående osäkerheter. 66 poster uppfyller de fyra registerkontrollerna. Giannini, Cosi – Chiantigiana och Passamaneria Toscana är markerade `unresolved`. Exakt entrépunkt är inte separat verifierad för alla platser.

`tools/map-links.js` skapar platskort och navigeringslänkar från kanoniska data. Verifierat företags-id används där det finns. Annars används en namngiven koordinatpunkt med reservation. Adressflaggor i presentationen påverkar inte längre navigeringsmålet. En senare verifierad `entrance.position` prioriteras för navigering.

Vid ändrad position måste motsvarande navigeringskontroll återställas och genomföras på nytt. Valideringen kräver källstöd för markerade kontroller, samma Apple-id i URL och register, samt att navigeringskällans destination stämmer med aktuell punkt. Den kontrollerar inte fysiska verkligheten eller dagsaktuella öppettider automatiskt.

## Listvyer – programversion 1.2.0

Karta, Schema och Sevärdheter använder samma validerade JSON-innehåll. Schema visar bokningar i resans tidszon, planerat program och valbara ruttstopp. Sevärdheter visar samtliga platser i alfabetisk ordning, beskrivning, adress, boknings-/osäkerhetsstatus och samma navigeringsmål som kartan. Kategorifiltren följer kartans lager; hotellet är fortsatt permanent. Visa på kartan öppnar rätt markör och aktiverar dess lager vid behov. Vyn kan länkas med `#schema` eller `#sevardheter` och bevaras vid uppdatering.

Listvyerna infördes i 1.2.0. Flygstödet infördes i 1.3.0 enligt nedan.

Mobil- och surfplatteflöden kan regressionstestas med `node tools/check-list-views.cjs` i en miljö med Playwright och Chromium. `BROWSER_EXECUTABLE_PATH` kan ange en befintlig Chromium-installation. Testet kontrollerar dagar/bokningar, platser, delade URL:er, synkroniserade filter, marköröppning, vy efter omladdning och tangentbordsnavigering.

## Flyg – programversion 1.3.0

Guide schema v2 lägger till `flights` (tom lista för resor utan flyg). Innehållsversionen för guiden är 4; platser och rutter är oförändrade. V1-schemat finns kvar för äldre guider. Index och kontrollscript läser respektive dokuments versionsbestämda schemareferens.

Varje flyg har unikt id, dayId, flightNumber, operator, eventuellt onBehalfOf samt departure/arrival. Varje ändpunkt har airportCode, airportName, city, at med UTC-offset, timeZone och eventuell terminal. Schema visar korten i avgångsordning med lokala tider och datum; bytestiden beräknas mellan flyg samma dag på samma flygplats. Terminaler visas enligt bokningen och kan ändras. Bokningsreferenser ingår inte i det offentliga innehållet och tillåts inte av schemat.

Flyguppgifterna kommer från användarens bokning 10 oktober 2026: OS962 ARN–VIE 13 oktober 10:05–12:15, OS535 VIE–FLR 12:45–14:05, SK1916 FLR–ARN 17 oktober 17:20–20:10. Detta är bokade tider, inte en kontroll av aktuell flygstatus. Valideringen kontrollerar unika flyg-id, resdag, flygplatskod, tidszon/offset och ankomst efter avgång.
