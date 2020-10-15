/*
MAIN.JS

Loads DOM elements upon window load, handles input, handles dark mode, and more.
*/

window.onload = () => {
    /* MARK: - DOM Elements - */
    let landing = document.querySelector("#landing");
    let localContainer = document.querySelector("#local-container");
    let localPlayers = document.querySelector("#local-players");
    let nicknames = document.querySelector("#local-nicks");
    let localButton = document.querySelector("#local-play");
    let roomButtons = document.querySelector("#room-buttons");
    let joinOptions = document.querySelector("#join-options");
    let hostOptions = document.querySelector("#host-options");
    let openButton = document.querySelector("#open-button");
    let hostButton = document.querySelector("#host-button");
    let hostNick = document.querySelector("#host-nick");
    let joinNick = document.querySelector("#join-nick");
    let hostID = document.querySelector("#host-id");
    let joinID = document.querySelector("#join-id");
    let joinButton = document.querySelector("#join-button");
    let gameContainer = document.querySelector("#game");
    let diceContainer = document.querySelector("#dice-container");
    rollButton = document.querySelector("#roll-button");
    endTurnButton = document.querySelector("#end-turn-button");
    restartButton = document.querySelector("#restart-button");
    let scoreboard = document.querySelector("#scoreboard");
    error = document.querySelector("#error");
    currRoll = document.querySelector("#curr-roll");
    let darkModeToggle = document.querySelector("#dark-mode-toggle");
    let soundToggle = document.querySelector("#sound-toggle");
    
    /* MARK: - Dice Setup - */
    for(let i = 0; i < diceContainer.children.length; i++) {
        dieArray.push(diceContainer.children[i]);
        setupDie(dieArray[i]);
    }
    
    /* MARK: - CORS Bypass for Audio - */
    for(let i = 0; i < rollSounds.length; i++) {
        rollSounds[i].crossOrigin = "anonymous";
    }
    
    /* MARK: - Dark Mode - */
    darkModeToggle.onclick = () => {
        // store colors to redraw after swapping modes
        let unselected = [], selected = [], prevSelected = [];
        for(let i = 0; i < dieArray.length; i++) {
            switch(dieArray[i].style.backgroundColor) {
                case previouslySelectedColor:
                    prevSelected.push(i);
                    break;
                case selectedColor:
                    selected.push(i);
                    break;
                case bgColor:
                    unselected.push(i);
                    break;
                
                default:
                    break;
            }
        }
        
        // toggle darkmode variable
        darkMode = !darkMode;
        
        // change colors based on mode
        bgColor = (darkMode) ? bgColorD : bgColorL;
        selectedColor = (darkMode) ? selectedColorD : selectedColorL;
        previouslySelectedColor = (darkMode) ? previouslySelectedColorD : previouslySelectedColorL;
        
        // change button colors based on mode
        //rollButton.classList.toggle("game-button");
        rollButton.classList.toggle("dark-button");
        
        //endTurnButton.classList.toggle("game-button");
        endTurnButton.classList.toggle("dark-button");
        
        //restartButton.classList.toggle("game-button");
        restartButton.classList.toggle("dark-button");
        
        //localButton.classList.toggle("game-button");
        localButton.classList.toggle("dark-button");
        
        // redraw dice
        for(let i = 0; i < unselected.length; i++)
            dieArray[unselected[i]].style.backgroundColor = bgColor;
        
        for(let i = 0; i < selected.length; i++)
            dieArray[selected[i]].style.backgroundColor = selectedColor;
        
        for(let i = 0; i < prevSelected.length; i++)
            dieArray[prevSelected[i]].style.backgroundColor = previouslySelectedColor;
        
        // toggle body's dark mode
        document.body.classList.toggle("dark-body");
        
        // update scoreboard for dark mode
        for(let i = 0; i < scoreboardTrs.length; i++) {          
            if(!(i % 2)) {
                scoreboardTrs[i].style.backgroundColor = (darkMode) ? trBgD : trBgL;
            }

            showCurrPlayer(currPlayer);
        }
        
        // handle toggling dark dice and changing their src images
        for(let i = 0; i < dieArray.length; i++) {
            dieArray[i].classList.toggle("dark-die");
            
            switch(dieArray[i].title) {
                case "one":
                    dieArray[i].src = (darkMode) ? diceSrcD[0] : diceSrcL[0];
                    break;
                case "two":
                    dieArray[i].src = (darkMode) ? diceSrcD[1] : diceSrcL[1];
                    break;
                case "three":
                    dieArray[i].src = (darkMode) ? diceSrcD[2] : diceSrcL[2];
                    break;
                case "four":
                    dieArray[i].src = (darkMode) ? diceSrcD[3] : diceSrcL[3];
                    break;
                case "five":
                    dieArray[i].src = (darkMode) ? diceSrcD[4] : diceSrcL[4];
                    break;
                case "six":
                    dieArray[i].src = (darkMode) ? diceSrcD[5] : diceSrcL[5];
                    break;
            }
        }
        
        // swap between unicode moons
        darkModeToggle.innerHTML = (darkMode) ? "🌝" : "🌚";
    };
    
    /* MARK: - Sound Toggle - */
    soundToggle.onclick = () => {
        mute = !mute;
        soundToggle.innerHTML = (mute) ? "🔊" : "🔈";
    };
    
    /* MARK: - Networking - */
    // start socket.io and add some universal handlers
    socket = io();
    socket.on('error', (err) => { errDisp(err); });
    
    // join-room-button
    roomButtons.children[0].onclick = () => {
        // fade old elements out and fade join options in
        fade(roomButtons, joinOptions);
        fadeOut(localContainer);
        
        // add onclick for join button
        joinButton.onclick = () => {
            // bring room code to lowercase and remove spaces
            let joinIDval = joinID.value.toLowerCase().replace(/\s/g, '');
            
            // check and make sure there's enough characters and emit join
            if(joinIDval.length == 6)
                socket.emit('join', joinIDval, joinNick.value);
            else
                errDisp("Please enter a 6-digit room ID.");
            
            socket.on('join-success', () => {
                joinNick.disabled = true;
                joinButton.disabled = true;
            });
        };
    };
    
    // host-room-button
    roomButtons.children[1].onclick = () => {
        // fade old elements out and fade host options in
        fade(roomButtons, hostOptions);
        fadeOut(localContainer);
        
        openButton.onclick = () => {
            hostNick.disabled = true;
            
            // call for room creation
            socket.emit('create', hostNick.value);
            
            // display room-id (called by emitting create) on-screen
            socket.on('room-id', (data) => {
                hostID.innerHTML = data;
                fadeIn(scoreboard);
                openButton.disabled = true;
                hostButton.disabled = false;
            });
        };
    };
    
    /* MARK: - Socket.io Handlers - */
    // on successful join, show some more things
    socket.on('update-scoreboard', (namesArr, scoresArr) => {
        playerNames = namesArr;
        scores = scoresArr;
        
        createScoreboard();
        fadeIn(scoreboard);
    });
    
    /* MARK: - Local Play Menu Options - */
    // create player entries based on value of localPlayers input
    localPlayers.onchange = () => {
        // remove all children
        while(nicknames.firstChild)
            nicknames.removeChild(nicknames.firstChild);
        
        // create new children
        for(let i = 0; i < localPlayers.value; i++) {
            let label = document.createElement("label");
            let input = document.createElement("input");
            let br = document.createElement("br");
            const name = "nick" + i;
            
            // fill out data
            label.htmlFor = name;
            label.innerHTML = name + ": ";
            input.type = "text";
            input.id = name;
            input.name = name;
            input.placeholder = name;
            
            // append to nicknames div
            nicknames.appendChild(label);
            nicknames.appendChild(input);
            nicknames.appendChild(br);
        }
    };
    
    // check for invalid input, then set up a local game
    localButton.onclick = () => {
        let invalidInput = false;
        
        // first check and make sure there's at least one player
        if(localPlayers.value != 0) {            
            // check for invalid input
            for(let i = 0; i < nicknames.children.length; i++) {
                if(nicknames.children[i].type == "text") {
                    if(nicknames.children[i].value == "") {
                        invalidInput = true;
                    }
                    
                    for(let j = 0; j < nicknames.children.length; j++) {
                        if(i != j && nicknames.children[i].value == nicknames.children[j].value)
                            invalidInput = true;
                    }
                }
            }
            
            // check for invalid name input
            if(invalidInput) {
                errDisp("Invalid name input!");
            } else {
                for(let i = 0; i < nicknames.children.length; i++) {
                    if(nicknames.children[i].type == "text") { 
                        playerNames.push(nicknames.children[i].value);
                        scores.push(0);
                    }
                }
                
                // create elements to be appended to the scoreboard element
                for(let i = 0; i < playerNames.length; i++) {
                    let tr = document.createElement("tr");
                    let name = document.createElement("td");
                    let score = document.createElement("td");
                    
                    tr.id = "player" + i;
                    if(!(i % 2))
                        tr.style.backgroundColor = trBgL;
                    
                    name.innerHTML = playerNames[i];
                    score.innerHTML = scores[i];
                    
                    tr.appendChild(name);
                    tr.appendChild(score);
                    scoreboard.children[0].appendChild(tr);
                    scoreboardTrs.push(document.querySelector("#player" + i));
                }
                
                showCurrPlayer();
                
                // fade out landing and fade in gamecontainer and scoreboard
                // landing gets faded out twice, but that's not a big deal
                fade(landing, gameContainer);
                fadeIn(scoreboard);
            }
        } else {
            errDisp("Must have at least one player!");
        }
    };
    
    let createScoreboard = () => {
        // wipe out old scoreboard
        while(scoreboard.children[0].firstChild)
            scoreboard.children[0].removeChild(scoreboard.children[0].firstChild);
        
        scoreboardTrs = [];
        
        // create elements to be appended to the scoreboard element
        for(let i = 0; i < playerNames.length; i++) {
            let tr = document.createElement("tr");
            let name = document.createElement("td");
            let score = document.createElement("td");
            
            tr.id = "player" + i;
            if(!(i % 2))
                tr.style.backgroundColor = trBgL;
            
            name.innerHTML = playerNames[i];
            score.innerHTML = scores[i];
            
            tr.appendChild(name);
            tr.appendChild(score);
            scoreboard.children[0].appendChild(tr);
            scoreboardTrs.push(document.querySelector("#player" + i));
        }
        
        showCurrPlayer();
    };
    
    /* MARK: - In-Game Buttons - */
    rollButton.onclick = roll;
    endTurnButton.onclick = endTurn;
    restartButton.onclick = restart;
};