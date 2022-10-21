
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

export const setSize = (w, h) => {

    canvas.width = w
    canvas.height = h

}

export class FieldEl {
    constructor(fill,x,y) {
        this.fill = fill;
        this._x = x;
        this._y = y;
        this._w = 1;
        this._h = 1;
        this.arrX = 0;
        this.arrY = 1;
        this.edges = []
        this.parent = null
        
    }

    setSizeAndPos(x, y, amount) {   
        
        this._w = (canvas.width / amount);
        this._h = (canvas.height / amount);    
        this._x = x * this._w;
        this._y = y * this._h;
        this.g = 0;
        this.f = 0;
        this.h = 0;
        this.arrX = y;
        this.arrY = x;
    }

    addNeighbors(arr) {
        const vertical = this.arrX;
        const horizontal = this.arrY; 
        if (horizontal > 0) this.edges.push(arr[vertical][horizontal - 1]);
        if (horizontal < arr[vertical].length - 1) this.edges.push(arr[vertical][horizontal + 1]);
        if (vertical > 0) this.edges.push(arr[vertical - 1][horizontal]);
        if (vertical < arr.length - 1) this.edges.push(arr[vertical + 1][horizontal]);
    }

    draw() {
        ctx.fillStyle = this.fill;   

        ctx.fillRect(this._x, this._y, this._w, this._h);
      
       
    
    }
}


export const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);