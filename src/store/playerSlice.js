// Import Redux Toolkit's createSlice for simplified reducer creation
import { createSlice } from '@reduxjs/toolkit';

/**
 * Player slice - Manages current player information and state
 * Handles player data, room assignment, and player-specific settings
 */
const playerSlice = createSlice({
  // Name of the slice, used for action type prefixes
  name: 'player',
  
  // Initial state when the application first loads
  initialState: {
    player: null,            // Current player object (null when not set)
    isHost: false,           // Whether current player is the game host
    ready: false,            // Whether player is ready to start game
    score: 0,                // Current game score
    linesCleared: 0,         // Total lines cleared in current game
    level: 1,                // Current game level
    gameOver: false,         // Whether player's game is over
    isAlive: true,           // Whether player is still alive in the game
  },

  // Reducer functions that handle state updates
  reducers: {
    /**
     * Set the current player information
     * Called when player joins a game or when player data changes
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with player data
     */
    setPlayer: (state, action) => {
      state.player = action.payload;        // Store player information
      state.isHost = action.payload?.isHost || false;  // Set host status
      state.ready = false;                  // Reset ready state for new game
      state.score = 0;                      // Reset score for new game
      state.linesCleared = 0;               // Reset lines cleared for new game
      state.level = 1;                      // Reset level for new game
      state.gameOver = false;               // Reset game over state
    },

    /**
     * Update player's host status
     * Called when host status changes (e.g., host leaves, new host assigned)
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with host status
     */
    setHostStatus: (state, action) => {
      state.isHost = action.payload;        // Update host status
    },

    /**
     * Set player's ready state
     * Called when player marks themselves as ready or not ready
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with ready status
     */
    setReady: (state, action) => {
      state.ready = action.payload;         // Update ready status
    },

    /**
     * Update player's score
     * Called when player earns points during gameplay
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with new score
     */
    updateScore: (state, action) => {
      state.score = action.payload;         // Update current score
    },

    /**
     * Update player's lines cleared count
     * Called when player clears lines during gameplay
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with lines cleared count
     */
    updateLinesCleared: (state, action) => {
      state.linesCleared = action.payload;  // Update lines cleared count
    },

    /**
     * Update player's game level
     * Called when player advances to a new level
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with new level
     */
    updateLevel: (state, action) => {
      state.level = action.payload;         // Update current level
    },

    /**
     * Set player's game over state
     * Called when player's game ends (win or lose)
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with game over status
     */
    setGameOver: (state, action) => {
      state.gameOver = action.payload;      // Update game over status
    },

    /**
     * Set player's alive status
     * Called when player is eliminated or revived
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with alive status
     */
    setIsAlive: (state, action) => {
      state.isAlive = action.payload;       // Update alive status
    },

    /**
     * Reset player's game state
     * Called when starting a new game or resetting current game
     * @param {Object} state - Current Redux state
     */
    resetGameState: (state) => {
      state.ready = false;                  // Reset ready status
      state.score = 0;                      // Reset score
      state.linesCleared = 0;               // Reset lines cleared
      state.level = 1;                      // Reset level
      state.gameOver = false;               // Reset game over status
      state.isAlive = true;                 // Reset alive status
    },

    /**
     * Clear player information
     * Called when player leaves the game or disconnects
     * @param {Object} state - Current Redux state
     */
    clearPlayer: (state) => {
      state.player = null;                  // Remove player information
      state.isHost = false;                 // Reset host status
      state.ready = false;                  // Reset ready status
      state.score = 0;                      // Reset score
      state.linesCleared = 0;               // Reset lines cleared
      state.level = 1;                      // Reset level
      state.gameOver = false;               // Reset game over status
      state.isAlive = true;                 // Reset alive status
    },
  },
});

// Export action creators for use in components
export const {
  setPlayer,           // Set current player data
  setHostStatus,       // Update host status
  setReady,            // Set ready status
  updateScore,         // Update score
  updateLinesCleared,  // Update lines cleared
  updateLevel,         // Update level
  setGameOver,         // Set game over status
  setIsAlive,          // Set alive status
  resetGameState,      // Reset game state
  clearPlayer,         // Clear player data
} = playerSlice.actions;

// Export the reducer for use in the store
export default playerSlice.reducer; 