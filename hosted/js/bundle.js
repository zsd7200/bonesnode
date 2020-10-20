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
  var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  var rand;

  die.onclick = function () {
    selectDie(die);
  };

  die.style.backgroundColor = bgColor;
  die.setAttribute("draggable", false);
  rand = rerollFace(die, num);
  socket.emit('setup-multi', rand);
}; // onclick handler


var selectDie = function selectDie(die) {
  var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  // get dieId to return if multi
  var dieId = die.id.substr(4, 5); // change die background color based on clicking

  if (die.style.backgroundColor == bgColor) {
    die.style.backgroundColor = selectedColor;
  } else if (die.style.backgroundColor != previouslySelectedColor) {
    die.style.backgroundColor = bgColor;
  }

  updateRollScore(num);
  if (num == -1 && currPlayer == playerId) socket.emit('select-multi', room, dieId, num);
}; // "freeze" dice by preventing interaction


var freeze = function freeze() {
  for (var i = 0; i < dieArray.length; i++) {
    dieArray[i].onclick = null;
  }

  rollButton.disabled = true;
  endTurnButton.disabled = true;
  isFrozen = true;
}; // "unfreeze" dice by reverting changes made in freeze


var unfreeze = function unfreeze() {
  var _loop = function _loop(i) {
    dieArray[i].onclick = function () {
      selectDie(dieArray[i]);
    };
  };

  for (var i = 0; i < dieArray.length; i++) {
    _loop(i);
  }

  rollButton.disabled = false;
  endTurnButton.disabled = false;
  isFrozen = false;
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
      }, intervalTiming);
      setTimeout(function () {
        die.classList.remove("spin");
        clearInterval(interval);
      }, spinTiming);
      break;
  }
}; // reroll die face


var rerollFace = function rerollFace(die) {
  var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  // randomly pick a number for use later, or use the passed in num
  var rand = num != -1 ? num : random(0, diceSrcL.length); // set die to rand

  die.src = darkMode ? diceSrcD[rand] : diceSrcL[rand];
  die.alt = diceAlt[rand];
  die.title = diceAlt[rand];
  return rand;
};
/* MARK: - Multiplayer-Specific Functions - */
// if setup-multi is true, this event gets called


var setupMultiHandler = function setupMultiHandler() {
  socket.on('setup-multi-true', function (rand) {
    if (currPlayer == playerId) currRollArr.push(rand); // if they're at the same length, then rolling is done, call other event
    // room param is necessary here as otherwise it would only emit once and essentially
    // do nothing

    if (currRollArr.length == dieArray.length) {
      socket.emit('match-roll', room, currRollArr);
    }
  });
}; // set all dice to be the same upon return-setup-roll


var matchRollHandler = function matchRollHandler() {
  socket.on('return-match-roll', function (rollArr) {
    currRollArr = _toConsumableArray(rollArr); // make sure to freeze dice for all who aren't the player

    if (currPlayer != playerId) {
      for (var i = 0; i < dieArray.length; i++) {
        if (currRollArr[i] != -1) rerollFace(dieArray[i], currRollArr[i]);
      }

      if (!isFrozen) freeze();
    } // empty currRollArr


    currRollArr = [];
  });
}; // handle server emitting "return-select-multi" (called in selectDie)


var selectDieHandler = function selectDieHandler() {
  socket.on('return-select-multi', function (dieId, num) {
    if (currPlayer != playerId) selectDie(dieArray[dieId], num);
  });
};
/*
GAME.JS

Functions related to scoring and game-related elements for both local and online multiplayer.
*/

/* MARK: - Die Selection/Marking - */
// returns an array of selected dice


var countDice = function countDice() {
  var checkWhite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var diceCount = [0, 0, 0, 0, 0, 0];

  for (var i = 0; i < dieArray.length; i++) {
    if (dieArray[i].style.backgroundColor == selectedColor || checkWhite == true && dieArray[i].style.backgroundColor != previouslySelectedColor) {
      switch (dieArray[i].title) {
        case "1":
          diceCount[0]++;
          break;

        case "2":
          diceCount[1]++;
          break;

        case "3":
          diceCount[2]++;
          break;

        case "4":
          diceCount[3]++;
          break;

        case "5":
          diceCount[4]++;
          break;

        case "6":
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
    errDisp(rolledStraightMsg);
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
  var bypass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  // clear errDisp
  errDisp();

  if (dieSelectValidation() || bypass) {
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
    } // match rolls for all players after spin animation


    if (isMultiplayer) {
      setTimeout(function () {
        // parse title for int, subtract one, push to currRollArr
        for (var _i2 = 0; _i2 < dieArray.length; _i2++) {
          if (currPlayer == playerId) currRollArr[_i2] = parseInt(dieArray[_i2].title) - 1;
        } // emit match-roll


        if (currPlayer == playerId) {
          socket.emit('match-roll', room, currRollArr);
        }
      }, matchTiming);
    }
  } else if (!straightChecker()) {
    errDisp(invalidDieMsg);
  }
}; // restart game


var restart = function restart() {
  // reset dice
  for (var i = 0; i < dieArray.length; i++) {
    dieArray[i].style.backgroundColor = bgColor;
    setupDie(dieArray[i]);
  } // reset scores internally and on screen


  for (var _i3 = 0; _i3 < scores.length; _i3++) {
    scores[_i3] = 0;
    scoreboardTrs[_i3].children[1].innerHTML = scores[_i3];
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
  // TODO: if score is 0, prevent end turn unless
  // there are no moves left OR current score >= 1000
  // disable endturn and roll buttons until
  // after spinning animation
  rollButton.disabled = true;
  endTurnButton.disabled = true;

  if (!isMultiplayer) {
    setTimeout(function () {
      rollButton.disabled = false;
      endTurnButton.disabled = false;
    }, spinTiming);
  } // reset current roll to 0


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
      errDisp(lastTurnMsg, true);
      endgame = true;
      winnerIndex = currPlayer;
    } // increment player


    currPlayer = currPlayer + 1 >= scores.length ? 0 : currPlayer + 1;
    showCurrPlayer(currPlayer); // freeze everyone who isn't current player
    // in multiplayer game

    if (isMultiplayer) {
      if (currPlayer == playerId && isFrozen) unfreeze();else if (!isFrozen) freeze();
    }

    if (endgame && winnerIndex == currPlayer) {
      var highestScore = 0;

      for (var _i4 = 0; _i4 < scores.length; _i4++) {
        if (scores[_i4] > highestScore) {
          highestScore = scores[_i4];
          winnerIndex = _i4;
        }
      } // display winner


      errDisp("The winner is " + playerNames[winnerIndex] + "!", true); // display restart button

      restartButton.style.display = "block"; // freeze dice to prevent interactions

      freeze();
    }

    for (var _i5 = 0; _i5 < dieArray.length; _i5++) {
      dieArray[_i5].style.backgroundColor = bgColor;
    } // pass in true to bypass dieSelectValidation


    roll(true);
  } else if (allSelectCheck() && !straightChecker()) {
    // force player to reroll if all selected and not a straight
    errDisp(rollAgainMsg);
    if (currPlayer == playerId) unfreeze();
    updateRollScore();
  }
};
/* MARK: - Multiplayer-Specific Functions - */

/* MARK: - Multiplayer Event Handlers - */
// These essentially emit events to the server and call the local method


var rollMulti = function rollMulti() {
  socket.emit('roll', room);
};

var endTurnMulti = function endTurnMulti() {
  socket.emit('end-turn', room);
};

var restartMulti = function restartMulti() {
  socket.emit('restart', room);
};

var rollMultiHandler = function rollMultiHandler() {
  socket.on('return-roll', function () {
    roll(false);
  });
};

var endTurnMultiHandler = function endTurnMultiHandler() {
  socket.on('return-end-turn', function () {
    endTurn();
  });
};

var restartMultiHandler = function restartMultiHandler() {
  socket.on('return-restart', function () {
    restart();
  });
};
/*
MAIN.JS

Loads DOM elements upon window load, handles input, handles dark mode, and more.
*/


window.onload = function () {
  /* MARK: - DOM Elements - */
  var landing = document.querySelector("#landing");
  var rules = document.querySelector("#rules");
  var localOnlineSelect = document.querySelector("#local-online-select");
  var localContainer = document.querySelector("#local-container");
  var localPlayers = document.querySelector("#local-players");
  var nicknames = document.querySelector("#local-nicks");
  var localButton = document.querySelector("#local-play");
  var roomButtons = document.querySelector("#room-buttons");
  var joinOptions = document.querySelector("#join-options");
  var hostOptions = document.querySelector("#host-options");
  var openButton = document.querySelector("#open-button");
  var hostButton = document.querySelector("#host-button");
  var hostNick = document.querySelector("#host-nick");
  var joinNick = document.querySelector("#join-nick");
  var hostID = document.querySelector("#host-id");
  var joinID = document.querySelector("#join-id");
  var joinButton = document.querySelector("#join-button");
  var gameContainer = document.querySelector("#game");
  diceContainer = document.querySelector("#dice-container");
  rollButton = document.querySelector("#roll-button");
  endTurnButton = document.querySelector("#end-turn-button");
  restartButton = document.querySelector("#restart-button");
  var scoreboard = document.querySelector("#scoreboard");
  error = document.querySelector("#error");
  currRoll = document.querySelector("#curr-roll");
  var darkModeToggle = document.querySelector("#dark-mode-toggle");
  var soundToggle = document.querySelector("#sound-toggle");
  var rulesButton = document.querySelector("#rules-button");
  var closeRulesButton = document.querySelector("#close-rules-button");
  var chatButton = document.querySelector("#chat-button");
  var messages = document.querySelector("#messages");
  var messageArrow = document.querySelector("#message-arrow");
  var messagesUL = document.querySelector("#messages-ul");
  var chatInput = document.querySelector("#chat-input");
  /* MARK: - Dice Setup - */

  for (var i = 0; i < diceContainer.children.length; i++) {
    dieArray.push(diceContainer.children[i]);
  }
  /* MARK: - CORS Bypass for Audio - */


  for (var _i6 = 0; _i6 < rollSounds.length; _i6++) {
    rollSounds[_i6].crossOrigin = "anonymous";
  }
  /* MARK: - Show Local/Online Options - */
  // local


  localOnlineSelect.children[0].onclick = function () {
    fade(localOnlineSelect, localContainer);
  }; // online


  localOnlineSelect.children[1].onclick = function () {
    fade(localOnlineSelect, roomButtons);
  };
  /* MARK: - Dark Mode - */


  darkModeToggle.onclick = function () {
    // store colors to redraw after swapping modes
    var unselected = [],
        selected = [],
        prevSelected = [];
    var buttons = document.querySelectorAll("button");
    var oddChats = document.querySelectorAll(".odd");

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

    for (var _i8 = 0; _i8 < buttons.length; _i8++) {
      buttons[_i8].classList.toggle("dark-button");
    }

    for (var _i9 = 0; _i9 < oddChats.length; _i9++) {
      oddChats[_i9].classList.toggle("dark-odd");
    } // redraw dice


    for (var _i10 = 0; _i10 < unselected.length; _i10++) {
      dieArray[unselected[_i10]].style.backgroundColor = bgColor;
    }

    for (var _i11 = 0; _i11 < selected.length; _i11++) {
      dieArray[selected[_i11]].style.backgroundColor = selectedColor;
    }

    for (var _i12 = 0; _i12 < prevSelected.length; _i12++) {
      dieArray[prevSelected[_i12]].style.backgroundColor = previouslySelectedColor;
    } // toggle dark mode for a few other elements


    document.body.classList.toggle("dark-body");
    rules.classList.toggle("dark-body");
    messages.classList.toggle("dark-body"); // update scoreboard for dark mode

    for (var _i13 = 0; _i13 < scoreboardTrs.length; _i13++) {
      if (!(_i13 % 2)) {
        scoreboardTrs[_i13].style.backgroundColor = darkMode ? trBgD : trBgL;
      }

      showCurrPlayer(currPlayer);
    } // handle toggling dark dice and changing their src images


    for (var _i14 = 0; _i14 < dieArray.length; _i14++) {
      dieArray[_i14].classList.toggle("dark-die");

      switch (dieArray[_i14].title) {
        case "1":
          dieArray[_i14].src = darkMode ? diceSrcD[0] : diceSrcL[0];
          break;

        case "2":
          dieArray[_i14].src = darkMode ? diceSrcD[1] : diceSrcL[1];
          break;

        case "3":
          dieArray[_i14].src = darkMode ? diceSrcD[2] : diceSrcL[2];
          break;

        case "4":
          dieArray[_i14].src = darkMode ? diceSrcD[3] : diceSrcL[3];
          break;

        case "5":
          dieArray[_i14].src = darkMode ? diceSrcD[4] : diceSrcL[4];
          break;

        case "6":
          dieArray[_i14].src = darkMode ? diceSrcD[5] : diceSrcL[5];
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
  /* MARK: - Hide/Show Rules - */


  rulesButton.onclick = function () {
    fadeIn(rules);
  };

  closeRulesButton.onclick = function () {
    fadeOut(rules);
  };
  /* MARK: - Networking - */
  // start socket.io


  socket = io(); // set up some event handlers from other methods
  // Dice.js

  setupMultiHandler();
  matchRollHandler();
  selectDieHandler(); // Game.js

  rollMultiHandler();
  endTurnMultiHandler();
  restartMultiHandler(); // join-room-button

  roomButtons.children[0].onclick = function () {
    // fade old elements out and fade join options in
    fade(roomButtons, joinOptions);
    fadeOut(localContainer); // add onclick for join button

    joinButton.onclick = function () {
      // bring room code to lowercase and remove spaces
      var joinIDval = joinID.value.toLowerCase().replace(/\s/g, '');
      var name = joinNick.value;
      var validName = true;
      if (name.length <= 1) validName = false; // check if names are the same
      // TODO: fix this, it seems like playerNames is empty

      for (var _i15 = 0; _i15 < playerNames.length; _i15++) {
        if (name == playerNames[_i15]) {
          validName = false;
          break;
        }
      }

      if (validName) {
        // check and make sure there's enough characters and emit join
        if (joinIDval.length == 6) socket.emit('join', name, joinIDval);else errDisp(sixDigitMsg);
        socket.on('join-success', function (pId, rm) {
          joinNick.disabled = true;
          joinID.disabled = true;
          joinButton.disabled = true;
          playerId = pId;
          currPlayer = playerId;
          room = rm;
          fadeIn(chatButton);
          socket.emit('increment-players', room);
          errDisp(joinedMsg);
        });
      } else errDisp(invalidNameMsg);
    };
  }; // host-room-button


  roomButtons.children[1].onclick = function () {
    // fade old elements out and fade host options in
    fade(roomButtons, hostOptions);

    openButton.onclick = function () {
      hostNick.disabled = true; // call for room creation

      socket.emit('create', hostNick.value); // display room-id (called by emitting create) on-screen

      socket.on('room-id', function (data) {
        hostID.innerHTML = data;
        room = data;
        fadeIn(scoreboard);
        fadeIn(chatButton);
        openButton.disabled = true;
        hostButton.disabled = false;
        playerId = 0;
        socket.emit('increment-players', room);
      });
    };
  }; // host button--starts the multiplayer game


  hostButton.onclick = function () {
    if (players >= 2) socket.emit('start', room);else errDisp(twoPlayersMsg);
  };
  /* MARK: - Socket.io Handlers - */
  // on successful join, show some more things


  socket.on('update-scoreboard', function (returnData) {
    // make copies of the returnData arrays
    playerNames = _toConsumableArray(returnData[0]);
    scores = _toConsumableArray(returnData[1]);
    createScoreboard();
    showCurrPlayer(playerId);
    fadeIn(scoreboard);
  }); // display error on screen

  socket.on('error', function (err) {
    errDisp(err);
  }); // start game by displaying the game container

  socket.on('start-game', function () {
    fade(landing, gameContainer);
    currPlayer = 0; // set isMulti and apply button handlers

    isMultiplayer = true;
    applyButtonHandlers();
    showCurrPlayer();

    for (var _i16 = 0; _i16 < dieArray.length; _i16++) {
      setupDie(dieArray[_i16]);
    }
  }); // update players variable (just used for chedcking if there's 
  // more than 2 players to start a multiplayer game with, and doing
  // room error checking on a rare chance there's some weird error, which
  // happened once during testing)

  socket.on('update-players', function (pVal) {
    if (pVal == -1) errDisp(roomErrMsg);else players = pVal;
  });
  /* MARK - Online Chat - */
  // show/hide chat

  chatButton.onclick = function () {
    if (messages.style.opacity == "100") {
      fadeOut(messages);
      fadeOut(messageArrow);
    } else {
      fadeIn(messages);
      fadeIn(messageArrow);
      chatButton.classList.remove("red");
    }
  }; // send message and reset value to empty


  chatInput.onkeyup = function (e) {
    // keycode 13 is enter
    if (e.keyCode == 13) {
      socket.emit('send-chat', room, chatInput.value);
      chatInput.value = "";
    }
  }; // on receiving a chat, show it in messages box


  socket.on('receive-chat', function (msg, nick) {
    // create necessary elements
    var infoLi = document.createElement('li');
    var userSp = document.createElement('span');
    var timeSp = document.createElement('span');
    var msgLi = document.createElement('li');
    var msgSp = document.createElement('span'); // get new date and convert it to just the current local time

    var d = new Date();
    var timeStr = d.toTimeString().slice(0, d.toTimeString().indexOf(" ")); // create user span

    userSp.innerHTML = nick;
    userSp.classList.add("user");

    if (nick == playerNames[playerId]) {
      userSp.classList.add("curr-user");
      userSp.innerHTML += " (You)";
    } // create time span


    timeSp.innerHTML = timeStr;
    timeSp.classList.add("time"); // append to info li

    infoLi.appendChild(userSp);
    infoLi.appendChild(timeSp); // fill message span and append

    msgSp.innerHTML = msg;
    msgLi.appendChild(msgSp); // add classes for different backgrounds if numMessages is odd

    if (!(numMessages % 2)) {
      infoLi.classList.add("odd");
      msgLi.classList.add("odd");

      if (darkMode) {
        infoLi.classList.add("dark-odd");
        msgLi.classList.add("dark-odd");
      }
    } // increment numMessages


    numMessages++; // append to messagesUL

    messagesUL.appendChild(infoLi);
    messagesUL.appendChild(msgLi); // scroll to bottom

    messagesUL.scrollTop = messagesUL.scrollHeight; // change chat button to red to indicate a new message

    if (messages.style.opacity != "100") chatButton.classList.add("red");
  });
  /* MARK: - Local Play Menu Options - */
  // create player entries based on value of localPlayers input

  localPlayers.onchange = function () {
    // remove all children
    while (nicknames.firstChild) {
      nicknames.removeChild(nicknames.firstChild);
    } // create new children


    for (var _i17 = 0; _i17 < localPlayers.value; _i17++) {
      var label = document.createElement("label");
      var input = document.createElement("input");
      var br = document.createElement("br");
      var name = "nick" + _i17; // fill out data

      label.htmlFor = name;
      label.innerHTML = name + ": ";
      input.type = "text";
      input.id = name;
      input.name = name;
      input.placeholder = name;
      input.setAttribute("maxlength", 12); // append to nicknames div

      nicknames.appendChild(label);
      nicknames.appendChild(input);
      nicknames.appendChild(br);
    }
  }; // check for invalid input, then set up a local game


  localButton.onclick = function () {
    var invalidInput = false;
    isMultiplayer = false; // first check and make sure there's at least one player

    if (localPlayers.value != 0) {
      // check for invalid input
      for (var _i18 = 0; _i18 < nicknames.children.length; _i18++) {
        if (nicknames.children[_i18].type == "text") {
          if (nicknames.children[_i18].value.length <= 1) {
            invalidInput = true;
          }

          for (var j = 0; j < nicknames.children.length; j++) {
            if (_i18 != j && nicknames.children[_i18].value == nicknames.children[j].value) invalidInput = true;
          }
        }
      } // check for invalid name input


      if (invalidInput) {
        errDisp(invalidNameMsg);
      } else {
        for (var _i19 = 0; _i19 < nicknames.children.length; _i19++) {
          if (nicknames.children[_i19].type == "text") {
            playerNames.push(nicknames.children[_i19].value);
            scores.push(0);
          }
        } // create the scoreboard and indicate current player


        createScoreboard();
        showCurrPlayer(); // fade out landing and fade in gamecontainer and scoreboard
        // landing gets faded out twice, but that's not a big deal

        fade(landing, gameContainer);
        fadeIn(scoreboard);
      }
    } else errDisp(onePlayerMsg); // apply button handlers


    applyButtonHandlers(); // setup dice for single player

    for (var _i20 = 0; _i20 < diceContainer.children.length; _i20++) {
      setupDie(dieArray[_i20]);
    }
  }; // function to create the scoreboard


  var createScoreboard = function createScoreboard() {
    // wipe out old scoreboard
    while (scoreboard.children[0].firstChild) {
      scoreboard.children[0].removeChild(scoreboard.children[0].firstChild);
    }

    scoreboardTrs = []; // re-create header

    var headTr = document.createElement("tr");
    var playerTh = document.createElement("th");
    var scoreTh = document.createElement("th");
    playerTh.innerHTML = "Player";
    scoreTh.innerHTML = "Score";
    headTr.appendChild(playerTh);
    headTr.appendChild(scoreTh);
    scoreboard.children[0].appendChild(headTr); // create elements to be appended to the scoreboard element

    for (var _i21 = 0; _i21 < playerNames.length; _i21++) {
      var tr = document.createElement("tr");
      var name = document.createElement("td");
      var score = document.createElement("td");
      tr.id = "player" + _i21;
      if (!(_i21 % 2)) tr.style.backgroundColor = darkMode ? trBgD : trBgL;
      name.innerHTML = playerNames[_i21];
      score.innerHTML = scores[_i21];
      tr.appendChild(name);
      tr.appendChild(score);
      scoreboard.children[0].appendChild(tr);
      scoreboardTrs.push(document.querySelector("#player" + _i21));
    }
  };
  /* MARK: - In-Game Buttons - */


  var applyButtonHandlers = function applyButtonHandlers() {
    rollButton.onclick = isMultiplayer ? rollMulti : function () {
      roll(false);
    };
    endTurnButton.onclick = isMultiplayer ? endTurnMulti : endTurn;
    restartButton.onclick = isMultiplayer ? restartMulti : restart;
  };
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
var diceAlt = ["1", "2", "3", "4", "5", "6"];
var intervalTiming = 75;
var spinTiming = 500;
var matchTiming = Math.floor(spinTiming / intervalTiming) * intervalTiming + 5; // 75ms for interval is arbitrary, BUT
// 500ms for timeout is related to spin timing in CSS
// 5ms is added to matchTiming just as a little buffer
// matchTiming is created so there isn't much of an issue with matching
// rolls between devices on slow connections--will hopefully make it 
// seem a lot more fluid

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
/* MARK: - Notice/Error Messages - */

var yourTurnMsg = "It's your turn!";
var lastTurnMsg = "This is your last turn! Make it count!";
var joinedMsg = "Joined game! Waiting to start...";
var rolledStraightMsg = "You rolled a straight! You must end your turn!";
var invalidDieMsg = "Invalid die selection! Please pick valid dice!";
var rollAgainMsg = "You must roll again!";
var sixDigitMsg = "Please enter a 6-digit room ID.";
var invalidNameMsg = "Invalid name input. Please enter something else.";
var onePlayerMsg = "Must have at least one player!";
var twoPlayersMsg = "Must have at least two players!";
var roomErrMsg = "Unknown problem with room. Please create a new room.";
/* MARK: - Global Arrays - */

var dieArray = [];
var rolls = [];
var scores = [];
var playerNames = [];
var scoreboardTrs = [];
var currRollArr = [];
var currSelecArr = [];
var currPrevArr = [];
/* MARK: - Score Constants - */

var backwardScore = -100;
var straightScore = 1000;
var minScore = 1000;
var scoreGoal = 10000;
/* MARK: - Global DOM Variables - */

var diceContainer, rollButton, endTurnButton, restartButton, error, currRoll;
/* MARK: - Other Variables - */

var darkMode = false;
var mute = false;
var endgame = false;
var currPlayer = 0;
var playerId = 0; // this is different per each connected client

var players = 0;
var winnerIndex = -1;
var isMultiplayer = false;
var isFrozen = false;
var numMessages = 0;
var socket, room;
/* MARK: - Helper Functions - */
// random int

var random = function random(min, max) {
  return Math.floor(Math.random() * max) + min;
}; // fading elements in/out helper functions


var fade = function fade(el1, el2) {
  el1.style.opacity = "0";
  setTimeout(function () {
    el1.style.display = "none";
    el2.style.display = "block";
    setTimeout(function () {
      el2.style.opacity = "100";
    }, 50);
  }, 500);
};

var fadeOut = function fadeOut(el) {
  el.style.opacity = "0";
  setTimeout(function () {
    el.style.display = "none";
  }, 500);
};

var fadeIn = function fadeIn(el) {
  var displayType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "block";
  el.style.display = displayType;
  setTimeout(function () {
    el.style.opacity = "100";
  }, 50);
}; // error display


var errDisp = function errDisp() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : " ";
  var stayOnScreen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var empty = str == " " ? true : false;
  var winnerMsg = str.indexOf("winner") > 0 ? true : false;
  var err = "<span style='color:red'>ERROR: </span>";
  var notice = "<span style='color:steelblue'>NOTICE: </span>"; // reset error to default just to be safe

  error.innerHTML = " ";
  error.style.opacity = "0"; // set to new stuff

  if (!empty && !winnerMsg) {
    switch (str) {
      default:
        error.innerHTML = err + str;
        break;

      case yourTurnMsg:
      case lastTurnMsg:
      case joinedMsg:
      case rolledStraightMsg:
        error.innerHTML = notice + str;
        break;
    }
  } else if (!empty && winnerMsg) {
    error.innerHTML = notice + str;
  }

  error.style.opacity = "100"; // fade out if stay on screen is true

  if (!stayOnScreen && !empty) {
    setTimeout(function () {
      error.style.opacity = "0";
      setTimeout(function () {
        error.innerHTML = " "; // this is alt+255, not a space
      }, 600);
    }, 2000);
  }
}; // update roll score on click


var updateRollScore = function updateRollScore() {
  var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

  if (num == -1) {
    // backup rolls array
    var rollCopy = _toConsumableArray(rolls);

    var currScore = scoreCalc(); // call scorecalc on die selection, then reset rolls to the backup

    currRoll.innerHTML = currScore;
    rolls = rollCopy; // return currScore in case

    return currScore;
  } else currRoll.innerHTML = num;
}; // highlight current player's name


var showCurrPlayer = function showCurrPlayer() {
  var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  for (var i = 0; i < scoreboardTrs.length; i++) {
    if (i != num) {
      for (var j = 0; j < scoreboardTrs[i].children.length; j++) {
        scoreboardTrs[i].children[j].style.color = darkMode ? "white" : "black";
        scoreboardTrs[i].children[j].style.fontWeight = "normal";
      }
    } else {
      // change color based on if multiplayer or not
      var color = currPlayer == playerId && isMultiplayer ? "steelblue" : "red";
      if (color == "steelblue") errDisp(yourTurnMsg, true);

      for (var _j = 0; _j < scoreboardTrs[i].children.length; _j++) {
        scoreboardTrs[i].children[_j].style.color = color;
        scoreboardTrs[i].children[_j].style.fontWeight = "bold";
      }
    }
  }
};