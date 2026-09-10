import React, { useEffect, useState } from 'react';
import { subscribeToDebugMode } from '../scene/hooks/useDebugCamera';

const DebugIndicator: React.FC = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToDebugMode(setIsDebugMode);
    return unsubscribe;
  }, []);

  if (!isDebugMode) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      DEBUG MODE
    </div>
  );
};

export default DebugIndicator;
