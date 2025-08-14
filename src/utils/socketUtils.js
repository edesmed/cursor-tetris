// Socket utility functions for sending actions to the server
// This file contains pure functions that don't depend on the socket middleware

/**
 * Send a game action to the server via socket
 * @param {Object} socket - Socket.IO instance
 * @param {string} eventName - Name of the event to emit
 * @param {Object} data - Data to send with the event
 */
export const sendGameAction = (socket, eventName, data) => {
  if (socket && socket.connected) {
    socket.emit(eventName, data);
  } else {
    console.warn('Cannot send game action: socket not connected');
  }
};

/**
 * Send a game move action
 * @param {Object} socket - Socket.IO instance
 * @param {Object} actionData - Game action data
 */
export const sendGameMove = (socket, actionData) => {
  sendGameAction(socket, 'gameAction', actionData);
};

/**
 * Join a game room
 * @param {Object} socket - Socket.IO instance
 * @param {string} roomName - Name of the room to join
 * @param {string} playerName - Name of the player joining
 */
export const joinGame = (socket, roomName, playerName) => {
  sendGameAction(socket, 'joinGame', { roomName, playerName });
};

/**
 * Start the game (host only)
 * @param {Object} socket - Socket.IO instance
 * @param {string} roomName - Name of the room to start
 */
export const startGame = (socket, roomName) => {
  sendGameAction(socket, 'startGame', { roomName });
};

/**
 * Restart the game (host only)
 * @param {Object} socket - Socket.IO instance
 * @param {string} roomName - Name of the room to restart
 */
export const restartGame = (socket, roomName) => {
  sendGameAction(socket, 'restartGame', { roomName });
};

/**
 * Mark player as ready
 * @param {Object} socket - Socket.IO instance
 * @param {string} roomName - Name of the room
 */
export const setPlayerReady = (socket, roomName) => {
  sendGameAction(socket, 'playerReady', { roomName });
};
