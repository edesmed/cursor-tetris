// Import React and ReactDOM for rendering the application
import React from 'react';                    // React core library
import ReactDOM from 'react-dom/client';      // React DOM rendering library

// Import Redux store and provider for state management
import { Provider } from 'react-redux';       // Redux provider component
import store from './store';                  // Configured Redux store

// Import main App component
import App from './App';                      // Root application component

// Import global CSS styles
import './index.css';                         // Global application styles

/**
 * Main entry point of the Red Tetris application
 * Sets up Redux store provider and renders the root component
 */

// Get the root DOM element where the React app will be mounted
// This element is defined in public/index.html with id="root"
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the React application
root.render(
  // StrictMode helps detect potential problems during development
  // It runs components twice to help identify side effects
  <React.StrictMode>
    {/* Redux Provider wraps the entire application */}
    {/* This makes the Redux store available to all components */}
    <Provider store={store}>
      {/* Main App component - the root of our component tree */}
      <App />
    </Provider>
  </React.StrictMode>
);

/**
 * Application Structure:
 * 
 * index.js (this file)
 * ├── Provider (Redux store wrapper)
 * │   └── App (main application component)
 * │       ├── Router (client-side navigation)
 * │       │   ├── Lobby (game lobby/entry point)
 * │       │   └── Game (main game interface)
 * │       └── ErrorBoundary (error handling wrapper)
 * 
 * Redux Store Slices:
 * ├── socket: WebSocket connection management
 * ├── player: Current player information
 * ├── game: Game state and mechanics
 * └── ui: User interface state and preferences
 * 
 * Key Features:
 * - Real-time multiplayer Tetris using Socket.IO
 * - Redux state management for predictable data flow
 * - React Router for client-side navigation
 * - Error boundaries for graceful error handling
 * - Responsive design for mobile and desktop
 */ 