import './reset.css'
import './style.css'
import { Scene3D } from './VertexPaint'; 

let scene3D = new Scene3D(document.querySelector("#canvas-wrap"))
scene3D.init();
scene3D.animate();
document,addEventListener("resize", (event) => {scene3D.resize()});