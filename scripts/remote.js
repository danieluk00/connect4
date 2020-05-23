//THIS FILE LETS MOVES BE PLAYED REMOTELY
let hostDocId = null;
let joinDocId = null;

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

    db.collection("connect4")
    .where('id', "==",  hostCode)
    .where('type', "==",  'host')
    .onSnapshot(function(querySnapshot) {
        if (querySnapshot.docs.length>0) {
            hostMatched = true; 
            hostDocId = querySnapshot.docs[0].id
        }

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
            id: hostCode,
            type: actionType,
            actionType,
            playerName,
            roundNumber
        }

        db.collection("connect4").doc().set(object).then(() => {
            callCount++;
        })
    }
}

//Adds move in firebase
const setOnlineColumn = col => {

    if (onlineGame==true && turn==thisPlayer && callCount<250) {

        //const now = new Date();
        const object = {
            id: hostCode,
            type: 'move',
            column: col,
            turn: turn,
        }

        db.collection("connect4").doc().set(object).then(() => {
            callCount++;
        })
    }
}

const createListener = () => {
    log('Creating listener for remote changes')

    //Listener for db changes
    db.collection('connect4')
    .where('id','==',hostCode)
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {

            if (change.type==='added' || change.type==='modified') {
                if(change.doc.data().type=='join') {
                    log('Join connected');
                    joinEvent=true;
                    joinDocId = change.id
                    onlineRole=='host' && opponentName=="" ? opponentName=change.doc.data().playerName : "";
                    if (onlineRole=='host') {
                        deleteDoc(change.doc.id);
                    }
                };
                if (change.doc.data().type=='host') {
                    log('Host connected');
                    hostEvent=true;
                    onlineRole=='join' && opponentName=="" ? opponentName=change.doc.data().playerName : "";
                    if (onlineRole=='join') {
                        deleteDoc(change.doc.id);
                    }
                };
                if (onlineGameState=='active' && change.doc.data().type=='move' && change.doc.data().turn==turn) {
                    let col=change.doc.data().column;
                    deleteDoc(change.doc.id);
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
        })

    })
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
                    deleteChatDoc(change.doc.id)
                
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
const deleteDoc = (id) => db.collection('connect4').doc(id).delete();
const deleteChatDoc = (id) => db.collection('connect4chats').doc(id).delete();

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