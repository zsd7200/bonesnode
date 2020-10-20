/*
VARIABLES.JS

Global variables and helper functions.
*/

/* MARK: - Dice-Related Variables - */
const rollScores = [
    [100,200,1000,2000,4000,8000],  // scores for 1s
    [200,400,800,1600],             // scores for 2s
    [300,600,1200,2400],            // scores for 3s
    [400,800,1600,3200],            // scores for 4s
    [50,100,500,1000,2000,4000],    // scores for 5s
    [600,1200,2400,4800],           // scores for 6s
];

const diceSrcL = [
    "assets/img/dice/l/1.webp",
    "assets/img/dice/l/2.webp",
    "assets/img/dice/l/3.webp",
    "assets/img/dice/l/4.webp",
    "assets/img/dice/l/5.webp",
    "assets/img/dice/l/6.webp",
];

const diceSrcD = [
    "assets/img/dice/d/1.webp",
    "assets/img/dice/d/2.webp",
    "assets/img/dice/d/3.webp",
    "assets/img/dice/d/4.webp",
    "assets/img/dice/d/5.webp",
    "assets/img/dice/d/6.webp",
];

const diceAlt = ["1", "2", "3", "4", "5", "6"];
const intervalTiming = 75;
const spinTiming = 500;
const matchTiming = (Math.floor(spinTiming / intervalTiming) * intervalTiming) + 5;
// 75ms for interval is arbitrary, BUT
// 500ms for timeout is related to spin timing in CSS
// 5ms is added to matchTiming just as a little buffer
// matchTiming is created so there isn't much of an issue with matching
// rolls between devices on slow connections--will hopefully make it 
// seem a lot more fluid

/* MARK: - Colors - */
const bgColorL = "rgb(255, 255, 255)";
const selectedColorL = "rgb(0, 255, 0)";
const previouslySelectedColorL = "rgb(3, 153, 10)";

const bgColorD = "rgb(48, 48, 48)";
const selectedColorD = "rgb(0, 89, 255)";
const previouslySelectedColorD = "rgb(0, 52, 148)";

let bgColor = bgColorL;
let selectedColor = selectedColorL;
let previouslySelectedColor = previouslySelectedColorL;

const trBgL = "rgb(221, 221, 221)";
const trBgD = "rgb(48, 48, 48)";

/* MARK: - Roll Sounds - */
let rollSounds = [
    new Audio("assets/audio/roll1.wav"),
    new Audio("assets/audio/roll2.wav"),
    new Audio("assets/audio/roll3.wav"),
    new Audio("assets/audio/roll4.wav"),
    new Audio("assets/audio/roll5.wav"),
    new Audio("assets/audio/roll6.wav")
];

/* MARK: - Notice/Error Messages - */
const yourTurnMsg = "It's your turn!";
const lastTurnMsg = "This is your last turn! Make it count!";
const joinedMsg = "Joined game! Waiting to start...";
const rolledStraightMsg = "You rolled a straight! You must end your turn!";

const invalidDieMsg = "Invalid die selection! Please pick valid dice!";
const rollAgainMsg = "You must roll again!";
const sixDigitMsg = "Please enter a 6-digit room ID.";
const invalidNameMsg = "Invalid name input. Please enter something else.";
const onePlayerMsg = "Must have at least one player!";
const twoPlayersMsg = "Must have at least two players!";
const roomErrMsg = "Unknown problem with room. Please create a new room.";

/* MARK: - Global Arrays - */
let dieArray = [];
let rolls = []; 
let scores = [];
let playerNames = [];
let scoreboardTrs = [];
let currRollArr = [];
let currSelecArr = [];
let currPrevArr = [];

/* MARK: - Score Constants - */
const backwardScore = -100;
const straightScore = 1000;
const minScore = 1000;
const scoreGoal = 10000;

/* MARK: - Global DOM Variables - */
let diceContainer, rollButton, endTurnButton, restartButton, error, currRoll;

/* MARK: - Other Variables - */
let darkMode = false;
let mute = false;
let endgame = false;
let currPlayer = 0;
let playerId = 0;               // this is different per each connected client
let players = 0;
let winnerIndex = -1;
let isMultiplayer = false;
let isFrozen = false;
let numMessages = 0;
let socket, room;

/* MARK: - Helper Functions - */
// random int
let random = (min, max) => { return Math.floor(Math.random() * max) + min; };

// fading elements in/out helper functions
let fade = (el1, el2) => {
    el1.style.opacity = "0";
    setTimeout(() => {
        el1.style.display = "none";
        
        el2.style.display = "block";
        setTimeout(() => {
            el2.style.opacity = "100";
        }, 50);
    }, 500);
};

let fadeOut = (el) => {
    el.style.opacity = "0";
    setTimeout(() => { el.style.display = "none"; }, 500);
};

let fadeIn = (el, displayType = "block") => {
    el.style.display = displayType;
    setTimeout(() => { el.style.opacity = "100"; }, 50);
};

// error display
let errDisp = (str = " ", stayOnScreen = false) => {
    const empty = (str == " ") ? true : false;
    const winnerMsg = (str.indexOf("winner") > 0) ? true : false;
    const err = "<span style='color:red'>ERROR: </span>";
    const notice = "<span style='color:steelblue'>NOTICE: </span>";
    
    // reset error to default just to be safe
    error.innerHTML = " ";
    error.style.opacity = "0";
    
    // set to new stuff
    if(!empty && !winnerMsg) {
        switch(str) {
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
    
    error.style.opacity = "100";
    // fade out if stay on screen is true
    if(!stayOnScreen && !empty) {
        setTimeout(() => {
            error.style.opacity = "0";
            setTimeout(() => {
                error.innerHTML = " ";  // this is alt+255, not a space
            }, 600);
        }, 2000);
    }
};

// update roll score on click
let updateRollScore = (num = -1) => {
    
    if(num == -1) {
        // backup rolls array
        let rollCopy = [...rolls];
        let currScore = scoreCalc();
        
        // call scorecalc on die selection, then reset rolls to the backup
        currRoll.innerHTML = currScore;
        rolls = rollCopy;
        
        // return currScore in case
        return currScore;
    } else 
        currRoll.innerHTML = num;
};

// highlight current player's name
let showCurrPlayer = (num = 0) => {
    for(let i = 0; i < scoreboardTrs.length; i++) {
        if(i != num) {
            for(let j = 0; j < scoreboardTrs[i].children.length; j++) {
                scoreboardTrs[i].children[j].style.color = (darkMode) ? "white" : "black";
                scoreboardTrs[i].children[j].style.fontWeight = "normal";
            }
        } else {
            // change color based on if multiplayer or not
            let color = (currPlayer == playerId && isMultiplayer) ? "steelblue" : "red";
            
            if(color == "steelblue")
                errDisp(yourTurnMsg, true);
            
            for(let j = 0; j < scoreboardTrs[i].children.length; j++) {
                scoreboardTrs[i].children[j].style.color = color;
                scoreboardTrs[i].children[j].style.fontWeight = "bold";
            }
        }
    }
};