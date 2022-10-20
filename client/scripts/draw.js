
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

export const setSize = (w, h) => {

    canvas.width = w
    canvas.height = h

}

export class FieldEl {
    constructor(fill,x,y,w, h) {
        this._fill = fill
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        
    }

    setSizeAndPos(x, y, amount) {   
    
        this._w = (canvas.width / amount);
        this._h = (canvas.height / amount);    
        this._x = x * this._w;
        this._y = y * this._h;
    }

    draw() {
        ctx.fillStyle = this._fill;   

        ctx.fillRect(this._x, this._y, this._w, this._h);
    }
}


export const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);