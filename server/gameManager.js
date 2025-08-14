// Import required modules
const Game = require('./game');  // Core game logic class
const Player = require('./player');  // Player management class

/**
 * GameManager - Manages multiple game instances and handles player interactions
 * Acts as a bridge between Socket.IO connections and individual game instances
 */
class GameManager {
  constructor(io, dbManager) {
    this.io = io;                    // Socket.IO instance for real-time communication
    this.dbManager = dbManager;       // Database manager for persistent storage
    this.games = new Map();          // Map of active games: roomName -> Game instance
    this.players = new Map();        // Map of connected players: socketId -> Player instance
  }

  /**
   * Handle a new player joining a game room
   * Creates player instance and adds them to the game
   * @param {string} roomName - Name of the game room
   * @param {Object} playerData - Player data from database
   */
  handlePlayerJoin(roomName, playerData) {
    try {
      // Create a new Player instance for this player
      const player = new Player(
        playerData.socket_id,
        playerData.player_name,
        roomName,
        playerData.is_host
      );

      // Store player reference for quick access
      this.players.set(playerData.socket_id, player);

      // Get or create the game instance for this room
      let game = this.games.get(roomName);
      if (!game) {
        // Create new game instance if this is the first player
        game = new Game(roomName, this.io, this.dbManager);
        this.games.set(roomName, game);
      }

      // Add player to the game
      game.addPlayer(player);

      // Update database to reflect new game status
      this.dbManager.updateGameStatus(roomName, 'waiting');

      // Notify all players in the room about the new player
      this.io.to(roomName).emit('playerJoined', {
        player: playerData,
        players: game.getPlayers()
      });

      console.log(`Player ${playerData.player_name} joined game ${roomName}`);
    } catch (error) {
      console.error('Error handling player join:', error);
    }
  }

  /**
   * Handle a player leaving a game room
   * Removes player from game and cleans up if game is empty
   * @param {string} roomName - Name of the game room
   * @param {Object} playerData - Player data from database
   */
  handlePlayerLeave(roomName, playerData) {
    try {
      // Remove player from our local tracking
      this.players.delete(playerData.socket_id);

      // Get the game instance for this room
      const game = this.games.get(roomName);
      if (game) {
        // Remove player from the game
        game.removePlayer(playerData.socket_id);

        // Check if game is now empty
        if (game.getPlayerCount() === 0) {
          // Remove empty game and update database
          this.games.delete(roomName);
          this.dbManager.updateGameStatus(roomName, 'finished');
          console.log(`Game ${roomName} ended - no players remaining`);
        } else {
          // Check if host left and assign new host if needed
          if (playerData.is_host) {
            const newHost = game.assignNewHost();
            if (newHost) {
              // Update database with new host
              this.dbManager.updateGameStatus(roomName, 'waiting');
              console.log(`New host assigned in game ${roomName}: ${newHost.name}`);
            }
          }

          // Notify remaining players about the player who left
          this.io.to(roomName).emit('playerLeft', {
            player: playerData,
            players: game.getPlayers()
          });
        }
      }

      console.log(`Player ${playerData.player_name} left game ${roomName}`);
    } catch (error) {
      console.error('Error handling player leave:', error);
    }
  }

  /**
   * Start a game in a specific room
   * Only the host can start the game
   * @param {string} roomName - Name of the game room to start
   */
  startGame(roomName) {
    try {
      const game = this.games.get(roomName);
      if (game) {
        // Check if enough players are ready to start
        if (game.getPlayerCount() < 2) {
          this.io.to(roomName).emit('error', { message: 'Need at least 2 players to start' });
          return;
        }

        // Start the game
        game.start();
        
        // Update database status
        this.dbManager.updateGameStatus(roomName, 'playing');

        // Notify all players that game has started
        this.io.to(roomName).emit('gameStarted', {
          players: game.getPlayers(),
          gameState: game.getGameState()
        });

        console.log(`Game ${roomName} started`);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  /**
   * Restart a game in a specific room
   * Only the host can restart the game
   * @param {string} roomName - Name of the game room to restart
   */
  restartGame(roomName) {
    try {
      const game = this.games.get(roomName);
      if (game) {
        // Reset the game state
        game.restart();
        
        // Update database status
        this.dbManager.updateGameStatus(roomName, 'waiting');

        // Notify all players that game has been restarted
        this.io.to(roomName).emit('gameRestarted', {
          players: game.getPlayers(),
          gameState: game.getGameState()
        });

        console.log(`Game ${roomName} restarted`);
      }
    } catch (error) {
      console.error('Error restarting game:', error);
    }
  }

  /**
   * Handle game actions from players (move, rotate, drop pieces)
   * Routes the action to the appropriate game instance
   * @param {string} roomName - Name of the game room
   * @param {string} socketId - Socket ID of the player
   * @param {Object} actionData - Game action data (type, direction, etc.)
   */
  handleGameAction(roomName, socketId, actionData) {
    try {
      const game = this.games.get(roomName);
      if (game && game.isPlaying()) {
        // Process the game action
        const result = game.handlePlayerAction(socketId, actionData);
        
        if (result.success) {
          // Broadcast updated game state to all players in the room
          this.io.to(roomName).emit('gameStateUpdate', {
            gameState: game.getGameState(),
            lastAction: result.action
          });
        }
      }
    } catch (error) {
      console.error('Error handling game action:', error);
    }
  }

  /**
   * Handle player ready state
   * Players can mark themselves as ready before the game starts
   * @param {string} roomName - Name of the game room
   * @param {string} socketId - Socket ID of the player
   */
  handlePlayerReady(roomName, socketId) {
    try {
      const game = this.games.get(roomName);
      if (game) {
        // Mark player as ready
        game.setPlayerReady(socketId);
        
        // Check if all players are ready
        if (game.areAllPlayersReady()) {
          // Notify host that game can be started
          this.io.to(roomName).emit('allPlayersReady');
        }

        // Notify all players about the ready state change
        this.io.to(roomName).emit('playerReadyStateChanged', {
          players: game.getPlayers()
        });
      }
    } catch (error) {
      console.error('Error handling player ready:', error);
    }
  }

  /**
   * Get all active games
   * @returns {Array} Array of active game instances
   */
  getActiveGames() {
    return Array.from(this.games.values());
  }

  /**
   * Get a specific game by room name
   * @param {string} roomName - Name of the game room
   * @returns {Game|null} Game instance or null if not found
   */
  getGame(roomName) {
    return this.games.get(roomName);
  }

  /**
   * Get all players in a specific room
   * @param {string} roomName - Name of the game room
   * @returns {Array} Array of player instances in the room
   */
  getPlayersInRoom(roomName) {
    const game = this.games.get(roomName);
    return game ? game.getPlayers() : [];
  }

  /**
   * Clean up resources when shutting down
   * Called during server shutdown
   */
  cleanup() {
    // Stop all active games
    for (const game of this.games.values()) {
      game.stop();
    }
    
    // Clear all references
    this.games.clear();
    this.players.clear();
  }
}

module.exports = GameManager; 