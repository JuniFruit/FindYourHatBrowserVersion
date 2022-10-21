import { Field } from "./game.js";
import { clearCanvas, setSize } from "./draw.js";
import {
    clearMessage,
    showMessage,
    CANVAS_SIZE,
    handleKeyPress,
    openLegend,
    resetCanvasSize,
    countDownForElement,
    finishRound,
    openStats,
    disableBtns,
    checkIsMobile,
    setMobile,
    preventDoubleTap
} from "./utilities.js";

const enterButton = document.getElementById('enter-button');
const settingsContainer = document.getElementById('settings');
const restartButton = document.getElementById('restart-button')
const operationButtons = document.querySelectorAll('.operation-button');
const helpBtn = document.getElementById('help');
const multiplayerBtn = document.getElementById('multiplayer-button');
const scoreBtn = document.getElementById('score');
const moveButtons = document.querySelectorAll('#move-button');

window.onload = () => {
    if (checkIsMobile()) {
        setMobile();
        preventDoubleTap(document.querySelector('.mobile-buttons'));
    };
    showMessage('Hello, visitor! To start a game, enter the size of the field.')
};

let game;
let SIZE = null;
let DIFFICULTY = null;

const initGame = () => {
    grabInputs();
    if (!SIZE) return showMessage('Enter the size of the field');
    if (Number(SIZE) > 40 || Number(SIZE) < 10) return showMessage('Possible size is between 10 and 40 units');

    setSize(CANVAS_SIZE.w, CANVAS_SIZE.h)
    game = new Field({ size: Number(SIZE), difficulty: Number(DIFFICULTY) });
    settingsContainer.style.display = 'none';
    restartButton.style.display = 'block';
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
    e.preventDefault();
    if (game.isOver || !game) return;
    const message = game.moveAround(e.target.innerHTML.toLowerCase());

    if (message) {
        clearCanvas();
        game.isOver = true;
        finishRound({
            score: { playerScore: game.playerScore, enemyScore: game.AIscore },
            notice: message + ' Press Restart to continue'
        })
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
    disableBtns([restartButton])
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


