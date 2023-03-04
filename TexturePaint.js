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
        this.color          = new THREE.Color( 0xffffffff ); 
        this.buffer         = new Uint8Array(this.size*this.size).fill(255);
    }
    changeColor( color = this.color ){
        color.isColor ? this.color = color : this.color = new THREE.Color(color); 
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
        this.history.pop();
        // three js will broke if we'll try to just equate data to history[last] for reasons
        if (this.history[0])
            for (let i = 0; i < this.data.length; i++ )
                this.data[i] = this.history[this.history.length - 1][i];
        this.texture.needsUpdate = true;
    }
    stage(){
        if ( this.historySize > this.history.length )
            this.history.push(new Uint8Array( this.data ));
        else {
            this.history.shift(); 
            this.history.push(new Uint8Array( this.data ));
        }
    }
    #blendAlphaColor ( c1 = 0, c2 = 0, a1 = 255, a2 = 255 ){
        return (c1 * a1 / 255) + (c2 * a2 * (255 - a1) / (255*255));
    }
    #blendBoolColor  ( c1 = 0, c2 = 0, a2 = 255 ){
        if (!a2) 
            return(c1) 
        else 
            return(c2); 
    }
    #updateMarker(){
        if (!this.marker.isObject3D)
            this.marker = new THREE.Mesh(
                new THREE.TorusGeometry(1,.1, 4, 16),
                new THREE.MeshBasicMaterial( 0x888888 )
            )
        //this.marker.size
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
        this.renderer = new THREE.WebGLRenderer();
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
        this.scene.background = new THREE.Color( 0x141417 );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.canvasRoot.appendChild( this.renderer.domElement );

        this.#loadMesh();
        
        this.controls.listenToKeyEvents( window );
        this.controls.enablePan = false; 
        this.controls.enableDamping = true; 
        this.controls.mouseButtons = {RIGHT: THREE.MOUSE.ROTATE}
        this.camera.position.set( -32, 8, 64 );

        this.scene.add(this.mesh)
        const light1 = new THREE.DirectionalLight( 0xffffff );
        light1.position.set( 1, 1, 1 );
        this.scene.add( light1 );
        const light2 = new THREE.DirectionalLight( 0xffffff );
        light2.position.set( - 2, - 2, - 2 );
        this.scene.add( light2 );
        const light3 = new THREE.AmbientLight( 0xffffff ); ;
        this.scene.add( light3 );
        // Raycasting marker 
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
        if (e.button == 0) 
            this.pt.stage(); 
            this.pt.onpaint = false; 
    }
    rayMouseDown(e){
        if (e.button == 0) {
            this.pt.brush.changeColor( new THREE.Color(Math.random()*128+64, Math.random()*128+64, Math.random()*128+64) );
            this.pt.onpaint = true; 
        }
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
            this.marker.position.x = this.intersects[0].point.x; 
            this.marker.position.y = this.intersects[0].point.y; 
            this.marker.position.z = this.intersects[0].point.z; 
        }
            else document.body.style.cursor = 'default'
        this.renderer.render( this.scene, this.camera );
    }
}