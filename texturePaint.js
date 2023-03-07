import * as THREE from './three'

export class PTBrush{
    constructor(radius = 5, hardnress = 1)
    {
        this.r              = radius;
        this.s              = radius * 2 - 1;
        this.hard           = hardnress; 
        this.col            = new THREE.Color( 0xffffffff ); 
        this.alpha          = 255;
        this.buf            = new Uint8Array(this.s*this.s).fill(255);
    }
    changeColor(color = this.col){
        color.isColor ? this.col = color : this.col = new THREE.Color(color);    
        this.col.a = this.alpha; 
    }
    changeOpacity(opacity = 255){
        (opacity > 255 || opacity < 0) ? this.alpha = 255 : this.alpha = opacity;
        this.col.a = opacity;
    }
    #setPixel(d, r, hard){
        if (d > r)
            return(0)
        else {
            let out = ((r - d) / (d - d / hard)) * 255;
            (out > 255) ? out = 255 : out = Math.floor(out);
            return out; 
        }
    }
    changeBrush(radius = this.r)
    {
        (radius > 0 && radius < 128) ? this.r = radius : this.r = 3;
        this.s = this.r * 2 - 1; 
        let shift, d, k; 
        this.buf = new Uint8Array(this.s*this.s*4).fill(0);
        for (let i = 1; i < this.s + 1; i++)
            for (let j = 1; j < this.s + 1; j++){
                shift = i + (j - 1) * this.s - 1;
                d = Math.sqrt(Math.pow((i - this.r), 2) + Math.pow((j - this.r), 2));
                this.buf[shift] = this.#setPixel(d, this.r, this.hard);
            }
    }
}
