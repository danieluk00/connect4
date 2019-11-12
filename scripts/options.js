//THIS FILE CONTAINS THE USER OPTIONS AND GETS/SETS COOKIES

//Get existing options from cookie
const getOptionsFromCookies = () => {

    if (checkCookie('skillLevel')) {
        slider.value = getCookie('skillLevel');
    }

    if (checkCookie('startingColour')) {
        yellowStartRadio.checked=(getCookie('startingColour')=='Y');
        redStartRadio.checked=(getCookie('startingColour')=='R');
    }

    if (checkCookie('followUpGames')) {
        alternateRadio.checked = (getCookie('followUpGames')=='Alternate');
        winnerStartsRadio.checked = (getCookie('followUpGames')=='Winner');
        loserStartsRadio.checked=(getCookie('followUpGames')=='Loser');
    }

    if (getCookie('numberOfPlayers')=='2') {
        yellowButton.innerText = "Player";
        slider.disabled=true;
        skillLevelDiv.classList.add('greyedout');
    }
}

//Expand starting options when user clicks
moreOptions.addEventListener('click', e => {

    moreOptions.classList.add('hidden'); //Hide more options link
    animateCSS(hiddenOptions,'fadeIn','show'); //Animate in additional options
    animateCSS(options,'pulse','show'); //Pulse whole options card
})

//Grey out skill slider when computer player not selected
const yellowPlayer = type => {
    yellowButton.innerHTML=`${type}`;
    slider.disabled = type=='Computer' ? false : true;

    if (type=='Computer' && skillLevelDiv.classList.contains('greyedout')) {
        skillLevelDiv.classList.remove('greyedout');
    } else if (type=='Player') {
        skillLevelDiv.classList.add('greyedout');
    }
}

const switchMode = (mode) => {

    const modeText = mode=='online' ? 'standard' : 'online'
    const elementOut = mode=='online' ? options : onlineOptions; 
    const elementIn = mode=='online' ? onlineOptions : options; 

    document.querySelector('.textlink').innerHTML=`<a href="#" onclick="switchMode('${modeText}')">Switch to ${modeText} mode</a>`
  
    elementOut.classList.add('hidden');
    animateCSS(elementIn,'rubberBand','show');

    if (mode=='online') {
        document.querySelector('.enternametext').name.focus(); //Focus cursor

        if (checkCookie('name')) {
            document.querySelector('.enternametext').name.value = getCookie('name'); //Get player name from cookie
            document.querySelector('.btn-join').disabled = false;
            document.querySelector('.btn-host').disabled = false;
        }

    }

}

const startGame = () => {
    //Get values from user option choices
    getOptionValues();

    if (onlineGame==false) {
        turn=started;
        playerTurn = !(players==1 && turn=='Y');
    } else {
        players = 2;
        started='R';
        turn=started;
        onlineGameState='active';
        playerTurn = (thisPlayer=='R')

        setTimeout(() => {
            animateCSS(chatDiv,'pulse','show');
        }, 2000);

    }

    updateCaptionText();

    //Update cookies
    setNewCookieValues();

    //Animate grid in
    onlineTextLink.classList.add('hidden');
    initialGridAnimation();

    if (playerTurn==false && onlineGame==false) {
        computerMove()
    };
}

const getOptionValues = () => {
    skillLevel=slider.value;
    players = yellowButton.textContent.trim()=='Player' ? 2 : 1; //Number of players
    alternateGames = alternateRadio.checked ? true : false; //Whether to alternate follow on games
    winnerStarts = (winnerStartsRadio.checked) ? true : false; //Whether winner starts follow on games
    started = yellowStartRadio.checked ? 'Y' : 'R' //Starting colour
}

const initialGridAnimation = () => {
    //Animate grid in
    animateCSS(options,'zoomOut');
    animateCSS(onlineOptions,'zoomOut');

    setTimeout(function() {
        animateCSS(caption,'zoomInUp','show');
        animateCSS(grid,'zoomInUp','show');
        
        options.classList.add('hidden');
        onlineOptions.classList.add('hidden');
        
        setTimeout(function() {
            gameOver = false; //Make game active
        },700)

    },250)
}

const setNewCookieValues = () => {
    //Log settings to cookies
    setCookie('numberOfPlayers',players,365);
    setCookie('skillLevel',skillLevel,365);
    setCookie('startingColour',started, 365);

    if (alternateGames==true) {
        setCookie('followUpGames',"Alternate",365);
    } else {
        winnerStarts==true ? setCookie('followUpGames',"Winner",365) : setCookie('followUpGames',"Loser",365);
    };
}

//Get existing cookie
const getCookie = cname => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
//Check if cookie exists
const checkCookie = cname => {
    if (getCookie(cname)=="") {return false;}
    else {return true;}
}  

//Set new cookie
  const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }