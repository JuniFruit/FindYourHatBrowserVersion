import { clearCanvas, setSize } from '../draw.js';
import { Field } from '../game.js';
import {
    clearMessage,
    showMessage,
    enableBtns,
    disableBtns,
    CANVAS_SIZE,
    handleKeyPress,
    openLegend,
    getQuery,
    setQuery,
    updateMultiplayerScore,
    handleChatNotifications,
    setUtilMsg
} from '../utilities.js';

import { receiveMessage, sendMessage } from './chat.js';

//DOM

const moveButtons = document.querySelectorAll('#move-button');
const startButton = document.getElementById('enter-button')
const form = document.querySelector('.chat-inputs');
const chatBtn = document.getElementById('chat');
const helpBtn = document.getElementById('help');
const exitBtn = document.getElementById('exit');
const spinner = document.querySelector('.spinner');
const scoreBtn = document.getElementById('score');

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
        startButton.disabled = true
        createField(field);
    })

    ioClient.on('message', async (data) => {

        const { type, payload, room } = data;

        switch (type) {
            case SERVER.MESSAGE.WAITING_FOR_USER:
                clearCanvas();
                updateMultiplayerScore(0, 0)
                setUtilMsg();
                disableBtns(moveButtons);
                await showMessage(payload);
                startButton.innerHTML = 'Waiting for a player';
                startButton.disabled = true;
                spinner.style.display = 'block';
                setQuery(room);
                break;
            case SERVER.MESSAGE.READY_TO_START:
                spinner.style.display = 'none'
                setQuery('')
                startButton.innerHTML = 'Game in progress'
                startButton.disabled = true
                enableBtns(moveButtons);
                start()
                break;

            case SERVER.MESSAGE.ROUND_LOST:
                disableBtns(moveButtons)
                clearCanvas();
                await showMessage(payload.notice + '. Waiting for opponent to restart');
                startButton.disabled = true
                updateMultiplayerScore(payload.score, payload.enemyScore)
                break;
            case SERVER.MESSAGE.ROUND_WON:
                clearCanvas();
                disableBtns(moveButtons)
                await showMessage(payload.notice);
                startButton.innerHTML = 'Restart'
                startButton.disabled = false
                updateMultiplayerScore(payload.score, payload.enemyScore)                
                break;
            case SERVER.MESSAGE.OPPONENT_LEFT:
                clearCanvas();
                startButton.style.display = 'none'
                showMessage(payload);
                disableBtns(moveButtons);
                break;           
            case SERVER.MESSAGE.NO_ROOM_FOUND:
                await showMessage(payload);
                break;
            case SERVER.MESSAGE.OBSERVER_NEW_CONNECTION:
                setObserver()
                start();
                break;
            case SERVER.MESSAGE.OBSERVER_UPDATE_GAME:
                clearCanvas();
                await showMessage(payload.notice);
                startButton.disabled = true;
                updateMultiplayerScore(payload.score, payload.enemyScore);
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

    window.onbeforeunload = (e) => {
        ioClient.disconnect(true);

    }


}

init();



// Handlers

const createField = (serverField) => {
    game = new Field({ size: SIZE, isMultiplayer: true });
    setSize(CANVAS_SIZE.w, CANVAS_SIZE.h);
    game.convertToField(serverField);
    game.print();
    enableBtns(moveButtons);
}

const start = () => {

    ioClient.emit('generate');
}



const handleMove = (e) => {
    const moveBtn = document.querySelector('#move-button');
    if (moveBtn.disabled || moveBtn.style.display === 'none') return;

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

const openStats = (e) => {

    if (e.target.innerHTML === 'Tab' || e.target.innerHTML === 'Score') {
        const stats = document.querySelector('.stats');
        stats.classList.toggle('stats-active')

    } else {
        return;
    }
}

const setObserver = () => {
    moveButtons.forEach(btn => {
        btn.style.display = 'none';

        console.log(btn)
    })
    startButton.innerHTML = 'Watching ongoing game'
    startButton.disabled = true;
    chatBtn.style.display = 'none';

    const playerScoreHeader = document.querySelector('.playerStats-header')
    const opponentScoreHeader = document.querySelector('.opponentStats-header');
    playerScoreHeader.innerHTML = 'Player 1';
    opponentScoreHeader.innerHTML = 'Player 2';
    setObserverLegend();
}

const setObserverLegend = () => {
    const youDesc = document.querySelector('.you').nextElementSibling;
    youDesc.innerHTML = 'Player 1';
    console.log(youDesc)
    const trailDesc = document.querySelector('.trail').nextElementSibling;
    trailDesc.innerHTML = 'Player 1 trail';
    const opponentDesc = document.querySelector('.opponent').nextElementSibling;
    opponentDesc.innerHTML = 'Player 2';
    const opponentTrailDesc = document.querySelector('.opponent-trail').nextElementSibling;
    opponentTrailDesc.innerHTML = 'Player 2 trail';
    const overlayDesc = document.querySelector('.overlay').nextElementSibling;
    overlayDesc.innerHTML = 'Both players at the same position'; 
}

// Listeners

moveButtons.forEach(btn => btn.onclick = handleMove);
startButton.onclick = start;

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
helpBtn.onclick = openLegend;
exitBtn.onclick = () => window.location.href = MAIN_PAGE;
window.onkeydown = (e) => handleKeyPress(e, [handleMove, openStats]);
scoreBtn.onclick = openStats;

