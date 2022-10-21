import { Field } from "./game.js";
import { clearCanvas, setSize } from "./draw.js";
import {
    clearMessage,
    showMessage,
    handleKeyPress,
    openLegend,
    resetCanvasSize,
    countDownForElement,
    finishRound,
    openStats,
    disableBtns,
    checkIsMobile,
    setMobile,
    preventDoubleTap,
    getCanvaseSize
} from "./utilities.js";

const enterButton = document.getElementById('enter-button');
const settingsContainer = document.getElementById('settings');
const restartButton = document.getElementById('restart-button')
const operationButtons = document.querySelectorAll('.operation-button');
const helpBtn = document.getElementById('help');
const multiplayerBtn = document.getElementById('multiplayer-button');
const scoreBtn = document.getElementById('score');
const moveButtons = document.querySelectorAll('#move-button');
const mobileRestart = document.querySelector('.mobile-restart')


let game;
let SIZE = null;
let DIFFICULTY = null;

const initGame = () => {
    grabInputs();
    if (!SIZE) return showMessage('Enter the size of the field');
    if (Number(SIZE) > 40 || Number(SIZE) < 10) return showMessage('Possible size is between 10 and 40 units');

    setSize(getCanvaseSize())
    game = new Field({ size: Number(SIZE), difficulty: Number(DIFFICULTY) });
    settingsContainer.style.display = 'none';
    if (!checkIsMobile()) restartButton.style.display = 'block';
    console.log(mobileRestart)
    enterButton.innerHTML = 'Exit';
    multiplayerBtn.style.display = 'none';
    scoreBtn.style.display = 'block'
    startGame();
}

const grabInputs = () => {
    SIZE = document.getElementById('inputSize').value;
    DIFFICULTY = document.querySelector('input[name="difficulty"]:checked').value;

}

const redirectToMultiplayer = () => {
    window.location.href = `${window.location.href}multiplayer-page.html`;
}

const handleMove = (e) => {
    // e.preventDefault();
    if (game.isOver || !game) return;
    const message = game.moveAround(e.target.innerHTML.toLowerCase());

    if (message) {
        clearCanvas();
        game.isOver = true;
        finishRound({
            score: { playerScore: game.playerScore, enemyScore: game.AIscore },
            notice: message + ' Press Restart to continue'
        })
        if (checkIsMobile()) return countDownForElement(mobileRestart, 3);
        countDownForElement(restartButton, 3)
    }

}

const exitGame = () => {
    enterButton.innerHTML = 'Solo';
    settingsContainer.style.display = 'block'
    restartButton.style.display = 'none';
    multiplayerBtn.style.display = 'block';
    scoreBtn.style.display = 'none';
    resetCanvasSize();
    game = null;
}

const startGame = () => {
    disableBtns([restartButton, mobileRestart])
    game.isOver = false;
    game.gameInit();

    animate();

}


const handleGame = (e) => {
    clearCanvas();
    clearMessage();

    switch (e.target.innerHTML) {
        case 'Solo':
            initGame()
            break;
        case 'Exit':
            exitGame();
            break;
        case 'Restart':
            startGame();
            break;
        case 'Multiplayer':
            redirectToMultiplayer();
            break;
    }
}


const animate = () => {
    if (!game) return;
    if ((game.opponentPosVert === game.endPosVert) && (game.opponentPosHor === game.endPosHor)) {
        clearCanvas();
        game.AIscore++;
        game.isOver = true;
        finishRound({
            msg: `You've Lost!`,
            score: { playerScore: game.playerScore, enemyScore: game.AIscore },
            notice: 'Press Restart to continue',
            color: 'red'
        })
        if (checkIsMobile()) return countDownForElement(mobileRestart, 3);
        countDownForElement(restartButton, 3);
        return;
    }
    if (game.isOver) return;
    window.requestAnimationFrame(animate);
    game.frames++;
    game.animatePathAI();
    game.print();
}



moveButtons.forEach(btn => btn.onclick = handleMove);
operationButtons.forEach(btn => btn.onclick = handleGame);
window.onkeydown = (e) => handleKeyPress(e, [handleMove])
helpBtn.onclick = openLegend
scoreBtn.onclick = openStats;
window.onload = () => {
    if (checkIsMobile()) {
        setMobile();
        // moveButtons.forEach(btn => preventDoubleTap(btn))
        
    };
    showMessage('Hello, visitor! To start a game, enter the size of the field.')
};

