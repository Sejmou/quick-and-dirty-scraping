/**
 * scrapes artists for every day from Electric Love Festival lineup page at https://www.electriclove.at/de/line-up/
 * and copies the data to the clipboard as a CSV string.
 */
async function getArtistsPerDay() {
  await loadAllArtists();
  const artistData = extractArtistData();
  const csv = convertArrayOfObjectsToCSV(artistData);
  copyToClipboard(csv);
}

async function loadAllArtists() {
  let loadMoreBtn = document.querySelector('.js-load-more__button');
  while (loadMoreBtn) {
    loadMoreBtn.click();
    console.log('Clicked load more button to get more artists...');
    // wait for new artists to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadMoreBtn = document.querySelector('.js-load-more__button');
    // apparently, they just hide the button when all artists are loaded, it's not removed from the DOM
    const isBtnVisible = loadMoreBtn.offsetParent !== null;
    if (!isBtnVisible) {
      console.log('Button not visible anymore, stopping reload loop...');
      break;
    }
  }
  console.log('All artists loaded');
}

function extractArtistData() {
  const artistNameDivs = Array.from(
    document.querySelectorAll('.artist-card__title.title.bold.uppercase')
  );

  const data = artistNameDivs
    .map(div => div.parentElement)
    .map(cardContent => {
      const artist = cardContent.querySelector(
        '.artist-card__title.title.bold.uppercase'
      )?.innerText;
      const location = cardContent.querySelector(
        '.copy-extra-small.bold'
      )?.innerText;
      const dateStr = cardContent.querySelector(
        '.copy-extra-small:not(.bold)'
      )?.innerText;
      // if day exists, it contains a string like 'SAT 6 JULY'
      // extract a date from that
      const date = dateStr
        ? new Date(dateStr.split(' ').slice(1).join(' '))
        : null;
      // if date exists set the year to the current year
      const currentYear = new Date().getFullYear();
      if (date) {
        date.setFullYear(currentYear);
      }

      // get weekday
      const weekDay = date?.toLocaleDateString('en-US', { weekday: 'long' });

      return {
        artist,
        location,
        date,
        weekDay,
      };
    });

  console.log('extracted artist data');
  return data;
}

function convertArrayOfObjectsToCSV(data) {
  // Extract column headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV string with headers as the first row
  let csv = headers.join(',') + '\n';

  // Iterate over each object in the array
  data.forEach(obj => {
    // Extract values from the object in the same order as the headers
    // convert dates to strings
    const row = headers
      .map(header => obj[header])
      .map(value => (value instanceof Date ? value.toISOString() : value));

    // Concatenate values with commas and add to CSV string
    csv += row.join(',') + '\n';
  });

  return csv;
}

function copyToClipboard(text) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

getArtistsPerDay();
