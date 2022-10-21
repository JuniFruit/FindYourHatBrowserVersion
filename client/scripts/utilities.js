
// Helper functions

import { setSize } from "./draw.js";

export const randomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}


export const removeFromArr = (arr, el) => {
    for (let i=arr.length -1; i>=0; i--) {
        if (arr[i] === el) {
            arr.splice(i,1);
        }
    }
}

// Counts the heuristics, used in A* algorithm

export const heuristics = (current, endPoint) => {
  
    let d = Math.abs(current.arrX - endPoint.arrX) + Math.abs(current.arrY - endPoint.arrY);
    
    return d;
}

export const showScaleUpMsg = async (msg, color) => {
    if (!msg) return;
    clearMessage();
    const canvasBox = document.getElementById('canvasBox');
    const text = document.createElement('h2');
    text.className = 'message scaleUpMsg'
    text.style.color = color;
    text.innerHTML = msg;
    canvasBox.append(text)
    await waitForMs(2000)
}

export const showMessage = async (msg, delay = 20) => {
    const canvasBox = document.getElementById('canvasBox');
    clearMessage();
    const letters = msg.split('');
  
    const text = document.createElement('h3');
    text.className = 'message'
    let i = 0;
    while (i < letters.length) {
        await waitForMs(delay); 
        text.append(letters[i]);
        canvasBox.append(text);
        i++
    }
  

    return;
}


export const waitForMs = (ms)  => new Promise(resolve => setTimeout(resolve, ms))

export const clearMessage = () => {
    const prevMessages = document.querySelectorAll('.message');
    prevMessages.forEach(msg => msg.remove())
}

export const disableBtns = (btns) => {    
    btns.forEach(btn => btn.disabled = true);
}

export const enableBtns = (btns) => {    
    btns.forEach(btn => btn.disabled = false);
 
}

export const handleKeyPress = (e, callbackArr) => {    
    
    if (e.srcElement !== document.body) return;

    callbackArr.forEach(callback => callback({target: {innerHTML: e.key}}));
}

export const openLegend = (e) => {
    e.preventDefault();

    const legendContainer = document.querySelector('.legend')
    legendContainer.classList.toggle('legend-active')
}

export const returnTime = () => {
    return `${new Date().getHours()}:${('0' + new Date().getMinutes()).slice(-2)}`
}

export const getQuery = () => {
    const params = new URLSearchParams(document.location.search);
    return params.get('room')
}

export const setQuery = (string) => {
    history.replaceState(null, '', `?room=${string}`)
}

export const updateScoreboard = (player, enemy) => {
    const playerScore = document.getElementById('player')
    playerScore.innerHTML = player || 0;
    const enemyScore = document.getElementById('opponent');
    enemyScore.innerHTML = enemy || 0;
}   

export const handleChatNotifications = (isNew) => { 
    const audioNotification = document.getElementById('chat-alert')
    const notification = document.querySelector('.chat-notification')
    if (isNew) {
        notification.style.transform = 'scale(1)'
        audioNotification.play();
    } else {
        notification.style.transform = 'scale(0)'
    }
}

export const setUtilMsg = () => {
    const msgBox = document.querySelector('.util-msg');
    msgBox.style.display = 'block';
    msgBox.innerHTML = 'Copy this page link by clicking here and send it to your opponent to start the game';
    msgBox.onclick = (e) => {
        navigator.clipboard.writeText(window.location.href);
        msgBox.innerHTML = 'Copied';
        setTimeout(() => {
            msgBox.style.display = 'none';
        }, 5000)
    }
}

export const resetCanvasSize = () => {
    setSize(650, 400)
}

export const countDownForElement = async (element, count) => {
    element.disabled = true;
    const prevInnerHtml = element.innerHTML;
    let current = count
    while (current > 0) {
        element.innerHTML = `${current}`;
        await waitForMs(1000);
        current--;
    }
    element.disabled = false;
    element.innerHTML = prevInnerHtml;
}

export const finishRound = async({msg, score, notice, buttonsToDisable, color}) => {
    disableBtns(buttonsToDisable);
    const {playerScore, enemyScore} = score;
    await showScaleUpMsg(msg, color);
    await showMessage(notice);
    updateScoreboard(playerScore, enemyScore);
}

export const openStats = (e) => {

    if (e.target.innerHTML === 'Tab' || e.target.innerHTML === 'Score') {
        const stats = document.querySelector('.stats');
        stats.classList.toggle('stats-active')

    } else {
        return;
    }
}

// Constants

export const CANVAS_SIZE = {
    w: Math.floor(window.innerWidth - (window.innerWidth * 0.25)),
    h: Math.floor(window.innerHeight - (window.innerHeight * 0.15))
}