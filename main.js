import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadMesh } from './routines'
import * as THREE from 'three';
import './style.css'

const mesh = new THREE.Group();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .01, 1000 );
const renderer = new THREE.WebGL1Renderer({alpha:true});
const controls = new OrbitControls( camera, renderer.domElement );
const raycaster = new THREE.Raycaster();

init(); 
animate();

function init( ){
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild(renderer.domElement);
  camera.position.set(64,16,64)
  const light1 = new THREE.DirectionalLight( 0xdddddd, .8 );
  const light2 = new THREE.DirectionalLight( 0xffffff, .8 );
  const light3 = new THREE.AmbientLight( 0xaaaaaa, .8 );
  light1.position.set( -2, -2, -2 );
  light2.position.set(  1,  1,  1 );
  loadMesh('assets/test.glb', mesh)
  scene.add(mesh, light1, light2, light3);

  controls.listenToKeyEvents( window );
  controls.enablePan = false; 
  controls.enableDamping = true; 
  controls.mouseButtons = {RIGHT: THREE.MOUSE.ROTATE}
  controls.touches = {TWO: THREE.TOUCH.DOLLY_PAN}
}

function animate( ){
  requestAnimationFrame(animate);
  renderer.render( scene, camera );
  controls.update(); 
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
})

function getMaxBound(mesh){
  let bb = new THREE.Box3().setFromObject(mesh);
  let s = new THREE.Vector3();
  bb.getSize(s);
  return(Math.max( s.x, s.y, s.z ));  
}
