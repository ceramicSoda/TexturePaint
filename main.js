import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LoadMesh } from './routines'
import * as THREE from 'three';
import './style.css'

const mesh = new THREE.Group();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .01, 1000 );
const renderer = new THREE.WebGL1Renderer({alpha:true});
const controls = new OrbitControls( camera, renderer.domElement );

init(); 
animate();

function init( ){
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild(renderer.domElement)
  camera.position.set(8,8,8)

  controls.listenToKeyEvents( window );
  controls.enablePan = false; 
  controls.enableDamping = true; 
  controls.mouseButtons = {RIGHT: THREE.MOUSE.ROTATE}
  controls.touches = {TWO: THREE.TOUCH.DOLLY_PAN}

  const light1 = new THREE.DirectionalLight( 0xdddddd );
  const light2 = new THREE.DirectionalLight( 0xdddddd );
  const light3 = new THREE.AmbientLight( 0xaaaaaa, .5 );
  light1.position.set( -2, -2, -2 );
  light2.position.set(  1,  1,  1 );
  LoadMesh('assets/test.glb', mesh)
  scene.add(mesh, light1, light2, light3);
}

function animate( ){
  requestAnimationFrame(animate);
  render(); 
}

function render( ){
  renderer.render( scene, camera );
  controls.update(); 
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize( window.innerWidth, window.innerHeight );
})
