// Import Socket.IO client library for real-time communication
import io from 'socket.io-client';

// Import Redux store actions for updating state
import { setConnected, setConnecting, setError, setDisconnected } from '../store/socketSlice';

/**
 * Socket middleware - Manages WebSocket connections and server communication
 * Handles connection establishment, event handling, and error management
 */

// Store reference to the socket connection
let socket = null;

// Store reference to the Redux store for dispatching actions
let store = null;

/**
 * Initialize the socket middleware with Redux store reference
 * Called once when the application starts
 * @param {Object} storeInstance - Redux store instance
 */
export const initSocketMiddleware = (storeInstance) => {
  store = storeInstance;
};

/**
 * Create and establish a new socket connection to the game server
 * Sets up event listeners and handles connection lifecycle
 * @returns {Object} Socket.IO instance
 */
export const connectSocket = () => {
  // Don't create multiple connections
  if (socket && socket.connected) {
    return socket;
  }

  // Mark connection attempt as in progress
  store?.dispatch(setConnecting(true));

  try {
    // Create socket connection to the game server
    // Uses environment variable for server URL or defaults to localhost:3001
    socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
      // Connection options for better reliability
      transports: ['websocket', 'polling'],  // Prefer WebSocket, fallback to polling
      timeout: 20000,                        // 20 second connection timeout
      reconnection: true,                     // Enable automatic reconnection
      reconnectionAttempts: 5,                // Try to reconnect 5 times
      reconnectionDelay: 1000,               // Wait 1 second between attempts
    });

    // Set up connection event listeners
    setupSocketEventListeners(socket);

    console.log('Socket connection established');
    return socket;

  } catch (error) {
    console.error('Failed to create socket connection:', error);
    
    // Dispatch error action to Redux store
    store?.dispatch(setError({
      message: 'Failed to connect to game server',
      type: 'connection',
      details: error.message
    }));
    
    store?.dispatch(setConnecting(false));
    return null;
  }
};

/**
 * Set up event listeners for the socket connection
 * Handles connection events, game events, and error handling
 * @param {Object} socketInstance - Socket.IO instance to set up listeners for
 */
const setupSocketEventListeners = (socketInstance) => {
  // Connection established successfully
  socketInstance.on('connect', () => {
    console.log('Connected to game server');
    
    // Update Redux store with connection status
    store?.dispatch(setConnected(true));
    store?.dispatch(setConnecting(false));
  });

  // Connection lost or failed
  socketInstance.on('disconnect', (reason) => {
    console.log('Disconnected from game server:', reason);
    
    // Update Redux store with disconnection status
    store?.dispatch(setDisconnected(reason));
  });

  // Connection error occurred
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    
    // Update Redux store with error information
    store?.dispatch(setError({
      message: 'Connection to game server failed',
      type: 'connection',
      details: error.message
    }));
    
    store?.dispatch(setConnecting(false));
  });

  // Reconnection attempt started
  socketInstance.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Attempting to reconnect (${attemptNumber})`);
    
    // Mark as attempting to connect
    store?.dispatch(setConnecting(true));
  });

  // Reconnection successful
  socketInstance.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    
    // Update Redux store with connection status
    store?.dispatch(setConnected(true));
    store?.dispatch(setConnecting(false));
  });

  // Reconnection failed
  socketInstance.on('reconnect_failed', () => {
    console.error('Failed to reconnect to game server');
    
    // Update Redux store with error information
    store?.dispatch(setError({
      message: 'Failed to reconnect to game server',
      type: 'connection',
      details: 'Maximum reconnection attempts exceeded'
    }));
    
    store?.dispatch(setConnecting(false));
  });

  // Game-specific event listeners
  setupGameEventListeners(socketInstance);
};

/**
 * Set up game-specific event listeners
 * Handles game events like player joins, game updates, etc.
 * @param {Object} socketInstance - Socket.IO instance to set up listeners for
 */
const setupGameEventListeners = (socketInstance) => {
  // Player joined the game room
  socketInstance.on('playerJoined', (data) => {
    console.log('Player joined:', data);
    // Game components will handle this event
  });

  // Player left the game room
  socketInstance.on('playerLeft', (data) => {
    console.log('Player left:', data);
    // Game components will handle this event
  });

  // Game started
  socketInstance.on('gameStarted', (data) => {
    console.log('Game started:', data);
    // Game components will handle this event
  });

  // Game restarted
  socketInstance.on('gameRestarted', (data) => {
    console.log('Game restarted:', data);
    // Game components will handle this event
  });

  // Game state updated
  socketInstance.on('gameStateUpdate', (data) => {
    console.log('Game state updated:', data);
    // Game components will handle this event
  });

  // All players are ready
  socketInstance.on('allPlayersReady', () => {
    console.log('All players are ready');
    // Game components will handle this event
  });

  // Player ready state changed
  socketInstance.on('playerReadyStateChanged', (data) => {
    console.log('Player ready state changed:', data);
    // Game components will handle this event
  });

  // Error message from server
  socketInstance.on('error', (data) => {
    console.error('Server error:', data);
    
    // Update Redux store with server error
    store?.dispatch(setError({
      message: data.message || 'Server error occurred',
      type: 'server',
      details: data.details
    }));
  });
};

/**
 * Get the current socket connection instance
 * @returns {Object|null} Socket.IO instance or null if not connected
 */
export const getSocket = () => {
  return socket;
};

/**
 * Check if socket is currently connected
 * @returns {boolean} True if connected, false otherwise
 */
export const isConnected = () => {
  return socket && socket.connected;
};

/**
 * Disconnect the socket connection
 * Called when cleaning up or leaving the game
 */
export const disconnectSocket = () => {
  if (socket) {
    // Remove all event listeners
    socket.removeAllListeners();
    
    // Disconnect from server
    socket.disconnect();
    
    // Clear socket reference
    socket = null;
    
    // Update Redux store
    store?.dispatch(setDisconnected('Manual disconnect'));
    
    console.log('Socket disconnected');
  }
};

/**
 * Send a game action to the server
 * Wrapper function for emitting game events
 * @param {string} eventName - Name of the event to emit
 * @param {Object} data - Data to send with the event
 */
export const sendGameAction = (eventName, data) => {
  if (socket && socket.connected) {
    socket.emit(eventName, data);
  } else {
    console.warn('Cannot send game action: socket not connected');
  }
};

/**
 * Join a game room
 * @param {string} roomName - Name of the room to join
 * @param {string} playerName - Name of the player joining
 */
export const joinGame = (roomName, playerName) => {
  sendGameAction('joinGame', { roomName, playerName });
};

/**
 * Start the game (host only)
 * @param {string} roomName - Name of the room to start
 */
export const startGame = (roomName) => {
  sendGameAction('startGame', { roomName });
};

/**
 * Restart the game (host only)
 * @param {string} roomName - Name of the room to restart
 */
export const restartGame = (roomName) => {
  sendGameAction('restartGame', { roomName });
};

/**
 * Send a game action (move, rotate, drop)
 * @param {Object} actionData - Game action data
 */
export const sendGameMove = (actionData) => {
  sendGameAction('gameAction', actionData);
};

/**
 * Mark player as ready
 * @param {string} roomName - Name of the room
 */
export const setPlayerReady = (roomName) => {
  sendGameAction('playerReady', { roomName });
};

// Export all functions for use in components
export default {
  initSocketMiddleware,
  connectSocket,
  getSocket,
  isConnected,
  disconnectSocket,
  joinGame,
  startGame,
  restartGame,
  sendGameAction,
  sendGameMove,
  setPlayerReady,
}; 