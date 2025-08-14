// Import Redux Toolkit's createSlice for simplified reducer creation
import { createSlice } from '@reduxjs/toolkit';

/**
 * Game slice - Manages game state and mechanics
 * Handles game board, pieces, scoring, and multiplayer state
 */
const gameSlice = createSlice({
  // Name of the slice, used for action type prefixes
  name: 'game',
  
  // Initial state when the application first loads
  initialState: {
    // Game status and state
    status: 'waiting',        // Current game status: waiting, playing, paused, finished
    isPlaying: false,         // Whether game is currently active
    isPaused: false,          // Whether game is paused
    
    // Game board and pieces
    board: [],                // 2D array representing the game board
    currentPiece: null,       // Currently falling piece
    nextPiece: null,          // Next piece to appear
    piecePosition: { x: 0, y: 0 },  // Current piece position on board
    
    // Game mechanics
    level: 1,                 // Current game level
    score: 0,                 // Current game score
    linesCleared: 0,          // Total lines cleared in this game
    linesToNextLevel: 10,     // Lines needed to advance to next level
    
    // Multiplayer state
    players: [],              // Array of all players in the game
    currentPlayer: null,      // Current player's information
    opponents: [],            // Array of opponent players
    gameStartTime: null,      // Timestamp when game started
    
    // Game settings
    boardWidth: 10,           // Number of columns in game board
    boardHeight: 20,          // Number of rows in game board
    dropSpeed: 1000,          // Initial drop speed in milliseconds
    
    // Game events and notifications
    lastAction: null,         // Last game action performed
    gameEvents: [],           // Array of recent game events
    notifications: [],        // Array of game notifications
  },

  // Reducer functions that handle state updates
  reducers: {
    /**
     * Set the game status
     * Called when game state changes (waiting, playing, paused, finished)
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with new status
     */
    setGameStatus: (state, action) => {
      state.status = action.payload;        // Update game status
      state.isPlaying = action.payload === 'playing';  // Update playing state
    },

    /**
     * Set the game board
     * Called when board state changes (pieces placed, lines cleared)
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with new board array
     */
    setBoard: (state, action) => {
      state.board = action.payload;         // Update game board
    },

    /**
     * Set the current falling piece
     * Called when a new piece appears or current piece changes
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with piece data
     */
    setCurrentPiece: (state, action) => {
      state.currentPiece = action.payload;  // Update current piece
    },

    /**
     * Set the next piece
     * Called when next piece is determined
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with next piece data
     */
    setNextPiece: (state, action) => {
      state.nextPiece = action.payload;     // Update next piece
    },

    /**
     * Update piece position
     * Called when piece moves or rotates
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with new position
     */
    setPiecePosition: (state, action) => {
      state.piecePosition = action.payload; // Update piece position
    },

    /**
     * Update game level
     * Called when player advances to next level
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with new level
     */
    setLevel: (state, action) => {
      state.level = action.payload;         // Update current level
      // Increase drop speed with level (faster gameplay)
      state.dropSpeed = Math.max(100, 1000 - (action.payload - 1) * 100);
    },

    /**
     * Update game score
     * Called when player earns points
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with new score
     */
    setScore: (state, action) => {
      state.score = action.payload;         // Update current score
    },

    /**
     * Update lines cleared count
     * Called when player clears lines
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with lines cleared count
     */
    setLinesCleared: (state, action) => {
      state.linesCleared = action.payload;  // Update lines cleared count
      
      // Check if level should increase
      const newLevel = Math.floor(action.payload / state.linesToNextLevel) + 1;
      if (newLevel > state.level) {
        state.level = newLevel;
        state.dropSpeed = Math.max(100, 1000 - (newLevel - 1) * 100);
      }
    },

    /**
     * Set all players in the game
     * Called when players join/leave or game starts
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with players array
     */
    setPlayers: (state, action) => {
      state.players = action.payload;       // Update players array
    },

    /**
     * Set current player information
     * Called when current player data changes
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with current player data
     */
    setCurrentPlayer: (state, action) => {
      state.currentPlayer = action.payload; // Update current player
    },

    /**
     * Set opponent players
     * Called when opponent information changes
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with opponents array
     */
    setOpponents: (state, action) => {
      state.opponents = action.payload;     // Update opponents array
    },

    /**
     * Set game start time
     * Called when game begins
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with start timestamp
     */
    setGameStartTime: (state, action) => {
      state.gameStartTime = action.payload; // Update game start time
    },

    /**
     * Add a game event
     * Called when significant game events occur
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with event data
     */
    addGameEvent: (state, action) => {
      state.gameEvents.push(action.payload); // Add new game event
      // Keep only last 10 events to prevent memory issues
      if (state.gameEvents.length > 10) {
        state.gameEvents.shift();
      }
    },

    /**
     * Add a notification
     * Called when game notifications should appear
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with notification data
     */
    addNotification: (state, action) => {
      state.notifications.push(action.payload); // Add new notification
      // Keep only last 5 notifications
      if (state.notifications.length > 5) {
        state.notifications.shift();
      }
    },

    /**
     * Remove a notification
     * Called when notification should be dismissed
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with notification index
     */
    removeNotification: (state, action) => {
      state.notifications.splice(action.payload, 1); // Remove notification at index
    },

    /**
     * Set last game action
     * Called when player performs an action
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with action data
     */
    setLastAction: (state, action) => {
      state.lastAction = action.payload;    // Update last action
    },

    /**
     * Pause the game
     * Called when game should be paused
     * @param {Object} state - Current Redux state
     */
    pauseGame: (state) => {
      state.isPaused = true;                // Mark game as paused
    },

    /**
     * Resume the game
     * Called when game should resume from pause
     * @param {Object} state - Current Redux state
     */
    resumeGame: (state) => {
      state.isPaused = false;               // Mark game as not paused
    },

    /**
     * Reset game state
     * Called when starting new game or resetting current game
     * @param {Object} state - Current Redux state
     */
    resetGame: (state) => {
      // Reset all game state to initial values
      state.status = 'waiting';
      state.isPlaying = false;
      state.isPaused = false;
      state.board = [];
      state.currentPiece = null;
      state.nextPiece = null;
      state.piecePosition = { x: 0, y: 0 };
      state.level = 1;
      state.score = 0;
      state.linesCleared = 0;
      state.linesToNextLevel = 10;
      state.dropSpeed = 1000;
      state.gameStartTime = null;
      state.lastAction = null;
      state.gameEvents = [];
      state.notifications = [];
    },

    /**
     * Clear all game data
     * Called when leaving game or cleaning up
     * @param {Object} state - Current Redux state
     */
    clearGame: (state) => {
      // Reset to initial state
      Object.assign(state, gameSlice.getInitialState());
    },
  },
});

// Export action creators for use in components
export const {
  setGameStatus,        // Set game status
  setBoard,             // Set game board
  setCurrentPiece,      // Set current piece
  setNextPiece,         // Set next piece
  setPiecePosition,     // Set piece position
  setLevel,             // Set game level
  setScore,             // Set game score
  setLinesCleared,      // Set lines cleared
  setPlayers,           // Set all players
  setCurrentPlayer,     // Set current player
  setOpponents,         // Set opponents
  setGameStartTime,     // Set game start time
  addGameEvent,         // Add game event
  addNotification,      // Add notification
  removeNotification,    // Remove notification
  setLastAction,        // Set last action
  pauseGame,            // Pause game
  resumeGame,           // Resume game
  resetGame,            // Reset game state
  clearGame,            // Clear all game data
} = gameSlice.actions;

// Export the reducer for use in the store
export default gameSlice.reducer; 