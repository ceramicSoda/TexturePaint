//import './reset.css'
import './style.css'
import { Scene3D } from './TexturePaint'; 

let scene3D = new Scene3D(document.querySelector("#canvas-wrap"))
scene3D.init();
scene3D.animate();
document,addEventListener("resize", (e) =>  {scene3D.resize()});
document,addEventListener("mousemove", (e) => {scene3D.rayMouseMove(e)});
document,addEventListener("mouseup", (e) => {scene3D.rayMouseUp(e)});
document,addEventListener("mousedown", (e) => {scene3D.rayMouseDown(e)});
document,addEventListener("keydown", (e) => {scene3D.keyUndo(e)});