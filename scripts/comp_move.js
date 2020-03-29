//THIS FILE CONTAINS THE COMPUTER PLAYER LOGIC

let compPicked=-1, compPickComplete=false, colsToAvoid=[], snookeredCols=[], randomVar, minValue, tempArray=[];
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

    snookeredCols=[];
    for (let col=0; col<=totalCols; col++) { //For each column...

        let row=getFreeRow(col);
        if (row<0) {continue};

        //Test change
        setGridArray(row,col,"Y");
        setGridArray(row-1,col,"F");

        //See if 4 reds is possible in any direction

        for (coli=0; coli<totalCols; coli++) {
            if (tryHorizontal(4,"Y",coli,false) >-1) {
                addSnookeredCol(col)
            }
        }
        for (coli=0; coli<totalCols; coli++) {
            if (tryVertical(4,"Y",coli,false) >-1) {
                addSnookeredCol(col)
            }
        }
        for (coli=0; coli<totalCols; coli++) {
            if (tryDiagonalUp(4,"Y",coli,false) >-1) {
                addSnookeredCol(col)
            }
        }
        for (coli=0; coli<totalCols; coli++) {
            if (tryDiagonalDown(4,"Y",coli,false) >-1) {
                addSnookeredCol(col)
            }
        }

        //Undo the test change
        setGridArray(row,col,"F");
        setGridArray(row-1,col,"B");
    }

    if (snookeredCols.length>0) {log("Possible snookered cols: "+snookeredCols)};
    return snookeredCols;
}

const addSnookeredCol = col => {
    col>=0 && colsToAvoid.includes(col)==false ? snookeredCols.push(col) : "";
}

const computerMove = () => {
    log("Running through computer moves");

    //Choose how good a move the computer will make (generates a random % (weighted by skill)
    minValue = parseInt(skillLevel-1) * 50;
    randomVar= Math.floor(Math.random() * (100 - minValue)) + minValue;
    log("Comp random skill value: "+randomVar);

    //Create array of columns to avoid
    colsToAvoid = randomVar==100 ? findColsToAvoid() : [];
    snookeredCols = snookered()
    compPicked==-1, compPickComplete=false;

    setTimeout(function() {

        //Try for yellow win
        if (randomVar>=20) {tryStandard(4,"Y",-1,false)};
        if (randomVar>=30) {tryDiagonals(4,"Y",-1,false)};
        //Try for block
        if (randomVar>=20) {tryStandard(4,"R",-1,false)};
        if (randomVar>=40) {tryDiagonals(4,"R",-1,false)};

        if (randomVar>=100) {
            playSnookerMove()
        };

        //Look for 2 in a row
        if (randomVar>=50) {
            ['R','Y'].forEach((colour)=>{
                tryStandard(3,colour,-1,true);
                tryDiagonals(3,colour,-1,true)
            });
        };

        //tryStandard(2,"Y",-1,true)

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
        if (row<0) {continue};

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
            compPickComplete=true;
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
                log(tempArray);
                log("Found " + number + " horizontal " + colour + " counters in column " + col);
                compPickComplete=true;
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
        if (row<0) {continue};

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
                compPickComplete=true;
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
        if (row<0) {continue};

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
                compPickComplete=true;
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
    if (snookeredCols.length <=1 || compPickComplete==true) {return;}

    for (i=0; i<snookeredCols.length; i++) {
        col = snookeredCols[i]
        for (j=0; j<snookeredCols.length; j++) {
            if (snookeredCols[j] == col && i!=j) {
                log("Playing snookered col " + col)
                compPickComplete=true;
                return col;
            }
        }
    }
}

const randomMove = () => { //Keep trying until we find a free column!
    if (compPickComplete==true) {return -1};

    let computerAttempts=0

    while(true) {
        computerAttempts++;

        if (movesTaken<=6) {
            col = Math.floor(Math.random() * (4 - 3) + 3);
        } else if (computerAttempts<=25) {
            col = Math.floor(Math.random() * (5 - 2) + 2);
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