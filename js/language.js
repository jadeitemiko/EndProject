//filtrera på språk

// Språklista, alternativen kollade via konsolen - Svenska borttaget och Engelska borttaget.
const LANGUAGES = [
  { code: 'ger', name: 'German' },
  { code: 'fre', name: 'French' },
  { code: 'spa', name: 'Spanish' },
];

//exkludera engelska titlar, då OL prioriterar dem framför översatta verk
const ORIGINAL_ENGLISH_TITLES = [
  "Frankenstein or The Modern Prometheus",
  "Frankenstein; or, The Modern Prometheus"
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
  const languageSelect = document.getElementById('language-select');
  const selectedLang = languageSelect.value;
  const outputContainer = document.getElementById('language-filter-output');

  if (!outputContainer) {
    console.error("ERROR: Could not find element #language-filter-output");
    return;
  }

  outputContainer.innerHTML = ''; // Rensa föregående resultat

  if (!selectedLang) {
    outputContainer.innerHTML = '<p>Choose a language</p>';
    return;
  }

  // kraschsäkring - förhindrar tyst krasch vid osäker API-data
  const filteredBooks = allBooks.filter(book => {
    // returnera false om book.language inte är korrekt definierad som array
    if (!Array.isArray(book.language)) {
      return false;
    }
    //filtrera ut de som har språk
    return book.language.includes(selectedLang);
  });

  //visa bara unika resultat, max 5 för att inte förstöra layouten
  const uniqueTitles = new Set();
  const results = [];

  for (const book of filteredBooks) {
    if (uniqueTitles.size >= 5) break;

    //ignorera eng originaltiteln
    if (ORIGINAL_ENGLISH_TITLES.includes(book.title)) {
      continue;
    }

    if (!uniqueTitles.has(book.title)) {
      uniqueTitles.add(book.title);

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
    //om saknas 
    outputContainer.innerHTML = '<p>No results found for chosen language.</p>';
  }
}
