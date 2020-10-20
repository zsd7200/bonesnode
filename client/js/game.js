/*
GAME.JS

Functions related to scoring and game-related elements for both local and online multiplayer.
*/


/* MARK: - Die Selection/Marking - */
// returns an array of selected dice
let countDice = (checkWhite = false) => {
    let diceCount = [0,0,0,0,0,0];
    
    for(let i = 0; i < dieArray.length; i++) {
        if(dieArray[i].style.backgroundColor == selectedColor || (checkWhite == true && dieArray[i].style.backgroundColor != previouslySelectedColor)) {
            
            switch(dieArray[i].title) {
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
};

// checks for valid dice selection
let dieSelectValidation = () => {
    let count = countDice();
    
    if(straightChecker()) {
        errDisp(rolledStraightMsg);
        return false;
    }
    
    // check for illegal moves (2, 3, 4, 6)
    if (count[1] == 1 || count[1] == 2) { return false; }
    if (count[2] == 1 || count[2] == 2) { return false; }
    if (count[3] == 1 || count[3] == 2) { return false; }
    if (count[5] == 1 || count[5] == 2) { return false; }
    
    // make sure there are any dice selected
    if (count[0] == 0 && count[1] == 0 && count[2] == 0 && count[3] == 0 && count[4] == 0 && count[5] == 0) {
        return false;
    }
    
    // add this roll to rolls
    rolls.push(count);
    
    // if all checks have passed, return true
    return true;
};

// checks for straights
let straightChecker = () => {
    let count = countDice(true);
    
    if (count[0] == 1 && count[1] == 1 && count[2] == 1 && count[3] == 1 && count[4] == 1 && count[5] == 1) {
        return true;
    }
    
    return false;
};

// checks if all dice are selected
let allSelectCheck = () => {
    if ((dieArray[0].style.backgroundColor == selectedColor || dieArray[0].style.backgroundColor == previouslySelectedColor) &&
        (dieArray[1].style.backgroundColor == selectedColor || dieArray[1].style.backgroundColor == previouslySelectedColor) &&
        (dieArray[2].style.backgroundColor == selectedColor || dieArray[2].style.backgroundColor == previouslySelectedColor) &&
        (dieArray[3].style.backgroundColor == selectedColor || dieArray[3].style.backgroundColor == previouslySelectedColor) &&
        (dieArray[4].style.backgroundColor == selectedColor || dieArray[4].style.backgroundColor == previouslySelectedColor) &&
        (dieArray[5].style.backgroundColor == selectedColor || dieArray[5].style.backgroundColor == previouslySelectedColor))
        return true;
    else
        return false;
};

/* MARK: - Score Calculation - */
// calculates total score
let scoreCalc = () => {
    let score = 0;
    let backward = false;
    
    rolls.push(countDice());
    
    for(let i = 0; i < rolls.length; i++) {
        // add score for current roll
        let scrAdd = scoreAdd(rolls[i]);
        
        // if scoreAdd is less than 0 for any roll,
        // set backward to true--otherwise, increment score
        if(scrAdd > 0)
            score += scrAdd;
        else
            backward = true;
    }
    
    // clear rolls
    rolls = [];
    
    // if backward, return the backward value (-100)
    if(backward)
        return backwardScore;
    
    return score;
};

// adds points together per roll
let scoreAdd = (count) => {
    let score = 0;
    
    if (straightChecker())
        return straightScore;
    
    // check for 1s
    switch(count[0])
    {
        case 1: score += rollScores[0][0]; break;
        case 2: score += rollScores[0][1]; break;
        case 3: score += rollScores[0][2]; break;
        case 4: score += rollScores[0][3]; break;
        case 5: score += rollScores[0][4]; break;
        case 6: score += rollScores[0][5]; break;
        
        default: break;
    }
    
    // check for 2s
    switch (count[1])
    {
        case 3: score += rollScores[1][0]; break;
        case 4: score += rollScores[1][1]; break;
        case 5: score += rollScores[1][2]; break;
        case 6: score += rollScores[1][3]; break;
        
        default: break;
    }
    
    // check for 3s
    switch (count[2])
    {
        case 3: score += rollScores[2][0]; break;
        case 4: score += rollScores[2][1]; break;
        case 5: score += rollScores[2][2]; break;
        case 6: score += rollScores[2][3]; break;
        
        default: break;
    }
    
    // check for 4s
    switch (count[3])
    {
        case 3: score += rollScores[3][0]; break;
        case 4: score += rollScores[3][1]; break;
        case 5: score += rollScores[3][2]; break;
        case 6: score += rollScores[3][3]; break;
        
        default: break;
    }
    
    // check for 5s
    switch (count[4])
    {
        case 1: score += rollScores[4][0]; break;
        case 2: score += rollScores[4][1]; break;
        case 3: score += rollScores[4][2]; break;
        case 4: score += rollScores[4][3]; break;
        case 5: score += rollScores[4][4]; break;
        case 6: score += rollScores[4][5]; break;
        
        default: break;
    }
    
    // check for 6s
    switch (count[5])
    {
        case 3: score += rollScores[5][0]; break;
        case 4: score += rollScores[5][1]; break;
        case 5: score += rollScores[5][2]; break;
        case 6: score += rollScores[5][3]; break;
        
        default: break;
    }
    
    // go backwards by 100 if score is 0
    if (score == 0) {
        score = backwardScore;
    }

    return score;
};

/* MARK: - Rolling, Restarting, Ending Turn - */
// roll dice
let roll = (bypass = false) => {    
    // clear errDisp
    if(!endgame)
        errDisp();
    
    if(dieSelectValidation() || bypass) {        
        let unselected = 0;
        
        if(allSelectCheck()) {
            for(let i = 0; i < dieArray.length; i++) {
                dieArray[i].style.backgroundColor = bgColor;
            }
        }
        
        for(let i = 0; i < dieArray.length; i++) {
            reroll(dieArray[i]);
            
            if(!mute && dieArray[i].style.backgroundColor == bgColor)
                unselected++;
        }
        
        // only play sounds if mute is off
        if(!mute) {
            switch(unselected) {
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
        
        // match rolls for all players after spin animation
        if(isMultiplayer) {
            setTimeout(() => {
                // parse title for int, subtract one, push to currRollArr
                for(let i = 0; i < dieArray.length; i++) {
                    if(currPlayer == playerId)
                        currRollArr[i] = parseInt(dieArray[i].title) - 1;
                }
                
                // emit match-roll
                if(currPlayer == playerId) {
                    socket.emit('match-roll', room, currRollArr);
                }
                
            }, matchTiming);
        }
        
    } else if(!straightChecker()) {
        errDisp(invalidDieMsg);
    }
    
    
};

// restart game
let restart = () => {
    // reset dice
    for(let i = 0; i < dieArray.length; i++) {
        dieArray[i].style.backgroundColor = bgColor;
        setupDie(dieArray[i]);
    }
    
    // reset scores internally and on screen
    for(let i = 0; i < scores.length; i++) {
        scores[i] = 0;
        scoreboardTrs[i].children[1].innerHTML = scores[i];
    }
    
    // enable roll and endturn buttons and hide restart
    rollButton.disabled = false;
    endTurnButton.disabled = false;
    restartButton.style.display = "none";
    
    // running with no params clears out the error message
    errDisp();
    
    // empty rolls array
    rolls = [];
    
    endgame = false;
};

// end turn
let endTurn = () => {
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
    
    if(!isMultiplayer) {
        setTimeout(() => {
            rollButton.disabled = false;
            endTurnButton.disabled = false;
        }, spinTiming);
    }
    
    // reset current roll to 0
    currRoll.innerHTML = "0";
    
    // check if anyone is over the score goal
    for(let i = 0; i < scores.length; i++) {
        if(scores[i] > scoreGoal) {
            endgame = true;
            break;
        }
    }
    
    if (!allSelectCheck() || straightChecker()) {
        const score = scoreCalc();
        let unselected = 0;
        
        // make sure first roll is 1000+ (minScore) points
        if(scores[currPlayer] == 0) {
            if(score >= minScore)
                scores[currPlayer] += score;
        } else
            scores[currPlayer] += score;
        
        // set score to 0 if score goes below 1000
        if(scores[currPlayer] < minScore)
            scores[currPlayer] = 0;
        
        // update scoreboard text
        if(isMultiplayer && currPlayer == playerId)
            socket.emit('send-score', room, scores[currPlayer], currPlayer);
        else if(!isMultiplayer)
            scoreboardTrs[currPlayer].children[1].innerHTML = scores[currPlayer];
        
        // if currPlayer has reached the goal
        if(scores[currPlayer] >= scoreGoal && endgame == false) {
            endgame = true;
            winnerIndex = currPlayer;
        }
        
        // increment player
        currPlayer = ((currPlayer + 1) >= scores.length) ? 0 : (currPlayer + 1);
        showCurrPlayer(currPlayer);
        
        // freeze everyone who isn't current player
        // in multiplayer game
        if(isMultiplayer) {            
            if(currPlayer == playerId && isFrozen)
                unfreeze();
            else if(!isFrozen)
                freeze();
        }
        
        if(endgame && (winnerIndex == currPlayer)) {
            let highestScore = 0;
            
            for(let i = 0; i < scores.length; i++) {
                if(scores[i] > highestScore) {
                    highestScore = scores[i];
                    winnerIndex = i;
                }
            }
            
            // display winner
            errDisp("The winner is " + playerNames[winnerIndex] + "!", true);
            
            // display restart button
            restartButton.style.display = "block";
            
            // freeze dice to prevent interactions
            freeze();
        }
    
        for(let i = 0; i < dieArray.length; i++)           
            dieArray[i].style.backgroundColor = bgColor;
        
        // pass in true to bypass dieSelectValidation
        roll(true);
        
        // show lastTurnMsg
        if(endgame && restartButton.style.display != "block") {
            if(isMultiplayer && currPlayer == playerId)
                errDisp(lastTurnMsg, true);
            else if(!isMultiplayer)
                errDisp(lastTurnMsg, true);
        }

    } else if(allSelectCheck() && !straightChecker()) { // force player to reroll if all selected and not a straight
        errDisp(rollAgainMsg);
        
        if(currPlayer == playerId)
            unfreeze();
        
        updateRollScore();
    }
};

/* MARK: - Multiplayer-Specific Functions - */
/* MARK: - Multiplayer Event Handlers - */
// These essentially emit events to the server and call the local method
let rollMulti = () => { socket.emit('roll', room); };
let endTurnMulti = () => { socket.emit('end-turn', room); };
let restartMulti = () => { socket.emit('restart', room); };
let rollMultiHandler = () => { socket.on('return-roll', () => { roll(false); }); };
let endTurnMultiHandler = () => { socket.on('return-end-turn', () => { endTurn(); }); };
let restartMultiHandler = () => { socket.on('return-restart', () => { restart(); }); };
let updateScoreHandler = () => {
    socket.on('receive-score', (score, player) => {
        scores[player] = score;
        scoreboardTrs[player].children[1].innerHTML = scores[player];
    });
};