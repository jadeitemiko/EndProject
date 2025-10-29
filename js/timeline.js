/**
 * Tidslinjelogik och data.
 * Denna modul innehåller all kurerad data (SELECTED_TIMELINE_BOOKS)
 * och alla funktioner som behövs för att matcha och rita tidslinjen.
 */

// Kurerad data över böcker som ska visas på tidslinjen.
// Denna data är statisk och hör logiskt hemma i tidslinjemodulen.
export const SELECTED_TIMELINE_BOOKS = [
  // cover_id_fallback: Korrekta Omslags-ID för externa bilder. Matchar troligen INTE i cache.
  { olKey: '/works/OL450063W', yearPub: 1818, note: 'Original edition', cover_id_fallback: 15113302 },
  { olKey: '/works/OL7141324W', yearPub: 1969, note: 'Psychidelic 60ies spinoff', cover_id_fallback: 1996606 },
  { olKey: '/works/OL892505W', yearPub: 1973, note: 'Science fiction spinoff', cover_id_fallback: 10037277 },
  { olKey: '/works/OL503317W', yearPub: 1990, note: 'New wave of spinoffs - or more scanned material?', cover_id_fallback: 3875774 },
  { olKey: '/works/OL16053120W', yearPub: 2000, note: 'One of many kids versions', cover_id_fallback: 6996467 },
  { olKey: '/works/OL497167W', yearPub: 2004, note: 'Modern thriller', cover_id_fallback: 12893839 },
  { olKey: '/works/OL14695537W', yearPub: 2006, note: 'Licensed sequel to the Universal monster movie', cover_id_fallback: 875041 },
  { olKey: '/works/OL21595085W', yearPub: 2007, note: 'Teen/YA version', cover_id_fallback: 6608895 },
  { olKey: '/works/OL17820824W', yearPub: 2013, note: 'Crossover with Sherlock Holmes', cover_id_fallback: 8358990 },
  { olKey: '/works/OL20251105W', yearPub: 2013, note: 'Postcolonial interpretation', cover_id_fallback: 8351858 },
  { olKey: '/works/OL28974510W', yearPub: 2035, note: 'Modern Science fiction', cover_id_fallback: 13816441 },
];

/**
 * Mappar den cachade sökdatan (allBooks) till en snabb-sökbar Map med Cover ID som nyckel.
 * @param {Array} books - Arrayen med alla sökresultat.
 * @returns {Map} - Map där nyckeln är cover_i (number).
 */
function createCoverIdMap(books) {
  const coverMap = new Map();
  books.forEach(book => {
    if (book.cover_i) {
      coverMap.set(book.cover_i, book);
    }
  });
  return coverMap;
}

/**
 * Mappar den cachade sökdatan (allBooks) till en snabb-sökbar Map med Work Key som nyckel.
 * Används som fallback när Cover ID-matchning misslyckas.
 * @param {Array} books - Arrayen med alla sökresultat.
 * @returns {Map} - Map där nyckeln är Work Key (string, t.ex. /works/OL...W).
 */
function createWorkKeyMap(books) {
  const workMap = new Map();
  books.forEach(book => {
    // En bok kan ha flera work keys (olid), vi använder den första om den finns.
    if (book.key) {
      // Work Key är den unika identifieraren för själva verket (Work)
      workMap.set(book.key, book);
    }
  });
  return workMap;
}

/**
 * Kontrollerar om den första författaren är Mary Shelley och, i så fall,
 * returnerar den andra författaren för att belysa spinoff-författaren.
 *
 * @param {object} matchedBook - Det matchande bokobjektet från allBooks.
 * @returns {string} - Författarnamnet som ska visas.
 */
function getDisplayAuthor(matchedBook) {
  const maryShelleyNames = ["Mary Shelley", "Mary Wollstonecraft Shelley", "Shelley, Mary"];

  if (!matchedBook.author_name || matchedBook.author_name.length === 0) {
    return ''; // Returnera tom sträng om ingen författardata finns.
  }

  const firstAuthor = matchedBook.author_name[0];

  const isMaryShelley = maryShelleyNames.some(name =>
    firstAuthor.toLowerCase().trim() === name.toLowerCase().trim()
  );

  if (isMaryShelley && matchedBook.author_name.length > 1) {
    // Mary Shelley hittades, och det finns en annan författare: returnera den andra.
    return matchedBook.author_name[1];
  }

  // Annars, returnera den första författaren.
  return firstAuthor;
}


/**
 * HÄMTAR METADATA OCH RITAR TIDS-LINJEN
 * @param {Array<Object>} allBooks - Den cachade datan från Open Library-sökningen.
 */
export async function loadTimelineContent(allBooks) {
  const container = document.getElementById('timeline-container');
  container.innerHTML = 'Hämtar metadata från cachade sökresultat...';

  // Skapa båda Map-strukturerna för snabb sökning
  const coverIdMap = createCoverIdMap(allBooks);
  const workKeyMap = createWorkKeyMap(allBooks);

  const timelineData = SELECTED_TIMELINE_BOOKS.map((timelineItem) => {

    // FÖRSÖK 1: Matcha via Omslags-ID
    let matchedBook = coverIdMap.get(timelineItem.cover_id_fallback);
    let matchMethod = matchedBook ? 'Cover ID' : 'None';

    // FÖRSÖK 2: Om Cover ID misslyckades, matcha via Work ID (olKey)
    if (!matchedBook) {
      matchedBook = workKeyMap.get(timelineItem.olKey);
      if (matchedBook) {
        matchMethod = 'Work ID';
      }
    }

    let finalTitle;
    let finalAuthor;

    // ---------------------------------------------------------------------
    // LOGIK: Använd matchat resultat, eller visa fel
    // ---------------------------------------------------------------------

    if (matchedBook) {
      // MATCHNING HITTADES I CACHEN (ANVÄND SÖKDATAN)
      finalTitle = matchedBook.title || 'Unknown Title';

      // ANVÄND SMART LOGIK FÖR ATT VÄLJA FÖRFATTARE
      finalAuthor = getDisplayAuthor(matchedBook);

    } else {
      // INGEN MATCHNING HITTADES I CACHEN. Nu visas ett hårt felmeddelande.
      finalTitle = `[!! FAILED MATCH: ${timelineItem.olKey}]`;
      finalAuthor = 'No match found in cached data.';
      matchMethod = 'Hard Failure';
    }


    return {
      // År och omslag hämtas ALLTID från vår hårdkodade sanning
      ...timelineItem,
      year: timelineItem.yearPub,
      title: finalTitle,
      author: finalAuthor,
      cover_id: timelineItem.cover_id_fallback,
      match_method: matchMethod // endast för debuggning
    };
  });

  // Sortera baserat på det kurerade året (yearPub)
  timelineData.sort((a, b) => a.yearPub - b.yearPub);

  container.innerHTML = ''; // RENSAR 'LADDAR...'

  // RITA UPP TIDS-LINJEN
  timelineData.forEach(book => {
    const entry = document.createElement('div');
    entry.className = 'timeline-entry';

    // 1. OMSLAG (Använder det kurerade ID:t)
    const imageSrc = book.cover_id
      ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
      : 'https://placehold.co/150x230/cccccc/333333?text=No+Cover';

    const imgElement = document.createElement('img');
    imgElement.src = imageSrc;
    imgElement.className = 'timeline-image';
    imgElement.alt = `Cover for ${book.title}`;

    // Lägg till fallback för bild som inte laddas (viktigt vid segt nät)
    imgElement.onerror = function() {
      this.onerror=null;
      this.src='https://placehold.co/150x230/cccccc/333333?text=Bild+Misslyckades';
    };


    // 2. INFO
    const info = document.createElement('div');
    info.className = 'timeline-info';
    info.innerHTML = `
            <!-- ÅR OCH TITEL VISAS SEPARAT -->
            <h3 class="timeline-year">${book.year}</h3>
            <h4 class="timeline-title">${book.title}</h4>
            <!-- FÖRFATTARE VISAS SEPARAT OM INTE FILTRERAD BORT ELLER TOM STRÄNG -->
            ${book.author ? `<p class="timeline-author"><strong>Author:</strong> ${book.author}</p>` : ''}
            <p class="timeline-note">${book.note}</p>
        `;

    entry.appendChild(imgElement);
    entry.appendChild(info);
    container.appendChild(entry);
  });
}


/**
 * FUNKTION FÖR ATT VISA POPUPEN (anropar loadTimelineContent)
 * @param {Array<Object>} allBooks - Den cachade datan från Open Library-sökningen.
 */
export function showTimelinePopup(allBooks) {
  // Avbryt om allBooks inte har laddats än
  if (allBooks.length === 0) {
    const output = document.getElementById("output");
    output.innerHTML = '<p class="text-red-500 font-bold p-4 bg-red-100 rounded-lg">Vänligen klicka "Meet Frankenstein" först för att ladda data innan tidslinjen kan visas.</p>';
    return;
  }

  const modal = document.getElementById('timeline-modal');
  modal.style.display = 'block';

  // STÄNG-FUNKTIONALITET
  const closeBtn = document.querySelector('.close-button');
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  // STÄNG OM MAN KLICKAR UTANFÖR
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // LADDA INNEHÅLLET
  loadTimelineContent(allBooks);
}
