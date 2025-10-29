//filtrera på språk

// Språklista, alternativen kollade via konsolen
const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'swe', name: 'Swedish' },
  { code: 'ger', name: 'German' },
  { code: 'fre', name: 'French' },
  { code: 'spa', name: 'Spanish' },
];

// html för språk
export function getLanguageFilterHTML() {
  let optionsHtml = LANGUAGES.map(lang =>
    `<option value="${lang.code}">${lang.name} (${lang.code})</option>`
  ).join('');

  return `
        <p>Filter titles according to language and see some of the available translations and editions</p>
        <div>
            <select id="language-select" name="language">
                <option value="">Choose language</option>
                ${optionsHtml}
            </select>
            <input type="button" id="filter-results-btn" name="filter-results" value="Filter" class="smaller-button">
        </div>
        <div id="language-filter-output"></div>
    `;
}


// filtrera cachade datan i allBooks utifrån valt språk, mata ut max 5 resultat.
export function applyLanguageFilter(allBooks) {
  console.log("--- applyLanguageFilter START ---");
  const languageSelect = document.getElementById('language-select');
  const selectedLang = languageSelect.value;
  console.log("Selected Language:", selectedLang);
  const outputContainer = document.getElementById('language-filter-output');
  if (!outputContainer) { // NYTT: 3. Kan vi hitta output-containern?
    console.error("ERROR: Could not find element #language-filter-output");
    return;
  }
  outputContainer.innerHTML = ''; // Rensa föregående resultat

  if (!selectedLang) {
    // Endast ren p-tagg utan stilklasser
    outputContainer.innerHTML = '<p>Choose a language</p>';
    return;
  }

  // Ingen säkerhetskontroll: Kraschar om book.language inte är en array eller är null/undefined
  const filteredBooks = allBooks.filter(book =>
    book.language.includes(selectedLang)
  );

  //visa bara unika resultat, max 5 för att inte förstöra layouten
  const uniqueTitles = new Set();
  const results = [];

  for (const book of filteredBooks) {
    if (uniqueTitles.size >= 5) break;
    if (!uniqueTitles.has(book.title)) {
      uniqueTitles.add(book.title);

      // Ingen säkerhetskontroll: Kraschar/ger undefined om book.author_name saknas/är tom
      const author = book.author_name[0];

      results.push({
        title: book.title,
        author: author
      });
    }
  }

  // show results
  if (results.length > 0) {
    const resultList = document.createElement('ul');
    resultList.classList.add('ten-titles-list');

    results.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('ten-list-item');
      li.innerHTML = `<strong>${item.title}</strong> by author ${item.author}`;
      resultList.appendChild(li);
    });

    outputContainer.appendChild(resultList);
  } else {
    // Endast ren p-tagg utan stilklasser
    outputContainer.innerHTML = '<p>No results found for chosen language.</p>';
  }
  console.log("Results found:", results.length);
}
