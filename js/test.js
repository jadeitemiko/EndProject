// data_filter_test.js
// Detta skript simulerar API-anropet och filtreringen för att bevisa om felet ligger i datastrukturen eller i DOM-hanteringen.

// --- Globala variabler från app.js ---
const startUrl = "https://openlibrary.org/search.json?title=";
const title = "frankenstein";
const genre = "fiction";
const languageToFilter = 'se' // Testa mot svenska

const MAX_PAGES = 5; // Begränsa till 500 böcker, som i app.js

/**
 * Hämtar all data om vald titel från Open Library API
 * @returns {Promise<Array>} Array med bokdokument.
 */
async function fetchAllBooks() {
  let subj = `&subject=${genre}`
  let url = `${startUrl}${title}${subj}`;
  let fetchedBooks = [];
  let totalFound = Infinity;

  console.log(`Hämtar data för '${title}' med ämnet '${genre}'.`);

  try {
    let page = 1;
    while (page <= MAX_PAGES && fetchedBooks.length < totalFound) {
      const offset = (page - 1) * 100;
      const apiUrl = `${url}&offset=${offset}`;
      console.log(`-> Sida ${page} (offset: ${offset})...`);

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Network error: ${res.status}`);

      const data = await res.json();
      if (!data.docs || data.docs.length === 0) break;

      if (totalFound === Infinity) {
        totalFound = data.numFound;
        console.log(`Totalt antal träffar: ${totalFound}. Bearbetar max ${Math.min(MAX_PAGES * 100, totalFound)}.`);
      }

      fetchedBooks.push(...data.docs);
      page++;
    }

    console.log(`Slutförd hämtning. Totalt antal böcker i cache: ${fetchedBooks.length}`);
    return fetchedBooks;

  } catch (error) {
    console.error("Hämtning misslyckades:", error);
    return [];
  }
}

/**
 * Filtrerar den cachade datan utifrån valt språk (swe) och skriver ut resultaten.
 * OBS! Implementerar säkerhetskontrollen för att undvika krasch.
 * @param {Array} allBooks - All hämtad bokdata.
 */
function applyLanguageFilterTest(allBooks) {
  console.log("\n--- STARTAR FILTRERING PÅ SPRÅK: ---");

  // Säker filtrering: Kontrollerar att book.language existerar och är en array.
  const filteredBooks = allBooks.filter(book => {
    if (!Array.isArray(book.language)) {
      return false;
    }
    // Returnera true om språket matchar
    return book.language.includes(languageToFilter);
  });

  // Visa bara unika titlar, max 5 för test
  const uniqueTitles = new Set();
  const results = [];

  for (const book of filteredBooks) {
    if (uniqueTitles.size >= 5) break;
    if (!uniqueTitles.has(book.title)) {
      uniqueTitles.add(book.title);

      // Lägger till säkerhetskontroll för författarnamn här också (om det är nästa fel)
      const authorName = Array.isArray(book.author_name) ? book.author_name.join(', ') : 'Okänd Författare';

      results.push({
        title: book.title,
        author: authorName,
        language: book.language
      });
    }
  }

  console.log(`\nFILTRERING SLUTFÖRD. Hittade unika resultat: ${results.length}`);

  if (results.length > 0) {
    console.log("--- Första 5 UNIKA TITLAR ---");
    results.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (av ${item.author})`);
    });
  } else {
    console.log("Inga resultat på språket hittades i den hämtade datan.");
  }
  console.log("-------------------------------------------------");
}


// --- Huvudfunktion för att köra testet ---
async function runTest() {
  const books = await fetchAllBooks();
  if (books.length > 0) {
    applyLanguageFilterTest(books);
  } else {
    console.log("Kunde inte starta filtrering: Ingen data hämtades.");
  }
}

// Kör testet
runTest();
