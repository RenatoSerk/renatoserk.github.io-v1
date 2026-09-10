import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useCursorStore } from '../../stores/useCursorStore';

const DAMPING = 0.95;
const UPRIGHT_RESTORATION_SPEED = 0.02;

export function useEarthRotation(earthRef: React.RefObject<THREE.Group>, glowRef: React.RefObject<THREE.Mesh>) {
  const { camera } = useThree();

  const lastMouse = useRef<THREE.Vector2>(new THREE.Vector2());
  const rotationVelocity = useRef<THREE.Vector2>(new THREE.Vector2());
  const prevIsHovering = useRef(false); // Store the previous isHovering value
  const { setIsHovering, isDragging, setIsDragging } = useCursorStore();

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(earthRef.current!, true);

    const hovering = intersects.length > 0;
    if (hovering !== prevIsHovering.current) {
      prevIsHovering.current = hovering;
      setIsHovering(hovering); // Only call setIsHovering if the value changes

      // Toggle glow visibility
      if (glowRef.current) {
        glowRef.current.visible = hovering;
      }
    }

    if (!isDragging) return;

    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;
    lastMouse.current.set(e.clientX, e.clientY);

    rotationVelocity.current.set(deltaY * 0.005, deltaX * 0.005);
  }, [camera, earthRef, glowRef, setIsHovering, isDragging]);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();

    const handlePointerDown = (e: PointerEvent) => {
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(earthRef.current!, true);

      if (intersects.length > 0) {
        setIsDragging(true);
        lastMouse.current.set(e.clientX, e.clientY);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [camera, earthRef, handlePointerMove, setIsDragging]);

  useFrame(() => {
    const earth = earthRef.current;
    if (!earth) return;

    if (isDragging) {
      earth.rotation.x += rotationVelocity.current.x;
      earth.rotation.y += rotationVelocity.current.y;

    } else if (rotationVelocity.current.lengthSq() > 0.00001) {
      // Apply momentum after release
      earth.rotation.x += rotationVelocity.current.x;
      earth.rotation.y += rotationVelocity.current.y;
      rotationVelocity.current.multiplyScalar(DAMPING);
    } else {
      // Idle behavior when no drag and no motion
      earth.rotation.x += (-earth.rotation.x) * UPRIGHT_RESTORATION_SPEED;
      earth.rotation.y += -0.003;
    }
  });
}