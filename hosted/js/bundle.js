"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*
DICE.JS

Functions related to the dice elements themselves.
*/

/* MARK: - Dice Setup - */
// add handler and prevent from dragging
var setupDie = function setupDie(die) {
  die.onclick = function () {
    selectDie(die);
  };

  die.style.backgroundColor = bgColor;
  die.setAttribute("draggable", false);
  rerollFace(die);
}; // onclick handler


var selectDie = function selectDie(die) {
  // change die background color based on clicking
  if (die.style.backgroundColor == bgColor) {
    die.style.backgroundColor = selectedColor;
  } else if (die.style.backgroundColor != previouslySelectedColor) {
    die.style.backgroundColor = bgColor;
  }

  updateRollScore();
}; // "freeze" dice by preventing interaction when game is over


var freeze = function freeze(die) {
  die.onclick = null;
};
/* MARK: - Rerolling - */
// reroll die with animation and handling for other background colors


var reroll = function reroll(die) {
  switch (die.style.backgroundColor) {
    // do nothing if was previously selected
    case previouslySelectedColor:
      break;

    case selectedColor:
      die.style.backgroundColor = previouslySelectedColor;
      break;

    case bgColor:
      var interval;
      die.classList.add("spin");
      interval = setInterval(function () {
        rerollFace(die);
      }, 75);
      setTimeout(function () {
        die.classList.remove("spin");
        clearInterval(interval);
      }, 500); // 75ms for interval is arbitrary, BUT
      // 500 ms for timeout is related to spin timing in CSS

      break;
  }
}; // reroll die face


var rerollFace = function rerollFace(die) {
  // randomly pick a number for use later
  var rand = random(0, diceSrcL.length); // set die to rand

  die.src = darkMode ? diceSrcD[rand] : diceSrcL[rand];
  die.alt = diceAlt[rand];
  die.title = diceAlt[rand];
};
/*
GAME.JS

Functions related to scoring and game-related elements.
*/

/* MARK: - Die Selection/Marking - */
// returns an array of selected dice


var countDice = function countDice() {
  var checkWhite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var diceCount = [0, 0, 0, 0, 0, 0];

  for (var i = 0; i < dieArray.length; i++) {
    if (dieArray[i].style.backgroundColor == selectedColor || checkWhite == true && dieArray[i].style.backgroundColor != previouslySelectedColor) {
      switch (dieArray[i].title) {
        case "one":
          diceCount[0]++;
          break;

        case "two":
          diceCount[1]++;
          break;

        case "three":
          diceCount[2]++;
          break;

        case "four":
          diceCount[3]++;
          break;

        case "five":
          diceCount[4]++;
          break;

        case "six":
          diceCount[5]++;
          break;

        default:
          console.log("error counting die number: " + i);
          break;
      }
    }
  }

  return diceCount;
}; // checks for valid dice selection


var dieSelectValidation = function dieSelectValidation() {
  var count = countDice();

  if (straightChecker()) {
    errDisp("You rolled a straight! You must end your turn!");
    return false;
  } // check for illegal moves (2, 3, 4, 6)


  if (count[1] == 1 || count[1] == 2) {
    return false;
  }

  if (count[2] == 1 || count[2] == 2) {
    return false;
  }

  if (count[3] == 1 || count[3] == 2) {
    return false;
  }

  if (count[5] == 1 || count[5] == 2) {
    return false;
  } // make sure there are any dice selected


  if (count[0] == 0 && count[1] == 0 && count[2] == 0 && count[3] == 0 && count[4] == 0 && count[5] == 0) {
    return false;
  } // add this roll to rolls


  rolls.push(count); // if all checks have passed, return true

  return true;
}; // checks for straights


var straightChecker = function straightChecker() {
  var count = countDice(true);

  if (count[0] == 1 && count[1] == 1 && count[2] == 1 && count[3] == 1 && count[4] == 1 && count[5] == 1) {
    return true;
  }

  return false;
}; // checks if all dice are selected


var allSelectCheck = function allSelectCheck() {
  if ((dieArray[0].style.backgroundColor == selectedColor || dieArray[0].style.backgroundColor == previouslySelectedColor) && (dieArray[1].style.backgroundColor == selectedColor || dieArray[1].style.backgroundColor == previouslySelectedColor) && (dieArray[2].style.backgroundColor == selectedColor || dieArray[2].style.backgroundColor == previouslySelectedColor) && (dieArray[3].style.backgroundColor == selectedColor || dieArray[3].style.backgroundColor == previouslySelectedColor) && (dieArray[4].style.backgroundColor == selectedColor || dieArray[4].style.backgroundColor == previouslySelectedColor) && (dieArray[5].style.backgroundColor == selectedColor || dieArray[5].style.backgroundColor == previouslySelectedColor)) return true;else return false;
};
/* MARK: - Score Calculation - */
// calculates total score


var scoreCalc = function scoreCalc() {
  var score = 0;
  var backward = false;
  rolls.push(countDice());

  for (var i = 0; i < rolls.length; i++) {
    // add score for current roll
    var scrAdd = scoreAdd(rolls[i]); // if scoreAdd is less than 0 for any roll,
    // set backward to true--otherwise, increment score

    if (scrAdd > 0) score += scrAdd;else backward = true;
  } // clear rolls


  rolls = []; // if backward, return the backward value (-100)

  if (backward) return backwardScore;
  return score;
}; // adds points together per roll


var scoreAdd = function scoreAdd(count) {
  var score = 0;
  if (straightChecker()) return straightScore; // check for 1s

  switch (count[0]) {
    case 1:
      score += rollScores[0][0];
      break;

    case 2:
      score += rollScores[0][1];
      break;

    case 3:
      score += rollScores[0][2];
      break;

    case 4:
      score += rollScores[0][3];
      break;

    case 5:
      score += rollScores[0][4];
      break;

    case 6:
      score += rollScores[0][5];
      break;

    default:
      break;
  } // check for 2s


  switch (count[1]) {
    case 3:
      score += rollScores[1][0];
      break;

    case 4:
      score += rollScores[1][1];
      break;

    case 5:
      score += rollScores[1][2];
      break;

    case 6:
      score += rollScores[1][3];
      break;

    default:
      break;
  } // check for 3s


  switch (count[2]) {
    case 3:
      score += rollScores[2][0];
      break;

    case 4:
      score += rollScores[2][1];
      break;

    case 5:
      score += rollScores[2][2];
      break;

    case 6:
      score += rollScores[2][3];
      break;

    default:
      break;
  } // check for 4s


  switch (count[3]) {
    case 3:
      score += rollScores[3][0];
      break;

    case 4:
      score += rollScores[3][1];
      break;

    case 5:
      score += rollScores[3][2];
      break;

    case 6:
      score += rollScores[3][3];
      break;

    default:
      break;
  } // check for 5s


  switch (count[4]) {
    case 1:
      score += rollScores[4][0];
      break;

    case 2:
      score += rollScores[4][1];
      break;

    case 3:
      score += rollScores[4][2];
      break;

    case 4:
      score += rollScores[4][3];
      break;

    case 5:
      score += rollScores[4][4];
      break;

    case 6:
      score += rollScores[4][5];
      break;

    default:
      break;
  } // check for 6s


  switch (count[5]) {
    case 3:
      score += rollScores[5][0];
      break;

    case 4:
      score += rollScores[5][1];
      break;

    case 5:
      score += rollScores[5][2];
      break;

    case 6:
      score += rollScores[5][3];
      break;

    default:
      break;
  } // go backwards by 100 if score is 0


  if (score == 0) {
    score = backwardScore;
  }

  return score;
};
/* MARK: - Rolling, Restarting, Ending Turn - */
// roll dice


var roll = function roll() {
  if (dieSelectValidation()) {
    var unselected = 0;

    if (allSelectCheck()) {
      for (var i = 0; i < dieArray.length; i++) {
        dieArray[i].style.backgroundColor = bgColor;
      }
    }

    for (var _i = 0; _i < dieArray.length; _i++) {
      reroll(dieArray[_i]);
      if (!mute && dieArray[_i].style.backgroundColor == bgColor) unselected++;
    } // only play sounds if mute is off


    if (!mute) {
      switch (unselected) {
        case 1:
          rollSounds[0].currentTime = 0;
          rollSounds[0].play();
          break;

        case 2:
          rollSounds[1].currentTime = 0;
          rollSounds[1].play();
          break;

        case 3:
          rollSounds[2].currentTime = 0;
          rollSounds[2].play();
          break;

        case 4:
          rollSounds[3].currentTime = 0;
          rollSounds[3].play();
          break;

        case 5:
          rollSounds[4].currentTime = 0;
          rollSounds[4].play();
          break;

        default:
          rollSounds[5].currentTime = 0;
          rollSounds[5].play();
          break;
      }
    }
  } else if (!straightChecker()) {
    errDisp("Invalid die selection! Please pick valid dice!");
  }
}; // restart game


var restart = function restart() {
  // reset dice
  for (var i = 0; i < dieArray.length; i++) {
    dieArray[i].style.backgroundColor = bgColor;
    setupDie(dieArray[i]);
  } // reset scores internally and on screen


  for (var _i2 = 0; _i2 < scores.length; _i2++) {
    scores[_i2] = 0;
    scoreboardTrs[_i2].children[1].innerHTML = scores[_i2];
  } // enable roll and endturn buttons and hide restart


  rollButton.disabled = false;
  endTurnButton.disabled = false;
  restartButton.style.display = "none"; // running with no params clears out the error message

  errDisp(); // empty rolls array

  rolls = [];
  endgame = false;
}; // end turn


var endTurn = function endTurn() {
  // TODO: Somewhere in this func, 
  // do a bit more for endgame, and fix it up.
  // IE - Possibly prevent "end turn" until user
  // has no moves left, show how much is needed
  // to catch up to current highest score.
  // reset current roll to 0
  currRoll.innerHTML = "0"; // check if anyone is over the score goal

  for (var i = 0; i < scores.length; i++) {
    if (scores[i] > scoreGoal) {
      endgame = true;
      break;
    }
  }

  if (!allSelectCheck() || straightChecker()) {
    var score = scoreCalc();
    var unselected = 0; // make sure first roll is 1000+ (minScore) points

    if (scores[currPlayer] == 0) {
      if (score >= minScore) scores[currPlayer] += score;
    } else scores[currPlayer] += score; // set score to 0 if score goes below 1000


    if (scores[currPlayer] < minScore) scores[currPlayer] = 0; // update scoreboard text

    scoreboardTrs[currPlayer].children[1].innerHTML = scores[currPlayer]; // if currPlayer has reached the goal

    if (scores[currPlayer] >= scoreGoal && endgame == false) {
      errDisp("This is your last turn! Make it count!", true);
      endgame = true;
      winnerIndex = currPlayer;
    } // increment player


    currPlayer = currPlayer + 1 >= scores.length ? 0 : currPlayer + 1;
    showCurrPlayer(currPlayer);

    if (endgame && winnerIndex == currPlayer) {
      var highestScore = 0;

      for (var _i3 = 0; _i3 < scores.length; _i3++) {
        if (scores[_i3] > highestScore) {
          highestScore = scores[_i3];
          winnerIndex = _i3;
        }
      } // display winner


      errDisp("The winner is " + playerNames[winnerIndex] + "!", true); // disable roll and endturn buttons

      rollButton.disabled = true;
      endTurnButton.disabled = true;
      restartButton.style.display = "block"; // freeze dice to prevent interactions

      for (var _i4 = 0; _i4 < dieArray.length; _i4++) {
        freeze(dieArray[_i4]);
      }
    }

    for (var _i5 = 0; _i5 < dieArray.length; _i5++) {
      dieArray[_i5].style.backgroundColor = bgColor;
      reroll(dieArray[_i5]);
    } // only run sound-related things if mute is off


    if (!mute) {
      for (var _i6 = 0; _i6 < dieArray.length; _i6++) {
        if (dieArray[_i6].style.backgroundColor == bgColor) unselected++;
      }

      switch (unselected) {
        case 1:
          rollSounds[0].currentTime = 0;
          rollSounds[0].play();
          break;

        case 2:
          rollSounds[1].currentTime = 0;
          rollSounds[1].play();
          break;

        case 3:
          rollSounds[2].currentTime = 0;
          rollSounds[2].play();
          break;

        case 4:
          rollSounds[3].currentTime = 0;
          rollSounds[3].play();
          break;

        case 5:
          rollSounds[4].currentTime = 0;
          rollSounds[4].play();
          break;

        default:
          rollSounds[5].currentTime = 0;
          rollSounds[5].play();
          break;
      }
    }
  } else if (allSelectCheck() && !straightChecker()) {
    // force player to reroll if all selected and not a straight
    errDisp("You must roll again!");
    updateRollScore();
  }
};
/* MARK: - Other - */


var showCurrPlayer = function showCurrPlayer() {
  var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  for (var i = 0; i < scoreboardTrs.length; i++) {
    if (i != num) {
      for (var j = 0; j < scoreboardTrs[i].children.length; j++) {
        scoreboardTrs[i].children[j].style.color = darkMode ? "white" : "black";
        scoreboardTrs[i].children[j].style.fontWeight = "normal";
      }
    } else {
      for (var _j = 0; _j < scoreboardTrs[i].children.length; _j++) {
        scoreboardTrs[i].children[_j].style.color = "red";
        scoreboardTrs[i].children[_j].style.fontWeight = "bold";
      }
    }
  }
};
/*
MAIN.JS

Loads DOM elements upon window load, handles input, handles dark mode, and more.
*/


window.onload = function () {
  /* MARK: - DOM Elements - */
  var landing = document.querySelector("#landing");
  var localPlayers = document.querySelector("#local-players");
  var nicknames = document.querySelector("#local-nicks");
  var localButton = document.querySelector("#local-play");
  var roomButtons = document.querySelector("#room-buttons");
  var joinOptions = document.querySelector("#join-options");
  var hostOptions = document.querySelector("#host-options");
  var gameContainer = document.querySelector("#game");
  var diceContainer = document.querySelector("#dice-container");
  rollButton = document.querySelector("#roll-button");
  endTurnButton = document.querySelector("#end-turn-button");
  restartButton = document.querySelector("#restart-button");
  var scoreboard = document.querySelector("#scoreboard");
  error = document.querySelector("#error");
  currRoll = document.querySelector("#curr-roll");
  var darkModeToggle = document.querySelector("#dark-mode-toggle");
  var soundToggle = document.querySelector("#sound-toggle");
  /* MARK: - Dice Setup - */

  for (var i = 0; i < diceContainer.children.length; i++) {
    dieArray.push(diceContainer.children[i]);
    setupDie(dieArray[i]);
  }
  /* MARK: - Dark Mode - */


  darkModeToggle.onclick = function () {
    // store colors to redraw after swapping modes
    var unselected = [],
        selected = [],
        prevSelected = [];

    for (var _i7 = 0; _i7 < dieArray.length; _i7++) {
      switch (dieArray[_i7].style.backgroundColor) {
        case previouslySelectedColor:
          prevSelected.push(_i7);
          break;

        case selectedColor:
          selected.push(_i7);
          break;

        case bgColor:
          unselected.push(_i7);
          break;

        default:
          break;
      }
    } // toggle darkmode variable


    darkMode = !darkMode; // change colors based on mode

    bgColor = darkMode ? bgColorD : bgColorL;
    selectedColor = darkMode ? selectedColorD : selectedColorL;
    previouslySelectedColor = darkMode ? previouslySelectedColorD : previouslySelectedColorL; // change button colors based on mode
    //rollButton.classList.toggle("game-button");

    rollButton.classList.toggle("dark-button"); //endTurnButton.classList.toggle("game-button");

    endTurnButton.classList.toggle("dark-button"); //restartButton.classList.toggle("game-button");

    restartButton.classList.toggle("dark-button"); //localButton.classList.toggle("game-button");

    localButton.classList.toggle("dark-button"); // redraw dice

    for (var _i8 = 0; _i8 < unselected.length; _i8++) {
      dieArray[unselected[_i8]].style.backgroundColor = bgColor;
    }

    for (var _i9 = 0; _i9 < selected.length; _i9++) {
      dieArray[selected[_i9]].style.backgroundColor = selectedColor;
    }

    for (var _i10 = 0; _i10 < prevSelected.length; _i10++) {
      dieArray[prevSelected[_i10]].style.backgroundColor = previouslySelectedColor;
    } // toggle body's dark mode


    document.body.classList.toggle("dark-body"); // update scoreboard for dark mode

    for (var _i11 = 0; _i11 < scoreboardTrs.length; _i11++) {
      if (!(_i11 % 2)) {
        scoreboardTrs[_i11].style.backgroundColor = darkMode ? trBgD : trBgL;
      }

      showCurrPlayer(currPlayer);
    } // handle toggling dark dice and changing their src images


    for (var _i12 = 0; _i12 < dieArray.length; _i12++) {
      dieArray[_i12].classList.toggle("dark-die");

      switch (dieArray[_i12].title) {
        case "one":
          dieArray[_i12].src = darkMode ? diceSrcD[0] : diceSrcL[0];
          break;

        case "two":
          dieArray[_i12].src = darkMode ? diceSrcD[1] : diceSrcL[1];
          break;

        case "three":
          dieArray[_i12].src = darkMode ? diceSrcD[2] : diceSrcL[2];
          break;

        case "four":
          dieArray[_i12].src = darkMode ? diceSrcD[3] : diceSrcL[3];
          break;

        case "five":
          dieArray[_i12].src = darkMode ? diceSrcD[4] : diceSrcL[4];
          break;

        case "six":
          dieArray[_i12].src = darkMode ? diceSrcD[5] : diceSrcL[5];
          break;
      }
    } // swap between unicode moons


    darkModeToggle.innerHTML = darkMode ? "🌝" : "🌚";
  };
  /* MARK: - Sound Toggle - */


  soundToggle.onclick = function () {
    mute = !mute;
    soundToggle.innerHTML = mute ? "🔊" : "🔈";
  };
  /* MARK: - Networking Menu Options - */

  /*
  // join-room-button
  roomButtons.children[0].onclick = () => {
      fade(roomButtons, joinOptions);
  };
  
  // host-room-button
  roomButtons.children[1].onclick = () => {
      fade(roomButtons, hostOptions);
  };
  */

  /* MARK: - Local Play Menu Options - */
  // create player entries based on value of localPlayers input


  localPlayers.onchange = function () {
    // remove all children
    while (nicknames.firstChild) {
      nicknames.removeChild(nicknames.firstChild);
    } // create new children


    for (var _i13 = 0; _i13 < localPlayers.value; _i13++) {
      var label = document.createElement("label");
      var input = document.createElement("input");
      var br = document.createElement("br");
      var name = "nick" + _i13; // fill out data

      label.htmlFor = name;
      label.innerHTML = name + ": ";
      input.type = "text";
      input.id = name;
      input.name = name;
      input.placeholder = name; // append to nicknames div

      nicknames.appendChild(label);
      nicknames.appendChild(input);
      nicknames.appendChild(br);
    }
  }; // check for invalid input, then set up a local game


  localButton.onclick = function () {
    var invalidInput = false; // first check and make sure there's at least one player

    if (localPlayers.value != 0) {
      // check for invalid input
      for (var _i14 = 0; _i14 < nicknames.children.length; _i14++) {
        if (nicknames.children[_i14].type == "text") {
          if (nicknames.children[_i14].value == "") {
            invalidInput = true;
          }

          for (var j = 0; j < nicknames.children.length; j++) {
            if (_i14 != j && nicknames.children[_i14].value == nicknames.children[j].value) invalidInput = true;
          }
        }
      } // check for invalid name input


      if (invalidInput) {
        errDisp("Invalid name input!");
      } else {
        for (var _i15 = 0; _i15 < nicknames.children.length; _i15++) {
          if (nicknames.children[_i15].type == "text") {
            playerNames.push(nicknames.children[_i15].value);
            scores.push(0);
          }
        } // create elements to be appended to the scoreboard element


        for (var _i16 = 0; _i16 < playerNames.length; _i16++) {
          var tr = document.createElement("tr");
          var name = document.createElement("td");
          var score = document.createElement("td");
          tr.id = "player" + _i16;
          if (!(_i16 % 2)) tr.style.backgroundColor = trBgL;
          name.innerHTML = playerNames[_i16];
          score.innerHTML = scores[_i16];
          tr.appendChild(name);
          tr.appendChild(score);
          scoreboard.children[0].appendChild(tr);
          scoreboardTrs.push(document.querySelector("#player" + _i16));
        }

        showCurrPlayer(); // fade out landing and fade in gamecontainer and scoreboard
        // landing gets faded out twice, but that's not a big deal

        fade(landing, gameContainer);
        fade(landing, scoreboard);
      }
    } else {
      errDisp("Must have at least one player!");
    }
  };
  /* MARK: - In-Game Buttons - */


  rollButton.onclick = roll;
  endTurnButton.onclick = endTurn;
  restartButton.onclick = restart;
};
/*
VARIABLES.JS

Global variables and helper functions.
*/

/* MARK: - Dice-Related Variables - */


var rollScores = [[100, 200, 1000, 2000, 4000, 8000], // scores for 1s
[200, 400, 800, 1600], // scores for 2s
[300, 600, 1200, 2400], // scores for 3s
[400, 800, 1600, 3200], // scores for 4s
[50, 100, 500, 1000, 2000, 4000], // scores for 5s
[600, 1200, 2400, 4800] // scores for 6s
];
var diceSrcL = ["assets/img/dice/l/1.webp", "assets/img/dice/l/2.webp", "assets/img/dice/l/3.webp", "assets/img/dice/l/4.webp", "assets/img/dice/l/5.webp", "assets/img/dice/l/6.webp"];
var diceSrcD = ["assets/img/dice/d/1.webp", "assets/img/dice/d/2.webp", "assets/img/dice/d/3.webp", "assets/img/dice/d/4.webp", "assets/img/dice/d/5.webp", "assets/img/dice/d/6.webp"];
var diceAlt = ["one", "two", "three", "four", "five", "six"];
/* MARK: - Colors - */

var bgColorL = "rgb(255, 255, 255)";
var selectedColorL = "rgb(0, 255, 0)";
var previouslySelectedColorL = "rgb(3, 153, 10)";
var bgColorD = "rgb(48, 48, 48)";
var selectedColorD = "rgb(0, 89, 255)";
var previouslySelectedColorD = "rgb(0, 52, 148)";
var bgColor = bgColorL;
var selectedColor = selectedColorL;
var previouslySelectedColor = previouslySelectedColorL;
var trBgL = "rgb(221, 221, 221)";
var trBgD = "rgb(48, 48, 48)";
/* MARK: - Roll Sounds - */

var rollSounds = [new Audio("assets/audio/roll1.wav"), new Audio("assets/audio/roll2.wav"), new Audio("assets/audio/roll3.wav"), new Audio("assets/audio/roll4.wav"), new Audio("assets/audio/roll5.wav"), new Audio("assets/audio/roll6.wav")];
/* MARK: - Global Arrays - */

var dieArray = [];
var rolls = [];
var scores = [];
var playerNames = [];
var scoreboardTrs = [];
/* MARK: - Score Constants - */

var backwardScore = -100;
var straightScore = 1000;
var minScore = 1000;
var scoreGoal = 10000;
/* MARK: - Global DOM Variables - */

var rollButton, endTurnButton, restartButton, error, currRoll;
/* MARK: - Other Variables - */

var darkMode = false;
var mute = false;
var endgame = false;
var currPlayer = 0;
var winnerIndex = -1;
/* MARK: - Helper Functions - */
// random int

var random = function random(min, max) {
  return Math.floor(Math.random() * max) + min;
}; // fading elements in/out helper function


var fade = function fade(el1, el2) {
  el1.style.opacity = "0";
  setTimeout(function () {
    el1.style.display = "none";
    el2.style.display = "block";
    setTimeout(function () {
      el2.style.opacity = "100";
    }, 50);
  }, 500);
}; // error display


var errDisp = function errDisp() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : " ";
  var stayOnScreen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  // reset error to default just to be safe
  error.innerHTML = " ";
  error.style.opacity = "0"; // set to new stuff

  error.innerHTML = str;
  error.style.opacity = "100"; // fade out if stay on screen is true

  if (!stayOnScreen) {
    setTimeout(function () {
      error.style.opacity = "0";
      setTimeout(function () {
        error.innerHTML = " "; // this is alt+255, not a space
      }, 600);
    }, 2000);
  }
}; // update roll score on click


var updateRollScore = function updateRollScore() {
  // backup rolls array
  var rollCopy = _toConsumableArray(rolls); // call scorecalc on die selection, then reset rolls to the backup


  currRoll.innerHTML = scoreCalc();
  rolls = rollCopy;
};