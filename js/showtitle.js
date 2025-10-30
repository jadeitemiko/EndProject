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
        <p>Want to look closer at our results? Enter a number no larger than our search result to look up details and book cover (if it exists)</p>
        <div>
            <input type="number" id="book-index-input" placeholder="Enter number between 1 and ${maxVal}" min="1" max="${maxVal}" value="1"/>
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

  const maxCount = CACHED_BOOKS.length;

  // Hämta och rensa input
  const inputValue = inputElement.value;
  const index = parseInt(inputValue, 10);

  // 2. Validering
  if (isNaN(index) || index < 1 || index > maxCount || !Number.isInteger(parseFloat(inputValue))) {
    outputContainer.innerHTML = `<p>Invalid entry. Add a whole number between 1 and ${maxCount}.</p>`;
    // Inget klassbyte här för felindikering, då vi undviker nya CSS-klasser.
    return;
  }

  // 3. Hämta data (Index 1 motsvarar array-index 0)
  const book = cached_books [index - 1];

  if (!book) {
    outputContainer.innerHTML = '<p>No book found at index. Unexpected error</p>';
    return;
  }

  // 4. Visa nycklar
  const title = book.title || 'Missing title';
  const workKey = book.key || 'Missing Work Key (/works/OL...W)';
  const coverEditionKey = book.cover_edition_key || 'Missing cover edition key';

  // fippla lite med CSS här om vill ha snyggare
  outputContainer.innerHTML = `
        <div>
            <h4>${index}. ${title}</h4>
            <p><strong>Work Key:</strong> ${workKey}</p>
            <p><strong>Edition Key:</strong> ${coverEditionKey}</p>
        </div>
    `;
}
