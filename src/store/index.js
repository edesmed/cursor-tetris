// Import Redux Toolkit for simplified Redux setup
import { configureStore } from '@reduxjs/toolkit';

// Import individual slice reducers
import socketReducer from './socketSlice';    // Manages WebSocket connection state
import playerReducer from './playerSlice';    // Manages current player information
import gameReducer from './gameSlice';        // Manages game state and logic
import uiReducer from './uiSlice';            // Manages UI state (loading, errors, etc.)

// Import socket middleware
import socketMiddleware from './socketMiddleware';

/**
 * Redux store configuration
 * Combines all slice reducers into a single store
 * Uses Redux Toolkit for simplified setup and better performance
 */
const store = configureStore({
  // Combine all slice reducers into the root state
  reducer: {
    socket: socketReducer,    // socket.* - WebSocket connection management
    player: playerReducer,    // player.* - Current player data
    game: gameReducer,        // game.* - Game state and mechanics
    ui: uiReducer,            // ui.* - User interface state
  },
  
  // Development tools configuration
  devTools: process.env.NODE_ENV !== 'production',  // Enable Redux DevTools in development
  
  // Middleware configuration
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});

// Export the configured store for use in the application
export default store; 