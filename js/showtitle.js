//plocka fram en enstaka titel att titta på utifrån numeriskt värde som hämtas från sökningen
//globala konstanter för maximalt antal böcker

// Globala konstanter (deklareras av modulen som importerar denna funktion, t.ex. app.js)
let maxBooksCount = 0;
let cached_books  = [];

export function initializeShowTitle(allBooks) {
  cached_books  = allBooks;
  maxBooksCount = allBooks.length;
}

export function getShowTitleHTML() {
  const maxVal = maxBooksCount;

  return `
        <h3>Lookup a title</h3>
        <p>Want to look closer at our results? Enter a number no larger than our search result to look up details and book cover (if it exists)</p>
        <div>
            <input type="number" id="book-index-input" placeholder="Enter number between 1 and ${maxVal}" min="1" max="${maxVal}" value="1"/>
            <br>
            <button type="button" id="show-title-btn" class="smaller-button">
            Lookup
            </button>
        </div>
        <div id="show-title-output"></div>
    `;
}

//kontrollera inmatning + visa eftersökt data
export function handleShowTitle(e) {
  const inputElement = document.getElementById('book-index-input');
  const outputContainer = document.getElementById('show-title-output');

  // Nollställ utdata
  outputContainer.innerHTML = '';

  const maxCount = cached_books.length;

  // Hämta och rensa input
  const inputValue = inputElement.value;
  const index = parseInt(inputValue, 10);

  // 2. Validering
  if (isNaN(index) || index < 1 || index > maxCount || !Number.isInteger(parseFloat(inputValue))) {
    outputContainer.innerHTML = `<p>Invalid entry. Add a whole number between 1 and ${maxCount}.</p>`;
    return;
  }

  // 3. Hämta data (Index 1 motsvarar array-index 0)
  const book = cached_books [index - 1];

  if (!book) {
    outputContainer.innerHTML = '<p>No book found at index. Unexpected error</p>';
    return;
  }

  // 4. Extrahera data
  const title = book.title || 'Missing title';

  // Hämta författarnamn säkert
  const authorName = book.author_name ? book.author_name[0] : 'Unknown Author';

  const coverEditionKey = book.cover_edition_key;

  // Skapa omslags-URL (Medium storlek) och HTML
  let coverHtml = '';
  if (coverEditionKey) {
    const coverUrl = `https://covers.openlibrary.org/b/olid/${coverEditionKey}-M.jpg`;

    // Använder den nya, existerande CSS-klassen 'cover-image'
    coverHtml = `<img src="${coverUrl}" alt="Omslag för ${title}" class="cover-image">`;
  } else {
    coverHtml = '<p>No book cover found for this edition.</p>';
  }


  // 5. Visa output
  outputContainer.innerHTML = `
        <div>
            <h4 style="font-weight: bold;">${index}. ${title}</h4>
            <p><strong>Author:</strong> ${authorName}</p>
            ${coverHtml}
        </div>
    `;
}
