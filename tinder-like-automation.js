// simple script so that I don't waste my time swiping on Tinder but maybe still get some matches if I'm lucky lol
async function swipe() {
  while (true) {
    // handle annoying popups that may appear, such as 'pay this ridiculous amount of money to get more matches'
    const dismissButton =
      getButtonWithText('NOT NOW') || getButtonWithText('NO THANKS');
    if (dismissButton) {
      await clickWithRandomDelay(dismissButton);
    } else {
      const detailsButton = getButtonWithText('Open Profile', false, true);
      await clickWithRandomDelay(detailsButton);
      await waitForSeconds(2);
      const distance = getDistanceFromInfo();
      console.log('Distance:', distance);
      const lookingFor = getLookingFor();
      console.log('Looking for:', lookingFor);
      const likeButton = getButtonWithText('LIKE', true);
      const dislikeButton = getButtonWithText('NOPE', true);
      if (distance <= 15) {
        await clickWithRandomDelay(likeButton);
      } else {
        await clickWithRandomDelay(dislikeButton);
      }
      await waitForSeconds(1);
    }
  }
}

function getDistanceFromInfo() {
  const divs = Array.from(document.querySelectorAll('div.Row')).filter(el =>
    el.innerText.includes('kilometers away')
  );
  if (divs.length !== 1) {
    throw new Error(
      `Could not find distance info: Expected 1 div, found ${divs.length} divs`
    );
  }
  const text = divs[0].innerText;
  const distance = parseInt(text.split(' ')[0]);
  return distance;
}

function getLookingFor() {
  const lookingForDivs = Array.from(document.querySelectorAll('div')).filter(
    el => el.innerText == 'Looking for'
  );
  if (lookingForDivs.length === 0) return null;
  if (lookingForDivs.length > 1) {
    throw new Error(
      `Could not extract looking for: found ${lookingForDivs.length} divs with text "Looking for"`
    );
  }
  const lookingFor = lookingForDivs[0].nextElementSibling.innerText;
  return lookingFor;
}

async function clickWithRandomDelay(button, min = 500, max = 2000) {
  await waitForRandomSeconds(min, max);
  button.click();
  console.log('Clicked button with text', button.innerText);
}

async function waitForSeconds(seconds) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}

async function waitForRandomSeconds(min, max) {
  const randomMilliseconds = Math.floor(Math.random() * (max - min)) + min;
  return waitForSeconds(randomMilliseconds / 1000);
}

/**
 * Searches for a button containing the specified text.
 *
 * @param {string} text - The text to search for within button elements.
 * @returns {(HTMLElement|null)} - The button element containing the text, or null if not found.
 */
function getButtonWithText(text, exact = false, raiseError = false) {
  const buttons = document.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const condition = exact
      ? button.innerText === text
      : button.innerText.includes(text);
    if (condition) {
      return button;
    }
  }
  if (raiseError) {
    throw new Error(`Could not find button with text "${text}"`);
  }
  return null;
}

swipe();
