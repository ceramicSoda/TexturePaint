import './style.css'
import { Scene3D } from './TexturePaint'; 

let hueRangeEl = document.querySelector("#hueRange");
let opacityRangeEl = document.querySelector("#opacityRange");
let radiusRangeEl = document.querySelector("#radiusRange");

let scene3D = new Scene3D(document.querySelector("#canvas-wrap"))
scene3D.init();
scene3D.animate();
window.addEventListener("resize", (e) =>  {scene3D.resize()});
document.addEventListener("mousemove", (e) => {scene3D.rayMouseMove(e)});
document.addEventListener("mouseup", (e) => {scene3D.rayMouseUp(e)});
document.addEventListener("mousedown", (e) => {scene3D.rayMouseDown(e)});
document.addEventListener("keydown", (e) => {scene3D.keyUndo(e)});

hueRangeEl.addEventListener("change", () => {
    scene3D.pt.brush.changeColor("hsl(" + hueRangeEl.value + ", 100%, 60%)");
})
radiusRangeEl.addEventListener("change", () => {
    scene3D.pt.brush.changeBrush(radiusRangeEl.value);
    scene3D.pt.marker.scale.set(1+scene3D.pt.brush.size/30, 1+scene3D.pt.brush.size/30, 1+scene3D.pt.brush.size/30);
})
opacityRangeEl.addEventListener("change", () => {
    scene3D.pt.brush.changeOpacity(opacityRangeEl.value);
})