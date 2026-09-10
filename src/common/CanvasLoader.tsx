import { Canvas } from '@react-three/fiber';
import Scene from '../scene/scene';

const CanvasLoader: React.FC = () => {
  return (
    <Canvas id="threejs-canvas" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 0,
      background: 'rgb(239, 232, 220)'
    }}>
      <Scene />
    </Canvas>
  );
};

export default CanvasLoader;
