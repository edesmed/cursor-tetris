import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'waiting', // waiting, playing, finished
  players: [],
  currentPlayer: null,
  boards: {},
  spectrums: {},
  currentPieces: {},
  nextPieces: {},
  winner: null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addPlayer: (state, action) => {
      const player = action.payload;
      const existingIndex = state.players.findIndex(p => p.id === player.id);
      if (existingIndex === -1) {
        state.players.push(player);
      } else {
        state.players[existingIndex] = player;
      }
    },
    
    removePlayer: (state, action) => {
      const playerId = action.payload;
      state.players = state.players.filter(p => p.id !== playerId);
      delete state.boards[playerId];
      delete state.spectrums[playerId];
      delete state.currentPieces[playerId];
      delete state.nextPieces[playerId];
    },
    
    updatePlayers: (state, action) => {
      state.players = action.payload;
    },
    
    startGame: (state, action) => {
      state.status = 'playing';
      state.players = action.payload.players;
      state.currentPieces = {};
      state.nextPieces = {};
      
      action.payload.currentPieces.forEach(pieceData => {
        state.currentPieces[pieceData.playerId] = pieceData.currentPiece;
        state.nextPieces[pieceData.playerId] = pieceData.nextPiece;
      });
    },
    
    endGame: (state, action) => {
      state.status = 'finished';
      state.winner = action.payload.winner;
      state.players = action.payload.players;
    },
    
    updateBoard: (state, action) => {
      const { playerId, board, spectrum, currentPiece } = action.payload;
      state.boards[playerId] = board;
      state.spectrums[playerId] = spectrum;
      if (currentPiece) {
        state.currentPieces[playerId] = currentPiece;
      }
    },
    
    updatePiecePosition: (state, action) => {
      const { playerId, board, spectrum } = action.payload;
      state.boards[playerId] = board;
      state.spectrums[playerId] = spectrum;
    },
    
    updatePieceRotation: (state, action) => {
      const { playerId, board, spectrum } = action.payload;
      state.boards[playerId] = board;
      state.spectrums[playerId] = spectrum;
    },
    
    updatePieceDrop: (state, action) => {
      const { playerId, board, spectrum, linesCleared } = action.payload;
      state.boards[playerId] = board;
      state.spectrums[playerId] = spectrum;
      
      // Update player score
      const player = state.players.find(p => p.id === playerId);
      if (player && linesCleared > 0) {
        player.linesCleared += linesCleared;
        player.score += linesCleared * 100;
      }
    },
    
    addPenaltyLines: (state, action) => {
      const { targetPlayerId, penaltyLines, affectedPlayers } = action.payload;
      state.players = affectedPlayers;
    },
    
    setNewHost: (state, action) => {
      const newHost = action.payload;
      const player = state.players.find(p => p.id === newHost.id);
      if (player) {
        player.isHost = true;
      }
    },
    
    resetGame: (state) => {
      state.status = 'waiting';
      state.players = [];
      state.boards = {};
      state.spectrums = {};
      state.currentPieces = {};
      state.nextPieces = {};
      state.winner = null;
    }
  }
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer; 