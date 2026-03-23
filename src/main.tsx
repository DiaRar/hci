import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { BubbleStoreProvider } from './store/BubbleStore';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BubbleStoreProvider>
        <App />
      </BubbleStoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
