# Separation mellan app och resmål

Samma appkod ska kunna användas för nästa resmål. Projektets bindande regel finns i AGENTS.md.

| Ansvar | Källa |
| --- | --- |
| Resa, datum, bokningar, permanent visade platser och kartans startläge | `guide.json` |
| Platser, rutter, berättelser och historia | Respektive innehållsfil och schema |
| Kategorier, ikoner och färger | `taxonomy.json` |
| Kartleverantör, bokningskategori, frågetext och textpresentation | `app-config.json` |
| Offlineområdets regler, regional kartkälla och äldre lagringsnamn som ska migreras | `offline-config.json` |
| Lagring, nedladdning, kartvisning, kompass och navigation | Generell JavaScript-kod |

Kartpaket, offlinefiler och manifest är genererade data och får innehålla resmålets koordinater och namn. Kartbygget läser område, namn och källadress från konfigurationen. Bygglagringen isoleras per resa, datakälla och område.

Offlinepaket får egna namn utifrån resans id. Äldre namn finns endast i migrationskonfigurationen. Ett äldre komplett paket används tills ersättningen är klar. Städning kontrollerar även webbplatsens URL-scope och ska aldrig radera en annan guides paket.

`npm run check` kontrollerar innehållet och kör `npm run test:architecture`. Arkitekturtestet startar den riktiga appkoden med nuvarande innehåll och med ett annat resmål vars kategorier har andra id:n. Separata tester kontrollerar lagringsmigrering, isolering och kartbyggets konfigurationsstyrning. Äldre resmålsspecifika regressionstester är testfixturer, inte appens logik.

## Online preview of another destination

`examples/stockholm/` contains explicitly fictional test content. Run
`npm run build:preview` to generate `demo/` from the shared `index.html`.
The builder only adjusts static resource paths and excludes destination-specific
offline integration; the application logic is identical. Schemas and content are
copied beside the preview. Regenerate the preview after changing the shared UI.
`test:architecture` verifies both startup and identical inline application logic.
The preview has no offline download because no matching offline map is supplied.
