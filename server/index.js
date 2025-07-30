const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const GameManager = require('./gameManager');
const DatabaseManager = require('./databaseManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database initialization
const dbManager = new DatabaseManager();
dbManager.init();

// Game manager
const gameManager = new GameManager(io, dbManager);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinGame', (data) => {
    gameManager.joinGame(socket, data.room, data.playerName);
  });
  
  socket.on('startGame', (data) => {
    gameManager.startGame(socket, data.room);
  });
  
  socket.on('movePiece', (data) => {
    gameManager.movePiece(socket, data);
  });
  
  socket.on('rotatePiece', (data) => {
    gameManager.rotatePiece(socket, data);
  });
  
  socket.on('hardDrop', (data) => {
    gameManager.hardDrop(socket, data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    gameManager.handleDisconnect(socket);
  });
});

// API routes
app.get('/api/games', (req, res) => {
  const games = gameManager.getActiveGames();
  res.json(games);
});

app.get('/api/players/:room', (req, res) => {
  const players = gameManager.getPlayersInRoom(req.params.room);
  res.json(players);
});

// Serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Red Tetris server running on port ${PORT}`);
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

module.exports = { app, server, io }; 