/*
DICE.JS

Functions related to the dice elements themselves.
*/

/* MARK: - Dice Setup - */
// add handler and prevent from dragging
let setupDie = (die, num = -1) => {
    let rand;
    
    die.onclick = () => { selectDie(die); };
    die.style.backgroundColor = bgColor;
    die.setAttribute("draggable", false);
    
    rand = rerollFace(die, num);
    
    socket.emit('setup-multi', rand);
};

// onclick handler
let selectDie = (die, num = -1) => {
    // get dieId to return if multi
    let dieId = die.id.substr(4, 5);
    
    // change die background color based on clicking
    if(die.style.backgroundColor == bgColor) {
        die.style.backgroundColor = selectedColor;
    } else if (die.style.backgroundColor != previouslySelectedColor) {
        die.style.backgroundColor = bgColor;
    }
    
    updateRollScore(num);
    
    if(num == -1 && currPlayer == playerId)
        socket.emit('select-multi', room, dieId, num);
};

// "freeze" dice by preventing interaction
let freeze = () => {
    for(let i = 0; i < dieArray.length; i++)
        dieArray[i].onclick = null;
    
    rollButton.disabled = true;
    endTurnButton.disabled = true;
    
    isFrozen = true;
};

// "unfreeze" dice by reverting changes made in freeze
let unfreeze = () => {
    for(let i = 0; i < dieArray.length; i++)
        dieArray[i].onclick = () => { selectDie(dieArray[i]); };
    
    rollButton.disabled = false;
    endTurnButton.disabled = false;
    
    isFrozen = false;
};

/* MARK: - Rerolling - */
// reroll die with animation and handling for other background colors
let reroll = (die) => {    
    switch(die.style.backgroundColor) {
        // do nothing if was previously selected
        case previouslySelectedColor:
            break;
            
        case selectedColor:
            die.style.backgroundColor = previouslySelectedColor;
            break;
        
        case bgColor:
            let interval;
        
            die.classList.add("spin");
            interval = setInterval(() => {
                rerollFace(die);
            }, intervalTiming);
            
            setTimeout (() => {
                die.classList.remove("spin");
                clearInterval(interval);
            }, spinTiming);
            break;
    }
};

// reroll die face
let rerollFace = (die, num = -1) => {
    // randomly pick a number for use later, or use the passed in num
    let rand = (num != -1) ? num : random(0, diceSrcL.length);
    
    // set die to rand
    die.src = (darkMode) ? diceSrcD[rand] : diceSrcL[rand];
    die.alt = diceAlt[rand];
    die.title = diceAlt[rand];
    
    return rand;
};

/* MARK: - Multiplayer-Specific Functions - */
// if setup-multi is true, this event gets called
let setupMultiHandler = () => {
    socket.on('setup-multi-true', (rand) => {
        if(currPlayer == playerId)
            currRollArr.push(rand);
        
        // if they're at the same length, then rolling is done, call other event
        // room param is necessary here as otherwise it would only emit once and essentially
        // do nothing
        if(currRollArr.length == dieArray.length) {
            socket.emit('match-roll', room, currRollArr);
        }
    });
};

// set all dice to be the same upon return-setup-roll
let matchRollHandler = () => {
    socket.on('return-match-roll', (rollArr) => {
        currRollArr = [...rollArr];
        
        // make sure to freeze dice for all who aren't the player
        if(currPlayer != playerId) {
            for(let i = 0; i < dieArray.length; i++) {
                if(currRollArr[i] != -1)
                    rerollFace(dieArray[i], currRollArr[i]);
            }
            
            if(!isFrozen)
                freeze();
        }
        
        // empty currRollArr
        currRollArr = [];
    });
};

// handle server emitting "return-select-multi" (called in selectDie)
let selectDieHandler = () => {
    socket.on('return-select-multi', (dieId, num) => {
        if(currPlayer != playerId)
            selectDie(dieArray[dieId], num);
    });
};