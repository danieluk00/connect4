//THIS FILE CONTAINS THE COMPUTER PLAYER LOGIC

let compPicked=-1, compPickComplete=false, colsToAvoid=[], snookeredColsR=[], snookeredColsY=[], randomVar, minValue, tempArray=[], crossOver={};
const delayBetweenTries =1000;

//Create array of all the potential moves which would enable a red win the following move
const findColsToAvoid = () => {

    colsToAvoid=[];
    for (let col=0; col<=totalCols; col++) { //For each column...

        let row=getFreeRow(col);
        if (row<0) {continue};

        //Test change
        setGridArray(row,col,"Y");
        setGridArray(row-1,col,"F");

        //See if 4 reds is possible in any direction
        addColToAvoid(tryVertical(4,"R",col,false));
        addColToAvoid(tryHorizontal(4,"R",col,false));
        addColToAvoid(tryDiagonalUp(4,"R",col,false));
        addColToAvoid(tryDiagonalDown(4,"R",col,false));

        //Undo the test change
        setGridArray(row,col,"F");
        setGridArray(row-1,col,"B");
    }

    log("Cols to avoid "+colsToAvoid);
    return colsToAvoid;
}

const addColToAvoid = (col) => col>=0 ? colsToAvoid.push(col) : "";

const snookered = () => {

    snookeredColsY=[];
    snookeredColsR=[];

    for (let col=0; col<=totalCols; col++) { //For each column...

        for (let i=0; i<=1; i++) {

            //For each column, test yellow and red
            let colour = i==0 ? 'Y' : 'R';

            let row=getFreeRow(col);
            if (row<0) {continue};

            //Test change
            setGridArray(row,col,colour);
            setGridArray(row-1,col,"F");

            //See if 4 yellows/reds is possible in any direction
            for (coli=0; coli<totalCols; coli++) {
                if (tryHorizontal(4,colour,coli,false) >-1) {
                    log(colour+' snooker horizontal '+col)
                    addSnookeredCol(col, colour)
                }
            }
            for (coli=0; coli<totalCols; coli++) {
                if (tryVertical(4,colour,coli,false) >-1) {
                    log(colour+' snooker vertical '+col)
                    addSnookeredCol(col, colour)
                }
            }
            for (coli=0; coli<totalCols; coli++) {
                if (tryDiagonalUp(4,colour,coli,false) >-1) {
                    log(colour+' snooker diagup '+col)
                    addSnookeredCol(col, colour)
                }
            }
            for (coli=0; coli<totalCols; coli++) {
                if (tryDiagonalDown(4,colour,coli,false) >-1) {
                    log(colour+' snooker diagdown '+col)
                    addSnookeredCol(col, colour)
                }
            }

            //Undo the test change
            setGridArray(row,col,"F");
            setGridArray(row-1,col,"B");

        }
    }

    if (snookeredColsR.length>0) {log("Possible snookered R cols: "+snookeredColsR)};
    if (snookeredColsY.length>0) {log("Possible snookered Y cols: "+snookeredColsY)};

    return [snookeredColsY,snookeredColsR];
}

const addSnookeredCol = (col, colour) => {
    if (colour=='R') {
        col>=0 && colsToAvoid.includes(col)==false ? snookeredColsR.push(col) : "";
    } else {
        col>=0 && colsToAvoid.includes(col)==false ? snookeredColsY.push(col) : "";  
    }
}

// function sleep(miliseconds) {
//     var currentTime = new Date().getTime();
 
//     while (currentTime + miliseconds >= new Date().getTime()) {
//     }
//  }

const computerMove = () => {
    log("Running through computer moves");

    //Choose how good a move the computer will make (generates a random % (weighted by skill)
    minValue = parseInt(skillLevel-1) * 50;
    randomVar= Math.floor(Math.random() * (100 - minValue)) + minValue;
    log("Comp random skill value: "+randomVar);

    //Create array of columns to avoid
    colsToAvoid = randomVar==100 ? findColsToAvoid() : [];
    snookered();

    compPicked==-1, compPickComplete=false;

    setTimeout(function() {

        //Try for yellow win
        if (randomVar>=20) {tryStandard(4,"Y",-1,false)};
        if (randomVar>=30) {tryDiagonals(4,"Y",-1,false)};
        //Try for block
        if (randomVar>=20) {tryStandard(4,"R",-1,false)};
        if (randomVar>=40) {tryDiagonals(4,"R",-1,false)};

        log('Random var' + randomVar)
        if (randomVar>=100) {
            playSnookerMove();
        };
    
        crossOver={};
        for (let ii=0; ii<=totalRows; ii++) {
            crossOver[ii]=0;
        }

        //Look for 2 in a row
        if (randomVar>=50) {
            let twoOrder= Math.floor(Math.random() * (4 - 1)) + 1; //Number between 1 and 3
            if (twoOrder>=2) {
                ['Y','R'].forEach((colour)=>{
                    tryStandard(3,colour,-1,true);
                    tryDiagonals(3,colour,-1,true)
                });
            } else {
                ['R','Y'].forEach((colour)=>{
                    tryStandard(3,colour,-1,true);
                    tryDiagonals(3,colour,-1,true)
                });
            }
        };

        //Play crossover move
        playCrossOverMove();

        //Go random
        randomMove();

        //Make the move
        addCounter(col);
    
    },2000) //Main pause
}

//Parameters: No. of counters, colour, specific column (or -1 for all), if enabling opponent matters
const tryStandard = (number, colour, oneCol, enableMatters) => {
    if (Math.random()<0.5) {
        tryVertical(number,colour,oneCol,enableMatters);
        tryHorizontal(number,colour,oneCol,enableMatters);
    } else {
        tryHorizontal(number,colour,oneCol,enableMatters);
        tryVertical(number,colour,oneCol,enableMatters);
    }
}

const tryDiagonals  = (number, colour, oneCol, enableMatters) => {
    if (Math.random()<0.5) {
        tryDiagonalUp(number,colour,oneCol,enableMatters);
        tryDiagonalDown(number,colour,oneCol,enableMatters);
    } else {
        tryDiagonalDown(number,colour,oneCol,enableMatters);
        tryDiagonalUp(number,colour,oneCol,enableMatters);
    }
}

const tryVertical = (number, colour, oneCol, enableMatters) => {
    if (oneCol==-1 && compPickComplete==true) {return -1};
    oneCol==-1 ? log("Try vertical looking for a column of " + number + " " + colour) : "";

    let minCol = setMinCol(oneCol);
    let maxCol = setMaxCol(oneCol);

    for (col=minCol; col<=maxCol; col++) { //Iterate through columns

        if (colsToAvoid.includes(col)==true && enableMatters==true) {continue}; //Do not bother to test columns we can't use

        let row=getFreeRow(col);
        if (row<0 || (row==0 && number==3)) {continue};

        let redCount=0, yellowCount=0; //Check the possibilities and add up the red and yellow counters in a row

        //Vertical check
        for (let x=1; x<=(number-1); x++) {
            if (row+x<=totalRows && gridArray[row+x][col]=="R") {
                redCount++;
            } else if (row+x<=totalRows && gridArray[row+x][col]=="Y") {
                yellowCount++;
            }
        }

        let redFound = (colour=="R" && redCount==number-1); //Looking for number not including the free cell
        let yellowFound = (colour=="Y" && yellowCount==number-1);

        if (redFound || yellowFound) {
            log("Found " + number + " vertical " + colour + " counters in column " + col);

            addToCrossOver(col, number)
            if (number==4) {compPickComplete=true;}
            return col;

        }
    }

    return -1;
}

const tryHorizontal = (number, colour, oneCol, enableMatters) => {

    if (oneCol==-1 && compPickComplete==true) {return -1};

    oneCol==-1 ? log("Try horizontal looking for a row of " + number + " " + colour) : "";

    let minCol = setMinCol(oneCol);
    let maxCol = setMaxCol(oneCol);

    for (col=minCol; col<=maxCol; col++) { //Iterate through columns

        //Do not bother to test columns we can't use
        if (colsToAvoid.includes(col)==true && enableMatters==true) {continue};

        //Get row of free cell
        let row=getFreeRow(col);
        if (row<0) {continue};

        //For each col, search from 3 cells previous to 3 cells after (but stay in bounds of array)
        minx = Math.max(col-(number-1),0); 
        maxx = Math.min(col+(number-1),totalCols);

        tempArray = []; //Put the values in a temp array
        i=0;

        for (let x=minx; x<=maxx; x++) { //Iterate our temp array

            updateTempArray(gridArray[row][x],number);

            let colourFound = (tempArray.filter(c => c == colour).length == (number-1));
            let freeFound = (tempArray.filter(c => c == "F").length == 1);

            if (colourFound && freeFound) { //Check if temp array filtered on colour is correct length

                //Ignore edges where three in the row is the max possible
                if (number==3 && colour=='Y') {
                    if (col<3 && gridArray[row][3]=='R') {continue};
                    if (col>totalCols-3 && gridArray[row][totalCols-3]=='R') {continue};
                } else if (number==3 && colour=='R') {
                    if (col<3 && gridArray[row][3]=='Y') {continue};
                    if (col>totalCols-3 && gridArray[row][totalCols-3]=='Y') {continue};
                }

                log(tempArray);
                log("Found " + number + " horizontal " + colour + " counters in column " + col);
                addToCrossOver(col, number)

                if (number==4) {compPickComplete=true;}
                return col;
            }

            i++; //Count our iterations
        }
    }

    return -1;
}

const tryDiagonalDown = (number, colour, oneCol, enableMatters) => {

    if (oneCol==-1 && compPickComplete==true) {return -1};
    oneCol==-1 ? log("Try diagonal down looking for a line of " + number + " " + colour) : "";

    let x=0, y=0, i=0, startx=0, starty=0;

    let minCol = setMinCol(oneCol);
    let maxCol = setMaxCol(oneCol);

    for (col=minCol; col<=maxCol; col++) { //Iterate through columns

        //Do not bother to test columns we can't use
        if (colsToAvoid.includes(col)==true && enableMatters==true) {continue};
         
        let row=getFreeRow(col); //Get row of free cell
        if (row<0 || (row==0 && number==3)) {continue};

        startx = setXY(row, col, number,'diagDown')[0];
        starty = setXY(row, col, number,'diagDown')[1];

        tempArray = [];

        x=startx; y=starty;

        for (let i=0; i<totalCols; i++) { //Iterate our temp array

            if (y<col+number) {
                updateTempArray(gridArray[x][y],number);
            }

            let colourFound = (tempArray.filter(c => c == colour).length == (number-1));
            let freeFound = (tempArray.filter(c => c == "F").length == 1);

            if (colourFound && freeFound) { //Check if temp array filtered on colour is correct length

                log(tempArray);
                log("Found " + number + " diagonal down " + colour + " counters in column " + col);
                if (number==4) {compPickComplete=true;}
                addToCrossOver(col, number)
                return col;

            }

            x++; y++; //Move through the array;
            if (x>totalRows || y>totalCols) {break};
        }
    }
    return -1;
}

const tryDiagonalUp = (number, colour, oneCol, enableMatters) => {

    if (oneCol==-1 && compPickComplete==true) {return -1};
    oneCol==-1 ? log("Try diagonal up looking for a line of " + number + " " + colour) : "";

    let minCol = setMinCol(oneCol);
    let maxCol = setMaxCol(oneCol);
 
    for (col=minCol; col<=maxCol; col++) { //Iterate through columns

        //Do not bother to test columns we can't use
        if (colsToAvoid.includes(col)==true && enableMatters==true) {continue};
    
        let row=getFreeRow(col); //Get row of free cell
        if (row<0 || (row==0 && number==3)) {continue};

        startx = setXY(row, col, number,'diagUp')[0];
        starty = setXY(row, col, number,'diagUp')[1];

        tempArray = []; //Put the values in this temporary array

        let x=startx; y=starty;

        for (let i=0; i<totalCols; i++) { //Iterate our temp array

            if (y<col+number) {
                updateTempArray(gridArray[x][y],number);
            }

            let colourFound = (tempArray.filter(c => c == colour).length == (number-1));
            let freeFound = (tempArray.filter(c => c == "F").length == 1);

            if (colourFound && freeFound) { //Check if temp array filtered on colour is correct length

                log(tempArray);
                log("Found " + number + " diagonal up " + colour + " counters in column " + col);
                addToCrossOver(col, number)
                if (number==4) {compPickComplete=true;}
                return col;

            }

            //Move through the array;
            x--; y++; 
            if (x<0 || y>totalCols) {break};

        }
    }
    return -1;
}

const playSnookerMove = () => {

    if (snookeredColsY.length >=1 && compPickComplete==false) {

        //Play a snookering yellow move

        for (i=0; i<snookeredColsY.length; i++) {
            col = snookeredColsY[i]
            for (j=0; j<snookeredColsY.length; j++) {
                if (snookeredColsY[j] == col && i!=j) {
                    log("Playing snookered Y col " + col)
                    compPickComplete=true;
                    return col;
                }
            }
        }

    }
    
    if (snookeredColsR.length >=1 && compPickComplete==false)  {

        //Block a snookering red move

        for (i=0; i<snookeredColsR.length; i++) {
            col = snookeredColsR[i]
            for (j=0; j<snookeredColsR.length; j++) {
                if (snookeredColsR[j] == col && i!=j) {
                    log("Playing snookered R col " + col)
                    compPickComplete=true;
                    return col;
                }
            }
        }

    }

}

const randomMove = () => { //Keep trying until we find a free column!
    if (compPickComplete==true) {return -1};

    let computerAttempts=0;

    while(true) {
        computerAttempts++;

        if (turnsTaken<=10 && randomVar>=80) {
            col = Math.floor(Math.random() * (5 - 3) + 3);
        } else {
            col = Math.floor(Math.random() * (totalCols + 1));
        }

        if (gridArray[0][col]=="B" || gridArray[0][col]=="F") {

            if (col<=totalCols && (colsToAvoid.includes(col)==false || computerAttempts>100)) { //If we reach 100 attempts, then stop checking if we enable a win
                log("Random column picked: ",col);
                return col;
            }

        }
    }
}

const updateTempArray = (value, number) => {
    tempArray.push(value); //Add to array
    if (tempArray.length>number) { //Never let array get longer than 4
        tempArray.shift()
    };
}

const setMinCol = oneCol => oneCol==-1 ? 0 : oneCol;
const setMaxCol = oneCol => oneCol==-1 ? totalCols : oneCol;

//const totalIterations = (col,number) => Math.min(totalCols,col+number-1);

const setXY = (row, col, number, direction) => {
//Starts a maximum of 3 spots up/down and left from the free cell

    let startx = direction=='diagDown' ? row-(number-1) : row+(number-1);
    let starty=col-(number-1);

    if (direction=='diagDown') {

        while (startx<0 || starty<0) {
            startx++;
            starty++;
        }
    } else if (direction=='diagUp') {

        while (startx>totalRows || starty<0) {
            startx--;
            starty++;
        }
    
    }
    return [startx, starty];

}

const playCrossOverMove = () => {

    if (compPickComplete==true) {return;}

    let selectedCol = -1;
    let score = 0;

    for (let col=0; col<=totalCols; col++) {
        if (parseInt(crossOver[col]) > score) {
            selectedCol = col;
            score = (parseInt(crossOver[col]));
        }
    }

    log('Crossover col '+selectedCol)

    if (selectedCol>-1) {
        compPickComplete=true;
        addCounter(selectedCol);
        return col;
    } else {
        return -1;
    }
}

const addToCrossOver = (col, number) => {    
    crossOver[col] += parseInt(crossOver[col]) + number;
}