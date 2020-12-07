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
    let chatButton = document.querySelector("#chat-button");
    let messages = document.querySelector("#messages");
    let messageArrow = document.querySelector("#message-arrow");
    let messagesUL = document.querySelector("#messages-ul");
    let chatInput = document.querySelector("#chat-input");
    
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
        const buttons = document.querySelectorAll("button");
        const oddChats = document.querySelectorAll(".odd");
        
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
        
        for(let i = 0; i < oddChats.length; i++)
            oddChats[i].classList.toggle("dark-odd");
        
        // redraw dice
        for(let i = 0; i < unselected.length; i++)
            dieArray[unselected[i]].style.backgroundColor = bgColor;
        
        for(let i = 0; i < selected.length; i++)
            dieArray[selected[i]].style.backgroundColor = selectedColor;
        
        for(let i = 0; i < prevSelected.length; i++)
            dieArray[prevSelected[i]].style.backgroundColor = previouslySelectedColor;
        
        // toggle dark mode for a few other elements
        document.body.classList.toggle("dark-body");
        rules.classList.toggle("dark-body");
        messages.classList.toggle("dark-body");
        
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
    updateScoreHandler();
        
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
            
            if(name.length > 1) {
                // check and make sure there's enough characters and emit join
                if(joinIDval.length == 6)
                    socket.emit('join', name, joinIDval);
                else
                    errDisp(sixDigitMsg);
                
                socket.on('join-success', (pId, rm, sec) => {
                    joinNick.disabled = true;
                    joinID.disabled = true;
                    joinButton.disabled = true;
                    playerId = pId;
                    currPlayer = playerId;
                    room = rm;
                    secret = sec;
                    fadeIn(chatButton);
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
            if(hostNick.value.length > 1) {
                hostNick.disabled = true;
                
                // call for room creation
                socket.emit('create', hostNick.value);
                
                // display room-id (called by emitting create) on-screen
                socket.on('room-id', (id, sec) => {
                    hostID.innerHTML = id;
                    room = id;
                    secret = sec;
                    fadeIn(scoreboard);
                    fadeIn(chatButton);
                    openButton.disabled = true;
                    hostButton.disabled = false;
                    playerId = 0;
                    socket.emit('increment-players', room);
                });
            } else
                errDisp(invalidNameMsg);
        };
    };
    
    // click open button if enter is pressed  
    hostNick.onkeyup = (e) => {
        if(e.keyCode == 13)
            openButton.click();
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
    socket.on('create-scoreboard', (returnData) => {     
    
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
        currPlayer = 0;
        
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
    
    /* MARK - Online Chat - */
    // show/hide chat
    chatButton.onclick = () => {
        if(messages.style.opacity == "100") {
            fadeOut(messages);
            fadeOut(messageArrow);
        } else {
            fadeIn(messages);
            fadeIn(messageArrow);
            chatButton.classList.remove("red");
        }
    };
    
    // send encrypted message and reset value to empty
    chatInput.onkeyup = (e) => {
        // keycode 13 is enter
        if(e.keyCode == 13 && chatInput.value != "") {
            const encMsg = CryptoJS.AES.encrypt(chatInput.value, secret).toString();
            socket.emit('send-chat', room, encMsg);
            chatInput.value = "";
        }
    };
    
    // on receiving a chat, show it in messages box
    socket.on('receive-chat', (msg, nick) => {
        // create necessary elements
        let infoLi = document.createElement('li');
        let userSp = document.createElement('span');
        let timeSp = document.createElement('span');
        let msgLi = document.createElement('li');
        let msgSp = document.createElement('span');
        
        // get new date and convert it to just the current local time
        let d = new Date();
        let timeStr = d.toTimeString().slice(0, d.toTimeString().indexOf(" "));
        
        // create user span
        userSp.innerHTML = nick;
        userSp.classList.add("user");
        if(nick == playerNames[playerId]) {
            userSp.classList.add("curr-user");
            userSp.innerHTML += " (You)";
        }
        
        // create time span
        timeSp.innerHTML = timeStr;
        timeSp.classList.add("time");
        
        // append to info li
        infoLi.appendChild(userSp);
        infoLi.appendChild(timeSp);
        
        // fill message span with decrypted message and append
        msgSp.innerHTML = CryptoJS.AES.decrypt(msg, secret).toString(CryptoJS.enc.Utf8);
        msgLi.appendChild(msgSp);
        
        // add classes for different backgrounds if numMessages is odd
        if(!(numMessages % 2)) {
            infoLi.classList.add("odd");
            msgLi.classList.add("odd");
            
            if(darkMode) {
                infoLi.classList.add("dark-odd");
                msgLi.classList.add("dark-odd");
            }
        }
        
        // increment numMessages
        numMessages++;
        
        // append to messagesUL
        messagesUL.appendChild(infoLi);
        messagesUL.appendChild(msgLi);
        
        // scroll to bottom
        messagesUL.scrollTop = messagesUL.scrollHeight;
        
        // change chat button to red to indicate a new message
        if(messages.style.opacity != "100")
            chatButton.classList.add("red");
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
                if(nicknames.children[i].type == "text")
                    playerNames.push(nicknames.children[i].value);
            }
            
            for(let i = 0; i < playerNames.length; i++) {
                // check length
                if(playerNames[i].length <= 1) {
                    invalidInput = true;
                    break;
                }
                
                // check if they're similar through stripSpecialChars
                for(let j = 0; j < playerNames.length; j++) {
                    if((i != j) && stripSpecialChars(playerNames[i]) == stripSpecialChars(playerNames[j])) {
                        invalidInput = true;
                        break;
                    }
                }
                
                if(invalidInput)
                    break;
            }
            
            // check for invalid name input
            if(invalidInput) {
                errDisp(invalidNameMsg);
                playerNames = [];
            } else {
                for(let i = 0; i < playerNames.length; i++)
                    scores.push(0);
                
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
    
    // func to strip special characters for name checking
    const stripSpecialChars = (str) => { return str.replace(/[^\w\s]/gi, '').toLowerCase(); };
    
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
                tr.style.backgroundColor = (darkMode) ? trBgD : trBgL;
            
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