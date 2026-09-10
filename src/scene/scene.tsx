import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useEarthRotation } from './hooks/useEarthRotation';
import { useThree } from '@react-three/fiber';
import { EarthModel, MarsModel } from './Models';
import { useDebugCamera } from './hooks/useDebugCamera';

const Scene: React.FC = () => {
  const earthRef = useRef<THREE.Group>(null!);
  const marsRef = useRef<THREE.Group>(null!);
  const earthGlowRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();

  // Initialize debug camera controls
  useDebugCamera(camera);
  useEarthRotation(earthRef, earthGlowRef);

  useEffect(() => {
    camera.position.set(-4, 0, 10.5);
  }, [camera.position]);

  return (
    <>
      <directionalLight position={[3, 2, 10]} intensity={1.5} />

      <group ref={earthRef} scale={5}>
        <EarthModel />
      </group>
      <mesh ref={earthGlowRef} scale={5.5} visible={false}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.15}/>
      </mesh>

      <group ref={marsRef} position={[0, -40, 0]} scale={40}>
        <MarsModel />
      </group>
    </>
  );
};

export default Scene;