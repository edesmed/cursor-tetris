import { configureStore } from '@reduxjs/toolkit';
import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import socketMiddleware from '../middleware/socketMiddleware';
import gameReducer from './gameSlice';
import playerReducer from './playerSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    game: gameReducer,
    player: playerReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(thunk, socketMiddleware)
});

export default store; 