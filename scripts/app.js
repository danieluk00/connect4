//THIS FILE CONTAINS THE MAIN VARIABLE DECLARATIONS AND RESETTING VALUES FOR FOLLOW ON GAMES

//CSS CLASS REFS

//Grid and main elements
const container =  document.querySelector('.container');
const grid = document.querySelector('.grid');
const rows = document.querySelectorAll('tr');
const body = document.getElementsByTagName('body')[0];

//Title and captions
const caption =  document.querySelector('.badge');
const title = document.querySelector('.title');
const leftTotal = document.querySelector('.lefttotal');
const rightTotal = document.querySelector('.righttotal');

//Main options
const startContainer =  document.querySelector('.stafrt');
const options = document.querySelector('.card');
const yellowButton = document.getElementById('dropdownmenulink');
const yellowStartRadio = document.getElementById('yellowstart');
const redStartRadio = document.getElementById('redstart');

//More options
const moreOptions = document.querySelector('.expand-options-icon'); //Link to expand options
const hiddenOptions = document.querySelector('.hiddenoptions'); //Initially hidden options
const gridCircleRadio = document.getElementById('gridcircle');
const gridSquareRadio = document.getElementById('gridsquare');
const alternateRadio = document.getElementById('alternate');
const winnerStartsRadio = document.getElementById('winnerstarts');
const loserStartsRadio = document.getElementById('loserstarts');
const skillLevelDiv = document.querySelector('.skilllevel');
const slider = document.querySelector('.slider');

//Online mode options
const onlineOptions = document.querySelector('.online');
const onlineTextLink = document.querySelector('.textlink');
const hostOrJoin = document.querySelector('.hostorjoin');
const chatForm = document.querySelector('.chat-form');
const chatDiv = document.querySelector('.chat');
const chatInner = document.querySelector('.chat-inner');
const messages = document.querySelector('.messages')

//Play again button
const playAgain = document.querySelector('.play-again');

//Counter images
const redCounter = `<img src="assets/red.png" class="counter bounceInDown animated">`;
const yellowCounter = `<img src="assets/yellow.png" class="counter bounceInDown animated">`;

//STARTING VARIABLES
const totalCols=7, totalRows=7; //Size of grid
let totalRedWins=0, totalYellowWins=0; //Set once per session
let started, skillLevel, players, alternateGames, winnerStarts, winner="", loser="", winerFull="", loserFull="", winFound=false, roundNumber=1, redTotal, yellowTotal; //Set once per game
let gridArray=[]; gameOver=true, turnsTaken=0, turn="R", playerTurn=true, movesTaken=0; //Current state of play, will change during game
let hostCode, onlineGame=false, onlineRole, onlineGameState, thisplayer='R', callCount=0, redName="", yellowName="", yourName="", opponentName="", joinEvent=false, hostEvent=false, joinID="", hostID=""; //\Online game variables
let winningGridR=[], winningGridY=[], winningGridRR=[], winningGridYY=[];
let emptyCell=null;
let debug=true; //Debugging

const onLoad = () => {
    gridArray = setUpGrid();
    getOptionsFromCookies();
}

const resetGame = () => {

    roundNumber++;
    setOnlineStatus(onlineRole);

    //Animate Grid Out
    removeAnimations(['highlight','badge-danger','badge-warning']);
    animateGridOut();
    wipeGrid();

    setTimeout(() => {
        revertTitle();
        resetVariables();
    }, 1000);

    setTimeout(function() {
        //Make game active
        onlineGame==false ? gameOver=false : "";
    },2000);

}

const setUpGrid = () => {
    gridArray=[];
    for (let i=0; i<=totalRows-1; i++) {
        gridArray.push(["B","B","B","B","B","B","B","B"]); //Blank ('B') cells are empty and not accessible yet
    }
    gridArray.push(["F","F","F","F","F","F","F","F"]); //Free ('F') cells are empty and where a move can be placed

    //Testing
    //debug==true ? useTestValues() : "";
    return gridArray;
}

const removeAnimations = (animArray) => {
    animArray.forEach((anim) => { //Remove all animations
        while (document.querySelector('.' + anim)) {
            document.querySelector(('.' + anim)).classList.remove(anim)
        }
    })
}

const revertTitle = () => {
    log('Checking which players have joined');

    //Revert title text, shadow colour and animate in
    title.textContent="Connect 4"
    turn=="R" ? title.classList.remove('r-wins') : "";
    turn=="Y" ? title.classList.remove('y-wins') : "";
    animateCSS(title,'bounceIn');

    if (onlineGame==true) {
        if ((hostEvent && !joinEvent) || (!hostEvent && joinEvent)) {
            // If only one of host or join player has connected, show grey holding background
           log('Waiting for opponent to join');
            title.textContent='Waiting for ' + opponentName + ' to join';
            document.querySelector('.body').classList.add('waiting');
        }
    }
}

const animateGridOut = () => {
    //Hide left and right totals
    animateCSS(redTotal, 'zoomOut','hide');
    animateCSS(yellowTotal, 'zoomOut','hide');

    //Hide play again button
    animateCSS(playAgain,'fadeOut','hide');
}

const wipeGrid = () => {
    animateCSS(grid,'jello');
    document.querySelectorAll('.counter').forEach(counter => animateCSS(counter,'fadeOutUpBig','hide'))

    setTimeout(() => {
        clearGridArray();
    }, 1000);
}

const clearGridArray = () => {
    for (let row=0; row<=totalRows; row++) {
        for (let col=0; col<=totalCols; col++) {
            getCellElement(row,col).innerHTML=``;
        }
    }
}

const resetVariables = () => {
        //Reset variables for new game
        turnsTaken=0;
        compPicked=-1; //For 1 player games, the column the computer chooses
        compPickComplete = false;
        colsToAvoid=[];
        snookeredColsR=[];
        snookeredColsY=[];
        DDRCols=[],
        DDYCols=[];

        onlineGame ? onlineGameState='active' : playerTurn=false;

        animateCSS(caption,'fadeIn','show');

        //Set who starts following game (turn will be switched!)
        if (alternateGames==true || winner=="Tie" || onlineGame==true) {
            turn=started;
        } else {
           turn = winnerStarts ? loser : winner;
        }

        turnChange(); //Switch the turn
        started=turn; //Set who started this new game
        onLoad(); //Load the grid from scratch
}

//For testing scenarios...
const useTestValues = () => {
    gridArray=[];
    // gridArray.push(["B","B","B","B","B","B","B","B"]);
    // gridArray.push(["B","B","B","B","B","B","B","B"]);
    // gridArray.push(["B","B","B","B","B","B","B","B"]);
    // gridArray.push(["B","F","F","B","B","F","B","B"]);
    // gridArray.push(["B","Y","R","F","F","R","B","B"]);
    // gridArray.push(["B","Y","R","R","Y","Y","F","B"]);
    // gridArray.push(["B","R","Y","Y","R","Y","R","F"]);
    // gridArray.push(["F","R","Y","R","Y","Y","R","R"]);

    gridArray.push(["B","B","B","B","B","B","B","B"]);
    gridArray.push(["B","B","B","B","B","B","B","B"]);
    gridArray.push(["B","F","F","F","B","B","B","B"]);
    gridArray.push(["B","Y","R","Y","B","B","B","B"]);
    gridArray.push(["B","Y","Y","Y","B","B","B","B"]);
    gridArray.push(["B","R","Y","R","B","B","B","B"]);
    gridArray.push(["B","R","R","Y","F","B","B","B"]);
    gridArray.push(["F","R","Y","R","R","F","F","F"]);

    addTestValuesToGrid();
}

const addTestValuesToGrid = () => {
    for (let row=0; row<=totalRows; row++) {
        for (let col=0; col<=totalCols; col++) {

            let spot = gridArray[row][col];
            if (spot=='R') {
                getCellElement(row,col).innerHTML = redCounter;
            } else if (spot=='Y') {
                getCellElement(row,col).innerHTML = yellowCounter;
            }
        }
    }
}

function animateCSS(element, animationName, hide, callback) {
    element.classList.add('animated', animationName);

    if (hide=='show' && element.classList.contains('hidden')) {
        element.classList.remove('hidden');
    }

    function handleAnimationEnd() {
        element.classList.remove('animated', animationName)
        element.removeEventListener('animationend', handleAnimationEnd)

        hide=='hide' ? element.classList.add('hidden') : "";

        if (typeof callback === 'function') callback()
    }

    element.addEventListener('animationend', handleAnimationEnd)
}
