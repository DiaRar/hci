/**
 * Bubbleverse Application Entry Point
 *
 * This is the main entry point for the React application.
 * It sets up the component tree with all necessary providers.
 *
 * ============================================================================
 * PROVIDER HIERARCHY (outer to inner)
 * ============================================================================
 *
 * StrictMode:
 *   - Enables React's development checks (double invocations, etc.)
 *   - Does nothing in production builds
 *
 * BrowserRouter:
 *   - Provides client-side routing context
 *   - Must wrap all components that use useNavigate, useLocation, etc.
 *   - Uses HTML5 history API (pushState/replaceState)
 *
 * BubbleStoreProvider:
 *   - Provides global state management via React Context
 *   - Wraps entire app so all components can access store
 *   - Handles localStorage persistence automatically
 *
 * App:
 *   - The root React component
 *   - Contains all route definitions (see App.tsx)
 *
 * ============================================================================
 * STYLES
 * ============================================================================
 *
 * index.css:
 *   - Tailwind CSS v4 imports
 *   - CSS custom properties (design tokens)
 *   - Minimal custom CSS (device frame, Leaflet overrides)
 *
 * leaflet/dist/leaflet.css:
 *   - Required for Leaflet map to render correctly
 *   - Provides default marker icons and map tiles styling
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AppProviders } from './AppProviders';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { BubbleStoreProvider } from './store/BubbleStore';

// Mount the application to the #root element in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BubbleStoreProvider>
        <AppProviders>
          <App />
        </AppProviders>
      </BubbleStoreProvider>
    </BrowserRouter>
  </StrictMode>,
);