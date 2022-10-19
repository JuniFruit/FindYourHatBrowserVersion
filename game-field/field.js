
const hat = 'green'
const hole = 'black';
const fieldCharacter = 'white';
const pathCharacter = 'blue';

const SIZE = 30;
const DIFFICULTY = 4;

const randomize = (max) => {
    return Math.floor(Math.random() * max);
}

const getStartAndEnd = (size) => {
    const playerVertical = randomize(size);
    const playerHorizontal = randomize(size);
    const hatVertical = randomize(size);
    const hatHorizontal = randomize(size);
    if ((playerHorizontal + playerVertical) === (hatHorizontal + hatVertical)) return getStartAndEnd(size);

    return [[playerVertical, playerHorizontal], [hatVertical, hatHorizontal]];
}

class Spot {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.edges = [];
    }
    addNeighbors(arr) {
        const vertical = this.x;
        const horizontal = this.y;
        if (horizontal > 0) this.edges.push(arr[vertical][horizontal - 1]);
        if (horizontal < arr[vertical].length - 1) this.edges.push(arr[vertical][horizontal + 1]);
        if (vertical > 0) this.edges.push(arr[vertical - 1][horizontal]);
        if (vertical < arr.length - 1) this.edges.push(arr[vertical + 1][horizontal]);
    }
}

const checkIsPlayable = (start) => {

    const stack = [start];
    const visited = [start];

    while (stack.length) {
        let current = stack.pop();
        if (current.type === hat) return true;
        current.edges.forEach(edge => {
            if (edge.type === hole) return;
            if (!visited.includes(edge)) {
                stack.push(edge);
                visited.push(edge);
            }
        })
    }
    return false;
}


const generateField = (size, difficulty) => {
    const field = []
    for (let i = 0; i < size; i++) {
        const line = []
        for (let j = 0; j < size; j++) {
            const random = randomize(10);
            if (random < difficulty) {
                line.push(new Spot(i, j, hole))
            } else {
                line.push(new Spot(i, j, fieldCharacter));
            }
        }
        field.push(line);
    }
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            field[i][j].addNeighbors(field);
        }
    }

    const playerCoordinates = getStartAndEnd(size)[0];
    const hatCoordinates = getStartAndEnd(size)[1];
    field[playerCoordinates[0]][playerCoordinates[1]].type = pathCharacter;
    field[hatCoordinates[0]][hatCoordinates[1]].type = hat;

    if (!checkIsPlayable(field[playerCoordinates[0]][playerCoordinates[1]])) return generateField(size, difficulty);

    return field

}


let GAME_FIELD = null;
let CLIENT_FIELD = null;

const createServerField = (settings) => {
    
    if (CLIENT_FIELD) return CLIENT_FIELD 
    const serverField = generateField(SIZE, DIFFICULTY);


    //Convert to non-circular array for sending to the client;
    const converted = [];
    for (let i = 0; i < serverField.length; i++) {
        const line = []
        for (let j = 0; j < serverField[i].length; j++) {
            line.push(serverField[i][j].type)
        }
        converted.push(line);
    }
    GAME_FIELD = serverField;
    CLIENT_FIELD = converted;
    return converted;
}


const checkWinConditions = (x, y) => {
    
    let isFinished = false;
    let isWinner = false;
    let msg = '';
    
    if (x < 0 || y < 0) {
        msg = 'out of the world'
        clearFields();
        return [msg, isFinished = true, isWinner =false]
    }
    if (x > GAME_FIELD.length - 1 || y > GAME_FIELD[0].length - 1) {
        msg = 'out of the world'
        clearFields();

        return [msg, isFinished = true, isWinner =false]
    }
    if (GAME_FIELD[x][y].type === hole) {
        msg = 'down in the hole'
        clearFields();

        return [msg, isFinished = true, isWinner =false]
    }
    if (GAME_FIELD[x][y].type === hat) {
        msg = 'found the hat'
        clearFields();

        return [msg, isFinished = true, isWinner = true]
    }

    return [msg, isFinished, isWinner];

}

const clearFields = () => {
    GAME_FIELD = null;
    CLIENT_FIELD = null;
}


module.exports = exports = {
    createServerField,
    checkWinConditions
};