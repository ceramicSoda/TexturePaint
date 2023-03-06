import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export function LoadMesh(path , mesh){
    let loader = new GLTFLoader(); 
    let dracoLoader = new DRACOLoader(); 
    dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' ); 
    loader.setDRACOLoader(dracoLoader); 
    if ( !mesh ){
        console.warn("Cannot load mesh: mesh must be Object3D");
        return mesh; 
    }
    loader.loadAsync( path, undefined)
        .catch(err => console.error(err))
        .then(gltf => {
            mesh.add(gltf.scene); 
        })
}

function findNestedMesh(childArray){
    if (childArray[0].type == "Group" || childArray[0].type == "Scene")
        return(findNestedMesh(childArray[0].children))
    else if (childArray[0].type == "Mesh")
        return([...childArray])
}