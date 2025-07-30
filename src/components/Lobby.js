import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Lobby.css';

const Lobby = () => {
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const connected = useSelector(state => state.ui.connected);

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!roomName.trim() || !playerName.trim()) {
      return;
    }

    setIsJoining(true);
    const cleanRoomName = roomName.trim().toLowerCase().replace(/\s+/g, '-');
    const cleanPlayerName = playerName.trim();
    
    navigate(`/${cleanRoomName}/${cleanPlayerName}`);
  };

  const handleCreateRandomGame = () => {
    const randomRoom = Math.random().toString(36).substring(2, 8);
    const randomPlayer = `Player${Math.floor(Math.random() * 1000)}`;
    
    setRoomName(randomRoom);
    setPlayerName(randomPlayer);
  };

  if (!connected) {
    return (
      <div className="lobby">
        <div className="card">
          <h1>Red Tetris</h1>
          <div className="spinner"></div>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby">
      <div className="card">
        <h1>Red Tetris</h1>
        <p className="subtitle">Networked Multiplayer Tetris with Red Pelicans Sauce</p>
        
        <form onSubmit={handleJoinGame} className="join-form">
          <div className="form-group">
            <label htmlFor="roomName">Room Name:</label>
            <input
              id="roomName"
              type="text"
              className="input"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="playerName">Player Name:</label>
            <input
              id="playerName"
              type="text"
              className="input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="button-group">
            <button 
              type="submit" 
              className="btn"
              disabled={isJoining || !roomName.trim() || !playerName.trim()}
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleCreateRandomGame}
            >
              Create Random Game
            </button>
          </div>
        </form>
        
        <div className="instructions">
          <h3>How to Play:</h3>
          <ul>
            <li><strong>Arrow Keys:</strong> Move pieces left/right/down</li>
            <li><strong>Up Arrow:</strong> Rotate piece</li>
            <li><strong>Spacebar:</strong> Hard drop</li>
            <li><strong>Goal:</strong> Clear lines and be the last player standing!</li>
          </ul>
          
          <h3>Multiplayer Features:</h3>
          <ul>
            <li>Share the same piece sequence with all players</li>
            <li>Clear lines to send penalty lines to opponents</li>
            <li>Watch opponent spectrums in real-time</li>
            <li>Last player alive wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Lobby; 