import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  name: '',
  roomName: '',
  isHost: false,
  isAlive: true,
  score: 0,
  linesCleared: 0
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayer: (state, action) => {
      return { ...state, ...action.payload };
    },
    
    updateScore: (state, action) => {
      const { score, linesCleared } = action.payload;
      state.score = score;
      state.linesCleared = linesCleared;
    },
    
    setAlive: (state, action) => {
      state.isAlive = action.payload;
    },
    
    setHost: (state, action) => {
      state.isHost = action.payload;
    },
    
    resetPlayer: (state) => {
      state.id = null;
      state.name = '';
      state.roomName = '';
      state.isHost = false;
      state.isAlive = true;
      state.score = 0;
      state.linesCleared = 0;
    }
  }
});

export const playerActions = playerSlice.actions;
export default playerSlice.reducer; 