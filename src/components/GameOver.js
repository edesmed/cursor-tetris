import React from 'react';
import './GameOver.css';

const GameOver = ({ winner, players, onRestart }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <div className="game-over">
      <div className="game-over-content">
        <h1>Game Over!</h1>
        
        {winner ? (
          <div className="winner-section">
            <h2>🏆 Winner: {winner.name} 🏆</h2>
            <div className="winner-stats">
              <div className="stat">
                <span className="stat-label">Final Score</span>
                <span className="stat-value">{winner.score}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Lines Cleared</span>
                <span className="stat-value">{winner.linesCleared}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-winner">
            <h2>No Winner</h2>
            <p>All players were eliminated!</p>
          </div>
        )}
        
        <div className="final-standings">
          <h3>Final Standings</h3>
          <div className="standings-list">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className={`standing-item ${index === 0 ? 'winner' : ''}`}>
                <span className="position">#{index + 1}</span>
                <span className="player-name">{player.name}</span>
                <span className="player-score">{player.score}</span>
                <span className="player-lines">{player.linesCleared} lines</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="game-over-actions">
          <button onClick={onRestart} className="btn">
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver; 