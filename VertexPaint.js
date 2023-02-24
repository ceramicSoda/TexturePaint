import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

class Scene3D{
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
        this.canvasRoot = canvasElement;
        this.controls = new OrbitControls( camera, renderer.domElement );
        this.raycaster = {}; 
        this.loader = new GLTFLoader(); 
        this.dracoLoader = new DRACOLoader();
        this.gltfPath = "assets/dog.gltf"; 
        // Vertex-paint specific
        this.mesh = null; 
        this.paintHistory = [];
        this.vertexColor = []; 
        this.baseColor = [1,1,1];
        // All scene objects 
    }

    #loadMesh(){
        this.dracoLoader.setDecoderPath( 'js/libs/draco/gltf/' ); 
        loader.setDRACOLoader( dracoLoader );
        loader.load( this.gltfPath, (gltf) => {
            this.mesh = gltf.scene; 
        }, undefined, console.error("failed to load GLTF !!!") );
    }

    init(){
        scene.background = new THREE.Color( 0x141417 );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.canvasRoot.appendChild( renderer.domElement );

        this.#loadMesh();
        let boundBox = THREE.Box3setFromObject( this.mesh );
        let size = new THREE.Vector3();
        box3.getSize(size);
        
        this.controls.listenToKeyEvents( window );
        this.controls.minDistance = Math.max(size.x, size.y, size.z);
        this.controls.maxDistance = this.controls.minDistance*3;
        this.camera.position.set( this.controls.minDistance, 0, 0 );

        const light1 = new THREE.DirectionalLight( 0xffffff );
        light1.position.set( 1, 1, 1 );
        this.scene.add( light1 );
        const light2 = new THREE.DirectionalLight( 0xAA5544 );
        light2.position.set( - 2, - 2, - 2 );
        this.scene.add( light2 );
        const light3 = new THREE.light3( 0x444444 );
        this.scene.add( light3 );
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    
    animate() {
        requestAnimationFrame( this.animate );
        this.controls.update();
        render();
    }

    #render() {
        this.renderer.render( this.scene, this.camera );
    }
}