// Import Redux Toolkit's createSlice for simplified reducer creation
import { createSlice } from '@reduxjs/toolkit';

/**
 * UI slice - Manages user interface state and interactions
 * Handles loading states, error messages, modals, and UI preferences
 */
const uiSlice = createSlice({
  // Name of the slice, used for action type prefixes
  name: 'ui',
  
  // Initial state when the application first loads
  initialState: {
    // Loading and connection states
    loading: false,           // Global loading indicator
    connecting: false,        // Connection attempt in progress
    connected: false,         // Whether connected to server
    
    // Error handling
    error: null,              // Current error message (null when no error)
    errorType: null,          // Type of error (connection, game, validation, etc.)
    errorDetails: null,       // Additional error details
    
    // Modal and overlay states
    showModal: false,         // Whether any modal is visible
    modalType: null,          // Type of modal (settings, help, gameOver, etc.)
    modalData: null,          // Data to display in modal
    
    // Game interface states
    showGameControls: true,   // Whether game controls are visible
    showSpectrum: true,       // Whether opponent spectrum is visible
    showChat: false,          // Whether chat interface is visible
    showSettings: false,      // Whether settings panel is visible
    
    // UI preferences and settings
    theme: 'dark',            // Current theme (dark, light, auto)
    soundEnabled: true,       // Whether sound effects are enabled
    musicEnabled: true,       // Whether background music is enabled
    volume: 0.7,              // Audio volume (0.0 to 1.0)
    
    // Responsive design states
    isMobile: false,          // Whether running on mobile device
    isTablet: false,          // Whether running on tablet device
    screenSize: 'desktop',    // Current screen size category
    
    // Animation and transition states
    animationsEnabled: true,  // Whether animations are enabled
    transitionSpeed: 'normal', // Transition speed (slow, normal, fast)
    
    // Accessibility settings
    highContrast: false,      // High contrast mode for accessibility
    largeText: false,         // Large text mode for accessibility
    reducedMotion: false,     // Reduced motion for accessibility
  },

  // Reducer functions that handle state updates
  reducers: {
    /**
     * Set global loading state
     * Called when starting/stopping operations that show loading indicator
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with loading status
     */
    setLoading: (state, action) => {
      state.loading = action.payload;       // Update loading state
    },

    /**
     * Set connection state
     * Called when connection status changes
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with connection status
     */
    setConnected: (state, action) => {
      state.connected = action.payload;     // Update connection status
      state.connecting = false;             // No longer attempting to connect
    },

    /**
     * Set connecting state
     * Called when attempting to connect to server
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with connecting status
     */
    setConnecting: (state, action) => {
      state.connecting = action.payload;    // Update connecting status
    },

    /**
     * Set error message
     * Called when an error occurs that should be displayed to user
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with error information
     */
    setError: (state, action) => {
      state.error = action.payload.message;     // Set error message
      state.errorType = action.payload.type;    // Set error type
      state.errorDetails = action.payload.details; // Set error details
    },

    /**
     * Clear error message
     * Called when error should be dismissed or resolved
     * @param {Object} state - Current Redux state
     */
    clearError: (state) => {
      state.error = null;                     // Clear error message
      state.errorType = null;                 // Clear error type
      state.errorDetails = null;              // Clear error details
    },

    /**
     * Show modal
     * Called when modal should be displayed
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with modal information
     */
    showModal: (state, action) => {
      state.showModal = true;                 // Show modal
      state.modalType = action.payload.type;  // Set modal type
      state.modalData = action.payload.data;  // Set modal data
    },

    /**
     * Hide modal
     * Called when modal should be hidden
     * @param {Object} state - Current Redux state
     */
    hideModal: (state) => {
      state.showModal = false;                // Hide modal
      state.modalType = null;                 // Clear modal type
      state.modalData = null;                 // Clear modal data
    },

    /**
     * Toggle game controls visibility
     * Called when user wants to show/hide game controls
     * @param {Object} state - Current Redux state
     */
    toggleGameControls: (state) => {
      state.showGameControls = !state.showGameControls; // Toggle visibility
    },

    /**
     * Toggle spectrum visibility
     * Called when user wants to show/hide opponent spectrum
     * @param {Object} state - Current Redux state
     */
    toggleSpectrum: (state) => {
      state.showSpectrum = !state.showSpectrum; // Toggle visibility
    },

    /**
     * Toggle chat visibility
     * Called when user wants to show/hide chat interface
     * @param {Object} state - Current Redux state
     */
    toggleChat: (state) => {
      state.showChat = !state.showChat;       // Toggle visibility
    },

    /**
     * Toggle settings visibility
     * Called when user wants to show/hide settings panel
     * @param {Object} state - Current Redux state
     */
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings; // Toggle visibility
    },

    /**
     * Set theme
     * Called when user changes application theme
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with theme name
     */
    setTheme: (state, action) => {
      state.theme = action.payload;           // Update theme
    },

    /**
     * Toggle sound effects
     * Called when user wants to enable/disable sound effects
     * @param {Object} state - Current Redux state
     */
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled; // Toggle sound effects
    },

    /**
     * Toggle background music
     * Called when user wants to enable/disable background music
     * @param {Object} state - Current Redux state
     */
    toggleMusic: (state) => {
      state.musicEnabled = !state.musicEnabled; // Toggle background music
    },

    /**
     * Set audio volume
     * Called when user adjusts volume slider
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with volume level
     */
    setVolume: (state, action) => {
      state.volume = Math.max(0, Math.min(1, action.payload)); // Clamp volume between 0 and 1
    },

    /**
     * Set device type detection
     * Called when detecting device capabilities
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with device information
     */
    setDeviceType: (state, action) => {
      state.isMobile = action.payload.isMobile;     // Set mobile status
      state.isTablet = action.payload.isTablet;     // Set tablet status
      state.screenSize = action.payload.screenSize; // Set screen size category
    },

    /**
     * Toggle animations
     * Called when user wants to enable/disable animations
     * @param {Object} state - Current Redux state
     */
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled; // Toggle animations
    },

    /**
     * Set transition speed
     * Called when user changes transition speed preference
     * @param {Object} state - Current Redux state
     * @param {Object} action - Action object with speed setting
     */
    setTransitionSpeed: (state, action) => {
      state.transitionSpeed = action.payload; // Update transition speed
    },

    /**
     * Toggle high contrast mode
     * Called when user wants to enable/disable high contrast for accessibility
     * @param {Object} state - Current Redux state
     */
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast; // Toggle high contrast
    },

    /**
     * Toggle large text mode
     * Called when user wants to enable/disable large text for accessibility
     * @param {Object} state - Current Redux state
     */
    toggleLargeText: (state) => {
      state.largeText = !state.largeText;     // Toggle large text
    },

    /**
     * Toggle reduced motion
     * Called when user wants to enable/disable reduced motion for accessibility
     * @param {Object} state - Current Redux state
     */
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion; // Toggle reduced motion
    },

    /**
     * Reset UI to default settings
     * Called when user wants to restore default UI preferences
     * @param {Object} state - Current Redux state
     */
    resetToDefaults: (state) => {
      // Reset to initial state values
      state.theme = 'dark';
      state.soundEnabled = true;
      state.musicEnabled = true;
      state.volume = 0.7;
      state.animationsEnabled = true;
      state.transitionSpeed = 'normal';
      state.highContrast = false;
      state.largeText = false;
      state.reducedMotion = false;
    },

    /**
     * Clear all UI state
     * Called when cleaning up or resetting the application
     * @param {Object} state - Current Redux state
     */
    clearUI: (state) => {
      // Reset to initial state
      Object.assign(state, uiSlice.getInitialState());
    },
  },
});

// Export action creators for use in components
export const {
  setLoading,           // Set loading state
  setConnected,         // Set connection status
  setConnecting,        // Set connecting status
  setError,             // Set error message
  clearError,           // Clear error message
  showModal,            // Show modal
  hideModal,            // Hide modal
  toggleGameControls,   // Toggle game controls
  toggleSpectrum,       // Toggle spectrum visibility
  toggleChat,           // Toggle chat visibility
  toggleSettings,       // Toggle settings visibility
  setTheme,             // Set theme
  toggleSound,          // Toggle sound effects
  toggleMusic,          // Toggle background music
  setVolume,            // Set audio volume
  setDeviceType,        // Set device type
  toggleAnimations,     // Toggle animations
  setTransitionSpeed,   // Set transition speed
  toggleHighContrast,   // Toggle high contrast
  toggleLargeText,      // Toggle large text
  toggleReducedMotion,  // Toggle reduced motion
  resetToDefaults,      // Reset to defaults
  clearUI,              // Clear all UI state
} = uiSlice.actions;

// Export the reducer for use in the store
export default uiSlice.reducer; 