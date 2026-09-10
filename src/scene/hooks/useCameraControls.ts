import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const sensitivity = 0.002;
const smoothness = 0.1;
const pitchLimit = Math.PI / 2 - 0.1;

export const useCameraControls = (camera: THREE.Camera, pivot: React.RefObject<THREE.Object3D>) => {
  const pitch = useRef(0);
  const yaw = useRef(0);
  const currentRotation = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      yaw.current -= event.movementX * sensitivity;
      pitch.current -= event.movementY * sensitivity;

      pitch.current = Math.max(-pitchLimit, Math.min(pitchLimit, pitch.current));
    };

    const handleClick = () => {
      document.body.requestPointerLock();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  useFrame(() => {
    if (!camera || !pivot.current) return;

    currentRotation.current.yaw = THREE.MathUtils.lerp(
      currentRotation.current.yaw,
      yaw.current,
      smoothness
    );
    currentRotation.current.pitch = THREE.MathUtils.lerp(
      currentRotation.current.pitch,
      pitch.current,
      smoothness
    );

    pivot.current.rotation.y = currentRotation.current.yaw;
    camera.rotation.x = currentRotation.current.pitch;
    camera.rotation.z = 0;
  });
};
