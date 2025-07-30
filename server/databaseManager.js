const { Pool } = require('pg');

class DatabaseManager {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'red_tetris',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });
  }

  async init() {
    try {
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  async createTables() {
    const client = await this.pool.connect();
    try {
      // Create games table
      await client.query(`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          room_name VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'waiting',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create players table
      await client.query(`
        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,
          socket_id VARCHAR(255) UNIQUE NOT NULL,
          player_name VARCHAR(255) NOT NULL,
          room_name VARCHAR(255) NOT NULL,
          is_host BOOLEAN DEFAULT FALSE,
          score INTEGER DEFAULT 0,
          lines_cleared INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_name) REFERENCES games(room_name) ON DELETE CASCADE
        )
      `);

      // Create game_scores table for bonus features
      await client.query(`
        CREATE TABLE IF NOT EXISTS game_scores (
          id SERIAL PRIMARY KEY,
          player_name VARCHAR(255) NOT NULL,
          score INTEGER NOT NULL,
          lines_cleared INTEGER NOT NULL,
          game_duration INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createGame(roomName) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO games (room_name) VALUES ($1) RETURNING *',
        [roomName]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async addPlayer(socketId, playerName, roomName, isHost = false) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO players (socket_id, player_name, room_name, is_host) VALUES ($1, $2, $3, $4) RETURNING *',
        [socketId, playerName, roomName, isHost]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async removePlayer(socketId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM players WHERE socket_id = $1 RETURNING *',
        [socketId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getPlayersInRoom(roomName) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM players WHERE room_name = $1 ORDER BY created_at',
        [roomName]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getGame(roomName) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM games WHERE room_name = $1',
        [roomName]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateGameStatus(roomName, status) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'UPDATE games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE room_name = $2 RETURNING *',
        [status, roomName]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updatePlayerScore(socketId, score, linesCleared) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'UPDATE players SET score = $1, lines_cleared = $2 WHERE socket_id = $3 RETURNING *',
        [score, linesCleared, socketId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async saveGameScore(playerName, score, linesCleared, gameDuration) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO game_scores (player_name, score, lines_cleared, game_duration) VALUES ($1, $2, $3, $4) RETURNING *',
        [playerName, score, linesCleared, gameDuration]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getTopScores(limit = 10) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT player_name, score, lines_cleared, game_duration, created_at FROM game_scores ORDER BY score DESC LIMIT $1',
        [limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = DatabaseManager; 