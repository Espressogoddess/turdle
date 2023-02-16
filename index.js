// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];
var gameStat;
var allowedWords = [];

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var gameOverBox = document.querySelector('#game-over-section');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');
var gameOverMessage = document.querySelector('#game-over-message');
var winningMessage = document.querySelector('#winning-message');
var totalGamesPlayed = document.querySelector('#stats-total-games');
var percentofGamesCorrect = document.querySelector('#stats-percent-correct');
var avgNumOfGuesses = document.querySelector('#stats-average-guesses');
var pluralGamesPlayed = document.querySelector('#plural-games-played');
var pluralNumOfCorrectGuesses = document.querySelector('#plural-num-of-correct-guesses');


// Event Listeners
window.addEventListener('load', setGame);

inputs.forEach(input => input.addEventListener('keyup', (event) => moveToNextInput(event)));

keyLetters.forEach(keyLetter => keyLetter.addEventListener('click', (event) => clickLetter(event)));


guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', () => {
  updateStats();
  viewStats();
});

// Functions
function setGame() {
  currentRow = 1;
  getWords().then(data => {
    allowedWords = data;
    var randomIndex = Math.floor(Math.random() * 2500);
    winningWord = data[randomIndex];
    updateInputPermissions();
  });
}

function getWords() {
  return fetch('http://localhost:3001/api/v1/words')
    .then(response => response.json());

}

function updateInputPermissions() {
  inputs.forEach(input => {
    if (!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true;
    } else {
      input.disabled = false
    }
  });
  inputs[0].focus();
}


function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if (key !== 8 && key !== 46) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    if (!inputs[indexOfNext]) {
      return
    } else {
      inputs[indexOfNext].focus();
    }
  }
}

function updateStats() {
  totalGamesPlayed.innerText = gamesPlayed.length;
  percentofGamesCorrect.innerText = ((getStats() / gamesPlayed.length) * 100).toFixed();
  avgNumOfGuesses.innerText = getAvgGuesses();
  pluralNumOfCorrectGuesses
  if (gamesPlayed.length > 1) {
    pluralGamesPlayed.innerText = 's.';
  } else {
    pluralGamesPlayed.innerText = '.';
  }
  if (getAvgGuesses() > 1) {
    pluralNumOfCorrectGuesses.innerText = 'es';
  } else {
    pluralNumOfCorrectGuesses.innerText = '';
  }
}

function getStats() {
  let numOfWonGames;
  if (!gamesPlayed.length) {
    numOfWonGames = 0;
  } else {
    numOfWonGames = gamesPlayed.filter(game => game.solved).length;
  }
  return numOfWonGames;
}

function getAvgGuesses() {
  numOfWonGames = getStats();
  return ((gamesPlayed
    .filter(game => game.solved)
    .map(game2 => game2.guesses)
    .reduce((acc, num) => {
      acc += num;
      return acc;
    }, 0)) / (getStats())).toFixed();
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;
  inputs.forEach((input, index) => {
    if (input.id.includes(`-${currentRow}-`) && !input.value && !activeInput) {
      activeInput = input;
      activeIndex = index;
    }
  });
  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareResults, 1000);
    } else if (currentRow === 6) {
      setTimeout(declareResults, 1000);
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  inputs.forEach(input => {
    if (input.id.includes(`-${currentRow}-`)) {
      guess += input.value;
    }
  });

  return allowedWords.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');
  guessLetters.forEach((guessLetter, i) => {
    if (winningWord.includes(guessLetter) && winningWord.split('')[i] !== guessLetter) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetter, 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetter, 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetter, 'wrong-key');
    }
  });
}

function updateBoxColor(letterLocation, className) {
  var row = [];
  inputs.forEach(input => {
    if (input.id.includes(`-${currentRow}-`)) {
      row.push(input);
    }
  });

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  keyLetters.forEach(key => {
    if (key.innerText === letter) {
      keyLetter = key;
    }
  });

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareResults() {
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function recordGameStats() {
  if (checkForWin()) {
    gamesPlayed.push({
      solved: true,
      guesses: currentRow
    });
  } else {
    gamesPlayed.push({
      solved: false,
      guesses: currentRow
    });
  }
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
  gameStat = gamesPlayed.slice(-1)[0]
  if (!gameStat.solved) {
    gameOverMessage.innerText = '💩 Whomp Whomp Whomp. You lose! Try better next time.';
    winningMessage.classList.add('hidden');
    guess = '';
  } else {
    winningMessage.classList.remove('hidden');
    gameOverMessage.innerText = '✨Yay!✨';
    guess = '';
  }
}


function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct-location', 'wrong-location', 'wrong');
  })
}

function clearKey() {
  keyLetters.forEach(keyLetter => {
    keyLetter.classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  });
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}