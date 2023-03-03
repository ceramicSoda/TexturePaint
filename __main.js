import './reset.css'
import './style.css'
import * as THREE from 'three';
import { PaintTexture } from './TexturePaint';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 ),
    render = new THREE.WebGL1Renderer(),
    controls = new OrbitControls( this.camera, this.renderer.domElement ),
    pt = new PaintTexture( 256 ); 
    mesh;

function init( ){
    scene.background = new THREE.Color( 0x131317 ); 
    mesh = LoadMesh( "assets/test.glb" );
        
}

function LoadMesh( path, mesh ){
    let loader = new GLTFLoader(); 

    function findNestedMesh(childArray){
        if (childArray[0].type == "Group" || childArray[0].type == "Scene")
            return(findNestedMesh(childArray[0].children))
        else if (childArray[0].type == "Mesh")
            return([...childArray])
    }

    loader.loadAsync( path, undefined)
        .catch(err => console.err(err))
        .then(gltf => {
            mesh.add(...findNestedMesh(gltf.scene.children))
        })
}
