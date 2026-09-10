import { useCallback } from 'react';
import * as THREE from 'three';
import { useCameraPanStore } from '../../stores/useCameraPanStore';

export const useSmoothCamera = (camera: THREE.Camera) => {
  const { smoothPanTo, smoothPanToPosition, smoothPanToRotation } = useCameraPanStore();

  const panTo = useCallback((
    targetPosition: THREE.Vector3, 
    targetRotation?: THREE.Euler, 
    duration: number = 2, 
    ease: string = "power2.inOut"
  ) => {
    return smoothPanTo(camera, targetPosition, targetRotation, duration, ease);
  }, [camera, smoothPanTo]);

  const panToPosition = useCallback((
    x: number, 
    y: number, 
    z: number, 
    duration: number = 2, 
    ease: string = "power2.inOut"
  ) => {
    return smoothPanToPosition(camera, x, y, z, duration, ease);
  }, [camera, smoothPanToPosition]);

  const panToRotation = useCallback((
    x: number, 
    y: number, 
    z: number, 
    duration: number = 2, 
    ease: string = "power2.inOut"
  ) => {
    return smoothPanToRotation(camera, x, y, z, duration, ease);
  }, [camera, smoothPanToRotation]);

  const panToLookAt = useCallback((
    target: THREE.Vector3, 
    duration: number = 2, 
    ease: string = "power2.inOut"
  ) => {
    // Calculate the direction to look at
    const direction = target.clone().sub(camera.position).normalize();
    
    // Convert direction to rotation
    const targetRotation = new THREE.Euler();
    targetRotation.setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction)
    );
    
    return smoothPanTo(camera, camera.position.clone(), targetRotation, duration, ease);
  }, [camera, smoothPanTo]);

  const panToOrbit = useCallback((
    center: THREE.Vector3,
    radius: number,
    phi: number, // horizontal angle
    theta: number, // vertical angle
    duration: number = 2,
    ease: string = "power2.inOut"
  ) => {
    // Calculate position based on spherical coordinates
    const x = center.x + radius * Math.sin(theta) * Math.cos(phi);
    const y = center.y + radius * Math.cos(theta);
    const z = center.z + radius * Math.sin(theta) * Math.sin(phi);
    
    const targetPosition = new THREE.Vector3(x, y, z);
    
    // Calculate rotation to look at center
    const direction = center.clone().sub(targetPosition).normalize();
    const targetRotation = new THREE.Euler();
    targetRotation.setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction)
    );
    
    return smoothPanTo(camera, targetPosition, targetRotation, duration, ease);
  }, [camera, smoothPanTo]);

  return {
    panTo,
    panToPosition,
    panToRotation,
    panToLookAt,
    panToOrbit
  };
};
