import React from 'react';
import './GameControls.css';

const GameControls = ({ isHost, gameStatus, onStartGame, onRestartGame }) => {
  return (
    <div className="game-controls">
      <div className="controls-section">
        <h3>Controls</h3>
        <div className="controls-grid">
          <div className="control-item">
            <span className="control-key">← →</span>
            <span className="control-desc">Move piece</span>
          </div>
          <div className="control-item">
            <span className="control-key">↓</span>
            <span className="control-desc">Soft drop</span>
          </div>
          <div className="control-item">
            <span className="control-key">↑</span>
            <span className="control-desc">Rotate piece</span>
          </div>
          <div className="control-item">
            <span className="control-key">Space</span>
            <span className="control-desc">Hard drop</span>
          </div>
        </div>
      </div>
      
      <div className="actions-section">
        {gameStatus === 'waiting' && isHost && (
          <button 
            onClick={onStartGame}
            className="btn btn-primary"
          >
            Start Game
          </button>
        )}
        
        {gameStatus === 'finished' && (
          <button 
            onClick={onRestartGame}
            className="btn btn-secondary"
          >
            Back to Lobby
          </button>
        )}
      </div>
      
      <div className="game-info-section">
        <h3>Game Rules</h3>
        <ul className="rules-list">
          <li>Clear lines to send penalty lines to opponents</li>
          <li>Penalty lines are indestructible</li>
          <li>Last player alive wins!</li>
          <li>All players receive the same piece sequence</li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls; 