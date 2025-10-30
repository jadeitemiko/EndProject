# EndProject
DANS25 Programmering ramming 1, avslutningsprojekt. Skapat hos Medieinstitutet, YH-klassen Digital Analytics
Sidan deployad på https://frankensteinbookcase.netlify.app/

1. Dokumentation
2. Credits

## Dokumentation
### 1.1 Grundläggande organisation
Index.html laddar direkt app.js, samt modulerna language.js (Språkfiltrering), showtitle.js (slå upp detaljer om enstaka träff) och timeline.js (tidslinje). Utseende definieras i style.css som svarar dynamiskt på olika skärmstorlekar.
### 1.2 Huvudscript, cache
När användaren trycker på knappen "Meet Frankenstein" (dvs ger input från DOM), initieras en asynkron fetch-request från app.js mot Open Library API för titlar som innehåller "frankenstein" och tillhör ämnet "fiction". Användaren kan ytterligare filtrera den hämtade datan genom att välja titlar med tillgänglig fulltext och/eller bokomslag. För att snabba upp data och minska belastningen på API:n, cachas metadata och lagras i "allBooks". Endast resurser som ej ingår i metadatan (t.ex. omslagsbilder länkade via URL) hämtas vid behov.
När data har hämtats (fastställ via asynkron funktion) ritas 3 kolumner upp i DOM. Kolumnernas ordning skiljer sig mellan större skärmar och mobiler. En kolumn (bookListCol) plockar fram de 10 populäraste böckerna som innehåller Frankenstein i titeln och visar dem samt författare. En kolumn (filterCol) erbjuder ytterligare filtreringsmöjlighet och förklaras nedan. Den avslutande kolumnen innehåller en knapp för att återställa sökningen, så att en ny fetch-request kan göras.
Flera felkontroller finns, för att hantera nätverksfel eller misslyckad hämtning.
### 2.1 Uppdelad javascript
App är huvudscriptet som åkallar dottermoduler. Detta är främst en organisatorisk uppdelning.
Filen test är endast för testning och felsökning direkt mot konsol
### 2.2 filterCol
Den mest komplexa kolumnen, filterCol, är den som erbjuder ytterligare filtreringsmöjligheter. I den skrivs vid körning av app.js formulär och knappar till DOM, som tillåter användaren att kalla på ytterligare moduler: langauge.js, showtitle.js och timeline.js

**Showtitle** tillåter användaren att slå upp en enskild bok (work) ur den cachelagrade datan. Användaren anger ett indexnummer (som av formuläret begränsas till min 1 och max det totala antalet hämtade titlar). Modulen använder bokens cover_i för att konstruera en extern URL för omslagsbilden, som sedan visas i DOM. Ett textmeddelande visas om bilden saknas.

**Timeline** visar en kuraterad lista över intressanta utgåvor, definierade statiskt i timeline.js.Eftersom Open Librarys API-struktur gjorde det opålitligt att dynamiskt hämta specifika historiska omslagsbilder (ex det hos open library sparade omslaget på originalutgåvan från 1818), används manuellt verifierade cover_id-värden i den statiska listan. Metadata (titel och författare) försöker matchas mot den cachade datan. Omslagsbilderna baseras på manuellt verifierade cover_id-värden i den statiska listan, vilka används för att konstruera en extern URL. Kommentarerna är hårdkodade i modulen.
För att inte krocka med adblockers, som kan ske med nya fönster, visas tidslinjen i en modal overlay.

**Language** är ett språkfilter baserat på cachad metadata. Modulen filtrerar tyska, spanska eller franska från från de hämtade titlarna och displayar upp till fem titlar.
På grund av Open Librarys datastruktur, som lagrar flera språkuppgifter i samma fält och prioriterar engelska titlar, blir funktionaliteten begränsad. Originaltiteln på Mary Shelley's Frankenstein är bortfiltrerad, då den annars displayas på engelska vid alla sökningar.

# Credits
Data och bokomslag hämtas från OpenLibrary API.

Övriga bilder:
https://wallpapercave.com/w/wp2036898
https://www.flaticon.com/free-icons/books
https://commons.wikimedia.org/wiki/File:Bookman_Ornament_7242_(bookshelf).svg

