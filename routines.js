import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export function loadMesh(path , mesh){
    let loader = new GLTFLoader(); 
    let dracoLoader = new DRACOLoader(); 
    dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' ); 
    loader.setDRACOLoader(dracoLoader); 
    if ( !mesh || !mesh.isObject3D ){
        console.warn("Cannot load mesh: mesh must be Object3D");
        return mesh; 
    }
    loader.loadAsync( path, undefined)
        .catch(err => console.error(err))
        .then(gltf => {
            mesh.add(...drillToMesh(gltf.scene.children))
        })
}

export function drillToMesh(childArray){
    if (childArray[0].type == "Group" || childArray[0].type == "Scene")
        return(drillToMesh(childArray[0].children))
    else if (childArray[0].type == "Mesh")
        return([...childArray]);
}