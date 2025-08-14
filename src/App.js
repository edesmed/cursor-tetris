// Import React and necessary hooks
import React, { useEffect } from 'react';  // React core library and useEffect hook
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  // Client-side routing

// Import Redux store and actions
import { useDispatch, useSelector } from 'react-redux';  // Redux hooks for state management
import { setSocket } from './store/socketSlice';  // Action to set socket connection
import { setPlayer } from './store/playerSlice';  // Action to set current player info

// Import custom components
import Lobby from './components/Lobby';      // Main lobby/entry point component
import Game from './components/Game';        // Main game component
import ErrorBoundary from './components/ErrorBoundary';  // Error handling wrapper

// Import CSS for styling
import './App.css';

/**
 * Main App component - Root component of the application
 * Handles routing, socket connection, and global state management
 */
function App() {
  // Redux hooks for accessing store and dispatching actions
  const dispatch = useDispatch();  // Function to dispatch Redux actions
  const socket = useSelector(state => state.socket.socket);  // Current socket connection from store
  const player = useSelector(state => state.player.player);  // Current player info from store

  /**
   * Effect hook that runs when component mounts
   * Sets up socket connection and player information from URL
   */
  useEffect(() => {
    // Extract room name and player name from URL path
    // URL format: /room-name/player-name
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      const roomName = pathParts[0];    // First part is room name
      const playerName = pathParts[1];  // Second part is player name
      
      // Update Redux store with player information
      dispatch(setPlayer({
        room: roomName,
        name: playerName
      }));
    }
  }, [dispatch]); // Only re-run if dispatch function changes

  /**
   * Effect hook that runs when player info changes
   * Establishes socket connection when player info is available
   */
  useEffect(() => {
    // Only establish socket connection if we have player info and no existing socket
    if (player && !socket) {
      // Import socket connection dynamically to avoid issues during SSR
      import('./middleware/socketMiddleware').then(({ connectSocket }) => {
        // Connect to the game server
        const newSocket = connectSocket();
        
        // Store socket connection in Redux store
        dispatch(setSocket(newSocket));
        
        // Join the game room with player information
        newSocket.emit('joinGame', {
          roomName: player.room,
          playerName: player.name
        });
      }).catch(error => {
        console.error('Failed to establish socket connection:', error);
      });
    }
  }, [player, socket, dispatch]); // Re-run when player, socket, or dispatch changes

  /**
   * Render the main application
   * Uses React Router for navigation between different views
   */
  return (
    // Error boundary wrapper to catch and handle any React errors gracefully
    <ErrorBoundary>
      {/* Router component that enables client-side navigation */}
      <Router>
        {/* Main container for the application */}
        <div className="App">
          {/* Route definitions for different application views */}
          <Routes>
            {/* Route for the main lobby/entry point */}
            <Route 
              path="/:room/:player" 
              element={
                // If we have a socket connection, show the game
                // Otherwise, show the lobby (which handles connection)
                socket ? <Game /> : <Lobby />
              } 
            />
            
            {/* Default route - redirect to a sample room/player */}
            <Route 
              path="/" 
              element={
                // Redirect to a default room and player name
                // This provides a starting point for users
                <Navigate to="/lobby/player" replace />
              } 
            />
            
            {/* Catch-all route for invalid URLs */}
            <Route 
              path="*" 
              element={
                // Redirect invalid URLs to the default route
                <Navigate to="/lobby/player" replace />
              } 
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

// Export the App component as the default export
export default App; 