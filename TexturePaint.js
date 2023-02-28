import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class CanvasTexture{
    constructor(resolution = 128, raycaster = null, mesh = null ){
        this.res = resolution; 
        this.raycaster = raycaster;
        this.brushSize = 0;
        this.history = []; 
        this.mesh = mesh;

        this.currentBuffer = new Uint8Array(this.res*this.res*4);

        this.texture = new THREE.DataTexture(this.currentBuffer, this.res, this.res);
        this.texture.needsUpdate = true; 
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
        this.gltfPath = "assets/dog.glb"; 

        this.raycaster = new THREE.Raycaster(); 
        this.intersects = null; 
        this.pointer = new THREE.Vector2();
        // Vertex-paint specific
        this.mesh = new THREE.Group(); 
        this.paintHistory = [];
        this.vertexColor = []; 
        this.baseColor = [1,1,1];
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
            this.mesh.position.y -= dimensions.y/2; 
            this.controls.minDistance = Math.max(dimensions.x, dimensions.y, dimensions.z)
            this.controls.maxDistance = this.controls.minDistance*2; 
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
        const light2 = new THREE.DirectionalLight( 0xAA9944 );
        light2.position.set( - 2, - 2, - 2 );
        this.scene.add( light2 );
        const light3 = new THREE.AmbientLight( 0x444444 );
        this.scene.add( light3 );
        // Raycasting marker 
        this.marker = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 8 ), 
            new THREE.MeshBasicMaterial( 0xffffff )
        )  
        this.scene.add(this.marker);

        console.log(this.mesh)
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
        //if (e.button == 0) 
    }
    rayMouseDown(e){
        //if (e.button == 0) console.log(this.intersects    0])
        if (e.button == 0) {
            
        }
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.controls.update();
        this.render();
        
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