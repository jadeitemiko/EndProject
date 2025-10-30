// Importerar tidslinje som popup
import { showTimelinePopup } from './timeline.js';
//importerar språkfilter
import { applyLanguageFilter, getLanguageFilterHTML } from './language.js';
// Importerar funktioner för att visa en enstaka titel utifrån nummervärde
import { initializeShowTitle, getShowTitleHTML, handleShowTitle } from './showtitle.js';

/*
Globala variabler:
allBooks - lagrar all hämtad bokdata (våra 369 pålitliga sökresultat)
startUrl - bas-URL för API-anrop
title - titel på "månadens bok", just nu Frankenstein
subj = om månadens bok ger för många alternativ, hårdkoda in ytterligare filter, nu fiction
*/

let allBooks = [];
const startUrl = "https://openlibrary.org/search.json?title=";
const title = "frankenstein"; //månadens bok
const genre = "fiction";

//återställ sökningen
async function resetSearch() {
  allBooks = [];
  const output = document.getElementById("output");
  output.innerHTML = '';

  const inputContainer = document.getElementById("input");
  inputContainer.innerHTML = `
    <form id="initial-search-form">
      <label for="withcover">With cover image</label> <input type="checkbox" id="withcover" name="withcover"><br>
      <label for="ebook">Available as book</label> <input type="checkbox" id="ebook" name="ebook">
      <p></p>
      <input type="submit" id="pull-api" name="pull-api" value="Meet Frankenstein" class="big-button">
    </form>
  `;

  //återställ lyssnare/knappar
  setEventListeners();
}

// Container-funktion för att organisera hämta från API
async function runTask() {

  //hämtar all data om vald titel från API
  async function fetchBook() {
    let subj = `&subject=${genre}`
    let url = `${startUrl}${title}${subj}`;
    const maxPages = 5; //paginerar, hämtar maxPages * 100 böcker åt gången
    let fetchedBooks = []; // lokal array för att returnera

    try {
      let page = 1;
      let totalFound = Infinity; // initialt obegränsat
      while (page <= maxPages && fetchedBooks.length < totalFound) {

        // OL använder 'offset' för paginering, inte 'page'.
        const res = await fetch(`${url}&offset=${(page - 1) * 100}`);
        if (!res.ok) throw new Error(`Network error: ${res.status}`);

        //cache-funktion för att inte hämta i onödan vid filtreringar
        const data = await res.json();
        if (!data.docs || data.docs.length === 0) break;

        // läs total antal träffar första sidan
        if (totalFound === Infinity) totalFound = data.numFound;
        fetchedBooks.push(...data.docs);
        page++;
      }

      allBooks = fetchedBooks;
      return fetchedBooks;

    } catch (error) {
      console.error("Failed retrieval:", error);
      const output = document.getElementById("output");
      output.textContent = "Cannot load data";
      return []; // returnerar tom array vid fel
    }
  }

  // Kolla om data finns cachad för att spara antalet anrop
  const books = allBooks.length > 0 ? allBooks : await fetchBook();
  if (books.length === 0) return; // om inga böcker, stoppa här

  //kontrollera checkbox-sökning och filtrera
  const withCover = document.getElementById('withcover')?.checked || false;
  const ebook = document.getElementById('ebook')?.checked || false;
  let filtered = books;
  if (withCover) filtered = filtered.filter(b => b.cover_i);
  if (ebook) filtered = filtered.filter(b => b.has_fulltext);

  // Initialisera den nya showtitle-modulen med den filtrerade datan
  initializeShowTitle(filtered);

  // hämta containern Input + uppdatera efter första sökningen
  const inputContainer = document.getElementById("input");
  inputContainer.innerHTML = `
      <form id="initial-search-form">
          <label for="withcover">With cover image</label> <input type="checkbox" id="withcover" name="withcover" ${withCover ? 'checked' : ''}><br>
          <label for="ebook">Available as e-book</label> <input type="checkbox" id="ebook" name="ebook" ${ebook ? 'checked' : ''}>
          <p></p>
      </form>
    `;

  // hämta output-containern (div på index.html) och rensa den vid varje knapptryckning
  const output = document.getElementById("output");
  output.innerHTML = '';

  //visa hur många träffar totalt
  const countElement = document.createElement("p");
  countElement.textContent = `Your search returned ${filtered.length} titles within the subject .`;

  //formatering för de 10 första titlarna i lista
  const listHeading = document.createElement("h2");
  listHeading.textContent = "The first ten unique titles:";
  listHeading.classList.add("list-heading");

  const bookListContainer = document.createElement("ul");
  bookListContainer.classList.add("ten-titles-list");

  //loop för att plocka fram de 10 första unika titlarna
  const seenTitles = new Set();
  let count = 0;

  for (const book of filtered) {
    if (count >= 10) {
      break;
    }
    if (!seenTitles.has(book.title)) {
      seenTitles.add(book.title);

      //skapa nytt element för att visa listan
      const titleElement = document.createElement("li");
      titleElement.classList.add("ten-list-item");

      // Hämta författarnamn dynamiskt från sökresultatet
      const authorText = book.author_name ? ` (Author: ${book.author_name.join(', ')})` : '';

      titleElement.textContent = book.title + authorText;
      bookListContainer.appendChild(titleElement);
      count++;
    }
  }

  //skapar layout som är 3 kolumner på stor skärm, 1 på liten
  const mainLayout = document.createElement("div");
  mainLayout.id = "resp-layout-box";

  //skapar kolumn för topp-10 boklistan
  const bookListCol = document.createElement("div");
  bookListCol.id = "book-results-column";

  // kolumnen för vidare filtrering, filterCol
  const filterCol = document.createElement("div");
  filterCol.id = "filter-column";

  const dividerHtml = `<img src="img/BookmanOrnament7242.png" alt="Divider: Bookman Ornament 7247" class="avdela">`;

  // Ladda in HTML för index-sökningen och lägg till i filterCol
  const showTitleForm = document.createElement('div');
  showTitleForm.innerHTML = getShowTitleHTML();

  //knapp för popup tidslinje av intressanta utgåvor med omslag
  const timelineButton = document.createElement('button');
  timelineButton.className = 'big-button';
  timelineButton.textContent = 'Show timeline';
  timelineButton.id = 'show-timeline-btn';
  timelineButton.type = 'button';

  //hämtar språk-filen
  const filterForm = document.createElement('form');
  filterForm.id = 'new-filter-form';
  filterForm.innerHTML = getLanguageFilterHTML();

  // lägger in index-sökningen, tidslinje-knapp + språkformulär i filtreringskolumnen
  filterCol.appendChild(showTitleForm);
  filterCol.insertAdjacentHTML('beforeend', dividerHtml); //avdelare
  filterCol.appendChild(timelineButton);
  filterCol.insertAdjacentHTML('beforeend', dividerHtml); //avdelare
  filterCol.appendChild(filterForm);

  //skapar återställningskolumnen
  const resetCol = document.createElement("div");
  resetCol.id = "reset-column";
  resetCol.innerHTML = `<p>Reset your search, if you want to start over from the beginning!</p>
    <input type="button" id="reset-api" value="Redo search" class="smaller-button">`;

  //lägg till alla kolumner i mainLayout
  bookListCol.appendChild(countElement);
  bookListCol.appendChild(listHeading);
  bookListCol.appendChild(bookListContainer);
  mainLayout.appendChild(bookListCol);
  mainLayout.appendChild(filterCol);
  mainLayout.appendChild(resetCol);

  output.appendChild(mainLayout); //aktivera knapparna ovan

  //återställ alla lyssnare/knappar (filterBtn och resetBtn)
  setEventListeners();
}

//setEventListeners skapar lyssnare som reagerar på input från DOM t.ex. (Meet Frankenstein)
function setEventListeners() {

  // hämtning från API som initieras via knapptryckning
  const pullApiBtn = document.getElementById('pull-api');
  if (pullApiBtn) {
    pullApiBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      await runTask();
    });
  }

  // återställ sökning och "börja om från början"
  const resetBtn = document.getElementById('reset-api');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      await resetSearch(); // Kör återställningslogiken
    });
  }

  // ladda knapp för att kolla tidslinjen
  const timelineButton = document.getElementById('show-timeline-btn');
  if (timelineButton) {
    //showTimelinePopup tar hand om allBooks-kontrollen
    timelineButton.addEventListener('click', () => showTimelinePopup(allBooks));
  }

  // Lyssnare för sökning av enskild titel via index
  const showTitleButton = document.getElementById('show-title-btn');
  if (showTitleButton) {
    showTitleButton.addEventListener('click', handleShowTitle);
  }


  //lyssnare för språkfilter
  const languageFilterBtn = document.getElementById('filter-results-btn');
  if (languageFilterBtn) {
    languageFilterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // felkoll - funkar lyssnaren?
      console.log("språkfilter fångat");
      applyLanguageFilter(allBooks);
    });
  }
}

// Starta lyssnare
setEventListeners();
