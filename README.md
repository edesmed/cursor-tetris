# Red Tetris - Networked Multiplayer Tetris

A full-stack JavaScript implementation of networked multiplayer Tetris with Red Pelicans sauce. Built with React, Redux, Express, Socket.io, and PostgreSQL.

## Features

- **Multiplayer Tetris**: Play with friends in real-time
- **Synchronized Piece Sequence**: All players receive the same pieces in the same order
- **Line Injection**: Clear lines to send penalty lines to opponents
- **Spectrum Visualization**: See opponent board heights in real-time
- **Host Management**: First player becomes host, can start/restart games
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## Technology Stack

### Frontend

- **React 18** - Modern UI framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **CSS Grid/Flexbox** - Modern layouts (no tables)

### Backend

- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **PostgreSQL** - Database for persistence
- **Object-Oriented Programming** - Server-side architecture

### Development

- **Webpack** - Module bundling
- **Babel** - JavaScript transpilation
- **Jest** - Testing framework
- **ESLint** - Code linting

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd red-tetris
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**

   ```bash
   # Create database
   createdb red_tetris

   # Or using psql
   psql -U postgres
   CREATE DATABASE red_tetris;
   ```

4. **Configure environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the development servers**

   ```bash
   # Start both client and server
   npm run dev

   # Or start separately
   npm run server:dev  # Server on port 3001
   npm run client:dev  # Client on port 3000
   ```

## Game Rules

### Controls

- **Arrow Keys (← →)**: Move piece horizontally
- **Arrow Down (↓)**: Soft drop
- **Arrow Up (↑)**: Rotate piece
- **Spacebar**: Hard drop

### Multiplayer Features

- **Same Piece Sequence**: All players receive identical pieces
- **Line Injection**: Clearing lines sends (n-1) penalty lines to opponents
- **Penalty Lines**: Indestructible lines that appear at the bottom
- **Spectrum View**: Real-time visualization of opponent board heights
- **Last Player Standing**: Winner is the last player alive

### Game Flow

1. **Join Room**: Navigate to `http://localhost:3000/room-name/player-name`
2. **Wait for Players**: Host can see all connected players
3. **Start Game**: Host clicks "Start Game" when ready
4. **Play**: Use controls to move and rotate pieces
5. **Win**: Be the last player alive!

## Architecture

### Client-Side (Functional Programming)

- **Pure Functions**: All game logic uses pure functions
- **No `this`**: Client code avoids `this` keyword (except Error classes)
- **Redux**: Centralized state management
- **Socket Middleware**: Encapsulated WebSocket communication

### Server-Side (Object-Oriented)

- **Game Class**: Manages game state and logic
- **Player Class**: Handles player data and state
- **Piece Class**: Tetromino shapes and rotation
- **Database Manager**: PostgreSQL operations

### Database Schema

```sql
-- Games table
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  room_name VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  socket_id VARCHAR(255) UNIQUE NOT NULL,
  player_name VARCHAR(255) NOT NULL,
  room_name VARCHAR(255) NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  lines_cleared INTEGER DEFAULT 0
);

-- Game scores table (bonus feature)
CREATE TABLE game_scores (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  lines_cleared INTEGER NOT NULL,
  game_duration INTEGER NOT NULL
);
```

## Development

### Scripts

```bash
npm start          # Production server
npm run dev        # Development (client + server)
npm run server:dev # Server only
npm run client:dev # Client only
npm run build      # Build client
npm test           # Run tests
npm run coverage   # Test coverage
npm run lint       # Lint code
```

### Testing

- **Coverage Requirements**: 70% statements, 50% branches
- **Jest Configuration**: JSDOM environment for React testing
- **Test Files**: `*.test.js` or `*.spec.js`

### Code Style

- **ESLint**: Enforces code quality
- **Functional Programming**: Client-side pure functions
- **Object-Oriented**: Server-side classes
- **Modern JavaScript**: ES6+ features

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

- `DB_USER`: PostgreSQL username
- `DB_HOST`: Database host
- `DB_NAME`: Database name
- `DB_PASSWORD`: Database password
- `DB_PORT`: Database port
- `PORT`: Server port (default: 3001)
- `CLIENT_URL`: Client URL for CORS

## Bonus Features

- **Score Persistence**: High scores saved to database
- **Game Statistics**: Detailed player performance tracking
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Graceful error recovery
- **Loading States**: Smooth user experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is part of the Red Tetris assignment for educational purposes.

## Acknowledgments

- **Red Pelicans**: Project sponsor
- **Tetris Company**: Original Tetris game concept
- **Socket.io**: Real-time communication library
- **React Team**: Modern UI framework
