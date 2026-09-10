import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import CustomCursor from './common/CustomCursor';
import HTMLContent from './common/HTMLContent';
import DebugIndicator from './components/DebugIndicator';
import CanvasLoader from './common/CanvasLoader';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomCursor />
    <HTMLContent />
    <CanvasLoader />
    <DebugIndicator />
  </StrictMode>
);
