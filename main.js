import './reset.css'
import './style.css'
import { Scene3D } from './VertexPaint'; 

let scene3D = new Scene3D(document.querySelector("#canvas-wrap"))
scene3D.init();
scene3D.animate();

/*
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, controls, renderer, raycaster, pointer; 

const mSphere = new THREE.MeshStandardMaterial({color: 0xEEEEEE, vertexColors: true})
const gSphere = new THREE.SphereGeometry(10, 64, 32);
const colors = [];
for ( let i = 0; i < gSphere.attributes.position.count; ++ i ) {
    let hui = gSphere.attributes.position.count; 
    //colors.push( Math.sin(i*40), Math.cos(i*40), Math.sin(i*40) );
    colors.push( i/hui, Math.cos(i*hui), (hui-i)/hui );
}
gSphere.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

const sphere = new THREE.Mesh(gSphere, mSphere)
console.log(sphere.geometry.attributes.position)

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
*/  


