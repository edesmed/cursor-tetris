const Game = require('./game');
const Player = require('./player');
const Piece = require('./piece');

class GameManager {
  constructor(io, dbManager) {
    this.io = io;
    this.dbManager = dbManager;
    this.games = new Map(); // roomName -> Game
    this.players = new Map(); // socketId -> Player
    this.socketToRoom = new Map(); // socketId -> roomName
  }

  async joinGame(socket, roomName, playerName) {
    try {
      // Check if player name is already taken in this room
      const existingPlayers = await this.dbManager.getPlayersInRoom(roomName);
      const nameExists = existingPlayers.some(p => p.player_name === playerName);
      
      if (nameExists) {
        socket.emit('error', { message: 'Player name already taken in this room' });
        return;
      }

      // Get or create game
      let game = this.games.get(roomName);
      if (!game) {
        const dbGame = await this.dbManager.getGame(roomName);
        if (!dbGame) {
          await this.dbManager.createGame(roomName);
        }
        game = new Game(roomName, this.io);
        this.games.set(roomName, game);
      }

      // Check if game is in progress
      if (game.status === 'playing') {
        socket.emit('error', { message: 'Game is already in progress' });
        return;
      }

      // Create player
      const isHost = game.players.length === 0;
      const player = new Player(socket.id, playerName, roomName, isHost);
      
      // Add to database
      await this.dbManager.addPlayer(socket.id, playerName, roomName, isHost);
      
      // Add to game
      game.addPlayer(player);
      
      // Store mappings
      this.players.set(socket.id, player);
      this.socketToRoom.set(socket.id, roomName);
      
      // Join socket room
      socket.join(roomName);
      
      // Notify all players in room
      this.io.to(roomName).emit('playerJoined', {
        player: player.toJSON(),
        players: game.getPlayersInfo()
      });
      
      console.log(`Player ${playerName} joined room ${roomName}`);
      
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  }

  async startGame(socket, roomName) {
    try {
      const game = this.games.get(roomName);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const player = this.players.get(socket.id);
      if (!player || !player.isHost) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }

      if (game.players.length < 1) {
        socket.emit('error', { message: 'Need at least 1 player to start' });
        return;
      }

      // Update game status
      await this.dbManager.updateGameStatus(roomName, 'playing');
      game.start();
      
      // Notify all players
      this.io.to(roomName).emit('gameStarted', {
        players: game.getPlayersInfo(),
        currentPieces: game.getCurrentPieces()
      });
      
      console.log(`Game started in room ${roomName}`);
      
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  }

  movePiece(socket, data) {
    const { direction } = data;
    const roomName = this.socketToRoom.get(socket.id);
    const game = this.games.get(roomName);
    
    if (!game || game.status !== 'playing') {
      return;
    }

    const player = this.players.get(socket.id);
    if (!player) {
      return;
    }

    const result = game.movePiece(player, direction);
    if (result.success) {
      this.io.to(roomName).emit('pieceMoved', {
        playerId: player.id,
        direction,
        board: result.board,
        spectrum: result.spectrum
      });
    }
  }

  rotatePiece(socket, data) {
    const roomName = this.socketToRoom.get(socket.id);
    const game = this.games.get(roomName);
    
    if (!game || game.status !== 'playing') {
      return;
    }

    const player = this.players.get(socket.id);
    if (!player) {
      return;
    }

    const result = game.rotatePiece(player);
    if (result.success) {
      this.io.to(roomName).emit('pieceRotated', {
        playerId: player.id,
        board: result.board,
        spectrum: result.spectrum
      });
    }
  }

  hardDrop(socket, data) {
    const roomName = this.socketToRoom.get(socket.id);
    const game = this.games.get(roomName);
    
    if (!game || game.status !== 'playing') {
      return;
    }

    const player = this.players.get(socket.id);
    if (!player) {
      return;
    }

    const result = game.hardDrop(player);
    if (result.success) {
      this.io.to(roomName).emit('pieceDropped', {
        playerId: player.id,
        board: result.board,
        spectrum: result.spectrum,
        linesCleared: result.linesCleared
      });

      // If lines were cleared, add penalty lines to other players
      if (result.linesCleared > 0) {
        const penaltyLines = result.linesCleared - 1;
        game.addPenaltyLinesToOthers(player, penaltyLines);
        
        this.io.to(roomName).emit('penaltyLinesAdded', {
          targetPlayerId: player.id,
          penaltyLines,
          affectedPlayers: game.getPlayersInfo()
        });
      }
    }
  }

  async handleDisconnect(socket) {
    try {
      const roomName = this.socketToRoom.get(socket.id);
      const player = this.players.get(socket.id);
      
      if (player && roomName) {
        const game = this.games.get(roomName);
        
        // Remove from database
        await this.dbManager.removePlayer(socket.id);
        
        // Remove from game
        if (game) {
          game.removePlayer(player);
          
          // Check if game should end
          if (game.players.length === 0) {
            this.games.delete(roomName);
            await this.dbManager.updateGameStatus(roomName, 'finished');
          } else if (game.status === 'playing') {
            // Check if only one player remains
            if (game.players.length === 1) {
              const winner = game.players[0];
              game.endGame(winner);
              
              this.io.to(roomName).emit('gameEnded', {
                winner: winner.toJSON(),
                players: game.getPlayersInfo()
              });
            } else {
              // Assign new host if needed
              if (player.isHost) {
                const newHost = game.players[0];
                newHost.isHost = true;
                this.io.to(roomName).emit('newHost', {
                  host: newHost.toJSON()
                });
              }
            }
          }
          
          // Notify remaining players
          this.io.to(roomName).emit('playerLeft', {
            playerId: player.id,
            players: game.getPlayersInfo()
          });
        }
        
        // Clean up mappings
        this.players.delete(socket.id);
        this.socketToRoom.delete(socket.id);
      }
      
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  getActiveGames() {
    return Array.from(this.games.values()).map(game => ({
      roomName: game.roomName,
      status: game.status,
      playerCount: game.players.length
    }));
  }

  getPlayersInRoom(roomName) {
    const game = this.games.get(roomName);
    return game ? game.getPlayersInfo() : [];
  }
}

module.exports = GameManager; 