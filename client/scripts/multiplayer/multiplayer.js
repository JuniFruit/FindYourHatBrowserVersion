import { clearCanvas, setSize } from '../draw.js';
import { Field } from '../game.js';
import {
    clearMessage,
    showMessage,
    handleKeyPress,
    openLegend,
    getQuery,
    setQuery,
    updateScoreboard,
    handleChatNotifications,
    setUtilMsg,
    resetCanvasSize,
    countDownForElement,
    finishRound,
    openStats,
    checkIsMobile,
    setMobile,
    disableBtns,
    getCanvaseSize,
    preventDoubleTap
} from '../utilities.js';

import { receiveMessage, sendMessage } from './chat.js';

//DOM

const startButton = document.getElementById('enter-button')
const form = document.querySelector('.chat-inputs');
const chatBtn = document.getElementById('chat');
const helpBtn = document.getElementById('help');
const exitBtn = document.getElementById('exit');
const spinner = document.querySelector('.spinner');
const scoreBtn = document.getElementById('score');
const utilMsg = document.querySelector('.util-msg')
const moveButtons = document.querySelectorAll('#move-button')
const mobileRestart = document.querySelector('.mobile-restart')

if (checkIsMobile()) startButton.style.display = 'none';

//Constants

const MAIN_PAGE = 'https://findyourhat2.herokuapp.com/';
const SIZE = 30;

let ioClient = null;
let game;

//Socket logic

const init = () => {

    if (ioClient) {
        ioClient.disconnect();
    }

    ioClient = io()

    ioClient.emit('access-room', (getQuery()))

    ioClient.on('field-return', field => {
        clearMessage();
        disableBtns([startButton, mobileRestart])
        createField(field);
    })

    ioClient.on('message', async (data) => {

        const { type, payload, room } = data;

        switch (type) {
            case SERVER.MESSAGE.WAITING_FOR_USER:
                clearCanvas();
                updateScoreboard(0, 0)
                setUtilMsg();
                resetCanvasSize();
                await showMessage(payload);
                game = null;
                startButton.innerHTML = 'Waiting for a player';
                disableBtns([startButton, mobileRestart])
                spinner.style.display = 'block';
                setQuery(room);
                break;
            case SERVER.MESSAGE.READY_TO_START:
                spinner.style.display = 'none'
                utilMsg.innerHTML = '';
                setQuery('')
                startButton.innerHTML = 'Restart'
                disableBtns([startButton, mobileRestart])
                start()
                break;

            case SERVER.MESSAGE.ROUND_LOST:
                clearCanvas();
                game.isOver = true
                finishRound({
                    msg: `You've Lost!`,
                    score: { playerScore: payload.score, enemyScore: payload.enemyScore },
                    notice: payload.notice + '. Waiting for opponent to restart',
                    buttonsToDisable: [startButton, mobileRestart],
                    color: 'red'
                })

                break;
            case SERVER.MESSAGE.ROUND_WON:
                clearCanvas();
                game.isOver = true
                finishRound({
                    msg: `You've Won!`,
                    score: { playerScore: payload.score, enemyScore: payload.enemyScore },
                    notice: payload.notice + '. Press Restart to continue',
                    color: 'blue'
                })
                if (checkIsMobile()) return countDownForElement(mobileRestart, 5);

                countDownForElement(startButton, 5);

                break;
            case SERVER.MESSAGE.OPPONENT_LEFT:
                clearCanvas();
                game.isOver = true;
                startButton.style.display = 'none'
                showMessage(payload);

                break;
            case SERVER.MESSAGE.NO_ROOM_FOUND:
                await showMessage(payload);
                startButton.style.display = 'none';
                break;
            case SERVER.MESSAGE.OBSERVER_NEW_CONNECTION:
                setObserver()
                start();
                break;
            case SERVER.MESSAGE.OBSERVER_UPDATE_GAME:
                clearCanvas();
                await showMessage(payload.notice);
                updateScoreboard(payload.score, payload.enemyScore);
                break;


        }

    })

    ioClient.on('move', (data) => {
        const { type, payload } = data;

        switch (type) {
            case SERVER.PLAYER_TYPE.PLAYER:
                receiveMove(payload)
                break;
            case SERVER.PLAYER_TYPE.OBSERVER:
                receiveObserverMoves(payload.p1Pos, payload.p2Pos);
                break;
        }
    })

    ioClient.on('message-chat', (msg) => {
        const { type, payload } = msg;

        switch (type) {
            case SERVER.CHAT.NEW_CONNECTION:
                receiveMessage(payload);
                break;
            case CLIENT.MESSAGE.NEW_MESSAGE:
                receiveMessage(payload);
                break;
        }
    })

    //Errors


    ioClient.on("connect_error", async () => {
        clearCanvas();

        disableBtns([startButton, mobileRestart]);
        await showMessage('Lost connection to the server. Trying to establish a new connection')
        setTimeout(() => {
            socket.connect();
        }, 1000);
    });

    //Close before leaving the page

    window.onbeforeunload = (e) => {
        ioClient.disconnect(true);

    }


}

init();



// Handlers

const createField = (serverField) => {
    game = new Field({ size: SIZE, isMultiplayer: true });
    setSize(getCanvaseSize());
    game.convertToField(serverField);
    game.print();

}

const start = () => {

    ioClient.emit('generate');
}



const handleMove = (e) => {
    if (game.isOver || !game) return;

    game.moveAround(e.target.innerHTML.toLowerCase());
    game.print();

    sendMove({ x: game.posVert, y: game.posHor });
}

const sendMove = (data) => {
    ioClient.emit('move', data);
}

const receiveMove = (move) => {
    game.receiveOpponentsPos(move);
    game.print();

}

const receiveObserverMoves = (pos1, pos2) => {
    game.receiveCurrentPos(pos1);
    game.receiveOpponentsPos(pos2);
    game.print();
}




const setObserver = () => {
    startButton.innerHTML = 'Watching ongoing game'
    disableBtns([startButton, mobileRestart]);
    chatBtn.style.display = 'none';
    document.querySelector('.mobile-buttons').style.display = 'none';
    const playerScoreHeader = document.querySelector('.playerStats-header')
    const opponentScoreHeader = document.querySelector('.opponentStats-header');
    playerScoreHeader.innerHTML = 'Player 1';
    opponentScoreHeader.innerHTML = 'Player 2';
    setObserverLegend();
}

const setObserverLegend = () => {
    const youDesc = document.querySelector('.you').nextElementSibling;
    youDesc.innerHTML = 'Player 1';
    const trailDesc = document.querySelector('.trail').nextElementSibling;
    trailDesc.innerHTML = 'Player 1 trail';
    const opponentDesc = document.querySelector('.opponent').nextElementSibling;
    opponentDesc.innerHTML = 'Player 2';
    const opponentTrailDesc = document.querySelector('.opponent-trail').nextElementSibling;
    opponentTrailDesc.innerHTML = 'Player 2 trail';
    const overlayDesc = document.querySelector('.overlay').nextElementSibling;
    overlayDesc.innerHTML = 'Both players at the same position';
    document.querySelector('.moving').remove();
}


// Listeners

moveButtons.forEach(btn => btn.onclick = handleMove)

startButton.onclick = start;
mobileRestart.onclick = start;

form.onsubmit = (e) => {
    e.preventDefault();
    sendMessage(ioClient)
};

chatBtn.onclick = (e) => {
    e.preventDefault();
    const chatContainer = document.querySelector('.chat');
    chatContainer.classList.toggle('chat-active')
    handleChatNotifications(false);
}

window.onload = () => {
    if (checkIsMobile()) setMobile();
    // moveButtons.forEach(btn => preventDoubleTap(btn))
};
helpBtn.onclick = openLegend;
exitBtn.onclick = () => window.location.href = MAIN_PAGE;
window.onkeydown = (e) => handleKeyPress(e, [handleMove, openStats]);
scoreBtn.onclick = openStats;
