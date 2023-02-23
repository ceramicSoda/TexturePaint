import './reset.css'
import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, controls, renderer; 
Init();
animate();

function Init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x141417 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.querySelector("#canvas-wrap").appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 50, 50, 0 );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); 

    const geometry = new THREE.SphereGeometry(10, 64, 32);
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: false } );
    scene.add(new THREE.Mesh(geometry, material));

    // lights
    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );
    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );
    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
}

function render() {
    renderer.render( scene, camera );
}