// Used for matching
var firstCard = undefined;
var secondCard = undefined;

// Current difficulty
var curDifficulty = 3;

// Set to curDifficulty on start
var totalPairs = 3;
// Goes down by 1 on successful match
var pairsLeft = 3;
// Goes up by 1 on successful match
var numMatches = 0;
// Goes up by 1 on click
var numClicks = 0;
// Set on start
var timeLimit = 100;
// Goes up once per second
var curTime = 0;
var timerOn = false;

var powerUpUses = 1;

// Generate a list of pokemon
async function makeBoard(pokeCount) {
  // Make an array of cards
  var pokemonObjects = [];

  // Get a list of every pokemon
  var allPokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1500`);
  // Turn it into an array
  var jsonObject = await allPokemonResponse.json();
  var allPokemonArray = jsonObject.results;
  // console.log(allPokemonArray);
  // Add the required amount (pokeCount) to array
  for (let i = 0; i < pokeCount; i++) {
    // Make sure it's a unique pokemon
    let inList = true;
    var image;
    while (inList) {
      inList = false;
      var random = Math.floor(Math.random() * allPokemonArray.length);
      for (let j = 0; j < pokemonObjects.length; j++) {
        if (pokemonObjects[j] == allPokemonArray[random]) {
          inList = true;
        }
      }      
      // Make sure image isn't null
      let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${allPokemonArray[random].name}`);
      let jsonObj2 = await response2.json();
      let pokemonImage = jsonObj2.sprites.other['official-artwork'].front_default;
      if (pokemonImage == null) {
        inList = true;
      } else {
        image = pokemonImage;
      }
    }

    pokemonObjects.push(image, image);
    

  } 
  // console.log(pokemonObjects, pokemonObjects.length)

  // Grab them at random until it's empty
  while (pokemonObjects.length > 0) {
    // console.log(pokemonObjects)
    var random = Math.floor(Math.random() * pokemonObjects.length);
    let cardTemplate = document.getElementById("pokecard");
    let newcard = cardTemplate.content.cloneNode(true)

    newcard.getElementById("img").src = pokemonObjects[random];
    document.getElementById("game_grid").append(newcard);
    pokemonObjects.splice(random, 1);
  }
  setup();
}

function flip() {
  // console.log(this)
  if (this.classList.contains("click") && secondCard == undefined) {
    numClicks++;
    this.classList.add("flip");
    if (firstCard == undefined) {
      firstCard = this.getElementsByClassName("front_face")[0];
    } else if (firstCard != this.getElementsByClassName("front_face")[0]) {
      secondCard = this.getElementsByClassName("front_face")[0];
      // console.log(firstCard, secondCard);
      if (firstCard.src == secondCard.src) {
        numMatches++;
        pairsLeft--;
        if (pairsLeft == 0) {
          win();
        }
        // console.log("match");
        firstCard.parentElement.classList.remove("click");
        secondCard.parentElement.classList.remove("click");
        firstCard = undefined;
        secondCard = undefined;
      } else {
        // console.log("no match")
        setTimeout(() => {
          firstCard.parentElement.classList.remove("flip");
          secondCard.parentElement.classList.remove("flip");
          firstCard = undefined;
          secondCard = undefined;
        }, 1000)
      }
    }
    updateText();
  }
    
}

function win() {
  timerOn = false;
  setTimeout(() => {
    alert("You win!");
  }, 900);
}

function lose() {
  timerOn = false;
  alert("Out of time! You lose");
  reset();
}

function setup() {
  // Should be .cards but a higher power somewhere wants me dead
  let cards = document.querySelectorAll("div");
  // console.log(cards, cards.length)
  for (let i = 0; i < cards.length; i++) {
    // console.log("added")
    cards[i].addEventListener("click", flip);
  }
}

function reset() {
  document.getElementById("game_grid").innerHTML = "";
}
document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("game_grid").style.contentVisibility = "hidden";
  document.getElementById("start").classList.remove("disabled");
  timerOn = false;
  document.getElementById("game_info").innerHTML = "";
  document.getElementById("timer").innerHTML = "";
});

function difficulty() {
  curDifficulty = parseInt(this.id);
  
  let difficultyButtons = document.getElementsByClassName("difficulty");
  for (let i = 0; i < difficultyButtons.length; i++) {
    difficultyButtons[i].classList.remove("active");
  }
  this.classList.add("active");
}
let difficultyButtons = document.getElementsByClassName("difficulty");
for (let i = 0; i < difficultyButtons.length; i++) {
  difficultyButtons[i].addEventListener("click", difficulty);
}

function start() {
  document.getElementById("game_grid").style.contentVisibility = "visible";
  document.getElementById("start").classList.add("disabled");
  reset();
  makeBoard(curDifficulty);
  let gameGrid = document.getElementById("game_grid");
  switch (curDifficulty) {
    case 3:
      gameGrid.className = "";
      gameGrid.classList.add("easy");
      timeLimit = 100;
      powerUpUses = 1;
      break;
    case 6:
      gameGrid.className = "";
      gameGrid.classList.add("medium");
      timeLimit = 200;
      powerUpUses = 2;
      break;
    case 10:
      gameGrid.className = "";
      gameGrid.classList.add("hard");
      timeLimit = 300;
      powerUpUses = 3;
      break;
  }
  totalPairs = curDifficulty;
  numMatches = 0;
  pairsLeft = curDifficulty;
  numClicks = 0;
  updateText();
  timerOn = true;
  curTime = 0;
  timer();
  document.getElementById("powerUp").classList.remove("disabled");
}
document.getElementById("start").addEventListener("click", start);

function updateText() {
  document.getElementById("game_info").innerHTML = `
    Total number of pairs: ${totalPairs} <br>
    Number of matches: ${numMatches} <br>
    Remaining pairs: ${pairsLeft} <br>
    Number of clicks: ${numClicks} <br>
    `
  document.getElementById("powerUp").innerHTML = `Reveal all (Uses: ${powerUpUses})`;
}

function timer() {
  document.getElementById("timer").innerHTML = `
    You have ${timeLimit} seconds. ${curTime} seconds passed!
    `
  setTimeout(() => {
    if (timerOn) {
      curTime++;
      timer();
      if (curTime == timeLimit) {
        lose();
      }
    }
  }, 1000)
}

document.getElementById("light").addEventListener("click", () => {
  document.getElementById("game_grid").setAttribute("col", "light");
  document.body.setAttribute("col", "light");
});
document.getElementById("dark").addEventListener("click", () => {
  document.getElementById("game_grid").setAttribute("col", "dark");
  document.body.setAttribute("col", "dark");
});

function powerUp() {
  if (powerUpUses > 0) {
    powerUpUses--;
    this.innerHTML = `Reveal all (Uses: ${powerUpUses})`;
    let pokemon = document.querySelectorAll(".click:not(.flip)");
    // console.log(pokemon)
    for (let i = 0; i < pokemon.length; i++) {
      pokemon[i].classList.add("flip");
      setTimeout(() => {
        pokemon[i].classList.remove("flip");
      }, 500)
    }
  } 
  if (powerUpUses == 0) {
    document.getElementById("powerUp").classList.add("disabled");
  }
}
document.getElementById("powerUp").addEventListener("click", powerUp);