import { create } from 'zustand';
import * as THREE from 'three';
import gsap from 'gsap';

type CameraPanStore = {
  panToMars: (() => void) | null;
  setPanToMars: (fn: () => void) => void;
  smoothPanTo: (camera: THREE.Camera, targetPosition: THREE.Vector3, targetRotation?: THREE.Euler, duration?: number, ease?: string) => void;
  smoothPanToPosition: (camera: THREE.Camera, x: number, y: number, z: number, duration?: number, ease?: string) => void;
  smoothPanToRotation: (camera: THREE.Camera, x: number, y: number, z: number, duration?: number, ease?: string) => void;
};

export const useCameraPanStore = create<CameraPanStore>((set, get) => ({
  panToMars: null,
  setPanToMars: (fn) => set({ panToMars: fn }),
  
  smoothPanTo: (camera: THREE.Camera, targetPosition: THREE.Vector3, targetRotation?: THREE.Euler, duration: number = 2, ease: string = "power2.inOut") => {
    
    // Create a timeline for smooth animation
    const tl = gsap.timeline();
    
    // Animate position
    tl.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: duration,
      ease: ease,
      onUpdate: () => {
        // Ensure the camera matrix is updated
        camera.updateMatrixWorld();
      }
    }, 0);
    
    // Animate rotation if provided
    if (targetRotation) {
      tl.to(camera.rotation, {
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z,
        duration: duration,
        ease: ease,
        onUpdate: () => {
          // Ensure the camera matrix is updated
          camera.updateMatrixWorld();
        }
      }, 0);
    }
    
    return tl;
  },
  
  smoothPanToPosition: (camera: THREE.Camera, x: number, y: number, z: number, duration: number = 2, ease: string = "power2.inOut") => {
    const targetPosition = new THREE.Vector3(x, y, z);
    return get().smoothPanTo(camera, targetPosition, undefined, duration, ease);
  },
  
  smoothPanToRotation: (camera: THREE.Camera, x: number, y: number, z: number, duration: number = 2, ease: string = "power2.inOut") => {
    const targetRotation = new THREE.Euler(x, y, z);
    return get().smoothPanTo(camera, camera.position.clone(), targetRotation, duration, ease);
  }
})); 