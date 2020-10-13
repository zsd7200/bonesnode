/*
DICE.JS

Functions related to the dice elements themselves.
*/

/* MARK: - Dice Setup - */
// add handler and prevent from dragging
let setupDie = (die) => {    
    die.onclick = () => { selectDie(die); };
    die.style.backgroundColor = bgColor;
    die.setAttribute("draggable", false);
    
    rerollFace(die);
};

// onclick handler
let selectDie = (die) => {
    // change die background color based on clicking
    if(die.style.backgroundColor == bgColor) {
        die.style.backgroundColor = selectedColor;
    } else if (die.style.backgroundColor != previouslySelectedColor) {
        die.style.backgroundColor = bgColor;
    }
    
    updateRollScore();
};

// "freeze" dice by preventing interaction when game is over
let freeze = (die) => {
    die.onclick = null;
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
            }, 75);
            
            setTimeout (() => {
                die.classList.remove("spin");
                clearInterval(interval);
            }, 500);
            
            // 75ms for interval is arbitrary, BUT
            // 500 ms for timeout is related to spin timing in CSS
            break;
    }
};

// reroll die face
let rerollFace = (die) => {
    // randomly pick a number for use later
    let rand = random(0, diceSrcL.length);
    
    // set die to rand
    die.src = (darkMode) ? diceSrcD[rand] : diceSrcL[rand];
    die.alt = diceAlt[rand];
    die.title = diceAlt[rand];
};