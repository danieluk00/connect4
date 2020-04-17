//THIS FILE CONTAINS THE MAIN GAME LOGIC: ADD COUNTER, TURN CHANGE, CHECK WIN ETC.

//Player move
grid.addEventListener('click', e => {
    let col=-1
    if (e.target.classList.contains('grid-cell')==false) {return}; //Stop if user hasn't clicked a grid cell

    for (let i=0; i<=totalCols; i++) {
        if (e.target.parentElement.classList.contains('col'+i)) {col=i;}; //Go to the parent element (the column), and get col number
    }

    if (col>=0 && gameOver==false && playerTurn==true && (gridArray[0][col]=="B" || gridArray[0][col]=="F")) {
        addCounter(col); //If move is valid, add the counter
    }
})

const addCounter = col => {
    let row=getFreeRow(col); //Get lowest free row from col selected
    if (col<0 || row<0) {return};

    log("Adding counter to column "+col);

    getCellElement(row,col).innerHTML = turn=="Y" ? yellowCounter : redCounter; //Adds yellow/red counter image into grid cell
    turnsTaken++; //Iterates turns taken

    if (onlineGame && turnsTaken==1 && turn==thisplayer) {
        deleteJoinHostDocs()
    }

    playerTurn=false;

    //Update array
    setGridArray(row,col,turn); //Fill in lowest free cell in column
    setGridArray(row-1,col,"F"); //Make cell above 'Free' (available for subsequent moves)

    // if (winningGridR.includes([row,col])) {
    //     indexOf([row,col]).splice;
    // } else if (winningGridY.includes([row,col])) {
    //     indexOf([row,col]).splice;
    // }

    log(gridArray);
    
    setOnlineColumn(col);
    checkWin(turn, 'WinCheck'); //Check if won, otherwise change turn
}

//Changes the turn
const turnChange = () => {
    
    turn = turn=="R" ? "Y" : "R" //Turn switches

    updateActive();
    updateCaptionText();

}

const updateActive = () => {

    if (onlineGame==false) {
        playerTurn = !(players==1 && turn=="Y");
        playerTurn==false ? computerMove() : log("Player's move");
    } else {
        playerTurn = turn==thisPlayer;
    }

}

const updateCaptionText = () => {

    if (turnsTaken==0) {
        //First move
        if (onlineGame==false && players==2) {
            caption.textContent = turn=='R' ? "Red to start" : "Yellow to start";
        } else if (onlineGame==false && players==1) {
            caption.textContent = turn=='R' ? "You start" : "Computer: thinking..."
        } else {
            caption.textContent = thisPlayer==turn ? "You start" : opponentName + " to start"
        }
    } else {
        //Subsequent moves
        if (onlineGame==false && players==2) {
            caption.textContent = turn=='R' ? "Red's turn" : "Yellow's turn";
        } else if (onlineGame==false && players==1) {
            caption.textContent = turn=='R' ? "Your turn" : "Computer: thinking..."
        } else {
            caption.textContent = thisPlayer==turn ? "Your turn" : opponentName + "'s turn"
        }
    }

    caption.classList.contains('badge-danger') ? caption.classList.remove('badge-danger') : "";
    caption.classList.contains('badge-warning') ? caption.classList.remove('badge-warning') : "";

    if (turn=="Y") {
        caption.classList.add("badge-warning");
    } else if (turn=="R") {
        caption.classList.add("badge-danger");
    }

    animateCSS(caption,'fadeIn');

}

//Check if a colour has won
const checkWin = (colour, actual) => {

    if (actual=='WinCheck') {
        winningGridR=[];
        winningGridY=[];
    } else if (actual=='TestPositions') {
        winningGridRR=[];
        winningGridYY=[];  
    }

    winFound=false;
    log('Checking for a win');

    for (row=0; row<=totalRows; row++) { //Iterate through all cells
        for (col=0; col<=totalCols; col++) {

            if (row+3<=totalRows) {
                checkSpots([row,col],[row+1,col],[row+2,col],[row+3,col],colour,actual);
            };
            if (col+3<=totalCols) {
                checkSpots([row,col],[row,col+1],[row,col+2],[row,col+3],colour,actual);
            };
            if (row+3<=totalRows && col+3<=totalCols) {
                checkSpots([row,col],[row+1,col+1],[row+2,col+2],[row+3,col+3],colour,actual);
            };
            if (row-3>=0 && col+3<=totalCols) {
                checkSpots([row,col],[row-1,col+1],[row-2,col+2],[row-3,col+3],colour,actual);
            };
        }
    }

    if (actual=='WinCheck') {
        //Set winner/tie, otherwise change turn
        (winFound || (turnsTaken==(totalRows+1)*(totalCols+1))) ? setWinner(winFound,colour) : turnChange();
    };
};

//Check if spot matches colour for win
const checkSpots = (cellA,cellB,cellC,cellD,colour,actual) => {

    let cellACheck = (gridArray[cellA[0]][cellA[1]]==colour);
    let cellBCheck = (gridArray[cellB[0]][cellB[1]]==colour);
    let cellCCheck = (gridArray[cellC[0]][cellC[1]]==colour);
    let cellDCheck = (gridArray[cellD[0]][cellD[1]]==colour);

    let redCount=0, yellowCount=0, otherCount=0;

    [cellA, cellB, cellC, cellD].forEach(cell => {
        if (gridArray[cell[0]][cell[1]]=='R') {
            redCount++;
        } else if (gridArray[cell[0]][cell[1]]=='Y') {
            yellowCount++;
        } else if (gridArray[cell[0]][cell[1]]=='B' || gridArray[cell[0]][cell[1]]=='F') {
            otherCount++;
            emptyCell = cellNumber(cell[0],cell[1]);
        }
    })
    
    //Populate potential winning positions
    if (redCount==3 && yellowCount==0 && otherCount==1 && colour=='R' && actual=='WinCheck') {
        winningGridR.push(emptyCell)
    } else if (yellowCount==3  && redCount==0 && otherCount==1 && colour=='Y' && actual=='WinCheck') {
        winningGridY.push(emptyCell)
    } else if (redCount==3  && yellowCount==0 && otherCount==1 && colour=='R' && actual=='TestPositions') {
        winningGridRR.push(emptyCell)
    } else if (yellowCount==3  && redCount==0 && otherCount==1 && colour=='Y' && actual=='TestPositions') {
        winningGridYY.push(emptyCell)
    };

    //Check for win and flash counters
    if (cellACheck && cellBCheck && cellCCheck && cellDCheck && actual=='WinCheck') {
        
        [cellA,cellB,cellC,cellD].forEach((i) => flashCounter(i))
        winFound = true;
        log('Winner '+colour);

    } 
};

//Set winner variables
const setWinner = (winFound,colour) => {

    onlineGameState='gameOver';
    hostEvent==false;
    joinEvent==false;
    gameOver=true;

    if (winFound==true) {
        winner = colour=='R' ? 'R' : 'Y';
        loser = winner=="R" ? "Y" : "R";
    } else {
        winner = 'Tie';
    };

    setTimeout(function() {
        winnerAnimation()}
    ,1600);
}

//Flash winning counters
const flashCounter = (cell) => {
    winFound=true;
    setTimeout(function() { //Wait 2 seconds then animate
        getCellElement(cell[0],cell[[1]]).classList.add('highlight'); //Animate
        animateCSS(getCellElement(cell[0],cell[[1]]),'flash','show');

    },1600)

}

//Animate the other elements after win
function winnerAnimation() {
    if (winner=="Tie") {
        title.textContent = "It's a tie!"
    } else {

        if (onlineGame==false && players==2) {
            title.textContent = winner=='R' ? "Red wins!" : "Yellow wins!"
        } else if (onlineGame==false && players==1) {
            title.textContent = winner=='R' ? 'You win!' : 'Computer wins!';
        } else {
            title.textContent = winner==thisPlayer ? "You win!" : opponentName + " wins!";
        }

        title.classList.add(winner.toLowerCase() + '-wins');
        winner=='R' ? totalRedWins++ : totalYellowWins++; //Iterate total wins
    }

    //Flip title and animate caption out
    animateCSS(title,'flip','show');
    caption.classList.add('animated','zoomOut')

    //Show total wins
    setTimeout(function() {
        showTotals()}
    ,800)
}

function showTotals() {
    caption.classList.add('hidden');
    caption.classList.remove('animated','zoomOut');

    //The highest total will go on the left
    redTotal = totalRedWins>=totalYellowWins ? leftTotal : rightTotal;
    yellowTotal = totalRedWins>=totalYellowWins ? rightTotal : leftTotal;

    //Display total wins and animate in
    animateCSS(leftTotal,'zoomInLeft','show');
    animateCSS(rightTotal,'zoomInRight','show');
    
    redTotal.textContent = "Red wins: " + totalRedWins;
    yellowTotal.textContent = "Yellow wins: " + totalYellowWins;
    redTotal.classList.add('badge-danger');
    yellowTotal.classList.add('badge-warning');

    setTimeout(function() {
        animateCSS(playAgain,'fadeIn','show'); //Animate in 'Play again' button
    },1000)
}

//Get lowest free row from given column
const getFreeRow = col => {
    let row = totalRows; //Start with bottom row in selected column

    if (col<0 || (gridArray[0][col]!="F") && gridArray[0][col]!="B") {return -1};

    while (row>0 && gridArray[row][col]!="F") { //Move up column until we find a free cell
        row--;
    }
    return row;

}

//Get cell number from row, col
const cellNumber = (row, col) => ((row*8) + col);

//Get cell element from row, col
const getCellElement = (row,col) => document.querySelector('.col'+col).querySelector('.row'+row);

//Get row from cellNumber
const rowNumber = cell => {
    let row=0;
    while (cell >= 8) {
        cell-=8; row++;
    }
    return row;
}

//Get col from cellNumber
const getCol = cell => {
    while (cell>=8) {
        cell-=8;
    }
    return cell;
}

//Set value in array
const setGridArray = (row,col,value) => {
    if (row>=0 && row<=totalRows && col>=0 && col<=totalCols) {
        gridArray[row][col]=value
    };
}

//Log to console
const log = text => debug==true ? console.log(text) : "";