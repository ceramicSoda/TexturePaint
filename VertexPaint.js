import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

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
        this.raycaster = {}; 
        this.loader = new GLTFLoader(); 
        this.dracoLoader = new DRACOLoader();
        this.gltfPath = "assets/test.glb"; 
        // Vertex-paint specific
        this.mesh = new THREE.Group(); 
        this.paintHistory = [];
        this.vertexColor = []; 
        this.baseColor = [1,1,1];
    }

    #findLoadedMesh(childObj){
        //if (childObj[0] )
    }

    #loadMesh(){
        this.dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' ); 
        this.loader.setDRACOLoader( this.dracoLoader );
        this.loader.load( this.gltfPath, (gltf) => {
            this.mesh.add(gltf.scene);
        }, undefined, console.error);
    }

    init(){
        this.scene.background = new THREE.Color( 0x141417 );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.canvasRoot.appendChild( this.renderer.domElement );

        this.#loadMesh();
        //let boundBox = new THREE.Box3().setFromObject(this.mesh);
        let size = new THREE.Vector3(20,30,25);
        //box3.getSize(size);
        
        this.controls.listenToKeyEvents( window );
        this.controls.enablePan = false; 
        this.controls.minDistance = Math.max(size.x, size.y, size.z);
        this.controls.maxDistance = this.controls.minDistance*3;
        this.controls.mouseButtons = {
            RIGHT: THREE.MOUSE.ROTATE
        }
        this.camera.position.set( -32, 8, 64 );

        const light1 = new THREE.DirectionalLight( 0xffffff );
        light1.position.set( 1, 1, 1 );
        this.scene.add( light1 );
        const light2 = new THREE.DirectionalLight( 0xAA9944 );
        light2.position.set( - 2, - 2, - 2 );
        this.scene.add( light2 );
        const light3 = new THREE.AmbientLight( 0x444444 );
        this.scene.add( light3 );
        this.scene.add(this.mesh)
        console.log(this.mesh.children)
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    
    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.controls.update();
        this.render();
    }

    render() {
        this.renderer.render( this.scene, this.camera );
    }
}