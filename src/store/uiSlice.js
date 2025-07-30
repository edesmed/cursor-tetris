import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  error: null,
  loading: false,
  showSpectrum: true
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    toggleSpectrum: (state) => {
      state.showSpectrum = !state.showSpectrum;
    }
  }
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer; 