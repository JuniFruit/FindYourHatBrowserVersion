// Imports

import { FieldEl } from './draw.js'
import { heuristics, removeFromArr, randomNum } from './utilities.js';

// Resources
const hat = 'green'
const hole = 'black';
const fieldCharacter = 'white';
const pathCharacter = 'blue';
const opponentPathCharacter = 'red';
const trail = 'lightblue';
const opponentTrail = 'coral';
const overlay = 'purple'

// Stores information about a player

class Player {
    constructor(name, difficulty) {
        this.name = name;
        this.winsInRow = 0;
        this.difficulty = difficulty;
    }
    // Resets winstreak if a player loses
    resetWin() {
        this.winsInRow = 0;
    }
    // Increments victories if a player succeeds
    addWin() {
        this.winsInRow += 1;
    }
}


export class Field {
    constructor({ size, name, difficulty, isMultiplayer = false }) {
        this.posVert = 0;
        this.posHor = 0;
        this.endPosVert = 0;
        this.endPosHor = 0;
        this.opponentPosVert = 0;
        this.opponentPosHor = 0;
        this.isMultiplayer = isMultiplayer;
        this.size = size;
        this.field = [];
        this.isOver = false;     
        this.playerStats = new Player(name, difficulty)
        this.difficulty = difficulty;
    }
    //Convert generated arr from the server to game field (multiplayer)
    convertToField(arr)  {
        this.field = []
        for(let i=0;i<arr.length;i++){
            const line = [];
            for(let j=0;j<arr[i].length;j++) {
                const element = new FieldEl(arr[i][j]);
                if (element._fill === pathCharacter) {
                    this.posVert = i;
                    this.posHor = j;
                    this.opponentPosVert = i;
                    this.opponentPosHor = j;
                    element._fill = overlay;
                } else if (element._fill === hat) {
                    this.endPosHor = j;
                    this.endPosVert = i;
                }
                element.setSizeAndPos(j,i, this.size);
                line.push(element)
            }
            this.field.push(line);
        }
    }

    // The main function to start the game 
    gameInit() { 
        this.generateField();
        this.print();
    }
    

    // Handles the moving logic

    moveAround(move) {        
        
        try {

        
        const prevPosVert = this.posVert;
        const prevPosHor = this.posHor;

        switch (move) {
            case 'w':
                this.posVert -= 1;
                break;
            case 's':
                this.posVert += 1;
                break;
            case 'd':
                this.posHor += 1;
                break;
            case 'a':
                this.posHor -= 1;
                break;
        }

        if (!this.isMultiplayer) {
            const msg = this.isFinished()
            if (msg) return msg;

        }

        this.field[prevPosVert][prevPosHor]._fill === overlay
        ? this.field[prevPosVert][prevPosHor]._fill = opponentPathCharacter : this.field[prevPosVert][prevPosHor]._fill = trail;


        if (this.isMultiplayer && this.isOverlay()) {
            this.field[this.posVert][this.posHor]._fill = overlay;
            return
        }
        this.field[this.posVert][this.posHor]._fill = pathCharacter;
        }catch (e) {

        }

    }

    //Checks if players overlay each other (multiplayer)
    
    isOverlay() {
        const horizontal = this.posHor == this.opponentPosHor;
        const vertical = this.posVert == this.opponentPosVert;

        if (horizontal && vertical) return true;
        return false
    }

    //Changes color of an element at the Player 2 pos (multiplayer)
    receiveOpponentsPos(pos) {
        if (!pos) return;

        const {x,y} = pos;
        const prevOpponentVert = this.opponentPosVert;
        const prevOpponentHor = this.opponentPosHor;
        this.opponentPosVert = x;
        this.opponentPosHor = y;
        
        if (this.isOverlay()) {
            this.field[prevOpponentVert][prevOpponentHor]._fill = opponentTrail;
            this.field[this.opponentPosVert][this.opponentPosHor]._fill = overlay;
        } else {
            this.field[prevOpponentVert][prevOpponentHor]._fill = opponentTrail;
            this.field[this.opponentPosVert][this.opponentPosHor]._fill = opponentPathCharacter;
            this.field[this.posVert][this.posHor]._fill = pathCharacter;
        }
    }

    //Multiplayer observer
    receiveCurrentPos(pos) {
        if (!pos) return;
        const {x,y} = pos;
        const prevPosVert = this.posVert;
        const prevPosHor = this.posHor;
        this.posVert = x;
        this.posHor = y;

        this.field[prevPosVert][prevPosHor]._fill === overlay
        ? this.field[prevPosVert][prevPosHor]._fill = opponentPathCharacter : this.field[prevPosVert][prevPosHor]._fill = trail;

        this.field[this.posVert][this.posHor]._fill = pathCharacter;
    }

    // Checks whether the finish condition is achieved

    isFinished() {
  
        if (this.posVert < 0 || this.posHor < 0) {
            this.playerStats.resetWin()
            return 'Oops, You fell out of the world!'
        }
        if (this.posVert > this.field.length - 1 || this.posHor > this.field[0].length - 1) {
            this.playerStats.resetWin()
            return 'Oops, You fell out of the world!'
        }
        if (this.field[this.posVert][this.posHor]._fill === hole) {
            this.playerStats.resetWin()
            return 'You fell down in a hole!'
        }
        if (this.field[this.posVert][this.posHor]._fill === hat) {
            this.playerStats.addWin();
            return `Congratulations, ${this.playerStats.name}! You\'ve found the hat!`
        }

        return null;

    }


    getRandomCoordinates() {
        const horizontal = randomNum(0, this.size)
        const vertical = randomNum(0, this.size);

        return [vertical, horizontal]
    }

    placeHat() {

        const [vertical, horizontal] = this.getRandomCoordinates();
        const character = this.field[vertical][horizontal];
        if (character._fill !== pathCharacter) {
            this.field[vertical][horizontal] = new FieldEl(hat);
            // Setting ending position
            this.endPosHor = horizontal;
            this.endPosVert = vertical;
            return
        } else {
            this.placeHat();
        }
    }

    placeCharacter() {
        const [vertical, horizontal] = this.getRandomCoordinates();
        this.field[vertical][horizontal] = new FieldEl(pathCharacter);
        // Setting starting position
        this.posHor = horizontal;
        this.posVert = vertical;
    }


    // Generates a random field with given size and difficulty

    generateField() {
        this.field = [];
        for (let i = 0; i < this.size; i++) {
            let line = [];
            for (let j = 0; j < this.size; j++) {
                const random = randomNum(0, 10);
                if (random < this.difficulty) {
                    line.push(new FieldEl(hole))
                } else {
                    line.push(new FieldEl(fieldCharacter));
                }

            };
            this.field.push(line);
        }


        // Placing our character at random pos

        this.placeCharacter();

        // Placing our hat at a random pos
        this.placeHat()


        if (this.isPlayable(this.field) === false) {
            this.generateField();
        } else {

            for (let i = 0; i < this.field.length; i++) {
                for (let j = 0; j < this.field[i].length; j++) {
                    this.field[i][j] = new FieldEl(this.field[i][j].char._fill)
                    this.field[i][j].setSizeAndPos(j, i, this.size)
                }
            }
        }
    }

    // Checks if a level is beatable by using A* algorithm
    isPlayable(generatedArr) {

        const savedField = generatedArr;


        let startVert = this.posVert;
        let startHor = this.posHor;

        let endVert = this.endPosVert;
        let endHor = this.endPosHor;

        let start;
        let end;

        const openSet = [];
        const closedSet = [];

        class Spot {
            constructor(i, j, char) {
                this.vert = i;
                this.hor = j;
                this.f = 0;
                this.g = 0;
                this.h = 0;
                this.neighbors = [];
                this.previous = undefined;
                this.obstacle = false;
                this.char = char;
            }
            addNeighbors(arr) {
                let vertPos = this.vert;
                let horPos = this.hor;
                if (horPos < arr[vertPos].length - 1) {
                    this.neighbors.push(arr[vertPos][horPos + 1])
                }
                if (horPos > 0) {
                    this.neighbors.push(arr[vertPos][horPos - 1])
                }
                if (vertPos < arr.length - 1) {
                    this.neighbors.push(arr[vertPos + 1][horPos]);
                }
                if (vertPos > 0) {
                    this.neighbors.push(arr[vertPos - 1][horPos])
                }
            }

        }

        for (let i = 0; i < savedField.length; i++) {
            for (let j = 0; j < savedField[i].length; j++) {
                if (savedField[i][j]._fill === hole) {
                    savedField[i][j] = new Spot(i, j, savedField[i][j]);
                    savedField[i][j].obstacle = true;
                } else {
                    savedField[i][j] = new Spot(i, j, savedField[i][j]);
                }


            }
        }
        for (let i = 0; i < savedField.length; i++) {
            for (let j = 0; j < savedField[i].length; j++) {
                savedField[i][j].addNeighbors(savedField);
            }
        }


        start = savedField[startVert][startHor];
        end = savedField[endVert][endHor];

        openSet.push(start);
        while (openSet.length > 0) {
            let winner = 0;

            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[winner].f) {
                    winner = i;
                }
            }

            let current = openSet[winner];

            if (current === end) {
                
                return true
            }
            removeFromArr(openSet, current);
            closedSet.push(current)

            let neighborsOfSpot = current.neighbors;

            for (let i = 0; i < neighborsOfSpot.length; i++) {
                let neighborOfSpot = neighborsOfSpot[i];
                if (!closedSet.includes(neighborOfSpot) && !neighborOfSpot.obstacle) {
                    let tempG = current.g + 1;
                    if (openSet.includes(neighborOfSpot)) {
                        if (tempG < neighborOfSpot.g) {
                            neighborOfSpot.g = tempG;
                        }
                    } else {
                        neighborOfSpot.g = tempG;
                        openSet.push(neighborOfSpot)
                    }

                    neighborOfSpot.h = heuristics(neighborOfSpot, end);
                    neighborOfSpot.f = neighborOfSpot.g + neighborOfSpot.h;

                }

            }

        }



        return false

    }


    print() {
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                this.field[i][j].draw();
            }
        }
    }
}




