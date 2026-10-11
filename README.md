## Navigation för tummarna – UI 1.18.0

Vyvalen ligger fast längs nederkanten: till vänster vid bred panelvisning på iPad/dator och över skärmens bredd i mindre helskärmsvyer. Alla fyra vyer har ikon och namn, minst 48 px tryckyta och samma placering mellan vybyten. Listorna börjar högre upp och har extra nedre marginal så slutet kan läsas ovanför menyn.

Lager, Dagar och rutter, Min position och Uppdatera ligger i en gemensam knappkolumn nere till höger, ovanför telefonens vyval och vid nederkanten på större skärmar. Lager öppnas till vänster med nederkanten intill knappen. Ruttkortet förankras vid ruttknappens nederkant och dess höjd beräknas utifrån utrymmet ovanför. Platskort ligger ovanför vyvalen och kartknapparna döljs medan kortet är öppet. Skalan ligger ovanför den nedre navigationen.

Tester omfattar sex telefon/surfplatteformat och fem format för läspaneler i dag/natt, 200 procent text i lager och program, knapparnas ordning och nedre placering, fasta vyval, etiketter, popupgränser, drag och scroll samt gemensamma ikonankare och oberoende filter. Bildkontroll är genomförd för telefon och iPad. Tester använder lokal Leaflet-adapter, inte fysisk Safari. Alla platser, koordinater, rutter, reseprogram och innehålls-/schemaversioner är oförändrade.

## Visa till vänster i Historia – UI 1.17.3

Visa-knappen ligger nu till vänster om kategoriikonen och platsnamnet i varje historiekapitel. Knappstil och funktion är oförändrade.

## Gemensam Visa-knapp i Historia – UI 1.17.2

Platserna i varje historiekapitel visar platsens kategoriikon och namn, följt av samma Visa-knapp som i Dagar och Sevärdheter. Knappen återanvänder den gemensamma action-renderaren med kartnålsikon, texten Visa och samma färger. Den tidigare stora länkraden med Visa på kartan och pil är ersatt. Funktionen markerar nålen utan popup. Innehåll och positioner är oförändrade.

## Fast meny och markering utan popup – UI 1.17.1

Flikmenyn ligger fast uppe till vänster med samma läge och bredd mellan vyerna. Visa centrerar och förstorar den valda kartnålen utan att öppna ett platskort; på större skärmar behålls läspanelen, på telefon visas kartvyn. Ett annat val flyttar markeringen och karttryck tar bort den. Tryck på själva kartnålen öppnar fortfarande dess platskort. Gå har samma knappstil som övriga alternativ i alla vyer. Positioner och innehåll är oförändrade.

Navigationstestet kontrollerar menyns oförändrade geometri mellan vyerna, Visa utan popup, en vald nål åt gången, byte och borttagning av markering samt likvärdig stil för Gå och Kartor, i dag/natt och på större och mindre skärmar.

## Läsning bredvid kartan – UI 1.17.0

Dagar, Sevärdheter och Historia visas i en vänsterpanel när skärmen är minst 900 px bred och 500 px hög. Kartans verkliga behållare får återstående bredd; den täcks inte av läspanelen. Flikarna ligger ovanför panelens innehåll. Karta återgår till hela kartbredden. Mindre och låga skärmar behåller helskärmsvyerna.

Visa på kartan behåller läspanelen på större skärmar och öppnar platskortet inom kartans fria yta. På telefon återgår samma knapp till kartvyn. Kartan räknar om storleken vid vybyte, visning av en plats och passage av storleksgränsen. Scrollposition och öppna kort bevaras. Panelen har en ljus/mörk läsbar glasbakgrund och stöd för minskad transparens.

Navigationstestet omfattar alla tre läsvyerna, 1024×768 och 1366×1024, stående iPad 834×1194, telefon 390×844 och låg bred skärm 956×440, dag/natt, kartans fria yta, popupens gränser, hotellkort under tisdag, återställd scroll och öppna kort samt växling mellan panel och helskärm. Tester använder en lokal Leaflet-adapter; fysisk Safari är inte verifierad. Platser, positioner, rutter och alla innehålls- och schemaversioner är oförändrade.

## Hotellet under ankomstdagen – UI 1.16.2

Boendekortet visas nu inne i tisdagens dagkort, efter utresans flyg. Det fristående kortet överst i Dagar är borttaget. Hotellinformation, länkar, kartvisning och alla innehålls- och schemaversioner är oförändrade.

## Tydligare bokat-markering – UI 1.16.1

Den gröna bokat-markeringen på kartnålarna har ökats från 10 till 13 px i diameter, med proportionerligt större bock. Nålarnas storlek, ankare och positioner är oförändrade. Presentationsfilen har en versionsparameter för uppdatering av cache. Innehåll och scheman är oförändrade.

## Integrerade dagval och växlande lagerknapp – UI 1.16.0

Lager-knappen öppnar och stänger samma meny. Leaflets automatiska hover-öppning och ursprungliga länklyssnare ersätts av en vanlig knapp med aria-expanded. Enter/blanksteg växlar menyn; Escape stänger och återför fokus. Karttryck, öppning av rutter eller platskort uppdaterar också knappens tillstånd.

Ruttkortet har sex integrerade dagknappar i stället för en smal native select: Ingen rutt och resans fem dagar. Alla etiketter visas helt, och valt alternativ markeras. Layouten anpassas med två kolumner på små telefoner och tre på större skärmar. Valet uppdaterar befintlig rutt, rubrik och program utan en extra systempopup. Dagvalen och programmet scrollas inom kortet när skärmen är låg. Ingen rutt behåller Välj dag och funktionsförklaringen. Alla innehålls- och schemaversioner är oförändrade; positioner, rutter och reseprogram är oförändrade.

Navigationstestet omfattar 1024×768 och 768×1024 för surfplatta samt fyra telefonstorlekar, dag/natt, fullständiga knappetiketter och minst 44 px träffytor, dubbeltryck för att stänga lager samt Enter, blanksteg och Escape. Leaflets hover-lyssnare återges i testadaptern för att kontrollera att de kopplas bort.

## Kompakt lagermeny och Välj dag – UI 1.15.1

Lagermenyn och övriga kartkort delar samma glasfärg, kant, skugga och blur. Lagerkontrollens yttre behållare är transparent och saknar blur, så menyn inte får en extra glasnivå. Menyn använder innehållsbredd med skärmgräns; kryssrutorna ligger på högersidan, närmast knappen, med 44 px rader. Läget Ingen rutt visar Välj dag och förklarar hur dagvalet visar plan och rutt, och hur Ingen rutt döljer ruttlinjerna. Det kortet får bara den höjd förklaringen behöver. Guide har schema 5, innehåll 14; övrigt innehåll, platser, positioner och rutter är oförändrade.

## Lagertext och kartkortens gester – UI 1.15.0

Leaflet 1.9.3 har en mer specifik öppet-läge-regel som sätter lagermenyn till position:relative. Den skrev över vår tidigare placering. Menyn har nu en uttrycklig absolut placering även i öppet läge. Leaflets verkliga, nästlade etiketter läggs som flexrader med separat checkbox, ikon och radbrytande text. Testet återger bibliotekets konfliktregel och etikettstruktur samt kontrollerar normala och dubblerade textstorlekar.

Kartkortets dragknapp har fortsatt 44 px träffyta men ligger över rubrikområdet i stället för att ta en tom rad. Överkantens avstånd är cirka 20 px. Rubrik och draglist flyttar kortet; texten scrollas nativt i båda lägena. Ett svep uppåt, scroll eller mushjul i den korta textvyn öppnar hela kortet och bevarar läspositionen. Scroll nedåt i texten stänger inte kortet. Dra nedåt på rubrik/draglist stänger efter 64 px; mindre rörelser återgår till samma läge. Avbrutna drag återställer läget. Tryck och tangentbord växlar kort/helt läge.

`check-map-navigation.cjs` testar verklig pekarfångst, musdrag och emulerat touchsvep med nativ scroll, förutom tidigare storlekar/dag/natt. Innehåll, kategorier, positioner och länkar är oförändrade. UI och place-sheet.css har version 1.15.0.

## Skala vid nederkanten – UI 1.14.2

Den gamla mobilregeln som lyfte nederkontrollerna 142 px är borttagen. Skalan ligger nu längst ned till vänster, på samma baslinje som Uppdatera och med iPhones safe-area-insets. När ett plats- eller ruttkort öppnas döljs skalan; den återkommer när kortet stängs. Skalan fångar inte kartgester. Innehåll och positioner är oförändrade.

## Mer transparens och enklare kartkontroller – UI 1.14.1

Kartans glasytor är mer transparenta: 55 % opacitet i dagläge och 62 % i nattläge. Lagerväljaren har en fast 44 px knapp även i Leaflets öppna läge; menyn begränsas av skärmens bredd, höjd och safe-area-insets och scrollas vid behov. Fullskärmknappen och dess plugin är borttagna. Uppdatera ligger i nedre högra hörnet. Skalan visar endast meter/kilometer, inte fot/miles. Innehåll och positioner är oförändrade.

## Kartnavigation – UI 1.14.0

Schema heter nu Dagar i navigation och rubrik. Befintliga ankarlänkar med #schema fungerar fortfarande. Kartans kontroller ligger till höger i ordningen Lager, Dagar och rutter, Helskärm, Min position, Uppdatera. Lager öppnas bredvid sin fasta knapp och behåller övriga kontrollers position. Dagar och rutter är en knapp som öppnar dagval och befintligt program i ett begränsat kort till vänster om knappen. Kortet stängs med samma knapp, Escape, tryck på kartan eller dragning nedåt. Lager, dagskort och platskort öppnas var för sig.

Kartnavigation, platskort, ruttinformation, tooltip och popup delar halvtransparent glas, bakgrundsoskärpa och dag/natt. Kartknappar och platskortets åtgärder använder samma blå åtgärdsfärg; Gå har samma bakgrund som övriga åtgärder. Kategorifärger och ikoner är oförändrade. Minskad transparens och ökad kontrast använder fasta ytor. Alla innehålls- och schemaversioner är oförändrade, liksom positioner, rutter och reseprogram.

`tools/check-map-navigation.cjs` kör produktionsappens navigation lokalt i Chromium med en Leaflet-adapter. Kontrollerar ordning, dagval, dragning, tangentbord, stängning, glas/färger, 44 px touchytor och skärmkanter i fem storlekar i dag/natt. Externa kartplugin och fysisk iPhone/Safari ingår inte i det lokala testet. `tools/check-list-views.cjs` har också uppdaterade regressioner för navigationen.

## Justerade färger och markörstorlekar – UI 1.13.1

Bokat och hotell använder grönt, Mat & dryck orange och Shopping gult. Daglägets nyanser är mörkare för läsbar text; nattläget använder ljusare färger i samma färgfamilj. Färgerna ligger fortsatt enbart i taxonomy.json (schema 1, innehåll 2). Shoppingnålarna har samma mått och förankring som övriga nålar: 35×45 px, spets vid 17×42 px. Platskoordinaterna är oförändrade. Guide har schema 5, innehåll 13; övriga innehållsfiler är oförändrade.

## Gemensamma kategorier och oberoende filter – UI 1.13.0

`taxonomy.json` är appens gemensamma register för kategorinamn, färger i dag/natt och SVG-ikoner. Underkategorier har stabila id:n och egna ikoner; de ärver huvudkategorins färg. `place-presentation.js` används av kartnålar, kartfilter, platskort, popup, schema och historievyn. Bokat är en separat status, inte en färg som ersätter platsens kategori.

Kategori, Område och Läsvy finns kvar. Sortering: kategori → underkategorins svenska namn → platsnamn. Kartans filter och sevärdhetsvyns filter har oberoende tillstånd. Visa på kartan kan tillfälligt visa en dold markör utan att ändra kartans filter. Markören återgår när kortet stängs. Positioner, länkar, resdagar, rutter, bokningar och flyg är oförändrade.

Versioner: taxonomy schema 1 / innehåll 1; places schema 5 / innehåll 10; guide schema 5 / innehåll 12. Övriga innehållsversioner är oförändrade. Äldre scheman finns kvar. Kör `npm run check` och `BROWSER_EXECUTABLE_PATH=/path/to/chromium node tools/check-place-order.cjs` för strukturell validering, gemensam presentation, sortering och filterseparation utan externa kartbibliotek. Testet körs i Chromium; fysisk iPhone/Safari är inte verifierad.

## Endast ändrad sortering – UI 1.12.0

Kategori, Område och Läsvy och deras utseende är kvar. Sorteringsnyckeln är kategori, underkategori (till exempel Glass och Utsikter), därefter platsnamn i svensk bokstavsordning. Områdesvyn använder nyckeln inom varje område; läsvyn följer vald gruppering. Inga extra rubriker eller navigationsval läggs till. Underkategori sparas som ett valfritt fält i registret: places schema 4, innehåll 9. Äldre innehåll använder Övrigt som reserv. Övriga platsuppgifter, positioner och länkar är oförändrade.

## Tre sätt att utforska – UI 1.11.0

Kategori, Område och Läsvy delar samma platskort och kategorifilter. Område återställer de åtta redaktionella grupperna utan hotellkortet. Läsvy öppnar alla synliga kort och behåller den senast valda grupperingen. Visningsval, gruppering och individuellt öppnade kort bevaras när man växlar vy. Filtren har mjuka kapslar, diskret skugga och samma ikoner och färgvariabler som tidigare; avstängda filter är neutrala och saknar skugga. Alla innehålls- och schemaversioner är oförändrade.

## Kategorier och läsvy – UI 1.10.0

Sevärdheterna grupperas först efter kartans kategorier och därefter i den redaktionella områdesordningen. Hotellet finns kvar i karta och schema men visas inte bland sevärdheterna. Korten använder samma ikonkonfiguration som respektive kartnål; filter och kategorirubriker kombinerar symbol och kategorifärg.

Stängda kort visar namn och en kort `focus`-text, utan adress eller bokningsdetaljer. `places.schema.v3.json` har schema 3 och `places.json` innehåll 8. Alla koordinater, adresser, företagslänkar och tidigare texter är oförändrade. Översikt behåller individuellt öppnade kort; Läsvy visar alla synliga kort öppna även efter filtrering och kartbesök. Visningsläget sparas per resa. Guide och områdesordning är oförändrade.

## Upptäcktsvänliga sevärdheter – UI 1.9.0

Platserna visas i åtta redaktionellt ordnade områden, med kvarteren kring hotellet först. Kompakta platskort öppnas på samma sätt som Historia och Schema. Berättelser och praktisk information ligger tillsammans i kortet; öppningsläget och läspositionen bevaras vid återkomst från kartan. Filter och kategorimarkeringar följer kartans kategorifärger, med rött för bokat och ofylld färgpunkt för avstängda filter. Dag/natt använder samma färgvariabler som kartans lagerlista.

`guide.schema.v4.json` (schema 4) lägger till valfria `discoveryAreas` med id, rubrik, introduktion och ordnade platsreferenser. `guide.json` har innehåll 11. Om områden anges måste alla platser finnas exakt en gång; äldre schema stöds med platsordningen i registret som reserv. Positions- och platsregistret, rutter, bokningar och flyg har inte ändrats.

## Öppningsbart schema – UI 1.8.1

Dagarna visas som kort med datum, kort sammanfattning och samma öppna/stäng-navigation som historiekapitlen. Hela rubrikytan går att trycka på; pilen visar om dagen är öppen. Öppnade dagar och läsposition bevaras när man besöker kartan och återvänder. Innehåll, bokningar, flygordning, rutter och positioner är oförändrade. Gemensamma stilar håller dag/natt och tryckytor enhetliga.

## Historiska bilder – UI 1.8.0

Tre bilder från Wikimedia Commons visas i historietexten med datering, bildtext, upphov och länk till original och public domain-licens. Catena-bilden är uttryckligen en kopia från 1887 av en vy från sent 1400-tal. Hela bilderna bevaras utan beskärning och laddas vid behov från lokala WebP-filer i `assets/history/`.

`history.json` har schema 2 och innehåll 2. `history.schema.v2.json` lägger till valfria bilder med obligatoriska uppgifter om källa och rättigheter; schema 1 finns kvar. Valideringen kontrollerar även placeringen i texten, och webbläsartestet verifierar att alla tre bilder laddas med rätt mått, bildtexter och länkar.

# Reseguiden

## Historievyns navigation – UI 1.7.1

Kapitelrubrik och ingress är en stor tryckyta med en pil som visar öppet/stängt. Den separata Läs berättelsen-länken och dubblerade platsknappar är borttagna. Varje plats har en enda rad som öppnar dess befintliga kartkort och platsberättelse. Historik, platsinnehåll, positioner, rutter, bokningar och schema-/innehållsversioner är oförändrade. Läsposition och öppna kapitel behålls vid växling mellan historia och karta.

## Florens berättar – UI 1.7.0

Ny Historievy med fem kapitel, fördjupning, befintliga platsberättelser och Visa på kartan. Historiken ligger i `history.json` (innehåll 2) med eget `history.schema.v2.json` (schema 2). Platsreferenser och berättelser valideras tillsammans med resans övriga innehåll. Fyra navigationsval ryms på mobil; dag/natt följer operativsystemet. Befintliga platser, positioner, rutter, bokningar och flyg är oförändrade.

## Torsdagens rutt – innehållsuppdatering

Beppa Fioraia är borttaget som stopp i torsdagens rutt och program, men finns kvar som plats på kartan och i platslistan. Taxi efter Lisio går nu till Piazzale Michelangelo, med lunch i området före kyrkobesöket efter 15.30. Återvägen går nu via Rosenträdgården och San Niccolò till hotellet. Rosenträdgårdens befintliga sevärdhet och berättelse har kompletterats med trädgårdsinformation, säsong och öppettider; inga kartpositioner har ändrats.

`BROWSER_EXECUTABLE_PATH=/path/to/chromium node tools/check-discovery-view.cjs` verifierar områdeordning, fullständighet, filterfärger, kontrast, öppningsläge och läsposition samt stora texter i dag/natt.

`BROWSER_EXECUTABLE_PATH=/path/to/chromium node tools/check-history-view.cjs` kontrollerar historievyn vid dubblerad textstorlek, dag/natt-kontrast, tangentbordsnavigering och bevarad läsposition.

## Kartkontroller och borttaget stopp – 1.6.2

Cosi – Chiantigiana är borttaget ur platsregistret, torsdagens program och dess alternativa taxirutt. Övriga platsuppgifter och positioner är oförändrade. Kartans knappar för fullskärm, position, lager och uppdatering ligger till höger. Zoomknapparna +/− är borttagna; nypzoom fungerar som tidigare.

## Dagsguide och platsinnehåll – 1.6.0

Dagsguiden är kompakt från start. Tryck på raden eller dra uppåt för programmet; dra nedåt för att fälla ihop. Den följer fingret och behåller sitt läge vid dagsbyte. Den separata dagväljaren använder systemets vanliga select. Version 1.6.1 förstorar enbart vald kartnål med 25 procent, förankrad i dess iconAnchor. Övriga nålar behåller färg, opacitet, storlek och skugga. Kartan panoreras inte när platskortet öppnas eller ändrar höjd. Ingen extra cirkel ritas.

Platsregister schema v2 har separata fält för `openingHours` och `specialties`. Tider har tidszon, veckodagar, intervall (även över midnatt), valfri giltighetsperiod, daterade undantag/notiser och källor med kontrolldatum. Status skiljer publicerade tider från obekräftade tider, bokade besök och utomhusplatser. Köks-, butiks- och verkstadstider skiljs i etiketterna. Okända eller motstridiga tider visas med kontrollänk; ingen realtidsstatus för öppet/stängt beräknas. Säsongstider visas när giltigheten överlappar resan.

29 platser har källbelagda specialiteter. Stories innehållsversion 3 har 40 berättelser, 13 fler om bland annat väveri, bokbinderi, stenarbete, vinbarer och glass. Castorinas beskrivning rättas till träsnideri. Guide schema v3 lägger till resans egna korta dagsrubriker; innehållsversion 7. Tidigare schemas v1/v2 behålls. Alla 69 platsidentiteter, koordinater, kartlänkar, entréuppgifter och geografiska verifieringar är oförändrade; även rutter, program, bokningar och flyg bevaras.

## Navigation och färgläge – 1.5.0

`ui-theme.css` samlar färger och utseende för hela guiden. Flikar, dagsval, kartknappar och filter har rundade former, diskret glasbakgrund och en gemensam knappstil. Listkort använder samma kompakta åtgärdsrad som platskorten, med ”Visa” för att öppna platsen på guidens karta. Samma tre flikar, dagsrutter, filter och funktioner används som tidigare. Dagskortet håller sig inom skärmen och scrollar inuti när programmet är långt.

Ljust/mörkt läge följer enhetens `prefers-color-scheme` och växlar direkt utan omladdning. Kartplattorna får nattutseende separat, medan markörernas kategorifärger behålls. Text, kort, kontroller, platsmarkering och webbläsarens temafärg följer samma färgläge. Begränsad animation, ökad kontrast och minskad transparens respekteras där webbläsaren stöder inställningarna. Ingen manuell temaväljare behövs.

Utseendet testas i både ljust och mörkt läge vid fem skärmstorlekar, även efter växling utan omladdning. Vanlig text och åtgärdsetiketter kontrolleras för minst 4,5:1 kontrast. Navigationens touchytor kontrolleras till minst 44×44 pixlar. Reducerad rörelse och ökad kontrast ingår. Neutrala kartplattor används i UI-testets skärmbilder; kartdata och markörpositioner ändras inte.

## Platskort och berättelser – 1.4.4

Alla platskort och även ruttinformationen har en draglist med 48 pixlars touchyta över hela bredden. Hela namnraden kan också dras. Uppåt visar hela kortet; nedåt stänger det från både kort och stort läge. Ett tryck växlar kort/stort läge och handtaget fungerar med tangentbord. Beskrivning och historia visas som sammanhängande text utan ”Mer om platsen”. Text som fortsätter utanför den korta vyn tonas ut mot nederkanten; den stora vyn visar texten normalt och kan scrollas. Kort utan överflöd tonas inte ut. Rörelsen respekterar inställningen för minskad animation.

Markörer öppnar nu ett Apple-inspirerat kort längst ned, inte en flytande plats-popup. Kartan är fortsatt interaktiv. Namn och stängknapp ligger kvar överst, medan innehållet scrollas vertikalt inom kortet. Kortet använder dynamisk skärmhöjd och safe-area-insets, även i liggande läge. Dagskortet döljs tillfälligt när platskortet är öppet och återkommer när det stängs. Kryss, Escape eller tryck på den fria kartan stänger kortet; dragning/zoomning stänger det inte. Fokus återgår till markören vid kryss/Escape.

Alla åtgärder ligger på en gemensam rad med symbol och kort etikett: Gå, Kartor, Webb och Fråga (ChatGPT). Webb visas när platsen har en webbplats. Buss och Bil har tagits bort från kort och listor; färdsätt kan väljas i Apple Kartor. Fullständiga tillgängliga namn förklarar varje val. Raden ryms även på 320 pixlars skärm med minst 44×44 pixlars touchytor. Samma kanoniska gång- och platslänkar används. All platsinformation finns kvar.

Den valda platsen får en blå ring vid kartpositionen, tydlig ljusmarkering runt nålen och högre visningsordning. Endast en plats är markerad åt gången. Markeringen försvinner när kortet stängs eller ruttinformation öppnas. Kartans visningsområde flyttas vid behov så att markören syns ovanför kortet; koordinaterna ändras inte.

Samma `stories.json` visas i platskortet och Sevärdheter; listans berättelser behåller sin egen utfällning. Innehållsversion 2 har 27 berättelser, inklusive historia för samtliga 25 platser i kategorin `see-do`. De 14 nya berättelserna kompletterar torg, broar, kyrkor, museer och trädgårdar som tidigare saknade historia. ”Läs vidare” visar länkarna som berättelsen bygger på: operatörs-, museums- och officiella turismsidor, kontrollerade 10–11 oktober 2026. Berättelserna är korta redaktionella återberättelser; betraktelserna under Titta efter är tips, inte nya boknings- eller öppettidsuppgifter. Innehållsuppdateringen ändrar inte UI, platser, positioner eller schema.

Schemaversion och innehållsversion är separata även för stories. Valideringen kräver källor, unika platsreferenser och befintliga placeId. Platser, positioner, rutter, bokningar och flyg är oförändrade från föregående publicering 1.3.3.

`BROWSER_EXECUTABLE_PATH=/path/to/chromium node tools/check-list-views.cjs` kontrollerar befintliga flöden, alla platskort, samtliga berättelser, 320×568, 390×844, 844×390, 1024×768, 768×1024 samt 200% grundtextstorlek. Det kontrollerar kortets kanter, horisontellt överflöde, inre vertikal scrollning, delat berättelseinnehåll, navigeringsmål, markörklick och stängning med tangentbord. Dragning testas i båda riktningarna med mus och emulerad touch, liksom tryck och tangentbordsväxling. Alla platser kontrolleras för tomma informationsval. Fysisk iPhone/Safari är inte automatiskt testad.

En statisk reseguide med återanvändbart kartgränssnitt. `index.html` innehåller presentation och interaktion. Resans innehåll läses från sex JSON-filer:

| Innehåll | Schema | Ansvar |
| --- | --- | --- |
| `places.json` | `places.schema.v5.json` | Platser, positioner, länkar och verifieringsstatus |
| `routes.json` | `routes.schema.v1.json` | Delsträckor, färdsätt och ordnade plats-id |
| `guide.json` | `guide.schema.v5.json` | Titel, destination, tidszon, kartutsnitt, resdagar, program, bokningar, flyg och presentation |
| `stories.json` | `stories.schema.v1.json` | Korta platsberättelser, konkreta saker att titta efter och källor |
| `history.json` | `history.schema.v2.json` | Stadens historiekapitel, perioder, platsreferenser och källor |
| `taxonomy.json` | `taxonomy.schema.v1.json` | Gemensamma kategorier, underkategorier, färger och SVG-ikoner |

Varje innehållsfil har `schemaVersion`, `contentVersion` och `updatedAt`. SchemaVersion ändras när datakontraktet ändras. ContentVersion ändras när innehållet i just den filen ändras. Versionerna är oberoende mellan filerna.

Koordinater och adresser lagras i platsregistret. Rutter och bokningar hänvisar till plats-id. Resdagar hänvisar till rutt-id. Programmet består av strukturerade textdelar, fetstil, kursiv text och platsknappar; rå HTML används inte i programmet.

Kartan visar samma delsträckor som tidigare. Linjerna mellan platserna är inte beräknade gatuvägar. `walk` visas heldraget och övriga färdsätt streckat.

`guide.json` styr dagsvalens etiketter och datum, automatisk dagsvisning i resans tidszon, kategorifilter, permanenta markörer och befintliga ikon- och popupinställningar. Bokade markörer bestäms av `bookings`.

## Kontrollera innehållet

Kör `npm ci` och `npm run check`. Kontroll sker också vid laddning i webbläsaren och automatiskt i GitHub. Samtliga scheman, unika id:n, länkar mellan filerna, nödvändiga positioner, bokningsdatum och kategorier kontrolleras. Geografisk riktighet och företagsidentitet kräver separat källverifiering; strukturellt godkända data blir inte automatiskt verifierade.

Valideringskoden ligger i `tools/validator-entry.js`. Efter ändringar där: kör `npm run build` och spara den genererade `places-validator.js`. Trots filnamnet validerar den alla sex innehållsfilerna med deras egna scheman.

## Nästa resa

Kopiera guiden till en separat katalog eller ett separat repository och ersätt innehållsfilerna. Återanvänd index, scheman, place-sheet.css och valideringskod. Ange den nya resans plats-id, rutter, datum, tidszon och kartutsnitt. Stories kan vara en tom lista. Behåll Florensguidens egna filer separat.

## Version och verifiering, 10 oktober 2026

| Fil | Schemaversion | Innehåll/programversion |
| --- | ---: | ---: |
| places.json | 5 | 10 |
| routes.json | 1 | 6 |
| guide.json | 5 | 14 |
| stories.json | 1 | 4 |
| history.json | 2 | 2 |
| taxonomy.json | 1 | 2 |
| index.html | – | 1.18.0 |
| ui-theme.css | – | 1.18.0 |
| place-sheet.css | – | 1.17.1 |
| place-presentation.js | – | 1.16.1 |

| valideringskod | – | 1.7.0 |
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

Programversion 1.3.1 komprimerar flygkorten till tider, flygplatskoder, flightnummer och operatör samt eventuell bytestid. Terminaler och fullständiga flygplatsnamn finns kvar i JSON men visas inte i schemat. Datum visas separat endast vid ankomst en annan dag. Guide schema v2 och innehållsversion 4 är oförändrade.

Programversion 1.3.2 visar avgångsterminal efter flygbolaget när bokningen anger den. Sista resdagens flyg visas efter program och valbara stopp; övriga dagar före programmet. Guideinnehåll 5 ändrar tisdagens text till ”upptäck Florens” och länkar Serre Torrigiani till dess befintliga platskort. Schemaversioner är oförändrade.

## Komplettering mot resbesluten – 1.3.3

Hotellet visas även i Schema. Bokningskort visar platsens besöksinformation och adress. Webbplats och Fråga ChatGPT finns i listvyerna, med samma plats-id som kartan. Programknappar öppnar markören och aktiverar dess lager även om det dolts. Giannini anges som spontant obokat stopp i lördagens Oltrarno-program och rutt. Lisio kompletteras med Cecilia Cerchiarini; Cuculia och Nugolo med två personer; Nugolo med det bokade avbokningsvillkoret. Bokade platser listas inte som valbara besök andra dagar bara för att promenaden passerar dem.

Kontroll: innehållsvalidatorn godkänner tre scheman, 69 platser, fem rutter, fem resdagar, fem bokningar, flyg och samtliga kart-/navigeringslänkar. JavaScript och renderat schema kontrollerat med hotellet, detaljerade bokningar, webbplats-/ChatGPT-knappar och flygordning. Visuellt Playwright-test kunde inte köras lokalt eftersom Chromium saknas. Tidigare geografiska osäkerheter i verifieringsrapporten kvarstår; denna ändring ändrar inga positioner eller Apple-id:n.
