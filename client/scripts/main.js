import { Field } from "./game.js";
import { clearCanvas, setSize } from "./draw.js";
import { clearMessage, showMessage, CANVAS_SIZE, handleKeyPress, openLegend, resetCanvasSize, countDownForElement } from "./utilities.js";

const enterButton = document.getElementById('enter-button');
const moveButtons = document.querySelectorAll('#move-button');
const settingsContainer = document.getElementById('settings');
const restartButton = document.getElementById('restart-button')
const operationButtons = document.querySelectorAll('.operation-button');
const helpBtn = document.getElementById('help');
const multiplayerBtn = document.getElementById('multiplayer-button')

window.onload = () => showMessage('Hello, visitor! To start a game, enter your name and size of the field.');

let game;
let NAME = null;
let SIZE = null;
let DIFFICULTY = null;

const startGame = async () => {
    grabInputs();

    if (!NAME || !SIZE) return showMessage('Enter your name and size of the field');
    if (Number(SIZE) > 30 || Number(SIZE) < 5) return showMessage('Possible size is between 5 and 30 units');
    moveButtons.forEach(btn => btn.disabled = false)

    setSize(CANVAS_SIZE.w, CANVAS_SIZE.h)
    game = new Field({ name: NAME, size: Number(SIZE), difficulty: Number(DIFFICULTY) });

    settingsContainer.style.display = 'none';
    restartButton.style.display = 'block';
    enterButton.innerHTML = 'Exit';
    multiplayerBtn.style.display = 'none';

    game.gameInit();
}

const grabInputs = () => {
     NAME = document.getElementById('inputName').value;
     SIZE = document.getElementById('inputSize').value;
     DIFFICULTY = document.querySelector('input[name="difficulty"]:checked').value;

}

const redirectToMultiplayer = () => {
    window.location.href = `${window.location.href}multiplayer-page.html`;
}

const handleMove = (e) => {
    if (game.isOver) return;
    const message = game.moveAround(e.target.innerHTML.toLowerCase());

    if (message) {
        clearCanvas();
        game.isOver = true;
        moveButtons.forEach(btn => btn.disabled = true)
        showMessage(`${message} Your current streak is ${game.playerStats.winsInRow}`);
        countDownForElement(restartButton, 3)
    } else {
        game.print();
    }
}

const exitGame = () => {
    enterButton.innerHTML = 'Start';
    settingsContainer.style.display = 'block'
    restartButton.style.display = 'none';
    multiplayerBtn.style.display = 'block';
    resetCanvasSize();
    moveButtons.forEach(btn => btn.disabled = true)

    game.isOver = true;
}

const restartGame = () => {
    moveButtons.forEach(btn => btn.disabled = false)
    game.isOver = false;
    setSize(CANVAS_SIZE.w, CANVAS_SIZE.h)
    game.gameInit();

}

const handleGame = (e) => {
    clearCanvas();
    clearMessage();

    switch (e.target.innerHTML) {
        case 'Start':
            startGame()
            break;
        case 'Exit':
            exitGame();
            break;
        case 'Restart':
            restartGame();
            break;
        case 'Multiplayer':
            redirectToMultiplayer();
            break;
    }
}

moveButtons.forEach(btn => btn.onclick = handleMove);
operationButtons.forEach(btn => btn.onclick = handleGame);
window.onkeydown = (e) => handleKeyPress(e, [handleMove])
helpBtn.onclick = openLegend
