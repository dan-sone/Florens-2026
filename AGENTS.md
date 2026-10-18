# Projektregler

## Separera alltid logik från innehåll

Denna regel gäller alla ändringar i projektet.

- Applogik, presentation och återanvändbara regler ska vara oberoende av resmål och resa.
- Resmål, platser, koordinater, datum, bokningar, rutter och redaktionella texter ska ligga i innehålls- eller konfigurationsfiler, enligt projektets befintliga JSON-modeller och scheman. Hårdkoda dem inte i JavaScript, HTML-mallar eller CSS.
- Appen ska läsa uppgifterna från dessa filer. Resmålsspecifika undantag ska uttryckas som data eller konfiguration, aldrig som specialfall i den generella logiken.
- Offlineområden, lagringsnamn, startpositioner och kartpaket ska härledas från resans data och konfiguration. Genererade kartpaket och andra byggfiler får innehålla resmålets data, men bygglogiken ska förbli generell.
- Ett nytt resmål ska kunna använda samma appkod genom att ersätta innehåll, konfiguration och genererade kartpaket.
- Kontrollera denna separation vid varje ändring. Befintliga avvikelser får inte användas som förebild för nya; rätta dem när den berörda funktionen ändras och verifiera att beteendet bevaras.
