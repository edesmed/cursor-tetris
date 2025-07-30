import React from 'react';
import './PlayerList.css';

// Pure function to render spectrum bars
const renderSpectrum = (spectrum, playerName, isCurrentPlayer) => {
  if (!spectrum || spectrum.length === 0) return null;
  
  const maxHeight = Math.max(...spectrum);
  const normalizedSpectrum = spectrum.map(height => 
    maxHeight > 0 ? (height / maxHeight) * 100 : 0
  );
  
  return (
    <div className="spectrum-container">
      <div className="spectrum-bars">
        {normalizedSpectrum.map((height, index) => (
          <div
            key={index}
            className="spectrum-bar"
            style={{
              height: `${height}%`,
              backgroundColor: isCurrentPlayer ? '#667eea' : '#95a5a6'
            }}
          />
        ))}
      </div>
      <div className="spectrum-labels">
        {spectrum.map((height, index) => (
          <span key={index} className="spectrum-label">
            {height}
          </span>
        ))}
      </div>
    </div>
  );
};

// Pure function to render a single player
const renderPlayer = (player, spectrums, currentPlayerId, showSpectrum) => {
  const isCurrentPlayer = player.id === currentPlayerId;
  const spectrum = spectrums[player.id] || new Array(10).fill(0);
  
  return (
    <div key={player.id} className={`player-item ${isCurrentPlayer ? 'current-player' : ''}`}>
      <div className="player-header">
        <span className="player-name">
          {player.name}
          {player.isHost && <span className="host-badge">👑</span>}
          {isCurrentPlayer && <span className="current-badge">You</span>}
        </span>
        <span className={`player-status ${player.isAlive ? 'alive' : 'eliminated'}`}>
          {player.isAlive ? 'Alive' : 'Eliminated'}
        </span>
      </div>
      
      <div className="player-stats">
        <div className="stat">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{player.score}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Lines:</span>
          <span className="stat-value">{player.linesCleared}</span>
        </div>
      </div>
      
      {showSpectrum && (
        <div className="player-spectrum">
          <span className="spectrum-title">Spectrum</span>
          {renderSpectrum(spectrum, player.name, isCurrentPlayer)}
        </div>
      )}
    </div>
  );
};

const PlayerList = ({ players, spectrums, currentPlayerId, showSpectrum }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    // Current player first
    if (a.id === currentPlayerId) return -1;
    if (b.id === currentPlayerId) return 1;
    
    // Then by score (descending)
    if (a.score !== b.score) return b.score - a.score;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });
  
  const playerElements = sortedPlayers.map(player => 
    renderPlayer(player, spectrums, currentPlayerId, showSpectrum)
  );
  
  return (
    <div className="player-list">
      <h3>Players ({players.length})</h3>
      <div className="players-container">
        {playerElements}
      </div>
    </div>
  );
};

export default PlayerList; 