const Piece = require('./piece');

class Game {
  constructor(roomName, io) {
    this.roomName = roomName;
    this.io = io;
    this.players = [];
    this.status = 'waiting'; // waiting, playing, finished
    this.pieceSequence = [];
    this.currentPieceIndex = 0;
    this.gameTimer = null;
    this.dropInterval = 1000; // 1 second
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    const index = this.players.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  start() {
    this.status = 'playing';
    this.generatePieceSequence();
    this.distributePieces();
    this.startGameLoop();
  }

  endGame(winner) {
    this.status = 'finished';
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  generatePieceSequence() {
    // Generate a sequence of all 7 tetromino types in random order
    const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    this.pieceSequence = [];
    
    // Generate multiple sets to ensure enough pieces
    for (let i = 0; i < 10; i++) {
      const shuffled = [...pieces].sort(() => Math.random() - 0.5);
      this.pieceSequence.push(...shuffled);
    }
  }

  distributePieces() {
    // Give each player the same piece sequence
    this.players.forEach(player => {
      player.currentPiece = new Piece(this.pieceSequence[this.currentPieceIndex]);
      player.nextPiece = new Piece(this.pieceSequence[this.currentPieceIndex + 1]);
      player.board = this.createEmptyBoard();
      player.score = 0;
      player.linesCleared = 0;
    });
  }

  createEmptyBoard() {
    const board = [];
    for (let row = 0; row < 20; row++) {
      board[row] = [];
      for (let col = 0; col < 10; col++) {
        board[row][col] = 0;
      }
    }
    return board;
  }

  startGameLoop() {
    this.gameTimer = setInterval(() => {
      this.players.forEach(player => {
        if (player.isAlive) {
          this.dropPiece(player);
        }
      });
    }, this.dropInterval);
  }

  dropPiece(player) {
    if (!player.currentPiece) return;

    const newY = player.currentPiece.y + 1;
    
    if (this.isValidPosition(player.board, player.currentPiece, player.currentPiece.x, newY)) {
      player.currentPiece.y = newY;
    } else {
      // Piece has landed, lock it in place
      this.lockPiece(player);
      this.clearLines(player);
      this.spawnNewPiece(player);
      
      // Check if game over
      if (!this.canSpawnPiece(player)) {
        player.isAlive = false;
        this.checkGameEnd();
      }
    }

    // Emit updated board to all players
    this.io.to(this.roomName).emit('boardUpdate', {
      playerId: player.id,
      board: player.board,
      spectrum: this.calculateSpectrum(player.board),
      currentPiece: player.currentPiece ? player.currentPiece.toJSON() : null
    });
  }

  lockPiece(player) {
    const piece = player.currentPiece;
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const boardRow = piece.y + row;
          const boardCol = piece.x + col;
          if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
            player.board[boardRow][boardCol] = piece.type;
          }
        }
      }
    }
  }

  clearLines(player) {
    let linesCleared = 0;
    
    for (let row = 19; row >= 0; row--) {
      if (this.isLineFull(player.board[row])) {
        // Remove the line
        player.board.splice(row, 1);
        // Add empty line at top
        player.board.unshift(new Array(10).fill(0));
        linesCleared++;
        row++; // Re-check the same row
      }
    }
    
    if (linesCleared > 0) {
      player.linesCleared += linesCleared;
      player.score += linesCleared * 100;
    }
    return linesCleared; // Return the number of lines cleared
  }

  isLineFull(line) {
    return line.every(cell => cell !== 0);
  }

  spawnNewPiece(player) {
    this.currentPieceIndex++;
    player.currentPiece = player.nextPiece;
    player.nextPiece = new Piece(this.pieceSequence[this.currentPieceIndex]);
    
    // Reset piece position
    player.currentPiece.x = 3;
    player.currentPiece.y = 0;
  }

  canSpawnPiece(player) {
    return this.isValidPosition(player.board, player.currentPiece, 3, 0);
  }

  isValidPosition(board, piece, x, y) {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const boardRow = y + row;
          const boardCol = x + col;
          
          if (boardRow < 0 || boardRow >= 20 || boardCol < 0 || boardCol >= 10) {
            return false;
          }
          
          if (board[boardRow][boardCol] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  movePiece(player, direction) {
    if (!player.currentPiece || !player.isAlive) {
      return { success: false };
    }

    let newX = player.currentPiece.x;
    let newY = player.currentPiece.y;

    switch (direction) {
      case 'left':
        newX--;
        break;
      case 'right':
        newX++;
        break;
      case 'down':
        newY++;
        break;
      default:
        return { success: false };
    }

    if (this.isValidPosition(player.board, player.currentPiece, newX, newY)) {
      player.currentPiece.x = newX;
      player.currentPiece.y = newY;
      return { 
        success: true, 
        board: player.board,
        spectrum: this.calculateSpectrum(player.board)
      };
    }

    return { success: false };
  }

  rotatePiece(player) {
    if (!player.currentPiece || !player.isAlive) {
      return { success: false };
    }

    const rotated = player.currentPiece.rotate();
    if (this.isValidPosition(player.board, rotated, player.currentPiece.x, player.currentPiece.y)) {
      player.currentPiece = rotated;
      return { 
        success: true, 
        board: player.board,
        spectrum: this.calculateSpectrum(player.board)
      };
    }

    return { success: false };
  }

  hardDrop(player) {
    if (!player.currentPiece || !player.isAlive) {
      return { success: false };
    }

    let dropDistance = 0;
    while (this.isValidPosition(player.board, player.currentPiece, player.currentPiece.x, player.currentPiece.y + 1)) {
      player.currentPiece.y++;
      dropDistance++;
    }

    // Lock piece and clear lines
    this.lockPiece(player);
    const linesCleared = this.clearLines(player);
    this.spawnNewPiece(player);

    return { 
      success: true, 
      board: player.board,
      spectrum: this.calculateSpectrum(player.board),
      linesCleared
    };
  }

  addPenaltyLinesToOthers(clearingPlayer, penaltyLines) {
    this.players.forEach(player => {
      if (player.id !== clearingPlayer.id && player.isAlive) {
        // Add penalty lines at the bottom
        for (let i = 0; i < penaltyLines; i++) {
          const penaltyLine = new Array(10).fill('X'); // Indestructible penalty blocks
          player.board.push(penaltyLine);
        }
        
        // Remove lines from top if board is too full
        while (player.board.length > 20) {
          player.board.shift();
        }
        
        // Check if player is now dead
        if (!this.canSpawnPiece(player)) {
          player.isAlive = false;
          this.checkGameEnd();
        }
      }
    });
  }

  checkGameEnd() {
    const alivePlayers = this.players.filter(p => p.isAlive);
    if (alivePlayers.length <= 1) {
      const winner = alivePlayers[0] || null;
      this.endGame(winner);
      
      this.io.to(this.roomName).emit('gameEnded', {
        winner: winner ? winner.toJSON() : null,
        players: this.getPlayersInfo()
      });
    }
  }

  calculateSpectrum(board) {
    const spectrum = [];
    for (let col = 0; col < 10; col++) {
      let height = 0;
      for (let row = 0; row < 20; row++) {
        if (board[row][col] !== 0) {
          height = 20 - row;
          break;
        }
      }
      spectrum.push(height);
    }
    return spectrum;
  }

  getCurrentPieces() {
    return this.players.map(player => ({
      playerId: player.id,
      currentPiece: player.currentPiece ? player.currentPiece.toJSON() : null,
      nextPiece: player.nextPiece ? player.nextPiece.toJSON() : null
    }));
  }

  getPlayersInfo() {
    return this.players.map(player => player.toJSON());
  }
}

module.exports = Game; 