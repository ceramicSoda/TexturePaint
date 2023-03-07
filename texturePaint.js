import * as THREE from 'three';

class TPBrush{
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
            return 0;
        else {
            let out = ((r - d) / (d - d / hard)) * 255;
            (out > 255) ? out = 255 : out = Math.floor(out);
            return out; 
        }
    }
    changeBrush(radius = this.r, hardnress = this.hard)
    {
        (radius > 0 && radius < 128) ? this.r = radius : this.r = 3;
        (hardnress > 0 && hardnress < 1) ? this.hard = hardnress : this.hard = 1; 
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

class TPMarker{
    constructor(texelSize = 1, texture){
        this.mesh           = new THREE.Mesh();
        this.texture        = new THREE.Texture();
        this.texel          = texelSize; 
    }
    initMarker(){
        let texdata = new Image(); 
        texdata.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAFVBMVEUAAACsrKyBgYFHR0fn5+fLy8v///8WTUTpAAACjklEQVR42uxb27KCMAwku0n//5MPIGpl5EyBtssM8uagJmw2V9JhOHQR4W5mYfOnoetFS+8r8jtAH1Uy+cnyGzFpFGiugC/C3SPsm2bGtkhY8hjtD67kMAOmsjFYhutIze+2qcC6KP3yU4d6CMD3/uEERFR7+ifjsC9M1AIAC9+tc6x5cW+JNhrxT4f3s5Hl+B9MBnCeDxvHIYx0Pq5yP4fzX1cjUgy665E9XagB5BhA682vgFqmAdtEPStWICq4/kYVUSi/FWHLEpTVLiZ2hz6tfBP7KysXU8cMAJ18iOWzGwE3+pYpXEYfpGPzTg8CutbQC9Wo1MDFxcGD7VBD4HIWyCEwKQtc7Qi2goASR8inGuitwtj08SMNe28NuM5CFDNC7pVKAKAOjKFOTvIC4TMmaLKz1AJQWyB0TkhMTw6Ey8gndf/Z/YabGj/PQdT6X6gRkFfnWgVc3aKFujsIMQKDXIGZA7F6Ad05GWHuCQZxNAh1QHaKmejyidG9hxWhVgDycY26KtDXprrObBnSjLkAMuPL6X/XnvAaY4HfZEg9sucVKKCMAlQXQlhtdBC9CTk2hvhslLvP6/MXBnaFqsTl45rf29QLvE3lrSHQs6CXEWj/VAg9ENje1mOXQYWJ2Y4rLGtdfluOLQmoNYB6XdHKF6whJiDalEdWLr9RgWaFoS6aLYJzj7e4MjVGUifnSOIN50UD5SC/1rmM43uqrDFEOrepi7M0XM7Jobnbbj+9kEg0T3Wded/G3/PoZb3HR9q1dBipdjR9uGXxmd55El3T+O8TtWVAMGqfFkL4xolakjDYSDp24nVObEa8NWufveC+qqvpW+fA2wHxMdHLFXBF9hxNYBbuhxeD/wQYANuQEnxmoEQiAAAAAElFTkSuQmCC"
        texdata.onload = () => { this.texture.needsUpdate = true };
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshStandardMaterial({ color: "#fff", transparent: true, side: THREE.DoubleSide, alphaTest: 0.1, depthTest: false })
        )
        this.mesh.renderOrder = 999; 
        this.texture.image = texdata; 
        this.mesh.material.alphaMap = this.markerTexture; 
        this.mesh.scale.set(this.texel, this.texel, this.texel);
        return(this.mesh); 
    }
}