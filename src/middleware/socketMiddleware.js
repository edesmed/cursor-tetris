import io from 'socket.io-client';
import { gameActions } from '../store/gameSlice';
import { playerActions } from '../store/playerSlice';
import { uiActions } from '../store/uiSlice';

let socket = null;

const socketMiddleware = store => next => action => {
  if (action.type === 'socket/connect') {
    if (socket) {
      socket.disconnect();
    }
    
    socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');
    
    socket.on('connect', () => {
      console.log('Connected to server');
      store.dispatch(uiActions.setConnected(true));
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      store.dispatch(uiActions.setConnected(false));
    });
    
    socket.on('error', (data) => {
      store.dispatch(uiActions.setError(data.message));
    });
    
    socket.on('playerJoined', (data) => {
      store.dispatch(gameActions.addPlayer(data.player));
      store.dispatch(gameActions.updatePlayers(data.players));
    });
    
    socket.on('playerLeft', (data) => {
      store.dispatch(gameActions.removePlayer(data.playerId));
      store.dispatch(gameActions.updatePlayers(data.players));
    });
    
    socket.on('gameStarted', (data) => {
      store.dispatch(gameActions.startGame(data));
    });
    
    socket.on('gameEnded', (data) => {
      store.dispatch(gameActions.endGame(data));
    });
    
    socket.on('boardUpdate', (data) => {
      store.dispatch(gameActions.updateBoard(data));
    });
    
    socket.on('pieceMoved', (data) => {
      store.dispatch(gameActions.updatePiecePosition(data));
    });
    
    socket.on('pieceRotated', (data) => {
      store.dispatch(gameActions.updatePieceRotation(data));
    });
    
    socket.on('pieceDropped', (data) => {
      store.dispatch(gameActions.updatePieceDrop(data));
    });
    
    socket.on('penaltyLinesAdded', (data) => {
      store.dispatch(gameActions.addPenaltyLines(data));
    });
    
    socket.on('newHost', (data) => {
      store.dispatch(gameActions.setNewHost(data.host));
    });
  }
  
  if (action.type === 'socket/disconnect') {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
  
  if (action.type === 'socket/joinGame') {
    if (socket) {
      socket.emit('joinGame', action.payload);
    }
  }
  
  if (action.type === 'socket/startGame') {
    if (socket) {
      socket.emit('startGame', action.payload);
    }
  }
  
  if (action.type === 'socket/movePiece') {
    if (socket) {
      socket.emit('movePiece', action.payload);
    }
  }
  
  if (action.type === 'socket/rotatePiece') {
    if (socket) {
      socket.emit('rotatePiece', action.payload);
    }
  }
  
  if (action.type === 'socket/hardDrop') {
    if (socket) {
      socket.emit('hardDrop', action.payload);
    }
  }
  
  return next(action);
};

export default socketMiddleware; 