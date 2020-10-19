/*
MAIN.JS

Loads DOM elements upon window load, handles input, handles dark mode, and more.
*/

window.onload = () => {
    /* MARK: - DOM Elements - */
    let landing = document.querySelector("#landing");
    let rules = document.querySelector("#rules");
    let localOnlineSelect = document.querySelector("#local-online-select");
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
    diceContainer = document.querySelector("#dice-container");
    rollButton = document.querySelector("#roll-button");
    endTurnButton = document.querySelector("#end-turn-button");
    restartButton = document.querySelector("#restart-button");
    let scoreboard = document.querySelector("#scoreboard");
    error = document.querySelector("#error");
    currRoll = document.querySelector("#curr-roll");
    let darkModeToggle = document.querySelector("#dark-mode-toggle");
    let soundToggle = document.querySelector("#sound-toggle");
    let rulesButton = document.querySelector("#rules-button");
    let closeRulesButton = document.querySelector("#close-rules-button");
    
    /* MARK: - Dice Setup - */
    for(let i = 0; i < diceContainer.children.length; i++)
        dieArray.push(diceContainer.children[i]);
    
    /* MARK: - CORS Bypass for Audio - */
    for(let i = 0; i < rollSounds.length; i++) {
        rollSounds[i].crossOrigin = "anonymous";
    }
    
    /* MARK: - Show Local/Online Options - */
    // local
    localOnlineSelect.children[0].onclick = () => { fade(localOnlineSelect, localContainer); };
    
    // online
    localOnlineSelect.children[1].onclick = () => { fade(localOnlineSelect, roomButtons); };
    
    
    /* MARK: - Dark Mode - */
    darkModeToggle.onclick = () => {
        // store colors to redraw after swapping modes
        let unselected = [], selected = [], prevSelected = [];
        let buttons = document.querySelectorAll("button");
        
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
        for(let i = 0; i < buttons.length; i++)
            buttons[i].classList.toggle("dark-button");
        
        // redraw dice
        for(let i = 0; i < unselected.length; i++)
            dieArray[unselected[i]].style.backgroundColor = bgColor;
        
        for(let i = 0; i < selected.length; i++)
            dieArray[selected[i]].style.backgroundColor = selectedColor;
        
        for(let i = 0; i < prevSelected.length; i++)
            dieArray[prevSelected[i]].style.backgroundColor = previouslySelectedColor;
        
        // toggle body and rules' dark modes
        document.body.classList.toggle("dark-body");
        rules.classList.toggle("dark-body");
        
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
                case "1":
                    dieArray[i].src = (darkMode) ? diceSrcD[0] : diceSrcL[0];
                    break;
                case "2":
                    dieArray[i].src = (darkMode) ? diceSrcD[1] : diceSrcL[1];
                    break;
                case "3":
                    dieArray[i].src = (darkMode) ? diceSrcD[2] : diceSrcL[2];
                    break;
                case "4":
                    dieArray[i].src = (darkMode) ? diceSrcD[3] : diceSrcL[3];
                    break;
                case "5":
                    dieArray[i].src = (darkMode) ? diceSrcD[4] : diceSrcL[4];
                    break;
                case "6":
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
    
    /* MARK: - Hide/Show Rules - */
    rulesButton.onclick = () => { fadeIn(rules); };
    closeRulesButton.onclick = () => { fadeOut(rules); };
    
    /* MARK: - Networking - */
    // start socket.io
    socket = io();
    
    // set up some event handlers from other methods
    // Dice.js
    setupMultiHandler();
    matchRollHandler();
    selectDieHandler();
    
    // Game.js
    rollMultiHandler();
    endTurnMultiHandler();
    restartMultiHandler();
        
    // join-room-button
    roomButtons.children[0].onclick = () => {
        // fade old elements out and fade join options in
        fade(roomButtons, joinOptions);
        fadeOut(localContainer);
        
        // add onclick for join button
        joinButton.onclick = () => {
            // bring room code to lowercase and remove spaces
            let joinIDval = joinID.value.toLowerCase().replace(/\s/g, '');
            let name = joinNick.value;
            let validName = true;

            if(name.length <= 1)
                validName = false;

            // check if names are the same
            // TODO: fix this, it seems like playerNames is empty
            for(let i = 0; i < playerNames.length; i++) {
                if(name == playerNames[i]) {
                    validName = false;
                    break;
                }
            }
            
            if(validName) {
                // check and make sure there's enough characters and emit join
                if(joinIDval.length == 6)
                    socket.emit('join', name, joinIDval);
                else
                    errDisp(sixDigitMsg);
                
                socket.on('join-success', (pId, rm) => {
                    joinNick.disabled = true;
                    joinID.disabled = true;
                    joinButton.disabled = true;
                    playerId = pId;
                    room = rm;
                    socket.emit('increment-players', room);
                    errDisp(joinedMsg);
                });
            } else
                errDisp(invalidNameMsg);
        };
    };
    
    // host-room-button
    roomButtons.children[1].onclick = () => {
        // fade old elements out and fade host options in
        fade(roomButtons, hostOptions);
        
        openButton.onclick = () => {
            hostNick.disabled = true;
            
            // call for room creation
            socket.emit('create', hostNick.value);
            
            // display room-id (called by emitting create) on-screen
            socket.on('room-id', (data) => {
                hostID.innerHTML = data;
                room = data;
                fadeIn(scoreboard);
                openButton.disabled = true;
                hostButton.disabled = false;
                playerId = 0;
                socket.emit('increment-players', room);
            });
        };
    };
        
    // host button--starts the multiplayer game
    hostButton.onclick = () => { 
        if(players >= 2)
            socket.emit('start', room);
        else
            errDisp(twoPlayersMsg);
    };
    
    /* MARK: - Socket.io Handlers - */
    // on successful join, show some more things
    socket.on('update-scoreboard', (returnData) => {     
    
        // make copies of the returnData arrays
        playerNames = [...returnData[0]];
        scores = [...returnData[1]];
        
        createScoreboard();
        showCurrPlayer(playerId);
        fadeIn(scoreboard);
    });
    
    // display error on screen
    socket.on('error', (err) => { errDisp(err); });
    
    // start game by displaying the game container
    socket.on('start-game', () => {
        fade(landing, gameContainer); 
        
        // set isMulti and apply button handlers
        isMultiplayer = true;
        applyButtonHandlers();
        showCurrPlayer();
        
        for(let i = 0; i < dieArray.length; i++) {
            setupDie(dieArray[i]);
        }
    });
    
    // update players variable (just used for chedcking if there's 
    // more than 2 players to start a multiplayer game with, and doing
    // room error checking on a rare chance there's some weird error, which
    // happened once during testing)
    socket.on('update-players', (pVal) => {
        if(pVal == -1)
            errDisp(roomErrMsg);
        else
            players = pVal; 
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
            input.setAttribute("maxlength", 12);
            
            // append to nicknames div
            nicknames.appendChild(label);
            nicknames.appendChild(input);
            nicknames.appendChild(br);
        }
    };
    
    // check for invalid input, then set up a local game
    localButton.onclick = () => {
        let invalidInput = false;
        isMultiplayer = false;
        
        // first check and make sure there's at least one player
        if(localPlayers.value != 0) {            
            // check for invalid input
            for(let i = 0; i < nicknames.children.length; i++) {
                if(nicknames.children[i].type == "text") {
                    if(nicknames.children[i].value.length <= 1) {
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
                errDisp(invalidNameMsg);
            } else {
                for(let i = 0; i < nicknames.children.length; i++) {
                    if(nicknames.children[i].type == "text") { 
                        playerNames.push(nicknames.children[i].value);
                        scores.push(0);
                    }
                }
                
                // create the scoreboard and indicate current player
                createScoreboard();
                showCurrPlayer();
                
                // fade out landing and fade in gamecontainer and scoreboard
                // landing gets faded out twice, but that's not a big deal
                fade(landing, gameContainer);
                fadeIn(scoreboard);
            }
        } else
            errDisp(onePlayerMsg);
        
        // apply button handlers
        applyButtonHandlers();
        
        // setup dice for single player
        for(let i = 0; i < diceContainer.children.length; i++)
            setupDie(dieArray[i]);
    };
    
    // function to create the scoreboard
    let createScoreboard = () => {
        // wipe out old scoreboard
        while(scoreboard.children[0].firstChild)
            scoreboard.children[0].removeChild(scoreboard.children[0].firstChild);
        scoreboardTrs = [];
        
        // re-create header
        let headTr = document.createElement("tr");
        let playerTh = document.createElement("th");
        let scoreTh = document.createElement("th");
        
        playerTh.innerHTML = "Player";
        scoreTh.innerHTML = "Score";
        headTr.appendChild(playerTh);
        headTr.appendChild(scoreTh);
        scoreboard.children[0].appendChild(headTr);
        
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
    };
    
    /* MARK: - In-Game Buttons - */
    let applyButtonHandlers = () => {
        rollButton.onclick = (isMultiplayer) ? rollMulti : () => { roll(false); };
        endTurnButton.onclick = (isMultiplayer) ? endTurnMulti : endTurn;
        restartButton.onclick = (isMultiplayer) ? restartMulti : restart;
    };
};