// Import Redux Toolkit's createSlice for simplified reducer creation
import { createSlice } from '@reduxjs/toolkit';

/**
 * Socket slice - Manages WebSocket connection state
 * Handles connection status, socket instance, and connection events
 */
const socketSlice = createSlice({
  // Name of the slice, used for action type prefixes
  name: 'socket',
  
  // Initial state when the application first loads
  initialState: {
    socket: null,           // Socket.IO instance (null when disconnected)
    connected: false,       // Connection status boolean
    connecting: false,      // Connection attempt in progress
    error: null,            // Connection error message (null when no error)
    room: null,             // Current room name (null when not in a room)
  },

  // Reducer functions that handle state updates
  reducers: {
    /**
     * Set the socket connection instance
     * Called when successfully connecting to the server
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with socket payload
     */
    setSocket: (state, action) => {
      state.socket = action.payload;        // Store the socket instance
      state.connected = !!action.payload;   // Set connected based on socket existence
      state.connecting = false;             // No longer attempting to connect
      state.error = null;                   // Clear any previous errors
    },

    /**
     * Mark connection attempt as in progress
     * Called when attempting to connect to the server
     * @param {Object} state - Current Redux state
     */
    setConnecting: (state) => {
      state.connecting = true;              // Mark as attempting to connect
      state.error = null;                   // Clear any previous errors
    },

    /**
     * Mark connection as successful
     * Called when socket connection is established
     * @param {Object} state - Current Redux state
     */
    setConnected: (state) => {
      state.connected = true;               // Mark as connected
      state.connecting = false;             // No longer attempting to connect
      state.error = null;                   // Clear any previous errors
    },

    /**
     * Mark connection as failed
     * Called when socket connection fails
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with error message
     */
    setDisconnected: (state, action) => {
      state.socket = null;                  // Remove socket instance
      state.connected = false;              // Mark as disconnected
      state.connecting = false;             // No longer attempting to connect
      state.error = action.payload;         // Store error message
    },

    /**
     * Set connection error message
     * Called when connection encounters an error
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with error message
     */
    setError: (state, action) => {
      state.error = action.payload;         // Store error message
      state.connecting = false;             // No longer attempting to connect
    },

    /**
     * Clear connection error
     * Called when error should be dismissed
     * @param {Object} state - Current Redux state
     */
    clearError: (state) => {
      state.error = null;                   // Remove error message
    },

    /**
     * Set current room name
     * Called when joining or leaving a game room
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with room name
     */
    setRoom: (state, action) => {
      state.room = action.payload;          // Store current room name
    },

    /**
     * Clear current room
     * Called when leaving a game room
     * @param {Object} state - Current Redux state
     */
    clearRoom: (state) => {
      state.room = null;                    // Remove room name
    },

    /**
     * Reset socket state to initial values
     * Called when cleaning up or resetting the application
     * @param {Object} state - Current Redux state
     */
    reset: (state) => {
      state.socket = null;                  // Remove socket instance
      state.connected = false;              // Mark as disconnected
      state.connecting = false;             // No longer attempting to connect
      state.error = null;                   // Clear error message
      state.room = null;                    // Clear room name
    },
  },
});

// Export action creators for use in components
export const {
  setSocket,        // Set socket instance
  setConnecting,    // Mark as connecting
  setConnected,     // Mark as connected
  setDisconnected,  // Mark as disconnected
  setError,         // Set error message
  clearError,       // Clear error message
  setRoom,          // Set room name
  clearRoom,        // Clear room name
  reset,            // Reset to initial state
} = socketSlice.actions;

// Export the reducer for use in the store
export default socketSlice.reducer; 