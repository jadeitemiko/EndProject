
/*
Globala variabler:
allBooks - lagrar all hämtad bokdata
startUrl - bas-URL för API-anrop
title - titel på "månadens bok", just nu Frankenstein
*/

let allBooks = [];
const startUrl = "https://openlibrary.org/search.json?title=";
const title = "frankenstein" //månadens bok

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
    let subj = "&subject=fiction";
    let url = `${startUrl}${title}${subj}`;
    const maxPages = 5; //paginerar, hämtar maxPages * 100 böcker åt gången
    let fetchedBooks = []; // lokal array för att returnera

    try {
      let page = 1;
      let totalFound = Infinity; // initialt obegränsat
      while (page <= maxPages && fetchedBooks.length < totalFound) {
        const res = await fetch(`${url}&offset=${(page-1)*100}`);
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
  const withCover = document.getElementById('withcover').checked;
  const ebook = document.getElementById('ebook').checked;
  let filtered = books;
  if (withCover) filtered = filtered.filter(b => b.cover_i);
  if (ebook) filtered = filtered.filter(b => b.has_fulltext);

  // hämta output-containern (div på index.html) och rensa den vid varje knapptryckning
  const output = document.getElementById("output");
  output.innerHTML = '';

  //visa hur många träffar totalt
  const countElement = document.createElement("p");
  countElement.textContent = `Found ${filtered.length} titles with the subject "fiction"`;
  output.appendChild(countElement);

  //formatering för de 10 första titlarna i lista
  const listHeading = document.createElement("h2");
  listHeading.textContent = "The first ten unique results:";
  listHeading.classList.add("list-heading");
  output.appendChild(listHeading);

  const bookListContainer = document.createElement("ul");
  bookListContainer.classList.add("ten-titles-list");
  output.appendChild(bookListContainer);

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
      titleElement.textContent = book.title;
      bookListContainer.appendChild(titleElement);
      count++;
    }
  }

  //byt ut formuläret till ett nytt, för förfinad sökning
  const inputContainer = document.getElementById("input");
  inputContainer.innerHTML = ''; // Rensa input-diven

  const newFormHTML = `
        <form id="new-filter-form">
            // YTTERLIGARE FILTRERING HÄR
            <p></p>
            <input type="submit" id="filter-results-btn" name="filter-results" value="Apply Filter" class="pull-api-button">
        </form>

        <input type="button" id="reset-api" value="Reset" class="smaller-button">
    `;
  inputContainer.innerHTML = newFormHTML;

  //återställ alla lyssnare/knappar
  setEventListeners();
}

//setEventListeners skapar lyssnare som reagerar på input från DOM t.ex. (Meet Frankenstein)
function setEventListeners() {

  // första sökningen (enda som syns vid start)
  const pullApiBtn = document.getElementById('pull-api');
  if (pullApiBtn) {
    pullApiBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      await runTask();
    });
  }

  //vidare filtrering av redan hämtat resultat
  const filterBtn = document.getElementById('filter-results-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      await runTask(); // Kör huvudlogiken, men nu med nya filter!
    });
  }

  // återställ sökning och "börja om från början"
  const resetBtn = document.getElementById('reset-api');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      await resetSearch(); // Kör återställningslogiken
    });
  }
}

// Starta lyssnare
setEventListeners();
