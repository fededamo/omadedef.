import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UIProvider } from './contexts/UIContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <UIProvider>
        <App />
      </UIProvider>
    </ErrorBoundary>
  </StrictMode>,
);
