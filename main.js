import './reset.css'
import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, controls, renderer; 
Init();

function Init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x333333 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.querySelector("#canvas-wrap").appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 50, 50, 0 );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); 
}
