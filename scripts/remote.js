//THIS FILE LETS MOVES BE PLAYED REMOTELY

//Enter your name
document.querySelector('.enternametext').addEventListener('keyup', () => {

    //Enable/disable host and join buttons if name is entered
    let btnDisabled = document.querySelector('.enternametext').name.value.trim()==""
    document.querySelector('.btn-join').disabled = btnDisabled;
    document.querySelector('.btn-host').disabled = btnDisabled;
});

//Prevent hitting enter
document.querySelector('.enternametext').addEventListener('submit', e => {
    e.preventDefault();
})

//Set name variable and add to cookie
const setName = name => {
    yourName = name;
    setCookie('name',name,365);
}

//Host game clicked
const hostGame = () => {
    //Generate and show host code
    hostCode = (Math.floor(Math.random() * (999999 + 1))).toString();
    document.querySelector('.hostcodetext').innerHTML = `${hostCode}`;

    createListener();
    chatListener();
    startingOnlineVariables();

    setName(document.querySelector('.enternametext').name.value.trim())
    onlineRole='host';
    thisPlayer='R';
    document.querySelector('.hostcode').classList.remove('hidden');

    //Save to Firebase
    setOnlineStatus('host');
}

//Join game clicked
const joinGame = () => {
    startingOnlineVariables()

    setName(document.querySelector('.enternametext').name.value.trim())
    onlineRole='join';
    thisPlayer='Y';
    document.querySelector('.joincode').classList.remove('hidden');
    document.querySelector('.joincodetext').code.focus();
};

const startingOnlineVariables = () => {
    onlineGame=true;
    onlineGameState='loading';
    document.querySelector('.hostorjoin').classList.add('hidden');
    document.querySelector('.textlink').classList.add('hidden');
    animateCSS(onlineOptions,'pulse','show');
}

//When join code has been entered
const joinCodeEntered = () => {

    hostCode = document.querySelector('.joincodetext').code.value.toString();

    createListener();
    chatListener();
    checkValidHostCode(hostCode);
}

document.querySelector('.joincodetext').addEventListener('submit', e => {
    e.preventDefault();
    joinCodeEntered();
})

//Checks hostcode entered is valid or not
const checkValidHostCode = hostCode => {
    let hostMatched=false;

    db.collection('connect4').get().then((snapshot) => {

        snapshot.docs.forEach(doc => {
            if (doc.id == hostCode+'host') {
                hostMatched = true;
            }
        })

        if (hostMatched) {
            hostCode = document.querySelector('.joincodetext').code.value;
            log('Join code entered: ' + hostCode);
            setOnlineStatus('join');
        } else {
            animateCSS(document.querySelector('.joininputbox'),'shake','show')
        }
    })
}

//Sets join/host status in firebase
const setOnlineStatus = (actionType) => {

    if (callCount<250 && onlineGame==true) {

        playerName = (actionType==onlineRole) ? yourName : "";

        object = {
            actionType,
            playerName,
            roundNumber
        }

        db.collection("connect4").doc(hostCode + actionType).set(object).then(() => {
            callCount++;
        })
    }
}

//Adds move in firebase
const setOnlineColumn = col => {

    if (onlineGame==true && turn==thisPlayer && callCount<250) {

        const now = new Date();
        const object = {
            column: col,
            turn: turn,
        }

        db.collection("connect4").doc(hostCode+'move').set(object).then(() => {
            callCount++;
        })
    }
}

const createListener = () => {
    log('Creating listener for remote changes')

    //Listener for db changes
    const unsub = db.collection('connect4').onSnapshot(snapshot => {

        snapshot.docChanges().forEach(change => {
            const changeData = change.doc.data();

            //Start game once joining player has connected
            if (change.type==='added' || change.type==='modified') {
                if(change.doc.id==(hostCode+'join')) {
                    log('Join connected');
                    joinEvent=true;
                    onlineRole=='host' && opponentName=="" ? opponentName=change.doc.data().playerName : "";
                };
                if (change.doc.id==(hostCode+'host')) {
                    log('Host connected');
                    hostEvent=true;
                    onlineRole=='join' && opponentName=="" ? opponentName=change.doc.data().playerName : "";
                };
                if (onlineGameState=='active' && change.doc.id==(hostCode+'move') && changeData.turn==turn) {
                    let col=changeData.column;
                    deleteDoc('connect4',change.doc.id);
                    addCounter(col);
                };
            };

            if (joinEvent && hostEvent) {
                log('Both players connected');

                if (document.querySelector('.body').classList.contains('waiting')) {
                    document.querySelector('.body').classList.remove('waiting');
                }
    
                title.textContent='Connect 4';
                onlineGameState=='active';
                joinEvent=false;
                hostEvent=false;
                gameOver=false;

                roundNumber==1 ? startGame() : updateCaptionText();
            }

        });

    });
}

const chatListener = () => {

    db.collection('connect4chats')
        .where('hostCode','==',hostCode)
        .orderBy('created_at')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type=="added" && change.doc.data().colour!=thisPlayer) {
                    if (chatInner.classList.contains('hidden')) {
                        toggleChat('Expand');
                    }

                    updateChat(change.doc.data().name, change.doc.data().colour, change.doc.data().message);
                    deleteDoc('connect4chats',change.doc.id)
                
                }
        })
    })

}

document.querySelector('.chat-input').addEventListener('submit', e => {
    e.preventDefault();
})

chatForm.addEventListener('submit', e => {

    e.preventDefault();
    let message = document.querySelector(".chat-form").message.value.trim();

    if (message=="") {
        return;
    }

    let now = new Date();

    let object = {
        name: yourName,
        colour: thisPlayer,
        hostCode,
        message,
        created_at: firebase.firestore.Timestamp.fromDate(now)
    }
    
    db.collection("connect4chats").add(object).then(() => {
        chatForm.message.value="";
    })

    updateChat(playerName,thisPlayer,message);

})


const updateChat = (playerName, colour, message) => {

    let colourClass = colour=='R' ? 'chat-red' : 'chat-yellow';

    messages.innerHTML +=`
    <div class="chat-display">
        <div class="chat-name ${colourClass}">${playerName}:</div>
        <div class="chat-message">${message}</div>
    </div>
    `
    messages.scrollTop = messages.scrollHeight;

}

//Delete from firebase
const deleteDoc = (collectionName, id) => db.collection(collectionName).doc(id).delete();

//After first move, delete the host and join docs from Firebase
const deleteJoinHostDocs = () => {
    deleteDoc('connect4',hostCode+'join');
    deleteDoc('connect4',hostCode+'host');
}

//Open/close chat when icon clicked
document.querySelector('.chat-icon').addEventListener('click', e => chatInner.classList.contains('hidden') ? toggleChat('Expand') : toggleChat('Collapse'))

const toggleChat = (type) => {

    type=='Expand' ? chatInner.classList.remove('hidden') : chatInner.classList.add('hidden');
    animateCSS(chatDiv,'pulse');
}