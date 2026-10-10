# Verifieringsrapport – version 1

Kontrollerad: 2026-10-10T10:29:52.947985Z. Utgångspunkt: commit `0e45f966083952a32869041e12776624e733baf6`.

## Resultat och begränsningar

Alla 69 poster har granskats. 67 Apple-platskort har öppnats via exakta plats-id; kortens publicerade namn och koordinater har jämförts med valda sökträffar. 66 poster uppfyller registrets fyra kontroller: identitet, position, platslänk och beräknad navigering. Tre är uttryckligen olösta. Detta är en kontroll av publicerade kartdata, inte en inmätning på plats eller ett löfte om att varje dörrpunkt är exakt.

67 positioner har ersatts med belagda kartkoordinater. Beppa Fioraias tidigare användarbekräftade punkt och Passamaneria Toscanas osäkra punkt har behållits. 67 direkta Apple-platskort ersätter textsökning. Giannini och Cosi får namngivna koordinatmarkeringar med tydlig reservation, inte felaktiga företags-id. 18 officiella webbplats-/kontaktlänkar har lagts till.

## Genomförda justeringar

1. Korrigerade positioner enligt tabellen nedan. Exakta plats-id skiljer företagskort från gatuträffar och andra filialer.
2. Bytte samtliga navigeringslänkar till Apples dokumenterade `/directions`-format med kanonisk koordinat och, där identitet och position är verifierade, `destination-place-id`. Befintliga knappar Gå, Kollektivtrafik och Bil/taxi behålls.
3. Införde säker reservlänk med koordinat och namn för verksamheter utan säkert Apple-id. Osäkra poster får en kort upplysning i popupen.
4. Behöll Beppa Fioraias bekräftade punkt, men kopplade länken till verksamhetens riktiga Apple-id.
5. Korrigerade Cosi – Chiantigiana till koordinaten på företagets egen kontaktsida i Bagno a Ripoli. Använder inte Gavinana-filialens id eller gamla Bar Anna & Robertos id.
6. Förtydligade onsdagens Santa Reparata-entré: Porta del Campanile, södra sidan. Behöll 11.30 och Ghiberti Pass. Lade till aktuell information om Baptisteriets Porta Sud och vad passet omfattar.
7. Lade torsdagens lunch före kyrkobesöket; San Miniato inne efter 15.30. Ritade in Beppa-alternativet, Cosi-alternativets fortsättning mot Michelangelo och promenaden via San Miniato/Porta San Niccolò tillbaka till hotellet. Lunchalternativen är alternativ, inte två på varandra följande luncher.
8. Lade in Scuola del Cuoios egen entrébeskrivning och aktuella oktoberöppettider; noterade skillnaden mot Apple.
9. Förtydligade att kartans linjer är schematiska förbindelser mellan stopp. Gatuväg kontrolleras i Apple; linjerna i guiden är inte beräknad väggeometri.
10. Skärpte validering av Apple-domän, överensstämmelse mellan plats-id och URL, källstöd per kontroll och navigeringens koppling till aktuell koordinat. En koordinatändring kan inte behålla gammal navigeringsverifiering.
11. Versionsatte programkoden 1.1.0 och de tre innehållsfilerna till innehållsversion 2. Datakontrakten ändrades inte: samtliga scheman är fortsatt version 1.

## Filversioner

| Fil | Schemaversion | Innehåll/programversion |
| --- | ---: | ---: |
| places.json | 1 | 2 |
| routes.json | 1 | 2 |
| guide.json | 1 | 2 |
| places.schema.v1.json | 1 | Oförändrad |
| routes.schema.v1.json | 1 | Oförändrad |
| guide.schema.v1.json | 1 | Oförändrad |
| index.html, places-validator.js, tools/map-links.js och valideringsverktyg | – | 1.1.0 |
| package.json, package-lock.json | – | 1.1.0 |
| verification-report.v1.md | – | Rapportversion 1 |

Programversionen finns även i indexets `application-version`-metadata. JSON-filerna visar själva `schemaVersion`, `contentVersion` och `updatedAt`. README återger versionerna.

## Samtliga platser och positionsjusteringar

Förflyttning är fågelvägsavstånd mellan gammal och ny punkt, avrundat till meter. Små förflyttningar kan vara skillnader i precision eller vald punkt inom samma plats. Verifierad avser registrets fyra kontroller; entréprecision redovisas separat i noteringar.

| Plats | Tidigare koordinat | Ny koordinat | Flytt m | Status | Apple-platskort |
| --- | --- | --- | ---: | --- | --- |
| Hotel La Scaletta | 43.7667626, 11.2493264 | 43.7667357, 11.2515213 | 176 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IEB80EB2465963C1A) |
| Duomo / Santa Reparata | 43.7728500, 11.2560000 | 43.7731275, 11.2569577 | 83 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I16F9E2AD1A5C907A) |
| Cuculia | 43.7680500, 11.2458500 | 43.7682311, 11.2462342 | 37 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IBF647608F7345D55) |
| Fondazione Arte della Seta Lisio | 43.7460560, 11.2865850 | 43.7454328, 11.2856036 | 105 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I8F50D9FB5E198FB8) |
| Uffizierna | 43.7683330, 11.2552780 | 43.7682698, 11.2557453 | 38 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I619339FB1AE74F28) |
| Nugolo | 43.7718200, 11.2680210 | 43.7718531, 11.2679681 | 6 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I5D428C07D60AF373) |
| Ponte Vecchio | 43.7680000, 11.2531000 | 43.7679813, 11.2531752 | 6 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I2EB04AE4C0A0D285) |
| Palazzo Pitti | 43.7652000, 11.2501000 | 43.7651745, 11.2499678 | 11 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IF0CB9D3977769C6F) |
| Piazza della Passera | 43.7668000, 11.2507000 | 43.7671987, 11.2504640 | 48 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IA96D45BC2D2A4FDA) |
| Piazza Santo Spirito | 43.7662000, 11.2476000 | 43.7665769, 11.2473875 | 45 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=ID3C51F77EAD52E3A) |
| Basilica di Santo Spirito | 43.7660000, 11.2474000 | 43.7675493, 11.2483102 | 187 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I64A1A759DB0DD4D6) |
| Piazza del Carmine | 43.7677000, 11.2430000 | 43.7686596, 11.2440146 | 134 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I6344C4E427A2CACF) |
| Piazza della Signoria | 43.7696000, 11.2557000 | 43.7696800, 11.2558770 | 17 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I628E70AEE3B57EA1) |
| Loggia dei Lanzi | 43.7694000, 11.2556000 | 43.7691879, 11.2555146 | 25 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I501E352752A61A82) |
| Orsanmichele | 43.7708000, 11.2549000 | 43.7707139, 11.2551270 | 21 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I783C563516143B7D) |
| Piazza della Repubblica | 43.7718000, 11.2541000 | 43.7715006, 11.2540394 | 34 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I7D5335D00155FDF5) |
| Piazza Santa Trinita | 43.7696000, 11.2514000 | 43.7701680, 11.2514699 | 63 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I7FA4711B05C7B750) |
| Ponte Santa Trinita | 43.7693400, 11.2503600 | 43.7690199, 11.2503339 | 36 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IC1D7C6EFEBDD3AF4) |
| Basilica di Santa Croce | 43.7687000, 11.2625000 | 43.7683899, 11.2628210 | 43 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IBF8F16153E9F31D9) |
| Mercato di Sant’Ambrogio | 43.7704800, 11.2680400 | 43.7705849, 11.2669515 | 88 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I5DA11D17F5DDBD44) |
| Giulio Giannini e Figlio | 43.7659600, 11.2503200 | 43.7664069, 11.2506566 | 57 | Olöst | Ingen säker POI-matchning |
| Scuola del Cuoio | 43.7680000, 11.2632000 | 43.7677701, 11.2632287 | 26 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I8990F937D705A52C) |
| Museo Opificio delle Pietre Dure | 43.7762000, 11.2588000 | 43.7761815, 11.2589544 | 13 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IBB109722B232AA6E) |
| Officina Profumo-Farmaceutica SMN | 43.7744000, 11.2487000 | 43.7741036, 11.2477416 | 84 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IEB3952EB90D3B7AD) |
| Porta San Niccolò | 43.7647000, 11.2654000 | 43.7645237, 11.2647736 | 54 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IEB22FB2BA67CBEDA) |
| Piazzale Michelangelo | 43.7629000, 11.2650000 | 43.7628190, 11.2650311 | 9 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I944CCC9074D473AA) |
| San Miniato al Monte | 43.7599000, 11.2649000 | 43.7595177, 11.2650482 | 44 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I25D3A27A02F6E11E) |
| Le Volpi e l’Uva | 43.7675000, 11.2525000 | 43.7670149, 11.2528166 | 60 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I8F4E230C7AD73242) |
| Il Santino | 43.7681000, 11.2460000 | 43.7689621, 11.2472908 | 141 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IC85D23C306182E4A) |
| Enoteca Pitti Gola e Cantina | 43.7655000, 11.2502000 | 43.7661198, 11.2500858 | 70 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I3B3BB09378DE88A2) |
| Enoteca Spontanea | 43.7668000, 11.2487000 | 43.7655711, 11.2483667 | 139 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I5487D38673801BA8) |
| Fuori Porta | 43.7629000, 11.2655000 | 43.7633882, 11.2616964 | 310 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IFC1B6C1599418DA8) |
| Loggia Roof Bar | 43.7667000, 11.2473000 | 43.7662261, 11.2474385 | 54 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I3EA1AAE0FCAA2F62) |
| Il Santo Bevitore | 43.7681000, 11.2458000 | 43.7690562, 11.2468096 | 134 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=ID7BB8E32A0470CD3) |
| Mercato Centrale | 43.7761000, 11.2538000 | 43.7766446, 11.2532562 | 75 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I99202BA0273E73AC) |
| Pitti Mosaici | 43.7654500, 11.2500000 | 43.7659882, 11.2497398 | 63 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IEA9B8145956CE110) |
| Castorina 1895 | 43.7683500, 11.2495500 | 43.7684524, 11.2481668 | 112 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IB4722DA40EF10653) |
| Mio Concept Store | 43.7719500, 11.2501700 | 43.7719386, 11.2502393 | 6 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I510076BDC06E3AB0) |
| Giulia Materia | 43.7657500, 11.2501100 | 43.7662050, 11.2492651 | 85 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IDF3A45D87DF7114F) |
| Gelateria della Passera | 43.7668200, 11.2506300 | 43.7671770, 11.2506960 | 40 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IF3B922F5269D6E7A) |
| Gelateria dei Neri | 43.7689500, 11.2598000 | 43.7677701, 11.2590927 | 143 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I8C46A6EFC4EA360F) |
| Gelateria La Carraia | 43.7691500, 11.2444000 | 43.7696140, 11.2466151 | 185 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I3D0877E956344DD1) |
| Perché No! | 43.7711500, 11.2555000 | 43.7708033, 11.2554985 | 39 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I9AC912A348306FBE) |
| Vivoli | 43.7694200, 11.2592000 | 43.7699782, 11.2600797 | 94 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I521AB0BA9811B712) |
| Cantina del Gelato | 43.7672000, 11.2565200 | 43.7665653, 11.2548226 | 153 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IB1F0CB1D9D81E335) |
| Serre Torrigiani in Piazzetta | 43.7712000, 11.2551000 | 43.7711312, 11.2550395 | 9 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IA4423F3D4CB4F4C1) |
| Caffè Concerto Paszkowski | 43.7717000, 11.2538000 | 43.7719428, 11.2539361 | 29 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IB018DBD3F014B97B) |
| Bulli & Balene | 43.7667200, 11.2502300 | 43.7671193, 11.2507349 | 60 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I43D9EF87076BECE0) |
| Pasticceria Cosi – Chiantigiana | 43.7403800, 11.2929200 | 43.7342470, 11.2967968 | 750 | Olöst | Ingen säker POI-matchning |
| Beppa Fioraia | 43.7627900, 11.2609700 | 43.7627900, 11.2609700 | 0 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IE09241B81B7B5B19) |
| Santa Maria Novella | 43.7746800, 11.2494200 | 43.7743000, 11.2493670 | 42 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I6A98E16006F9DCB) |
| Basilica di San Lorenzo | 43.7749300, 11.2542200 | 43.7748667, 11.2541842 | 8 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IDF0CD4D347521232) |
| Cappelle Medicee | 43.7750200, 11.2533700 | 43.7749984, 11.2532401 | 11 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I9E82C0EF471352A0) |
| Galleria dell’Accademia | 43.7769200, 11.2587600 | 43.7767763, 11.2587413 | 16 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I241C35AA75E4289B) |
| Museo Nazionale del Bargello | 43.7704500, 11.2586000 | 43.7703946, 11.2579635 | 51 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I9D1D42F28C179399) |
| Giardino di Boboli | 43.7637700, 11.2497200 | 43.7625711, 11.2488413 | 151 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I3359EDF6CB2DFCEF) |
| Palazzo Medici Riccardi | 43.7751500, 11.2555700 | 43.7751456, 11.2559009 | 27 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I1C26C762F1355553) |
| Giardino delle Rose | 43.7615800, 11.2653000 | 43.7628947, 11.2631472 | 226 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=IE2CBE11189240006) |
| Antico Setificio Fiorentino | 43.7708588, 11.2412205 | 43.7708604, 11.2413137 | 7 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=ICF08CBBA3A57EFCB) |
| Alberto Cozzi – Legatoria | 43.7706900, 11.2497300 | 43.7707144, 11.2496125 | 10 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I15A8A512A9783E54) |
| Riccardo Luci – Carta Marmorizzata | 43.7706900, 11.2498000 | 43.7706865, 11.2495905 | 17 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I17FB6072F5D18326) |
| Scarpelli Mosaici | 43.7765500, 11.2588000 | 43.7752308, 11.2575263 | 179 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I3FA7C2F58E13ECB6) |
| Casa dei Tessuti | 43.7724000, 11.2530000 | 43.7728486, 11.2537444 | 78 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I35B88C14C56E6F6F) |
| Ermini Agostino | 43.7737000, 11.2543000 | 43.7738174, 11.2545958 | 27 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I3E4A3225D773ABA6) |
| Valli Tessuti | 43.7710300, 11.2488800 | 43.7709311, 11.2488842 | 11 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I549A497A0F25D038) |
| Le Telerie Toscane | 43.7662200, 11.2492800 | 43.7662154, 11.2492656 | 1 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I3AC3CCB4319ADD2E) |
| Passamaneria Toscana | 43.7748000, 11.2536000 | 43.7748000, 11.2536000 | 0 | Olöst | [Platskort](https://maps.apple.com/place?place-id=IC79B1AD2FBD07EB0) |
| Chalet il Boschetto | 43.7621498, 11.2655096 | 43.7620442, 11.2647951 | 59 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I62896965EA378BAE) |
| Terrazze Michelangelo | 43.7613080, 11.2669320 | 43.7613203, 11.2669434 | 2 | Verifierad | [Platskort](https://maps.apple.com/place?place-id=I951FB975D51FF8B9) |

## Olösta frågor

- **Giulio Giannini e Figlio:** företagets kontaktuppgifter och kartlänk är belagda. Publicerad GPS har jämförts med företagets kartlänk och ersätter den gamla punkten. Exakt dörr och ett säkert Apple-företagskort saknas.
- **Cosi – Chiantigiana:** rätt verksamhet/adress och företagets egen koordinatlänk är belagda. Apple visar tidigare Bar Anna & Roberto på platsen. Cosis nya företagskort saknas; aktuella filialöppettider ska bekräftas på +39 055 6147820. Sökresultat som blandar Gavinana med Chiantigiana används inte som säkra öppettider.
- **Passamaneria Toscana:** Apple anger Piazza San Lorenzo 12/R, andra aktuella register Via del Canto dei Nelli 10. Ingen säker grund för att flytta punkten eller påstå exakt butiksläge. Verksamhetens Apple-kort är länkat, positionen är markerad osäker.

## Entréer och öppettider

Exakt entrékoordinat är inte belagd för alla platser. `entrance` har därför inte fyllts med gissade koordinater. Navigering går till verifierad platsidentitet/koordinat; särskilda dörrinstruktioner anges i text. Om en entrékoordinat senare verifieras prioriterar länkgeneratorn den.

- **Santa Reparata:** officiell [entréinformation](https://duomo.firenze.it/it/scopri/chiesa-di-santa-reparata) anger Porta del Campanile, södra sidan. [FAQ](https://tickets.duomo.firenze.it/it/support/faq) bekräftar onsdagens öppethållande och starttidskravet, samt Baptisteriets byte till Porta Sud från 10 september.
- **Uffizi:** fredag 10.30 ligger inom [officiella tider](https://www.uffizi.it/gli-uffizi), tisdag–söndag 08.15–18.30. Äldre instruktioner om Porta 3 är motstridiga. Aktuell [officiell karta, oktober 2026](https://www.datocms-assets.com/103094/1791457179-mappa_uffizi_sito_it_ottobre-26.pdf), bokningsbekräftelse och skyltning prioriteras; ingen osäker portkoordinat har skapats. [Strejkaviset 14 oktober](https://www.uffizi.it/avvisi/sciopero) gäller onsdagen, inte fredagsbokningen.
- **San Miniato:** [klostrets egen kontaktsida](https://sanminiatoalmonte.it/contatti/) anger måndag–lördag 09.30–13.00 och 15.30–19.00. Kommunens äldre/avvikande tider prioriteras inte. Turistbesök ska inte ske under gudstjänst.
- **Scuola del Cuoio:** [företaget](https://scuoladelcuoio.it/it/) anger oktoberöppet alla dagar 10.00–18.30 och hantverkare måndag–fredag. Apple anger kortare öppettider och söndagsstängt; företagets uppgift prioriteras. Entré via trädgården bakom kyrkan, Via San Giuseppe 5R.
- **Lisio:** [operatörens kontaktsida](https://www.fondazionelisio.org/it/contattaci) bekräftar Via Benedetto Fortini 143. Torsdagens 10.15 behålls som tidigare registrerad bokning, utan att en ny bokningsbekräftelse påstås ha inhämtats. Bilväg till punkten kunde beräknas; separat gångväg till tomtpunkten kunde inte beräknas.
- **Cuculia och Nugolo:** registrerade tider onsdag 19.45 respektive fredag 19.30 passar publicerade öppettider. [Nugolos operatör](https://ilnugolo.com/contatti/) anger kvällsöppet; Apple kan ange tidigare sluttid. Inga bokningar ändras.

Följande är en avläsning av Apples publicerade tider, inte oberoende bekräftelse från alla verksamheter och inte särskilda tider för varje resdag. Tomma poster betyder att tider saknades på avläst kort.

| Plats | Apple-kortets publicerade tider vid kontroll |
| --- | --- |
| Hotel La Scaletta | Ingen tid avläst |
| Duomo / Santa Reparata | Ingen tid avläst |
| Cuculia | Sunday, 12:30 PM to 3:00 PM, 7:00 PM to 10:30 PM; Monday, Closed; Tuesday to Wednesday, 7:00 PM to 10:30 PM; Thursday to Saturday, 12:30 PM to 3:00 PM, 7:00 PM to 10:30 PM |
| Fondazione Arte della Seta Lisio | Sunday, Closed; Monday to Thursday, 8:00 AM to 5:00 PM; Friday, 8:00 AM to 1:30 PM; Saturday, Closed |
| Uffizierna | Sunday, 8:15 AM to 6:30 PM; Monday, Closed; Tuesday to Saturday, 8:15 AM to 6:30 PM |
| Nugolo | Sunday, Closed; Monday to Friday, 7:30 PM to 10:30 PM; Saturday, 12:00 PM to 2:30 PM, 7:30 PM to 10:30 PM |
| Ponte Vecchio | Ingen tid avläst |
| Palazzo Pitti | Sunday, 8:15 AM to 6:30 PM; Monday, Closed; Tuesday to Saturday, 8:15 AM to 6:30 PM |
| Piazza della Passera | Ingen tid avläst |
| Piazza Santo Spirito | Ingen tid avläst |
| Basilica di Santo Spirito | Ingen tid avläst |
| Piazza del Carmine | Ingen tid avläst |
| Piazza della Signoria | Ingen tid avläst |
| Loggia dei Lanzi | Ingen tid avläst |
| Orsanmichele | Sunday, 8:30 AM to 1:30 PM; Monday, 8:30 AM to 6:30 PM; Tuesday, Closed; Wednesday to Saturday, 8:30 AM to 6:30 PM |
| Piazza della Repubblica | Ingen tid avläst |
| Piazza Santa Trinita | Ingen tid avläst |
| Ponte Santa Trinita | Ingen tid avläst |
| Basilica di Santa Croce | Ingen tid avläst |
| Mercato di Sant’Ambrogio | Sunday, Closed; Monday to Saturday, 7:00 AM to 2:00 PM |
| Giulio Giannini e Figlio | Ingen tid avläst |
| Scuola del Cuoio | Sunday, Closed; Monday to Saturday, 10:00 AM to 6:00 PM |
| Museo Opificio delle Pietre Dure | Sunday, Closed; Monday to Saturday, 8:15 AM to 2:00 PM |
| Officina Profumo-Farmaceutica SMN | Ingen tid avläst |
| Porta San Niccolò | Ingen tid avläst |
| Piazzale Michelangelo | Ingen tid avläst |
| San Miniato al Monte | Ingen tid avläst |
| Le Volpi e l’Uva | Ingen tid avläst |
| Il Santino | Ingen tid avläst |
| Enoteca Pitti Gola e Cantina | Sunday to Friday, 12:00 PM to 11:00 PM; Saturday, 12:00 PM to 10:00 PM |
| Enoteca Spontanea | Sunday, Closed; Monday to Saturday, 6:00 PM to 11:00 PM |
| Fuori Porta | Sunday to Monday, 12:00 PM to 3:30 PM, 6:00 PM to 10:30 PM; Tuesday to Wednesday, 6:00 PM to 10:30 PM; Thursday to Saturday, 12:00 PM to 3:30 PM, 6:00 PM to 10:30 PM |
| Loggia Roof Bar | Ingen tid avläst |
| Il Santo Bevitore | Sunday, 12:30 PM to 2:30 PM, 7:30 PM to 11:30 PM; Monday, 7:30 PM to 11:30 PM; Tuesday to Saturday, 12:30 PM to 2:30 PM, 7:30 PM to 11:30 PM |
| Mercato Centrale | Ingen tid avläst |
| Pitti Mosaici | Ingen tid avläst |
| Castorina 1895 | Sunday, Closed; Monday to Friday, 9:00 AM to 1:00 PM, 2:00 PM to 6:00 PM; Saturday, Closed |
| Mio Concept Store | Sunday, Closed; Monday to Saturday, 10:00 AM to 1:30 PM, 3:00 PM to 7:30 PM |
| Giulia Materia | Sunday, 11:00 AM to 7:00 PM; Monday to Saturday, 10:30 AM to 7:00 PM |
| Gelateria della Passera | Sunday, 10:30 AM to 11:00 PM; Monday, Closed; Tuesday to Thursday, 10:30 AM to 11:00 PM; Friday to Saturday, 10:30 AM to 12:00 AM |
| Gelateria dei Neri | Sunday to Monday, 10:30 AM to 12:00 AM; Tuesday, Closed; Wednesday to Saturday, 10:30 AM to 12:00 AM |
| Gelateria La Carraia | Ingen tid avläst |
| Perché No! | Sunday to Monday, 11:00 AM to 8:00 PM; Tuesday, Closed; Wednesday to Saturday, 11:00 AM to 8:00 PM |
| Vivoli | Sunday, 8:00 AM to 9:00 PM; Monday, Closed; Tuesday to Saturday, 8:00 AM to 9:00 PM |
| Cantina del Gelato | Ingen tid avläst |
| Serre Torrigiani in Piazzetta | Sunday, 11:00 AM to 12:00 AM; Monday to Wednesday, 11:00 AM to 11:30 PM; Thursday, 11:00 AM to 12:00 AM; Friday, 11:00 AM to 1:00 AM; Saturday, 11:00 AM to 2:00 AM |
| Caffè Concerto Paszkowski | Ingen tid avläst |
| Bulli & Balene | Sunday, 12:00 PM to 12:00 AM; Monday to Friday, 5:00 PM to 12:00 AM; Saturday, 12:00 PM to 12:00 AM |
| Pasticceria Cosi – Chiantigiana | Ingen tid avläst |
| Beppa Fioraia | Ingen tid avläst |
| Santa Maria Novella | Ingen tid avläst |
| Basilica di San Lorenzo | Sunday, Closed; Monday to Saturday, 10:00 AM to 5:30 PM |
| Cappelle Medicee | Sunday, 8:15 AM to 6:50 PM; Monday, Closed; Tuesday to Saturday, 8:15 AM to 6:50 PM |
| Galleria dell’Accademia | Sunday, 8:15 AM to 6:50 PM; Monday, Closed; Tuesday to Saturday, 8:15 AM to 6:50 PM |
| Museo Nazionale del Bargello | Sunday, 8:15 AM to 6:00 PM; Monday, Closed; Tuesday to Saturday, 8:15 AM to 6:00 PM |
| Giardino di Boboli | Ingen tid avläst |
| Palazzo Medici Riccardi | Sunday to Tuesday, 9:00 AM to 7:00 PM; Wednesday, Closed; Thursday to Saturday, 9:00 AM to 7:00 PM |
| Giardino delle Rose | Sunday, 10:00 AM to 8:00 PM; Monday to Saturday, 9:00 AM to 8:00 PM |
| Antico Setificio Fiorentino | Sunday, Closed; Monday to Friday, 9:30 AM to 1:00 PM, 2:00 PM to 6:00 PM; Saturday, Closed |
| Alberto Cozzi – Legatoria | Sunday, Closed; Monday to Friday, 9:00 AM to 1:00 PM, 3:00 PM to 7:00 PM; Saturday, 10:00 AM to 1:00 PM, 3:00 PM to 7:00 PM |
| Riccardo Luci – Carta Marmorizzata | Sunday, Closed; Monday to Saturday, 10:00 AM to 7:30 PM |
| Scarpelli Mosaici | Sunday, Closed; Monday to Saturday, 9:30 AM to 6:00 PM |
| Casa dei Tessuti | Sunday, Closed; Monday, 3:00 PM to 7:00 PM; Tuesday to Saturday, 10:30 AM to 1:00 PM, 3:00 PM to 7:00 PM |
| Ermini Agostino | Sunday, Closed; Monday, 3:30 PM to 7:30 PM; Tuesday to Saturday, 9:30 AM to 7:30 PM |
| Valli Tessuti | Ingen tid avläst |
| Le Telerie Toscane | Sunday, Closed; Monday to Saturday, 10:30 AM to 1:30 PM, 2:30 PM to 6:30 PM |
| Passamaneria Toscana | Ingen tid avläst |
| Chalet il Boschetto | Sunday, 12:00 PM to 3:00 AM; Monday, 12:00 PM to 5:00 PM; Tuesday to Saturday, 12:00 PM to 3:00 AM |
| Terrazze Michelangelo | Ingen tid avläst |

## Alla planerade delsträckor

Apple MapKit JS har beräknat gatuväg mellan de aktuella koordinaterna. Tabellen visar avstånd och beräknad ren restid; köer, trafikvariationer, lutning, pauser, lunch och besök ingår inte som extra marginal. Kollektivtrafikknapparnas format och destination har testats, men avgångar och tidtabeller är inte verifierade. Taxirutter är beräknade bilvägar och innebär inte garanti för tillstånd/tillträde i Florens ZTL.

| Dag/delsträcka | Från → till | Färdsätt | Meter | Minuter, uppåt avrundat |
| --- | --- | --- | ---: | ---: |
| tue-1 | Hotel La Scaletta → Ponte Vecchio | walk | 196 | 3 |
| tue-1 | Ponte Vecchio → Uffizierna | walk | 293 | 5 |
| tue-1 | Uffizierna → Piazza della Signoria | walk | 187 | 3 |
| tue-1 | Piazza della Signoria → Orsanmichele | walk | 135 | 2 |
| tue-1 | Orsanmichele → Piazza della Repubblica | walk | 137 | 2 |
| tue-1 | Piazza della Repubblica → Duomo / Santa Reparata | walk | 357 | 5 |
| tue-1 | Duomo / Santa Reparata → Serre Torrigiani in Piazzetta | walk | 319 | 5 |
| tue-1 | Serre Torrigiani in Piazzetta → Ponte Santa Trinita | walk | 561 | 7 |
| tue-1 | Ponte Santa Trinita → Hotel La Scaletta | walk | 327 | 5 |
| wed-1 | Hotel La Scaletta → Ponte Vecchio | walk | 196 | 3 |
| wed-1 | Ponte Vecchio → Duomo / Santa Reparata | walk | 738 | 10 |
| wed-2 | Duomo / Santa Reparata → Ponte Vecchio | walk | 738 | 10 |
| wed-2 | Ponte Vecchio → Hotel La Scaletta | walk | 196 | 3 |
| wed-3 | Hotel La Scaletta → Cuculia | walk | 596 | 9 |
| wed-4 | Cuculia → Hotel La Scaletta | walk | 596 | 9 |
| thu-1 | Hotel La Scaletta → Fondazione Arte della Seta Lisio | taxi | 6548 | 18 |
| thu-2 | Fondazione Arte della Seta Lisio → Pasticceria Cosi – Chiantigiana | taxi | 2884 | 8 |
| thu-2 | Pasticceria Cosi – Chiantigiana → Piazzale Michelangelo | taxi | 7953 | 18 |
| thu-3 | Fondazione Arte della Seta Lisio → Beppa Fioraia | taxi | 4062 | 11 |
| thu-4 | Beppa Fioraia → Piazzale Michelangelo | walk | 621 | 11 |
| thu-4 | Piazzale Michelangelo → San Miniato al Monte | walk | 532 | 9 |
| thu-4 | San Miniato al Monte → Porta San Niccolò | walk | 992 | 16 |
| thu-5 | Porta San Niccolò → Hotel La Scaletta | walk | 1180 | 15 |
| fri-1 | Hotel La Scaletta → Ponte Vecchio | walk | 196 | 3 |
| fri-1 | Ponte Vecchio → Uffizierna | walk | 293 | 5 |
| fri-1 | Uffizierna → Basilica di Santa Croce | walk | 770 | 11 |
| fri-1 | Basilica di Santa Croce → Mercato di Sant’Ambrogio | walk | 518 | 8 |
| fri-1 | Mercato di Sant’Ambrogio → Nugolo | walk | 165 | 3 |
| fri-1 | Nugolo → Hotel La Scaletta | walk | 1808 | 24 |
| sat-1 | Hotel La Scaletta → Palazzo Pitti | walk | 249 | 4 |
| sat-1 | Palazzo Pitti → Piazza Santo Spirito | walk | 332 | 5 |
| sat-1 | Piazza Santo Spirito → Hotel La Scaletta | walk | 431 | 6 |

Tisdagens orienteringsrunda är ungefär 2,5 km, cirka 35 minuter ren gångtid; med stopp blir den längre. Onsdagens katedralpromenad är cirka 12–14 minuter från hotellet och Cuculia cirka 8 minuter; lämna marginal före bokade tider. Torsdagens bilväg hotellet–Lisio beräknades till 17 minuter; avfärd 09.35 inför 10.15 lämnar ungefär 23 minuters marginal före eventuella trafik-/upphämtningsförseningar. Lisio–Cosi cirka 7 minuter taxi, Cosi–Michelangelo cirka 17 minuter taxi. Lisio–Beppa cirka 11 minuter taxi. Promenaderna i området och kyrkans återöppning styr eftermiddagen. Fredagens sammanlagda rutt är cirka 3,8 km / 51 minuter ren gång, utöver besök och pauser; Nugolo ligger nära Sant’Ambrogio. Lördagens Oltrarno-runda är cirka 1 km / 15 minuter ren gång. Flygtid och flygplatsens dagsaktuella trafik har inte verifierats mot en ny biljett.

## Tekniska verifieringar

- Tre JSON-scheman och alla referenser mellan platser, rutter, resdagar, program och bokningar.
- 69 platslänkar, 207 navigeringslänkar och prioritering av eventuell verifierad entrépunkt.
- 27 fall som ska avvisas: ogiltiga värden, dubbletter, okända id, fel bokningsdatum, saknad källa, olika Apple-id/URL och gammal navigeringskoordinat.
- Oberoende schema-/innehållsversioner och innehåll för nästa resa.
- Mobilstorlek 390 × 844: samtliga kategorier, sex dagsval, uppdateringsknapp, alla 69 markörer, popupknappar, korrigerade programtexter och oförändrade bokningstider.
- Ändring av innehåll utan ändring av index: markörer och ruttändpunkter följer kanonisk koordinat; verifieringen måste återställas om positionen ändras.
- Felaktigt schema eller korsreferens ger kontrollerat laddningsfel före rendering.

Karttiles har ersatts med testbilder i webbläsartestet; kartbakgrundens visuella kvalitet och interaktion med den riktiga Apple-appen på fysisk iPhone är inte testade.

## Hållbart arbetssätt

1. Bekräfta verksamhet/landmärke och filial, sedan plats-id och punkt. Använd operatörens uppgift för adresser/entréer när kartdatabaser motsäger den.
2. Registrera källa, datum, vad den stödjer och sådant som inte är verifierat. Gissa inte ett företags-id eller entrépunkt.
3. Vid ändrad punkt: nollställ position/navigering som behöver ny kontroll, använd status `unresolved`, beräkna väg till nya punkten och spara ny navigeringskälla.
4. Öka bara ändrade filers `contentVersion`. Öka `schemaVersion` när kontraktet ändras; filerna har oberoende versioner.
5. Kör `npm run build` och `npm run check`. Kontrollera även ändrade platser och rutter i webbläsare samt GitHub-kontroll och publicerad filversion.

Länkformat följer [Apples Unified Map URLs](https://developer.apple.com/documentation/mapkit/unified-map-urls).
