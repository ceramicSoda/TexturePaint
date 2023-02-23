import './reset.css'
import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WireframeGeometry } from 'three';

let scene, camera, controls, renderer; 

const mSphere = new THREE.MeshStandardMaterial({color: 0xEEEEEE, vertexColors: true})
const gSphere = new THREE.SphereGeometry(10, 64, 32);
const sphere = new THREE.Mesh(gSphere, mSphere)
console.log(sphere.geometry)

function Init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x141417 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.querySelector("#canvas-wrap").appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 32, 0, 0 );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window );  
    scene.add(sphere);
    console.log(scene); 
    // lights
    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );
    const dirLight2 = new THREE.DirectionalLight( 0xAA5544 );
    dirLight2.position.set( - 2, - 2, - 2 );
    scene.add( dirLight2 );
    const ambientLight = new THREE.AmbientLight( 0x444444 );
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
Init();
animate();