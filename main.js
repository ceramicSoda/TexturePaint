import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TexurePaint } from './texturePaint'
import * as THREE from 'three';
import './style.css'

const mesh = new THREE.Group();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .01, 1000 );
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
        console.log(tp.texture);
  })

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild(renderer.domElement);
  camera.position.set(64,16,64)
  const light1 = new THREE.DirectionalLight( 0xdfffff, .8 );
  const light2 = new THREE.DirectionalLight( 0xffefbf, .8 );
  const light3 = new THREE.AmbientLight( 0xaaaaaa, .8 );
  light1.position.set( -2, -2, -2 );
  light2.position.set(  1,  1,  1 );
  tp.mouse("LEFT", document);
  tp.texture.needsUpdate = true;
  tp.brush.changeBrush(14,0.2);
  scene.add(mesh, light1, light2, light3);
  scene.add(tp.getMarker()); 

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

function getMaxBound(mesh){
  let bb = new THREE.Box3().setFromObject(mesh);
  let s = new THREE.Vector3();
  bb.getSize(s);
  return(Math.max(s.x, s.y, s.z));  
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
})

window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
})

function drillToMesh(childArray){
  if (childArray[0].type == "Group" || childArray[0].type == "Scene")
      return(drillToMesh(childArray[0].children))
  else if (childArray[0].type == "Mesh")
      return([...childArray]);
}