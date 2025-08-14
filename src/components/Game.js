import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { setPlayer } from '../store/playerSlice';
import { resetGame } from '../store/gameSlice';
import GameBoard from './GameBoard';
import PlayerList from './PlayerList';
import GameControls from './GameControls';
import GameOver from './GameOver';
import './Game.css';

const Game = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { room, playerName } = useParams();
  
  const game = useSelector(state => state.game);
  const player = useSelector(state => state.player);
  const connected = useSelector(state => state.socket.connected);

  // Set up player data when component mounts
  useEffect(() => {
    if (room && playerName && connected) {
      dispatch(setPlayer({
        name: playerName,
        roomName: room
      }));
    }
  }, [room, playerName, connected, dispatch]);

  // Handle keyboard controls
  const handleKeyDown = useCallback((e) => {
    if (game.status !== 'playing' || !player.isAlive) return;

    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        dispatch({ type: 'socket/movePiece', payload: { direction: 'left' } });
        break;
      case 'ArrowRight':
        e.preventDefault();
        dispatch({ type: 'socket/movePiece', payload: { direction: 'right' } });
        break;
      case 'ArrowDown':
        e.preventDefault();
        dispatch({ type: 'socket/movePiece', payload: { direction: 'down' } });
        break;
      case 'ArrowUp':
        e.preventDefault();
        dispatch({ type: 'socket/rotatePiece', payload: {} });
        break;
      case 'Space':
        e.preventDefault();
        dispatch({ type: 'socket/hardDrop', payload: {} });
        break;
      default:
        break;
    }
  }, [game.status, player.isAlive, dispatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle game start
  const handleStartGame = () => {
    dispatch({ type: 'socket/startGame', payload: { room } });
  };

  // Handle game restart
  const handleRestartGame = () => {
    dispatch(resetGame());
    navigate('/');
  };

  if (!connected) {
    return (
      <div className="game">
        <div className="card">
          <h2>Connecting to server...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (game.status === 'finished') {
    return (
      <GameOver 
        winner={game.winner}
        players={game.players}
        onRestart={handleRestartGame}
      />
    );
  }

  const currentPlayer = game.players.find(p => p.name === playerName);
  const isHost = currentPlayer?.isHost || false;

  return (
    <div className="game">
      <div className="game-header">
        <h1>Red Tetris</h1>
        <div className="game-info">
          <span>Room: {room}</span>
          <span>Players: {game.players.length}</span>
          {game.status === 'playing' && (
            <span>Status: Playing</span>
          )}
        </div>
      </div>

      <div className="game-content">
        <div className="game-main">
          <GameBoard 
            board={game.boards[player.id] || []}
            currentPiece={game.currentPieces[player.id]}
            nextPiece={game.nextPieces[player.id]}
            isAlive={player.isAlive}
          />
          
          <GameControls 
            isHost={isHost}
            gameStatus={game.status}
            onStartGame={handleStartGame}
            onRestartGame={handleRestartGame}
          />
        </div>

        <div className="game-sidebar">
          <PlayerList 
            players={game.players}
            spectrums={game.spectrums}
            currentPlayerId={player.id}
            showSpectrum={true}
          />
        </div>
      </div>

      {game.status === 'waiting' && isHost && (
        <div className="waiting-overlay">
          <div className="card">
            <h2>Waiting for Players</h2>
            <p>Share this URL with friends to join:</p>
            <div className="share-url">
              <input 
                type="text" 
                value={window.location.href} 
                readOnly 
                className="input"
              />
              <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="btn"
              >
                Copy
              </button>
            </div>
            <button 
              onClick={handleStartGame}
              className="btn"
              disabled={game.players.length < 1}
            >
              Start Game ({game.players.length} players)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game; 