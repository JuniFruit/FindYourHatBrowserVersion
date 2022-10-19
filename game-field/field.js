
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
    if ((playerHorizontal === hatHorizontal) && (playerVertical === hatVertical)) return getStartAndEnd(size);

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


let GAME_ROOM_FIELDS = new Map();
let CLIENT_ROOM_FIELDS = new Map();

//Create field for a specific room and save it in a hash map

const createServerField = (room) => {
    
    if (CLIENT_ROOM_FIELDS.has(room)) return CLIENT_ROOM_FIELDS.get(room); 
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
    GAME_ROOM_FIELDS.set(room, serverField);
    CLIENT_ROOM_FIELDS.set(room, converted);
    return converted;
}

const checkFieldExist = (room) => {
    return GAME_ROOM_FIELDS.has(room)
}

const checkWinConditions = (x, y, room) => {
    let isFinished = false;
    let isWinner = false;
    let msg = '';
    console.log(x,y)
    if (x < 0 || y < 0) {
        msg = 'out of the world'
        clearFields(room);
        return [msg, isFinished = true, isWinner =false]
    }
    if (x > GAME_ROOM_FIELDS.get(room).length - 1 || y > GAME_ROOM_FIELDS.get(room)[0].length - 1) {
        msg = 'out of the world'
        clearFields(room);

        return [msg, isFinished = true, isWinner =false]
    }
    if (GAME_ROOM_FIELDS.get(room)[x][y].type === hole) {
        msg = 'down in the hole'
        clearFields(room);

        return [msg, isFinished = true, isWinner =false]
    }
    if (GAME_ROOM_FIELDS.get(room)[x][y].type === hat) {
        msg = 'found the hat'
        clearFields(room);

        return [msg, isFinished = true, isWinner = true]
    }

    return [msg, isFinished, isWinner];

}

const clearFields = (room) => {
    GAME_ROOM_FIELDS.delete(room);
    CLIENT_ROOM_FIELDS.delete(room);
}


module.exports = exports = {
    createServerField,
    checkWinConditions,
    checkFieldExist
};