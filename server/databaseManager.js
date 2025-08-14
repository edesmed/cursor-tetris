let Pool;
try {
  Pool = require('pg').Pool;
} catch (error) {
  console.warn('PostgreSQL module not available, using in-memory storage only');
  Pool = null;
}

/**
 * DatabaseManager - Handles all PostgreSQL database operations for the Tetris game
 * Uses connection pooling for efficient database connections
 * Falls back to in-memory storage if PostgreSQL is not available
 */
class DatabaseManager {
  constructor() {
    this.useInMemory = false;
    this.inMemoryData = {
      games: new Map(),
      players: new Map(),
      gameScores: []
    };
    
    try {
      if (!Pool) {
        throw new Error('PostgreSQL module not available');
      }
      
      // Create a connection pool to efficiently manage database connections
      // This allows multiple concurrent database operations without creating new connections each time
      this.pool = new Pool({
        user: process.env.DB_USER || 'postgres',        // Database username from environment or default
        host: process.env.DB_HOST || 'localhost',       // Database host from environment or localhost
        database: process.env.DB_NAME || 'red_tetris',  // Database name from environment or default
        password: process.env.DB_PASSWORD || 'password', // Database password from environment or default
        port: process.env.DB_PORT || 5432,              // Database port from environment or default PostgreSQL port
      });
    } catch (error) {
      console.warn('PostgreSQL connection failed, falling back to in-memory storage:', error.message);
      this.useInMemory = true;
    }
  }

  /**
   * Initialize the database by creating all required tables
   * Called when the server starts up to ensure database schema exists
   */
  async init() {
    try {
      if (this.useInMemory) {
        console.log('Using in-memory storage (PostgreSQL not available)');
        return;
      }
      
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.warn('Database initialization failed, falling back to in-memory storage:', error.message);
      this.useInMemory = true;
    }
  }

  /**
   * Create all database tables if they don't exist
   * Uses transactions to ensure all tables are created successfully or none are
   */
  async createTables() {
    const client = await this.pool.connect();
    try {
      // Start a transaction to ensure data consistency
      
      // Create games table to store game room information
      // Each game has a unique room name and status (waiting, playing, finished)
      await client.query(`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,                           -- Auto-incrementing unique identifier
          room_name VARCHAR(255) UNIQUE NOT NULL,          -- Unique room name for each game
          status VARCHAR(50) DEFAULT 'waiting',            -- Game status: waiting, playing, finished
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the game was created
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- When the game was last updated
        )
      `);

      // Create players table to store player information for each game
      // Links players to games via room_name foreign key
      await client.query(`
        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,                           -- Auto-incrementing unique identifier
          socket_id VARCHAR(255) UNIQUE NOT NULL,          -- WebSocket connection ID for real-time updates
          player_name VARCHAR(255) NOT NULL,               -- Display name of the player
          room_name VARCHAR(255) NOT NULL,                 -- Which game room the player is in
          is_host BOOLEAN DEFAULT FALSE,                   -- Whether this player is the game host
          score INTEGER DEFAULT 0,                         -- Current game score
          lines_cleared INTEGER DEFAULT 0,                 -- Total lines cleared in current game
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the player joined
          FOREIGN KEY (room_name) REFERENCES games(room_name) ON DELETE CASCADE  -- Link to games table, delete player if game is deleted
        )
      `);

      // Create game_scores table for persistent high score tracking
      // Stores final scores from completed games for leaderboards
      await client.query(`
        CREATE TABLE IF NOT EXISTS game_scores (
          id SERIAL PRIMARY KEY,                           -- Auto-incrementing unique identifier
          player_name VARCHAR(255) NOT NULL,               -- Name of the player who achieved this score
          score INTEGER NOT NULL,                          -- Final score achieved
          lines_cleared INTEGER NOT NULL,                  -- Total lines cleared in the game
          game_duration INTEGER NOT NULL,                  -- Game duration in seconds
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- When the score was recorded
        )
      `);

      // Commit the transaction if all tables were created successfully
      await client.query('COMMIT');
    } catch (error) {
      // Rollback the transaction if any table creation failed
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Create a new game room in the database
   * @param {string} roomName - Unique name for the game room
   * @returns {Object} The created game record
   */
  async createGame(roomName) {
    if (this.useInMemory) {
      const game = {
        id: Date.now(),
        room_name: roomName,
        status: 'waiting',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.inMemoryData.games.set(roomName, game);
      return game;
    }
    
    const client = await this.pool.connect();
    try {
      // Insert a new game record and return the created data
      const result = await client.query(
        'INSERT INTO games (room_name) VALUES ($1) RETURNING *',
        [roomName]
      );
      return result.rows[0];
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Add a new player to a game room
   * @param {string} socketId - WebSocket connection ID for real-time updates
   * @param {string} playerName - Display name of the player
   * @param {string} roomName - Name of the game room to join
   * @param {boolean} isHost - Whether this player is the game host
   * @returns {Object} The created player record
   */
  async addPlayer(socketId, playerName, roomName, isHost = false) {
    if (this.useInMemory) {
      const player = {
        id: Date.now(),
        socket_id: socketId,
        player_name: playerName,
        room_name: roomName,
        is_host: isHost,
        score: 0,
        lines_cleared: 0,
        created_at: new Date()
      };
      this.inMemoryData.players.set(socketId, player);
      return player;
    }
    
    const client = await this.pool.connect();
    try {
      // Insert a new player record and return the created data
      const result = await client.query(
        'INSERT INTO players (socket_id, player_name, room_name, is_host) VALUES ($1, $2, $3, $4) RETURNING *',
        [socketId, playerName, roomName, isHost]
      );
      return result.rows[0];
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Remove a player from the database when they disconnect
   * @param {string} socketId - WebSocket connection ID to remove
   * @returns {Object} The removed player record
   */
  async removePlayer(socketId) {
    if (this.useInMemory) {
      const player = this.inMemoryData.players.get(socketId);
      if (player) {
        this.inMemoryData.players.delete(socketId);
        return player;
      }
      return null;
    }
    
    const client = await this.pool.connect();
    try {
      // Delete the player record and return the removed data
      const result = await client.query(
        'DELETE FROM players WHERE socket_id = $1 RETURNING *',
        [socketId]
      );
      return result.rows[0];
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Get all players currently in a specific game room
   * @param {string} roomName - Name of the game room
   * @returns {Array} Array of player records in the room
   */
  async getPlayersInRoom(roomName) {
    if (this.useInMemory) {
      const players = Array.from(this.inMemoryData.players.values())
        .filter(player => player.room_name === roomName)
        .sort((a, b) => a.created_at - b.created_at);
      return players;
    }
    
    const client = await this.pool.connect();
    try {
      // Query all players in the specified room, ordered by when they joined
      const result = await client.query(
        'SELECT * FROM players WHERE room_name = $1 ORDER BY created_at',
        [roomName]
      );
      return result.rows;
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Get game information for a specific room
   * @param {string} roomName - Name of the game room
   * @returns {Object} Game record for the room
   */
  async getGame(roomName) {
    if (this.useInMemory) {
      return this.inMemoryData.games.get(roomName) || null;
    }
    
    const client = await this.pool.connect();
    try {
      // Query the game record for the specified room
      const result = await client.query(
        'SELECT * FROM games WHERE room_name = $1',
        [roomName]
      );
      return result.rows[0];
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Update the status of a game (e.g., from 'waiting' to 'playing' to 'finished')
   * @param {string} roomName - Name of the game room to update
   * @param {string} status - New status for the game
   * @returns {Object} Updated game record
   */
  async updateGameStatus(roomName, status) {
    const client = await this.pool.connect();
    try {
      // Update the game status and timestamp, return the updated record
      const result = await client.query(
        'UPDATE games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE room_name = $2 RETURNING *',
        [status, roomName]
      );
      return result.rows[0];
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Update a player's score and lines cleared during gameplay
   * @param {string} socketId - WebSocket connection ID of the player
   * @param {number} score - New score value
   * @param {number} linesCleared - New lines cleared count
   * @returns {Object} Updated player record
   */
  async updatePlayerScore(socketId, score, linesCleared) {
    const client = await this.pool.connect();
    try {
      // Update the player's score and lines cleared, return the updated record
      const result = await client.query(
        'UPDATE players SET score = $1, lines_cleared = $2 WHERE socket_id = $3 RETURNING *',
        [score, linesCleared, socketId]
      );
      return result.rows[0];
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Save a final game score to the high scores table
   * Called when a game ends to persist player achievements
   * @param {string} playerName - Name of the player
   * @param {number} score - Final score achieved
   * @param {number} linesCleared - Total lines cleared in the game
   * @param {number} gameDuration - Game duration in seconds
   * @returns {Object} Created score record
   */
  async saveGameScore(playerName, score, linesCleared, gameDuration) {
    const client = await this.pool.connect();
    try {
      // Insert a new high score record and return the created data
      const result = await client.query(
        'INSERT INTO game_scores (player_name, score, lines_cleared, game_duration) VALUES ($1, $2, $3, $4) RETURNING *',
        [playerName, score, linesCleared, gameDuration]
      );
      return result.rows[0];
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Get the top high scores for leaderboard display
   * @param {number} limit - Maximum number of scores to return (default: 10)
   * @returns {Array} Array of top score records ordered by score descending
   */
  async getTopScores(limit = 10) {
    const client = await this.pool.connect();
    try {
      // Query top scores ordered by highest score first, limited to specified count
      const result = await client.query(
        'SELECT player_name, score, lines_cleared, game_duration, created_at FROM game_scores ORDER BY score DESC LIMIT $1',
        [limit]
      );
      return result.rows;
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Cleanly close all database connections in the pool
   * Called when shutting down the server
   */
  async close() {
    if (this.useInMemory) {
      // Clear in-memory data
      this.inMemoryData.games.clear();
      this.inMemoryData.players.clear();
      this.inMemoryData.gameScores = [];
      return;
    }
    
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = DatabaseManager; 