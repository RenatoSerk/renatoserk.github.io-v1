import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { GLTFLoader, type GLTF } from 'three-stdlib';

const loader = new GLTFLoader();

function loadModel(path: string, setScene: (scene: THREE.Group) => void) {
    loader.load(path, (gltf: GLTF) => {
        // Traverse and update materials
        gltf.scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh;
                const origMat = mesh.material as THREE.MeshStandardMaterial;
                mesh.material = new THREE.MeshToonMaterial({
                    color: origMat.color,
                    map: origMat.map,
                    transparent: origMat.transparent,
                    opacity: origMat.opacity,
                });
            }
        });
        setScene(gltf.scene);
    });
}

export function EarthModel() {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    loadModel('/globeFlag.glb', setScene);
  }, []);

  if (!scene) return null;
  return (
    <primitive object={scene} />
  );
}

export function MarsModel() {
    const [scene, setScene] = useState<THREE.Group | null>(null);
  
    useEffect(() => {
      loadModel('/mars.glb', setScene);
    }, []);
  
    if (!scene) return null;
    return (
      <primitive object={scene} />
    );
  }