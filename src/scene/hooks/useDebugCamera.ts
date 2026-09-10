import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MOVEMENT_SPEED = 0.1;
const MOUSE_SENSITIVITY = 0.002;

// Global state for debug mode that can be accessed outside Canvas
let globalDebugMode = false;
const debugModeListeners: Array<(mode: boolean) => void> = [];

export const setGlobalDebugMode = (mode: boolean) => {
  globalDebugMode = mode;
  debugModeListeners.forEach(listener => listener(mode));
};

export const getGlobalDebugMode = () => globalDebugMode;

export const subscribeToDebugMode = (listener: (mode: boolean) => void) => {
  debugModeListeners.push(listener);
  return () => {
    const index = debugModeListeners.indexOf(listener);
    if (index > -1) {
      debugModeListeners.splice(index, 1);
    }
  };
};

export const useDebugCamera = (camera: THREE.Camera) => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const keys = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    PageUp: false,
    PageDown: false,
    w: false,
    s: false,
    a: false,
    d: false,
  });
  
  const mousePosition = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);
  
  // Store original camera position and rotation
  const originalCameraState = useRef({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler()
  });

  useEffect(() => {
    // Safety check for camera
    if (!camera) {
      console.warn('useDebugCamera: Camera is not available');
      return;
    }

    // Store original camera state when hook initializes
    originalCameraState.current.position.copy(camera.position);
    originalCameraState.current.rotation.copy(camera.rotation);

    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle debug mode with numpad asterisk (*)
      if (event.key === '*' && event.location === 3) {
        const newMode = !isDebugMode;
        setIsDebugMode(newMode);
        setGlobalDebugMode(newMode);
        
        if (newMode) {
          // Entering debug mode - store current state as original
          originalCameraState.current.position.copy(camera.position);
          originalCameraState.current.rotation.copy(camera.rotation);
          console.log(`Debug mode enabled`);
          console.log('Debug Controls:');
          console.log('- Arrow keys or WASD: Move camera');
          console.log('- Page Up/Down: Move up/down');
          console.log('- Mouse: Look around (click to lock pointer)');
          console.log('- Enter: Log camera position and rotation');
          console.log('- Numpad *: Toggle debug mode');
          console.log('- Escape: Unlock mouse pointer');
          console.log('Current camera position:', {
            x: camera.position.x.toFixed(3),
            y: camera.position.y.toFixed(3),
            z: camera.position.z.toFixed(3)
          });
        } else {
          // Exiting debug mode - restore original camera state and unlock mouse
          camera.position.copy(originalCameraState.current.position);
          camera.rotation.copy(originalCameraState.current.rotation);
          
          // Unlock mouse pointer
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          isPointerLocked.current = false;
          
          // Reset mouse position
          mousePosition.current.x = 0;
          mousePosition.current.y = 0;
          
          console.log(`Debug mode disabled - camera restored to original position`);
        }
        return;
      }

      // Handle Escape key to unlock mouse
      if (event.key === 'Escape' && isDebugMode) {
        if (document.pointerLockElement) {
          document.exitPointerLock();
          isPointerLocked.current = false;
          console.log('Mouse pointer unlocked');
        }
        return;
      }

      // Log camera position and orientation with Enter in debug mode
      if (event.key === 'Enter' && isDebugMode) {
        const position = camera.position.clone();
        const rotation = camera.rotation.clone();
        console.log('Camera Debug Info:', {
          position: {
            x: position.x.toFixed(3),
            y: position.y.toFixed(3),
            z: position.z.toFixed(3)
          },
          rotation: {
            x: (rotation.x * 180 / Math.PI).toFixed(3) + '°',
            y: (rotation.y * 180 / Math.PI).toFixed(3) + '°',
            z: (rotation.z * 180 / Math.PI).toFixed(3) + '°'
          }
        });
        return;
      }

      // Handle movement keys
      if (event.key in keys.current) {
        keys.current[event.key as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key in keys.current) {
        keys.current[event.key as keyof typeof keys.current] = false;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDebugMode || !isPointerLocked.current) return;
      
      // Fix inverted left/right movement by negating the X movement
      mousePosition.current.x -= event.movementX * MOUSE_SENSITIVITY;
      // Fix inverted up/down movement by negating the Y movement
      mousePosition.current.y -= event.movementY * MOUSE_SENSITIVITY;
      
      // Clamp vertical rotation to prevent gimbal lock
      mousePosition.current.y = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, mousePosition.current.y));
    };

    const handleClick = () => {
      if (!isDebugMode) return;
      
      if (!isPointerLocked.current) {
        // Lock mouse pointer
        document.body.requestPointerLock();
        isPointerLocked.current = true;
      } else {
        // Unlock mouse pointer
        document.exitPointerLock();
        isPointerLocked.current = false;
      }
    };

    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      isPointerLocked.current = isLocked;
      
      if (!isLocked && isDebugMode) {
        // Mouse was unlocked (either by Escape or clicking again)
        console.log('Mouse pointer unlocked');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      // Cleanup: restore camera state if debug mode was active
      if (isDebugMode) {
        camera.position.copy(originalCameraState.current.position);
        camera.rotation.copy(originalCameraState.current.rotation);
        
        // Unlock mouse pointer
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      }
      
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [camera, isDebugMode]);

  useFrame(() => {
    if (!isDebugMode || !camera) return;

    // Handle keyboard movement
    if (keys.current.ArrowUp || keys.current.w) {
      camera.translateZ(-MOVEMENT_SPEED);
    }
    if (keys.current.ArrowDown || keys.current.s) {
      camera.translateZ(MOVEMENT_SPEED);
    }
    if (keys.current.ArrowLeft || keys.current.a) {
      camera.translateX(-MOVEMENT_SPEED);
    }
    if (keys.current.ArrowRight || keys.current.d) {
      camera.translateX(MOVEMENT_SPEED);
    }
    if (keys.current.PageUp) {
      camera.translateY(MOVEMENT_SPEED);
    }
    if (keys.current.PageDown) {
      camera.translateY(-MOVEMENT_SPEED);
    }

    // Handle mouse rotation
    camera.rotation.y = mousePosition.current.x;
    camera.rotation.x = mousePosition.current.y;
    camera.rotation.z = 0;
  });

  return { isDebugMode };
};
