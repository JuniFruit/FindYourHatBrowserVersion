// Imports

import { FieldEl } from './draw.js'
import { heuristics, removeFromArr, randomNum } from './utilities.js';

// Resources
const hat = 'green'
const hole = 'black'
const fieldCharacter = 'white'
const pathCharacter = 'blue'
const opponentPathCharacter = 'red'
const trail = 'lightblue'
const opponentTrail = 'coral'
const overlay = 'purple'

export class Field {
    constructor({ size, difficulty, isMultiplayer = false }) {
        this.posVert = 0;
        this.posHor = 0;
        this.endPosVert = 0;
        this.endPosHor = 0;
        this.playerScore = 0;
        this.opponentPosVert = 0;
        this.opponentPosHor = 0;
        this.isMultiplayer = isMultiplayer;
        this.size = size;
        this.field = [];
        this.isOver = false;        
        this.difficulty = difficulty;
        this.frames = 0;
        this.AIdelay = 40;
        this.AIpath = [];
        this.AIscore = 0;
        this.AIstep = 0;
    }
    //Convert generated arr from the server to game field (multiplayer)
    convertToField(arr) {
        this.field = []
        for (let i = 0; i < arr.length; i++) {
            const line = [];
            for (let j = 0; j < arr[i].length; j++) {
                const element = new FieldEl(arr[i][j]);
                if (element.fill === pathCharacter) {
                    this.posVert = i;
                    this.posHor = j;
                    this.opponentPosVert = i;
                    this.opponentPosHor = j;
                    element.fill = overlay;
                } else if (element.fill === hat) {
                    this.endPosHor = j;
                    this.endPosVert = i;
                }
                element.setSizeAndPos(j, i, this.size);
                line.push(element)
            }
            this.field.push(line);
        }
    }

    // The main function to start the game 
    gameInit() {
        this.AIpath = []
        this.AIstep = 0;
       
        this.generateField();
        this.opponentAI();

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

            this.field[prevPosVert][prevPosHor].fill === overlay
                ? this.field[prevPosVert][prevPosHor].fill = opponentPathCharacter : this.field[prevPosVert][prevPosHor].fill = trail;


            if (this.isOverlay()) {
                this.field[this.posVert][this.posHor].fill = overlay;
                return
            }
            this.field[this.posVert][this.posHor].fill = pathCharacter;
        } catch (e) {

        }

    }

    //Checks if players overlay each other

    isOverlay() {
        const horizontal = this.posHor == this.opponentPosHor;
        const vertical = this.posVert == this.opponentPosVert;

        if (horizontal && vertical) return true;
        return false
    }

    //Changes color of an element at the Player 2 pos
    receiveOpponentsPos(pos) {
        if (!pos) return;

        const { x, y } = pos;
        const prevOpponentVert = this.opponentPosVert;
        const prevOpponentHor = this.opponentPosHor;
        this.opponentPosVert = x;
        this.opponentPosHor = y;

        if (this.isOverlay()) {
            this.field[prevOpponentVert][prevOpponentHor].fill = opponentTrail;
            this.field[this.opponentPosVert][this.opponentPosHor].fill = overlay;
        } else {
            this.field[prevOpponentVert][prevOpponentHor].fill = opponentTrail;
            this.field[this.opponentPosVert][this.opponentPosHor].fill = opponentPathCharacter;
            this.field[this.posVert][this.posHor].fill = pathCharacter;
        }
    }

    //Multiplayer observer
    receiveCurrentPos(pos) {
        if (!pos) return;
        const { x, y } = pos;
        const prevPosVert = this.posVert;
        const prevPosHor = this.posHor;
        this.posVert = x;
        this.posHor = y;

        this.field[prevPosVert][prevPosHor].fill === overlay
            ? this.field[prevPosVert][prevPosHor].fill = opponentPathCharacter : this.field[prevPosVert][prevPosHor].fill = trail;

        this.field[this.posVert][this.posHor].fill = pathCharacter;
    }

    // Checks whether the finish condition is achieved

    isFinished() {

        if (this.posVert < 0 || this.posHor < 0) {
            this.AIscore++
            return 'Oops, You fell out of the world!'
        }
        if (this.posVert > this.field.length - 1 || this.posHor > this.field[0].length - 1) {
            this.AIscore++

            return 'Oops, You fell out of the world!'
        }
        if (this.field[this.posVert][this.posHor].fill === hole) {
            this.AIscore++

            return 'You fell down in a hole!'
        }
        if (this.field[this.posVert][this.posHor].fill === hat) {
            this.playerScore++

            return `Congratulations! You\'ve found the hat!`
        }

        return null;

    }


    getRandomCoordinates() {
        const horizontal = randomNum(0, this.size)
        const vertical = randomNum(0, this.size);

        return [vertical, horizontal]
    }

    getStartAndEnd() {
        const [playerVertical, playerHorizontal] = this.getRandomCoordinates();
        const [hatVertical, hatHorizontal] = this.getRandomCoordinates();

        if ((playerHorizontal === hatHorizontal) && (playerVertical === hatVertical)) return this.getStartAndEnd();

        this.posVert = playerVertical;
        this.posHor = playerHorizontal;
        this.endPosVert = hatVertical;
        this.endPosHor = hatHorizontal;
        this.opponentPosVert = this.posVert;
        this.opponentPosHor = this.posHor;
        this.field[this.posVert][this.posHor] = new FieldEl(overlay);      
        this.field[this.endPosVert][this.endPosHor] = new FieldEl(hat);        
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


        this.getStartAndEnd();

        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                this.field[i][j].setSizeAndPos(j, i, this.size)
                this.field[i][j].addNeighbors(this.field)
            }
        }


        if (this.depthFirst(this.field[this.posVert][this.posHor]) === false) return this.generateField();


    }


    depthFirst(start) {

        let stack = [start];
        let visited = [start];

        while (stack.length) {
            let current = stack.pop();

            if (current.fill === hat) {
               
                let prev = current
                let path = []
                while (prev.fill !== overlay) {
                    path.push(prev);
                    prev = prev.parent;
                }
                this.AIpath = path.reverse();
                return true;

            };

            current.edges.forEach(edge => {
                if (edge.fill === hole) return;

                if (!visited.includes(edge)) {
                    visited.push(edge);
                    edge.parent = current;
                    stack.push(edge);
                }
            })

        }

        return false;

    }

    aStarSearch = (start, endNode) => {
        const openSet = [start];
        const closedSet = [];
        
        while (openSet.length) {
            let lowestInd = 0;
            for (let i=0; i<openSet.length;i++) {
                if (openSet[i].f < openSet[lowestInd].f) {lowestInd = i};
            }
            
            let current = openSet[lowestInd];
            if (current === endNode) {
                let currentNode = current;
                let path = []
                while (currentNode.parent) {
                    path.push(currentNode);
                    currentNode = currentNode.parent;
                }
                return this.AIpath = path.reverse();
            }
            openSet.splice(lowestInd, 1);
            closedSet.push(current);
    
            current.edges.forEach(edge => {
                const neighbor = edge
                if (neighbor.fill !== hole && !closedSet.includes(neighbor)) {
                    const gScore = current.g + 1;
                    if (openSet.includes(neighbor)) {
                        if (gScore < neighbor.g) neighbor.g = gScore;
                    } else {
                        neighbor.g = gScore;
                        neighbor.parent = current;
                        openSet.push(neighbor)
                    }
                    neighbor.h = heuristics(neighbor, endNode);
                    neighbor.f = neighbor.g + neighbor.h;
                } else {
                    return
                }
    
            })
    
        }
        return;
    }

    opponentAI() {

        if (Number(this.difficulty) == 2) {
            this.AIdelay = 30;
            this.depthFirst(this.field[this.opponentPosVert][this.opponentPosHor]);

        };
        if (Number(this.difficulty) == 4) {
            this.AIdelay = 20;
            this.aStarSearch(this.field[this.opponentPosVert][this.opponentPosHor], this.field[this.endPosVert][this.endPosHor]);
        }
    }

    animatePathAI() {
        if (this.isOver) return;

        if (this.frames % this.AIdelay === 1) {
            if (!this.AIpath[this.AIstep]) {
                this.isOver = true;                
                return;
            }
           
            this.receiveOpponentsPos({ x: this.AIpath[this.AIstep].arrX, y: this.AIpath[this.AIstep].arrY })
            // this.print();
            this.AIstep++
        }

    }

    animate() {

        window.requestAnimationFrame(this.animate);
        console.log('gi')
        this.print()
    }


    print() {
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                this.field[i][j].draw();
            }
        }


    }
}




