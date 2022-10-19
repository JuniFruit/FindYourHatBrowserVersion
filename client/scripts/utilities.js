
// Helper functions

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
  
    let d = Math.abs(current.vert - endPoint.vert) + Math.abs(current.hor - endPoint.hor);
    
    return d;
}

export const showMessage = async (msg, delay = 20) => {
    const canvasBox = document.getElementById('canvasBox');
    clearMessage();
    const letters = msg.split('');
  
    const text = document.createElement('h3');
    text.className = 'message'
    let i = 0;
    document.querySelectorAll('.operation-button').forEach(btn => btn.disabled = true)
    while (i < letters.length) {
        await waitForMs(delay); 
        text.append(letters[i]);
        canvasBox.append(text);
        i++
    }
    document.querySelectorAll('.operation-button').forEach(btn => btn.disabled = false)

    return;
}


const waitForMs = (ms)  => new Promise(resolve => setTimeout(resolve, ms))

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
    console.log(params)
    return params.get('room')
}

export const setQuery = (string) => {
    history.replaceState(null, '', `?room=${string}`)
}

export const updateMultiplayerScore = (player, enemy) => {
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
        console.log(audioNotification)
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

// Constants

export const CANVAS_SIZE = {
    w: 750,
    h: 450
}