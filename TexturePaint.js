import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//123123
class PTBrush{
    constructor(radius = 5, smooth = true)
    {
        this.radius         = radius;
        this.size           = radius * 2 - 1;
        this.smooth         = smooth; 
        this.color          = new THREE.Color( 0xff40ffff ); 
        this.opacity        = 255;
        this.buffer         = new Uint8Array(this.size*this.size).fill(255);
    }
    changeColor( color = this.color ){
        color.isColor ? this.color = color : this.color = new THREE.Color(color);    
        this.color.a = this.opacity; 
    }
    changeOpacity( opacity = 255 ){
        ( opacity > 255 || opacity < 0 ) ? this.opacity = 255 : this.opacity = opacity;
        this.color.a = opacity;
    }
    changeBrush( radius = this.radius )
    {
        ( radius > 0 && radius < 128 ) ? this.radius = radius : this.radius = 3;
        this.size = this.radius * 2 - 1; 
        let shift, d, k; 
        this.buffer = new Uint8Array(this.size*this.size*4).fill(0);
        for ( let i = 1; i < this.size + 1; i++)
            for ( let j = 1; j < this.size + 1; j++){
                d = Math.sqrt( Math.pow((i - this.radius), 2) + Math.pow((j - this.radius), 2) );
                k = d / this.radius + 0.05;
                k < 1 ? k = 1 : k = 0; 
                shift = i + ( j - 1) * this.size - 1;
                this.buffer[shift]      = Math.floor(k * 255);
            }
    }
}

class PaintTexture{
    constructor( resolution = 128, raycaster = null, mesh = null, historySize = 20 )
    {
        this.onpaint                = false; 
        this.res                    = resolution; 
        this.brush                  = new PTBrush(); 
        this.raycaster              = raycaster;
        this.mesh                   = mesh;
        this.marker                 = null; 
        this.markerTexture          = new THREE.Texture();
        this.data                   = new Uint8Array(this.res*this.res*4).fill(128);
        this.texture                = new THREE.DataTexture(this.data, this.res, this.res);
        this.texture.needsUpdate    = true; 
        this.texture.minFilter      = THREE.LinearMipmapLinearFilter;
        this.texture.magFilter      = THREE.LinearFilter;
        this.history                = [];
        this.historySize            = historySize; 
        this.history.push(this.data); 
    }
    undo(){
        if (this.history[0])
            for (let i = 0; i < this.data.length; i++ )
                this.data[i] = this.history[this.history.length - 1][i];
        this.history.pop();
        this.texture.needsUpdate = true;
    }
    stage(){
        if ( this.historySize >= this.history.length )
            this.history.push(new Uint8Array( this.data ));
        else {
            this.history.shift(); 
            this.history.push(new Uint8Array( this.data ));
        }
    }
    #blendAlphaColor ( c1 = 0, c2 = 0, a1 = 255, a2 = 255 ){
        return Math.floor(c1 * a1 / 255) + (c2 * a2 * (255 - a1) / (255*255));
       // return Math.floor( (c1));

    }
    #blendBoolColor  ( c1 = 0, c2 = 0, a2 = 255 ){
        if (!a2) 
            return(c1) 
        else 
            return(c2); 
    }
    initMarker(){
        let texdata = new Image(); 
        texdata.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACE1BMVEU2NjY3Nzc8PDw0NDQ4ODg/Pz8yMjI6OjpDQ0NJSUk9PT0QEBAwMDBbW1tVVVVOTk5CQkJKSkpBQUFHR0cBAQFQUFAREREEBAQICAhFRUUtLS1qamoYGBgGBgYODg5WVlZNTU1TU1MxMTFgYGBfX18aGhoHBwd0dHRMTEw1NTVXV1csLCwvLy8MDAxxcXEpKSkSEhI5OTlSUlL+/v4TExNlZWUeHh4lJSVvb28WFhYbGxtUVFRtbW1eXl5paWlmZmZAQEAzMzMuLi5ERERZWVliYmJjY2N9fX0kJCQnJycXFxchISEoKChLS0tycnImJiZnZ2doaGgUFBSenp4jIyNcXFxdXV0FBQX7+/vZ2dlsbGxwcHA7Ozvt7e3T09PPz88cHBwgICB+fn7h4eGQkJDQ0NDV1dXp6emSkpKMjIyxsbGgoKD8/PwZGRnHx8f9/f2Dg4NaWloqKiqXl5fNzc2UlJRRUVHv7+/b29umpqaRkZFISEhPT08KCgpYWFiJiYnd3d339/fLy8uPj48JCQn6+vrAwMArKyve3t7r6+uEhIQdHR2tra3S0tK6uroLCwvc3NxhYWHOzs55eXna2tq/v7/o6Oi2traIiIjn5+dkZGR/f3/Y2NjFxcX29vaFhYWkpKSOjo7i4uL19fWysrLm5uZra2siIiKKiop8fHzExMQNDQ0DAwMCAgIPDw8AAAD///8jFKXzAAADfElEQVR42iyUZXvjSAyAxxDHicPMnIYaaqhJ2gbLjFvaW2beY8bdY2ZmjGesn3jj7eqLNNL7yBqNZJQchSQilapbhJDj2nsXL87vGai5VXJJhIRGSaRgjN1BD8a+a6fhsZxJNTEeO4Wx7FBQSMZuardu0MD1+bhpeHj1MkBlnhJBGcshRGhcxq8APGEM5F3VqouM3spco8f+I4Ig4h5z4/MAG/mt5VwsJvQM/QXXx4tfA1hxMChTIBjE38O3uVIjlmF4vlzm+UysSDx3AUQ85ibIdQqb4KtWYJxjyqxeQ0V/zKPxludfuPM+DkqoiksAxVsGxLMai+i1272iTa9FhrrnBjyFZReS8AfgX1LjtoFuNWKORKx2UcPyhi3PBZjGJUQW4MBV5Gjcu2qOmsJh04TZ6u0eo36+DVewhMjTkK0LSKvxpp1h415iendoclpFjZare74AM73FTw8CNIFetDrDu5/WOp25uNFk1llYxpf/HH4hqAx/JGM0gT1iMs5u+A8PZzpxYzQ90PAxUoZ3JbQBa8sCYi06ZzbR+WuyUJj016bDZrtNm7kV+B3G0c+V8ILAsBbrxL3ZmclCKlWY2oxnnTobm9nxXAYreqGyun4CGCmwdgIMVQCte/6DMPq1EnkMDOObU4W1taOpjYSaQYsantvQRucr0w1ag02toeafPDqamplTa+hqM+fyv4EX7cHdHYPahkjUGO/M+P2btcRwIi3q+d5SA6CB7sOZFn0ovUVnNhkTc9/NzSbutSN2G8sYiAkOaKPe2fcV1U6K1pfaWePurjEbNetogszKy8/DmyMUSsE3ywaOYbsDXeSZqKkddaZ1tNMotnT2JvRGaETg9fWiSmhEuy6dTq/qvBaNluFW8tvwhiOEXI55uH42J3CMVt+1iIOBaNHoadxX6gLwikQB/NrN1DlfjEO8ltVTYbUM6vmaydOwrTjUoVUWYd9ff9sgcIihU8kwiBNyzdZz8INDUYdWlhU73Hk1sOgzCALHcT1B6P8tiVfgz6YiUyAkU8K7D5deTC7cz/XHx30ry9WdqwAfBhS6OPQWWCV2voTKbT9XDwSWmivRbbplT2LFjWWFAsojwjF7QL3Pfvbwx0/U7fxIVBQ3dVNAURQHTUWVefvCye5e+qfsUOj36eoqCkqORuoPgEhUk5w9OmFbJNSkHlWNkv8LMAC4oC50smPpNQAAAABJRU5ErkJggg=="
        texdata.onload = () => { this.markerTexture.needsUpdate = true };
        this.marker = new THREE.Mesh(
            new THREE.PlaneGeometry(5,5),
            new THREE.MeshStandardMaterial({ color: "#fff", transparent: true, side: THREE.DoubleSide, alphaTest: 0.1, depthTest: false })
        )
        this.marker.renderOrder = 999; 
        this.markerTexture.image = texdata; 
        this.marker.material.alphaMap = this.markerTexture; 
        this.marker.scale.set(this.brush.size/9, this.brush.size/9, this.brush.size/9)
    }
    #draw( uv ){
        let cx = Math.floor ( uv.x * this.res ); 
        let cy = Math.floor ( uv.y * this.res ); 
        let ax = cx - this.brush.radius;
        let ay = cy - this.brush.radius;
        let shift, shift2;     
        for ( let i = 1; i < this.brush.size + 1; i++)
            for ( let j = 1; j < this.brush.size + 1; j++){
                shift = ( ( i + ax - 1 ) + ( j + ay - 1 )  * this.res - 1  ) * 4; 
                shift2 = i - 1 + (j - 1) * this.brush.size;
                this.data[shift]     = this.#blendBoolColor(this.data[shift], this.brush.color.r*255, this.brush.buffer[shift2]);
                this.data[shift + 1] = this.#blendBoolColor(this.data[shift + 1], this.brush.color.g*255, this.brush.buffer[shift2]);
                this.data[shift + 2] = this.#blendBoolColor(this.data[shift + 2], this.brush.color.b*255, this.brush.buffer[shift2]);
                this.data[shift + 3] = this.brush.buffer[shift2]; 
                //this.data[shift]     = this.#blendAlphaColor(this.data[shift], this.brush.color.r*255, this.data[shift + 3], this.brush.buffer[shift2]);
                //this.data[shift + 1]     = this.#blendAlphaColor(this.data[shift + 1], this.brush.color.g*255, this.data[shift + 3], this.brush.buffer[shift2]);
                //this.data[shift + 2]     = this.#blendAlphaColor(this.data[shift + 2], this.brush.color.b*255, this.data[shift + 3], this.brush.buffer[shift2]);
                //this.data[shift + 3] = 255; 
            } 
        this.texture.needsUpdate = true; 
    }
    paint( uv ){
        //this.#stage();
        this.#draw( uv ); 
    }
}






export class Scene3D{
    constructor(canvasRoot){
        if (Scene3D.exists){
            return Scene3D.instance; 
        }
        this.exists = true; 
        this.instance = this; 
        // Commmon three stuf
        this.scene = new THREE.Scene;
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
        this.renderer = new THREE.WebGLRenderer({alpha:true});
        this.canvasRoot = canvasRoot;
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        this.loader = new GLTFLoader(); 
        this.dracoLoader = new DRACOLoader();
        this.gltfPath = "assets/test.glb"; 

        this.raycaster = new THREE.Raycaster(); 
        this.intersects = null; 
        this.pointer = new THREE.Vector2();
        // Vertex-paint specific
        this.mesh = new THREE.Group(); 
        this.pt = new PaintTexture(512);
    }
    #findNestedMesh(childArray){
        if (childArray[0].type == "Group")
            return(this.#findNestedMesh(childArray[0].children))
        else if (childArray[0].type == "Mesh" || childArray[0].type == "Scene")
            return([...childArray])
    }

    #loadMesh(){
        this.dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' ); 
        this.loader.setDRACOLoader( this.dracoLoader );
        this.loader.loadAsync( this.gltfPath, undefined)
        .catch(err => console.err(err))
        .then(gltf => {
            // Because screw nested scene structure of three.js!!!
            // Make all your transormations with mesh if needed
            this.mesh.add(...this.#findNestedMesh(gltf.scene.children))
            let dimensions = new THREE.Vector3();
            let bounding = new THREE.Box3().setFromObject(this.mesh);
            bounding.getSize(dimensions);
            //this.mesh.position.y -= dimensions.y/2; 
            this.controls.minDistance = Math.max(dimensions.x, dimensions.y, dimensions.z)
            this.controls.maxDistance = this.controls.minDistance*2; 

            // REMOVE LATER!!!!
            this.pt.brush.changeBrush( 9, 0xffffffff )
            this.mesh.children[0].material.map = this.pt.texture;
        })
        
    }

    init(){
        //this.scene.background = new THREE.Color( 0x14141700 );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.canvasRoot.appendChild( this.renderer.domElement );

        this.#loadMesh();
        
        this.controls.listenToKeyEvents( window );
        this.controls.enablePan = false; 
        this.controls.enableDamping = true; 
        this.controls.mouseButtons = {RIGHT: THREE.MOUSE.ROTATE}
        this.controls.touches = {TWO: THREE.TOUCH.DOLLY_PAN}

        this.camera.position.set( -32, 8, 64 );

        this.scene.add(this.mesh)
        const light1 = new THREE.DirectionalLight( 0xdddddd );
        light1.position.set( 1, 1, 1 );
        this.scene.add( light1 );
        const light2 = new THREE.DirectionalLight( 0xdddddd );
        light2.position.set( - 2, - 2, - 2 );
        this.scene.add( light2 );
        const light3 = new THREE.AmbientLight( 0xaaaaaa ); ;
        this.scene.add( light3 );
        // Raycasting marker 
        this.pt.initMarker(); 
        this.scene.add(this.pt.marker)
        
        this.marker = new THREE.Mesh(
            new THREE.SphereGeometry(.01, 16, 8 ), 
            new THREE.MeshBasicMaterial( 0xffffff )
        )  
        this.scene.add(this.marker);
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
 
    rayMouseMove(e) {
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
    }   
    rayMouseUp(e) {
        if (e.button == 0 && this.pt.onpaint){
            this.pt.onpaint = false; 
        }
    }
    rayMouseDown(e){
        if (e.button == 0 && this.intersects[0]) {
            //this.pt.brush.changeColor( new THREE.Color(Math.random()*128+64, Math.random()*128+64, Math.random()*128+64) );
            this.pt.stage(); 
            this.pt.onpaint = true; 
        }
        console.log(this.intersects)
    }
    keyUndo(e){
        if (e.keyCode == 90 && e.ctrlKey == true )
            this.pt.undo();
        if (e.keyCode == 219 )
            this.pt.brush.changeBrush(this.pt.brush.radius-3);
            if (e.keyCode == 221 )
            this.pt.brush.changeBrush(this.pt.brush.radius+3);
        //if (e.keyCode == )
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.controls.update();
        this.render();
        if (this.intersects[0] && this.pt.onpaint){
            this.pt.paint(this.intersects[0].uv); 
        }
    }

    render() {
        this.raycaster.setFromCamera( this.pointer, this.camera );
        this.intersects = this.raycaster.intersectObject(this.mesh);
        if (this.intersects[0]) {
            document.body.style.cursor = 'none'
            this.pt.marker.lookAt(this.intersects[0].face.normal)
            this.pt.marker.position.x = this.intersects[0].point.x; 
            this.pt.marker.position.y = this.intersects[0].point.y; 
            this.pt.marker.position.z = this.intersects[0].point.z; 
        }
            else document.body.style.cursor = 'default'
        this.renderer.render( this.scene, this.camera );
    }
}