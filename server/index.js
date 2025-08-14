// Import required Node.js modules and third-party packages
const express = require('express');           // Web framework for creating HTTP server
const http = require('http');                 // Built-in HTTP module for creating server
const socketIo = require('socket.io');        // Real-time bidirectional communication library
const cors = require('cors');                 // Cross-Origin Resource Sharing middleware
const path = require('path');                 // Built-in path utilities for file/directory operations
require('dotenv').config();                   // Load environment variables from .env file

// Import our custom modules
const DatabaseManager = require('./databaseManager');  // Database operations manager
const GameManager = require('./gameManager');          // Game logic and state manager

// Create Express application instance
const app = express();

// Create HTTP server instance using Express app
const server = http.createServer(app);

// Create Socket.IO instance attached to the HTTP server
// This enables real-time WebSocket communication between clients and server
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",  // Allow connections from client
    methods: ["GET", "POST"]                                    // Allow GET and POST requests
  }
});

// Configure middleware for Express app
app.use(cors());  // Enable CORS for cross-origin requests
app.use(express.json());  // Parse JSON request bodies
app.use(express.static(path.join(__dirname, '../public')));  // Serve static files from public directory

// Initialize database manager instance
const dbManager = new DatabaseManager();

// Initialize game manager instance with Socket.IO and database manager
const gameManager = new GameManager(io, dbManager);

// Initialize database when server starts
// This creates all necessary tables if they don't exist
dbManager.init().catch(console.error);

// Socket.IO connection event handler
// This runs every time a new client connects to the server
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);  // Log new connection

  // Handle client joining a game room
  // This is called when a player wants to join a specific game
  socket.on('joinGame', async (data) => {
    try {
      const { roomName, playerName } = data;  // Extract room name and player name from request
      
      // Check if the requested room exists in the database
      let game = await dbManager.getGame(roomName);
      
      if (!game) {
        // If room doesn't exist, create it
        game = await dbManager.createGame(roomName);
        console.log(`Created new game room: ${roomName}`);
      }
      
      // Check if the room is already full (max 4 players)
      const playersInRoom = await dbManager.getPlayersInRoom(roomName);
      if (playersInRoom.length >= 4) {
        // Send error message if room is full
        socket.emit('error', { message: 'Room is full' });
        return;
      }
      
      // Determine if this player should be the host
      // First player to join becomes the host
      const isHost = playersInRoom.length === 0;
      
      // Add player to the database
      const player = await dbManager.addPlayer(socket.id, playerName, roomName, isHost);
      
      // Join the Socket.IO room for this game
      // This allows the server to send messages to all players in the same game
      socket.join(roomName);
      
      // Store player information in the socket for later use
      socket.roomName = roomName;
      socket.playerName = playerName;
      
      // Notify the game manager that a player joined
      // This updates the game state and notifies other players
      gameManager.handlePlayerJoin(roomName, player);
      
      console.log(`Player ${playerName} joined room ${roomName}`);
      
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  // Handle client disconnection
  // This runs when a player leaves the game or closes their browser
  socket.on('disconnect', async () => {
    try {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.roomName) {
        // Remove player from database
        const removedPlayer = await dbManager.removePlayer(socket.id);
        
        if (removedPlayer) {
          // Notify game manager that player left
          // This updates the game state and notifies other players
          gameManager.handlePlayerLeave(socket.roomName, removedPlayer);
          
          // Leave the Socket.IO room
          socket.leave(socket.roomName);
          
          console.log(`Player ${removedPlayer.player_name} left room ${socket.roomName}`);
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle game start request from host
  // Only the host can start the game
  socket.on('startGame', (data) => {
    if (socket.roomName) {
      gameManager.startGame(socket.roomName);
    }
  });

  // Handle game restart request from host
  // Only the host can restart the game
  socket.on('restartGame', (data) => {
    if (socket.roomName) {
      gameManager.restartGame(socket.roomName);
    }
  });

  // Handle player game actions (move, rotate, drop pieces)
  // These are the core Tetris gameplay commands
  socket.on('gameAction', (data) => {
    if (socket.roomName) {
      gameManager.handleGameAction(socket.roomName, socket.id, data);
    }
  });

  // Handle player ready state
  // Players can mark themselves as ready before the game starts
  socket.on('playerReady', (data) => {
    if (socket.roomName) {
      gameManager.handlePlayerReady(socket.roomName, socket.id);
    }
  });
});

// Define the port number for the server
// Use environment variable if set, otherwise default to 3001
const PORT = process.env.PORT || 3001;

// Start the server and listen for incoming connections
server.listen(PORT, () => {
  console.log(`Red Tetris server running on port ${PORT}`);
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown handling
// This ensures the server shuts down cleanly when receiving termination signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await dbManager.close();  // Close database connections
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await dbManager.close();  // Close database connections
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 