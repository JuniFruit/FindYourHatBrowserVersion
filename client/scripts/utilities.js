import { setSize } from "./draw.js";


export const checkIsMobile = () => {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    const isMobBrowser = toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
    return (window.innerWidth <= 768) || isMobBrowser
}

export const getCanvaseSize = () => {
    return {
        w: checkIsMobile() ? Math.floor(window.innerWidth) : Math.floor(window.innerWidth - (window.innerWidth * 0.25)),
        h: checkIsMobile() ? 365 : Math.floor(window.innerHeight - (window.innerHeight * 0.15))
    }
}

// Helper functions

export const preventDoubleTap = (element) => {

    let doubleTouchStartTimestamp = 0;
    element.addEventListener("touchstart", function (event) {
        let now = +(new Date());
        if (doubleTouchStartTimestamp + 50 > now) {
            event.preventDefault();
        };
        doubleTouchStartTimestamp = now;
    });
}


export const randomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}




export const setMobile = () => {
    document.querySelector('.mobile-buttons').style.display = 'flex';
    document.querySelector('.moving').style.display = 'none';
    const canvasBox = document.querySelector('#canvasBox')
    const { w, h } = getCanvaseSize();
    document.documentElement.style.setProperty('--canvasHeight', `${h}px`);
    document.documentElement.style.setProperty('--canvasWidth', '100%');
    // canvasBox.style.width = w;
    // canvasBox.style.height = h;
}

//Gets coordinates from predefined set

export const getCoordinates = (maxSize) => {
    const possiblePlaces = [{ x: 0, y: 0 },
    { x: maxSize - 1, y: 0 },
    { x: 0, y: maxSize - 1 },
    { x: maxSize - 1, y: maxSize - 1 },
    { x: Math.floor(maxSize / 2), y: Math.floor(maxSize / 2) }];

    possiblePlaces.sort(() => 0.5 - Math.random());
    return [possiblePlaces[0], possiblePlaces[1]]
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


export const waitForMs = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const clearMessage = () => {
    const prevMessages = document.querySelectorAll('.message');
    prevMessages.forEach(msg => msg.remove())
}

export const disableBtns = (btns) => {
    btns.forEach(btn => {
        if (!btn) return;
        btn.disabled = true
    });
}

export const enableBtns = (btns) => {
    btns.forEach(btn => {
        if (!btn) return;
        btn.disabled = false
    });

}

export const handleKeyPress = (e, callbackArr) => {

    if (e.srcElement !== document.body) return;

    callbackArr.forEach(callback => callback({ target: { innerHTML: e.key } }));
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

export const finishRound = async ({ msg, score, notice, buttonsToDisable = [], color }) => {
    disableBtns(buttonsToDisable);
    const { playerScore, enemyScore } = score;
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

