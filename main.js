import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TexurePaint } from './texturePaint'
import * as THREE from 'three';
import './style.css'

let hueRangeEl = document.getElementById("hueRange"); 
let hardRangeEl = document.getElementById("hardRange"); 
let radiusRangeEl = document.getElementById("radiusRange"); 
let opacityRangeEl = document.getElementById("opacityRange");

const mesh = new THREE.Group();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, .01, 1000 );
const renderer = new THREE.WebGL1Renderer({alpha:true});
const controls = new OrbitControls( camera, renderer.domElement );
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(); 
const tp = new TexurePaint(mesh, raycaster, 512); 

init(); 
animate();

function init( ){
  let loader = new GLTFLoader(); 
  let dracoLoader = new DRACOLoader(); 
  dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' ); 
  loader.setDRACOLoader(dracoLoader); 
  loader.loadAsync( "assets/test.glb", undefined)
    .catch(err => console.error(err))
    .then(gltf => {
        mesh.add(...drillToMesh(gltf.scene.children))
        mesh.children[0].material.map = tp.getTexture(); 
        controls.minDistance = getMaxBound(mesh.children[0]);
        controls.maxDistance = controls.minDistance*2; 
  })

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild(renderer.domElement);
  camera.position.set(64,16,64)
  const light1 = new THREE.DirectionalLight( 0xdfffff, .8 );
  const light2 = new THREE.DirectionalLight( 0xffefbf, .8 );
  const light3 = new THREE.AmbientLight( 0xaaaaaa, .8 );
  light1.position.set( -2, -2, -2 );
  light2.position.set(  1,  1,  1 );
  scene.add(mesh, light1, light2, light3);
  scene.add(tp.getMarker()); 

  tp.mouse("LEFT", document);
  
  controls.listenToKeyEvents( window );
  controls.enablePan = false; 
  controls.enableDamping = true; 
  controls.mouseButtons = {RIGHT: THREE.MOUSE.ROTATE}
  controls.touches = {TWO: THREE.TOUCH.DOLLY_PAN}  
}

function animate( ){
  requestAnimationFrame(animate);
  raycaster.setFromCamera(pointer, camera);
  renderer.render(scene, camera);
  controls.update(); 
  tp.texture.needsUpdate = true; 
  tp.update();
}

// -- Events

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
})

window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
})

hueRangeEl.addEventListener("change", (e) => {
  tp.brush.changeColor("hsl(" + hueRangeEl.value + ", 100%, 60%)");
})

radiusRangeEl.addEventListener("change", (e) => {
  tp.changeBrush(radiusRangeEl.value, hardRangeEl.value ); 
})

hardRangeEl.addEventListener("change", (e) => {
  tp.changeBrush( radiusRangeEl.value, hardRangeEl.value ); 
})

opacityRangeEl.addEventListener("change", (e) => {
  tp.brush.changeOpacity(opacityRangeEl.value ); 
})

document.addEventListener("keydown", (e) => {
  if (e.keyCode == 90 && e.ctrlKey == true ) tp.undo(); 
});

// -- helpers

function drillToMesh(childArray){
  if (childArray[0].type == "Group" || childArray[0].type == "Scene")
      return(drillToMesh(childArray[0].children))
  else if (childArray[0].type == "Mesh")
      return([...childArray]);
}

function getMaxBound(mesh){
  let bb = new THREE.Box3().setFromObject(mesh);
  let s = new THREE.Vector3();
  bb.getSize(s);
  return(Math.max(s.x, s.y, s.z));  
}
