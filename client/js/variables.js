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

const diceAlt = ["one", "two", "three", "four", "five", "six"];

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
    new Audio("./audio/roll1.wav"),
    new Audio("./audio/roll2.wav"),
    new Audio("./audio/roll3.wav"),
    new Audio("./audio/roll4.wav"),
    new Audio("./audio/roll5.wav"),
    new Audio("./audio/roll6.wav")
];

/* MARK: - Global Arrays - */
let dieArray = [];
let rolls = []; 
let scores = [];
let playerNames = [];
let scoreboardTrs = [];

/* MARK: - Score Constants - */
const backwardScore = -100;
const straightScore = 1000;
const minScore = 1000;
const scoreGoal = 10000;

/* MARK: - Global DOM Variables - */
let rollButton, endTurnButton, restartButton, error, currRoll;

/* MARK: - Other Variables - */
let darkMode = false;
let mute = false;
let endgame = false;
let currPlayer = 0;
let winnerIndex = -1;

/* MARK: - Helper Functions - */
// random int
let random = (min, max) => { return Math.floor(Math.random() * max) + min; };

// fading elements in/out helper function
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

// error display
let errDisp = (str = " ", stayOnScreen = false) => {
    // reset error to default just to be safe
    error.innerHTML = " ";
    error.style.opacity = "0";
    
    // set to new stuff
    error.innerHTML = str;
    error.style.opacity = "100";
    
    // fade out if stay on screen is true
    if(!stayOnScreen) {
        setTimeout(() => {
            error.style.opacity = "0";
            setTimeout(() => {
                error.innerHTML = " ";  // this is alt+255, not a space
            }, 600);
        }, 2000);
    }
};

// update roll score on click
let updateRollScore = () => {
    // backup rolls array
    let rollCopy = [...rolls];
    
    // call scorecalc on die selection, then reset rolls to the backup
    currRoll.innerHTML = scoreCalc();
    rolls = rollCopy;
};