# Verifieringsrapport – version 3

Kontrollerad 12 oktober 2026. Utgångspunkt: GitHub main `9424f7243948835c4d259911da41798c5e5a63c3`. Platser: schema 5, innehållsversion 12. Programversion 1.18.5.

## Resultat

- Samtliga 69 aktuella platser har granskats. Registret skiljer sig från rapport v2: Cosi har tagits bort och Forte di Belvedere lagts till.
- Alla 67 befintliga Apple-platskort har hämtats som HTML med HTTP 200. Publicerade namn, adresser, plats-id och koordinater har lästs ur Apples kartdata och jämförts med registret.
- 65 av 67 kartpunkter sammanfaller med Apples publicerade punkt. Beppas användarbekräftade punkt avviker cirka 17 meter och behålls. Passamanerias ungefärliga markör avviker cirka 99 meter och är fortsatt uttryckligen osäker.
- Lisios kartkort är rätt verksamhet och adress, men operatörens egen Google-punkt ligger cirka 105 meter från Apples. Detta nya källmotsägelsetest gör Lisio `unresolved`, även om kortet öppnar rätt företag.
- Alla 187 unika aktiva plats-/webb-/käll-/bildkredit-/licenslänkar i de tre granskade innehållsfilerna kunde hämtas efter justeringarna. Fragment kontrolleras mot motsvarande sida. HTTP 200 är ett tillgänglighetstest, inte i sig ett bevis för varje påstående på sidan.
- Alla 69 genererade gånglänkar och två namngivna reservplatslänkar kunde hämtas med HTTP 200. Validering kontrollerar också samtliga 207 färdsättslänkar och 69 platslänkar mot rätt kanoniskt mål.
- 56 platser har nu en kontrollerad webbknapp, jämfört med 20 före genomgången. Saknade webbknappar har kompletterats med verksamhetens, museets eller en officiell turismorganisations sida. Ingen påhittad webbplats har lagts till där säkert alternativ saknas.
- Registrerade besökstider med publicerade källor har jämförts med sidorna. Datumavvikelser inom resan 13–17 oktober redovisas nedan. Osäkra tider förblir osäkra.
- Slutstatus: 65 `verified`, 3 `unresolved` och 1 `pending`. Detta är inte ett påstående om att alla entréer eller alla veckotider är fullständigt verifierade.

## Genomförda innehållsändringar

1. **Santo Spirito:** officiell webbknapp och besökstider 10–13/15–18 på mån–tis och tor–lör, 11.30–13.30/15–18 på söndag. Onsdag 14 oktober uttryckligen stängt för besök. Fotografiförbud anges. Kyrkans och museispårets olika tillträdesregler hänvisas till officiell sida.
2. **Santa Reparata:** tider från Duomos FAQ och officiell platssida i webbknappen. Bokningen onsdag 11.30, Ghiberti Pass och södra entrén behålls; öppettiderna etiketteras tydligt som Santa Reparatas.
3. **Lisio:** den olösta koordinatskillnaden dokumenteras. Grinden på Via Benedetto Fortini 143, ringklockan ”Fondazione Lisio-Uffici” och fortsättningen uppför till vänster om kyrkan anges enligt operatören. Befintlig punkt flyttas inte utan säkrare underlag. Navigeringslänken använder koordinat utan att låsa målet till den motstridiga Apple-punkten via plats-id. Den tidigare beräknade rutten avser samma oflyttade koordinat.
4. **Sant’Ambrogio:** marknadens egen adress och tider mån–lör 07–14 bekräftas; officiell webbknapp och tider läggs till. Apples sidoadress Via Santa Verdiana 9A ersätter inte operatörens Piazza Lorenzo Ghiberti.
5. **Officina SMN:** den historiska butiken på Via della Scala 16 har officiella tider 09.30–20 alla dagar.
6. **San Miniato:** söndagens officiella tider kompletteras; torsdagens eftermiddagsbesök och regler för gudstjänster behålls.
7. **Opificio:** extra öppning torsdag 15 oktober 14–18 registreras som datumundantag ovanpå ordinarie 08.15–14. Ordinarie biljettkassas sluttid 13.30 skiljs från det särskilda höstprogrammet.
8. **Le Volpi e l’Uva:** kontaktsidans motstridiga starttider 11/12 redovisas; appen behåller den försiktigare tiden 12. Söndagens osäkerhet kvarstår.
9. **Adresser:** Casa dei Tessuti preciseras till Via dei Pecori 20–24R enligt företagets sida. Gelateria dei Neri preciseras till 9/11R enligt återavläst Apple-kort.
10. **Trasiga källor:** Cantina del Gelatos äldre .it-sida gav 503 vid kontroll och ersätts med Italiens officiella turismsida för samma filial, Via dei Bardi 31. Sidan belägger även gelato och açaískål. Passamanerias LocalShop24-sida gav 410 och ersätts med ett fungerande sekundärregister som fortfarande anger den alternativa adressen; detta löser inte själva adresskonflikten.
11. Övriga bekräftade webbplatser görs åtkomliga i webbknappen. Befintliga plats-id, bokningar, dagsprogram, rutter och historiareferenser behålls.

## Uppgifter som påverkar resdagarna

| Plats | Uppgift 13–17 oktober | Källa |
| --- | --- | --- |
| Santo Spirito | Stängt onsdag 14 oktober för besök | [Basilikan](https://www.basilicasantospirito.it/visitare-la-basilica-di-santo-spirito/) |
| Santa Maria Novella | Torsdag 15 oktober stänger 14.30, sista insläpp 14.00; redan registrerat undantag bekräftat | [Operatören](https://www.smn.it/en/visit/) |
| Opificio delle Pietre Dure | Torsdag 15 oktober extra eftermiddagsöppet 14–18 | [Höstprogrammet](https://opificiodellepietredure.cultura.gov.it/avvisi/autunno-al-museo-dellopificio-delle-pietre-dure-aperture-straordinarie-visite-guidate-musica-e-percorsi-tattili/) |
| Forte di Belvedere | Ordinarie hösttider 10–18, säsong till 16 oktober; 17 oktober ligger utanför annonserad säsong, vilket redan finns i appen | [Kommunens särskilda tidssida](https://cultura.comune.fi.it/pagina/musei-civici-fiorentini-forte-di-belvedere/orari-biglietti-accessi-opening-tickets-access) |
| Rosenträdgården | Oktober 09–18 alla dagar | [FeelFlorence](https://www.feelflorence.it/en/points-interest/rose-garden) |
| San Miniato | Mån–lör 09.30–13/15.30–19; ingen turistvisning under gudstjänst | [Klostret](https://sanminiatoalmonte.it/contatti/) |
| Lisio | Bokad torsdag 10.15; ingen ny bokningsbekräftelse inhämtad. Besök endast enligt överenskommelse | [Operatörens kontakt och grindinstruktion](https://www.fondazionelisio.org/it/contattaci) |
| Duomo/Santa Reparata | Bokad onsdag 11.30, entré Porta del Campanile; Ghiberti gäller även museet och Baptisteriet, inte kupol eller klocktorn | [FAQ](https://tickets.duomo.firenze.it/it/support/faq) |
| Uffizi | Fredag 10.30 ligger inom 08.15–18.30; aviserad strejk gäller onsdag 14 oktober. Biljett och entréskyltning gäller | [Museet](https://www.uffizi.it/gli-uffizi) |

## Kvarstående osäkerheter

- **Giulio Giannini e Figlio:** operatörens aktuella Via dei Velluti 1R och webbplats är bekräftade. Namngiven koordinatpunkt öppnas korrekt; säkert Apple-företags-id och exakt dörrpunkt saknas. Äldre register använder Piazza Pitti 37R. Markören flyttas inte med hjälp av Google-länkens utsnittscentrum: ett kartcentrum är inte automatiskt en verksamhetskoordinat.
- **Passamaneria Toscana:** Apple anger Piazza San Lorenzo 12/R; aktuellt sekundärregister anger Via del Canto dei Nelli 10. Exakt aktuell butikspunkt kräver starkare bekräftelse. Tider är obekräftade. Reservnavigering till den ungefärliga punkten ska inte läsas som en säker butiksentré.
- **Lisio:** samma verksamhet/adress är belagd, men Apple och operatörens egen kartpunkt skiljer cirka 105 meter. Exakt grindkoordinat kan inte avgöras säkert enbart av de två kartkällorna. Följ operatörens fysiska grindinstruktion och ange Via Benedetto Fortini 143 till taxi.
- **Forte di Belvedere:** kommun och Museo Galileo belägger identitet, adress och fortets koordinat. Reservplatslänken fungerar. Säkert Apple-företags-/sevärdhets-id och en ny beräknad gångväg till entrén har inte verifierats; `pending` behålls.

## Samtliga platser

Kartstatus i tabellen avser denna avläsning, inte inmätning. ”Samma” betyder samma publicerade punkt som Apple; ”osäker” betyder att starkare belägg saknas. Webb-länkar som nedan saknas är avsiktligt inte gissade. Gånglänkarnas HTTP-status är 200 för samtliga poster.

| Plats | Adress i appen | Kartkontroll | Platskort | Webb | Status |
| --- | --- | --- | --- | --- | --- |
| Hotel La Scaletta | Via de’ Guicciardini 13, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IEB80EB2465963C1A) | [Webb](https://www.hotellascaletta.it/) | verified |
| Duomo / Santa Reparata | Porta del Campanile, Piazza del Duomo, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I16F9E2AD1A5C907A) | [Webb](https://duomo.firenze.it/it/scopri/chiesa-di-santa-reparata) | verified |
| Cuculia | Via dei Serragli 3R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IBF647608F7345D55) | [Webb](https://www.cuculia.it/contatti/) | verified |
| Fondazione Arte della Seta Lisio | Via Benedetto Fortini 143, Firenze | Samma Apple-punkt; operatör avviker 105 m | [Kartor](https://maps.apple.com/place?place-id=I8F50D9FB5E198FB8) | [Webb](https://www.fondazionelisio.org/it/contattaci) | unresolved |
| Uffizierna | Piazzale degli Uffizi 6, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I619339FB1AE74F28) | [Webb](https://www.uffizi.it/gli-uffizi) | verified |
| Nugolo | Via della Mattonaia 27R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I5D428C07D60AF373) | [Webb](https://ilnugolo.com/contatti/) | verified |
| Ponte Vecchio | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I2EB04AE4C0A0D285) | [Webb](https://www.italia.it/en/tuscany/florence/ponte-vecchio) | verified |
| Palazzo Pitti | Piazza de’ Pitti 1, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IF0CB9D3977769C6F) | [Webb](https://www.uffizi.it/en/pitti-palace) | verified |
| Piazza della Passera | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IA96D45BC2D2A4FDA) | — | verified |
| Piazza Santo Spirito | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=ID3C51F77EAD52E3A) | — | verified |
| Basilica di Santo Spirito | Piazza Santo Spirito 30, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I64A1A759DB0DD4D6) | [Webb](https://www.basilicasantospirito.it/visitare-la-basilica-di-santo-spirito/) | verified |
| Piazza del Carmine | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I6344C4E427A2CACF) | — | verified |
| Piazza della Signoria | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I628E70AEE3B57EA1) | — | verified |
| Loggia dei Lanzi | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I501E352752A61A82) | [Webb](https://www.uffizi.it/video/la-loggia-de-lanzi) | verified |
| Orsanmichele | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I783C563516143B7D) | [Webb](https://bargellomusei.it/musei/orsanmichele/) | verified |
| Piazza della Repubblica | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I7D5335D00155FDF5) | — | verified |
| Piazza Santa Trinita | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I7FA4711B05C7B750) | — | verified |
| Ponte Santa Trinita | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IC1D7C6EFEBDD3AF4) | — | verified |
| Basilica di Santa Croce | Piazza Santa Croce 16, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IBF8F16153E9F31D9) | [Webb](https://www.santacroceopera.it/) | verified |
| Mercato di Sant’Ambrogio | Piazza Lorenzo Ghiberti, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I5DA11D17F5DDBD44) | [Webb](https://mercatosantambrogio.it/) | verified |
| Giulio Giannini e Figlio | Via dei Velluti 1R, Firenze | Namngiven punkt; ingen säker POI | [Kartor](https://maps.apple.com/place?coordinate=43.7664069%2C11.2506566&name=Giulio+Giannini+e+Figlio) | [Webb](https://www.giuliogiannini.com/it/content/contatti.html) | unresolved |
| Scuola del Cuoio | Via San Giuseppe 5R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I8990F937D705A52C) | [Webb](https://scuoladelcuoio.it/it/) | verified |
| Museo Opificio delle Pietre Dure | Via degli Alfani 78, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IBB109722B232AA6E) | [Webb](https://opificiodellepietredure.cultura.gov.it/) | verified |
| Officina Profumo-Farmaceutica SMN | Via della Scala 16, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IEB3952EB90D3B7AD) | [Webb](https://storelocator-eu.smnovella.com/it/italia/toscana/citta-metropolitana-di-firenze/firenze/officina-profumo-farmaceutica-di-santa-maria-novella-florence-7) | verified |
| Porta San Niccolò | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IEB22FB2BA67CBEDA) | [Webb](https://www.feelflorence.it/it/punti-di-interesse/torre-san-niccolo) | verified |
| Piazzale Michelangelo | Offentlig plats, se kartnamnet | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I944CCC9074D473AA) | — | verified |
| San Miniato al Monte | Via delle Porte Sante 34, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I25D3A27A02F6E11E) | [Webb](https://sanminiatoalmonte.it/contatti/) | verified |
| Le Volpi e l’Uva | Piazza dei Rossi 1R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I8F4E230C7AD73242) | [Webb](https://www.levolpieluva.com/home-italiano) | verified |
| Il Santino | Via di Santo Spirito 60R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IC85D23C306182E4A) | [Webb](https://www.ilsantobevitore.com/#intro-santino) | verified |
| Enoteca Pitti Gola e Cantina | Piazza de’ Pitti 16, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I3B3BB09378DE88A2) | [Webb](https://www.pittigolaecantina.com/it/) | verified |
| Enoteca Spontanea | Via Maggio 61R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I5487D38673801BA8) | — | verified |
| Fuori Porta | Via del Monte alle Croci 10R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IFC1B6C1599418DA8) | [Webb](https://www.fuoriporta.it/) | verified |
| Loggia Roof Bar | Piazza Santo Spirito 9, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I3EA1AAE0FCAA2F62) | [Webb](https://www.palazzoguadagni.com/it/loggia-roof-bar-terrazza-firenze/) | verified |
| Il Santo Bevitore | Via Santo Spirito 64R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=ID7BB8E32A0470CD3) | [Webb](https://www.ilsantobevitore.com/) | verified |
| Mercato Centrale | Piazza del Mercato Centrale, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I99202BA0273E73AC) | [Webb](https://www.mercatocentrale.it/firenze/) | verified |
| Pitti Mosaici | Piazza de’ Pitti 23R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IEA9B8145956CE110) | [Webb](https://www.pittimosaici.com/contact) | verified |
| Castorina 1895 | Via Santo Spirito 15R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IB4722DA40EF10653) | [Webb](https://www.castorina1895.com/contatti/) | verified |
| Mio Concept Store | Via della Spada 34R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I510076BDC06E3AB0) | [Webb](https://www.mio-concept.com/about-us) | verified |
| Giulia Materia | Sdrucciolo de’ Pitti 13R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IDF3A45D87DF7114F) | [Webb](https://www.giuliamateria.com/) | verified |
| Gelateria della Passera | Via Toscanella 15R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IF3B922F5269D6E7A) | [Webb](https://gelateriadellapassera.it/gusti-ed-altro/) | verified |
| Gelateria dei Neri | Via dei Neri 9/11R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I8C46A6EFC4EA360F) | — | verified |
| Gelateria La Carraia | Piazza Nazario Sauro 25R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I3D0877E956344DD1) | [Webb](https://www.gelaterialacarraia.it/en/) | verified |
| Perché No! | Via dei Tavolini 19R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I9AC912A348306FBE) | [Webb](https://www.feelflorence.it/en/points-interest/perche-no) | verified |
| Vivoli | Via Isola delle Stinche 7R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I521AB0BA9811B712) | [Webb](https://vivoli.it/) | verified |
| Cantina del Gelato | Via de’ Bardi 31, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IB1F0CB1D9D81E335) | [Webb](https://www.italia.it/it/toscana/firenze/dove-mangiare/cantina-del-gelato) | verified |
| Serre Torrigiani in Piazzetta | Piazza dei Tre Re 1, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IA4423F3D4CB4F4C1) | [Webb](https://serretorrigiani.it/serre-torrigiani-in-piazzetta/) | verified |
| Caffè Concerto Paszkowski | Piazza della Repubblica 6, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IB018DBD3F014B97B) | [Webb](https://www.caffepaszkowski.com/en) | verified |
| Bulli & Balene | Via dello Sprone 14R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I43D9EF87076BECE0) | — | verified |
| Beppa Fioraia | Via dell’Erta Canina 6R, Firenze | Avvikelse 17 m; användarbekräftad punkt behålls | [Kartor](https://maps.apple.com/place?place-id=IE09241B81B7B5B19) | [Webb](https://www.beppafioraia.it/) | verified |
| Santa Maria Novella | Piazza Santa Maria Novella | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I6A98E16006F9DCB) | [Webb](https://www.smn.it/en/visit/) | verified |
| Basilica di San Lorenzo | Piazza di San Lorenzo | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IDF0CD4D347521232) | [Webb](https://www.feelflorence.it/it/punti-di-interesse/basilica-di-san-lorenzo) | verified |
| Cappelle Medicee | Piazza di Madonna degli Aldobrandini 6 | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I9E82C0EF471352A0) | [Webb](https://www.feelflorence.it/it/punti-di-interesse/museo-delle-cappelle-medicee) | verified |
| Galleria dell’Accademia | Via Ricasoli 58/60 | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I241C35AA75E4289B) | [Webb](https://www.feelflorence.it/en/points-interest/galleria-dellaccademia-di-firenze-academy-gallery) | verified |
| Museo Nazionale del Bargello | Via del Proconsolo 4 | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I9D1D42F28C179399) | [Webb](https://www.feelflorence.it/it/punti-di-interesse/museo-del-bargello) | verified |
| Giardino di Boboli | Palazzo Pitti / Piazza de’ Pitti | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I3359EDF6CB2DFCEF) | [Webb](https://www.uffizi.it/en/boboli-garden) | verified |
| Palazzo Medici Riccardi | Via Cavour 3 | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I1C26C762F1355553) | [Webb](https://www.palazzomediciriccardi.it/en/) | verified |
| Rosenträdgården · Giardino delle Rose | Viale Giuseppe Poggi 2 | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=IE2CBE11189240006) | [Webb](https://www.feelflorence.it/en/points-interest/rose-garden) | verified |
| Antico Setificio Fiorentino | Via Lorenzo Bartolini 4 | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=ICF08CBBA3A57EFCB) | [Webb](https://anticosetificiofiorentino.com/en) | verified |
| Alberto Cozzi – Legatoria | Via del Parione 35R | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I15A8A512A9783E54) | [Webb](https://www.legatoriacozzifirenze.it/contact-us/) | verified |
| Riccardo Luci – Carta Marmorizzata | Via del Parione 35A/R | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I17FB6072F5D18326) | [Webb](https://www.riccardoluci.com/en/) | verified |
| Scarpelli Mosaici | Via Ricasoli 59R | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I3FA7C2F58E13ECB6) | [Webb](https://scarpellimosaici.it/) | verified |
| Casa dei Tessuti | Via dei Pecori 20–24R, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I35B88C14C56E6F6F) | [Webb](https://www.casadeitessuti.com/fabrics/) | verified |
| Ermini Agostino | Borgo San Lorenzo 3 | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I3E4A3225D773ABA6) | [Webb](https://www.erminiagostino.it/contatti) | verified |
| Valli Tessuti | Via della Vigna Nuova 81/R | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I549A497A0F25D038) | [Webb](https://www.vallitessuti.com/negozio-firenze/) | verified |
| Le Telerie Toscane | Sdrucciolo de’ Pitti 15R | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I3AC3CCB4319ADD2E) | [Webb](https://www.letelerietoscane.com/italiano/le_telerie_toscane_biancheria_tovaglie_lenzuola_su_misura_firenze.php) | verified |
| Passamaneria Toscana | Via del Canto dei Nelli 10 | Avvikelse 98 m; osäker | [Kartor](https://maps.apple.com/place?place-id=IC79B1AD2FBD07EB0) | — | unresolved |
| Chalet il Boschetto | Chalet il Boschetto, Piazzale Michelangelo, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I62896965EA378BAE) | — | verified |
| Terrazze Michelangelo | Terrazze Michelangelo, Viale Michelangiolo 61, Firenze | Samma Apple-punkt | [Kartor](https://maps.apple.com/place?place-id=I951FB975D51FF8B9) | [Webb](https://www.terrazzemichelangelo.it/ristorante-pizzeria-firenze/) | verified |
| Forte di Belvedere | Via San Leonardo 1, Firenze | Namngiven punkt; ingen säker POI | [Kartor](https://maps.apple.com/place?coordinate=43.7634%2C11.2534&name=Forte+di+Belvedere) | [Webb](https://cultura.comune.fi.it/pagina/musei-civici-fiorentini-forte-di-belvedere/orari-biglietti-accessi-opening-tickets-access) | pending |

## Kontrollernas gränser

Detta är dokument- och kartdatarevision. Ingen fysisk dörr har mätts in på plats. Apple-kortets centrum kan ligga inne i en kyrka, trädgård eller större fastighet; platscentrum och ingång skiljs därför åt. Uffizi och Santa Reparata har fortfarande instruktioner om fysisk entré i text.

HTTP-kontrollen visar att sidorna går att hämta och att korten har rätt identitet. Den kan inte garantera framtida drift, appövergång på varje iPhone, spontan stängning eller användarens aktuella position. Gånglänkarna har rätt destination och svarar, men färdiga gångvägar/ETA har inte beräknats på nytt i MapKit eller Apple-appen. Äldre ruttevidens från 10 oktober behålls endast för oflyttade punkter. Bokningar har inte ombekräftats med verksamheterna.

Publicerade tider är granskade mot de länkar som faktiskt innehåller tidsuppgifterna. Poster utan säkra tider förblir `unconfirmed`; fungerande kartlänk betyder inte att en butik är öppen. Denna revision granskar inte varje historiskt påstående i berättelserna, men kontrollerar deras källänkar och korsreferenser.

Appens gränssnitt och funktioner har inte ändrats. Kontrollen gäller innehåll, adresser, källor och länkar. Befintliga automatiska kontroller godkänner sex scheman, 69 platser, 207 navigeringslänkar, 79 avsiktligt felaktiga indatafall, bokningar, fem rutter och återanvändbara versioner. Slutinnehållet har validerats efter sista datumundantaget. Bildfilerna finns och bildkredit-/licenslänkarna svarar.
