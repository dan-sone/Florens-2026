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
