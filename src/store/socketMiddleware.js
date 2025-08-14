// Socket middleware for handling socket-related actions
import { sendGameAction } from '../utils/socketUtils';

/**
 * Socket middleware - Intercepts socket-related actions and sends them to the server
 * This middleware sits between Redux actions and the socket connection
 */
const socketMiddleware = store => next => action => {
  // Let the action pass through to reducers first
  const result = next(action);
  
  // Check if this is a socket action that needs to be sent to the server
  if (action.type && action.type.startsWith('socket/')) {
    const socket = store.getState().socket.socket;
    
    if (socket && socket.connected) {
      switch (action.type) {
        case 'socket/movePiece':
          sendGameAction(socket, 'gameAction', {
            type: 'move',
            direction: action.payload.direction
          });
          break;
          
        case 'socket/rotatePiece':
          sendGameAction(socket, 'gameAction', {
            type: 'rotate'
          });
          break;
          
        case 'socket/hardDrop':
          sendGameAction(socket, 'gameAction', {
            type: 'hardDrop'
          });
          break;
          
        case 'socket/startGame':
          sendGameAction(socket, 'startGame', {
            roomName: action.payload.room
          });
          break;
          
        case 'socket/restartGame':
          sendGameAction(socket, 'restartGame', {
            roomName: action.payload.room
          });
          break;
          
        case 'socket/playerReady':
          sendGameAction(socket, 'playerReady', {
            roomName: action.payload.room
          });
          break;
          
        default:
          // Unknown socket action type
          console.warn('Unknown socket action type:', action.type);
      }
    } else {
      console.warn('Cannot send socket action: socket not connected');
    }
  }
  
  return result;
};

export default socketMiddleware;
