import React from 'react';
import './GameBoard.css';

// Pure function to get piece color
const getPieceColor = (pieceType) => {
  const colors = {
    'I': '#00f5ff', // Cyan
    'O': '#ffff00', // Yellow
    'T': '#a000f0', // Purple
    'S': '#00f000', // Green
    'Z': '#f00000', // Red
    'J': '#0000f0', // Blue
    'L': '#ffa000', // Orange
    'X': '#ff4757'  // Penalty blocks
  };
  return colors[pieceType] || '#ffffff';
};

// Pure function to render a single cell
const renderCell = (cell, rowIndex, colIndex) => {
  const cellClass = `cell ${cell ? 'filled' : 'empty'}`;
  const style = cell ? { backgroundColor: getPieceColor(cell) } : {};
  
  return (
    <div 
      key={`${rowIndex}-${colIndex}`}
      className={cellClass}
      style={style}
    />
  );
};

// Pure function to render a piece
const renderPiece = (piece, board) => {
  if (!piece) return null;
  
  const cells = [];
  const { shape, x, y, type } = piece;
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardRow = y + row;
        const boardCol = x + col;
        
        if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
          cells.push(
            <div
              key={`piece-${row}-${col}`}
              className="cell piece"
              style={{
                backgroundColor: getPieceColor(type),
                gridRow: boardRow + 1,
                gridColumn: boardCol + 1
              }}
            />
          );
        }
      }
    }
  }
  
  return cells;
};

// Pure function to render the board
const renderBoard = (board, currentPiece) => {
  const cells = [];
  
  // Render board cells
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      cells.push(renderCell(board[row]?.[col], row, col));
    }
  }
  
  // Render current piece
  const pieceCells = renderPiece(currentPiece, board);
  
  return [...cells, ...pieceCells];
};

// Pure function to render next piece preview
const renderNextPiece = (nextPiece) => {
  if (!nextPiece) return null;
  
  const cells = [];
  const { shape, type } = nextPiece;
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        cells.push(
          <div
            key={`next-${row}-${col}`}
            className="cell next-piece"
            style={{
              backgroundColor: getPieceColor(type),
              gridRow: row + 1,
              gridColumn: col + 1
            }}
          />
        );
      }
    }
  }
  
  return cells;
};

const GameBoard = ({ board, currentPiece, nextPiece, isAlive }) => {
  const boardCells = renderBoard(board, currentPiece);
  const nextPieceCells = renderNextPiece(nextPiece);
  
  return (
    <div className="game-board-container">
      <div className="board-section">
        <h3>Game Board</h3>
        <div className={`game-board ${!isAlive ? 'game-over' : ''}`}>
          {boardCells}
        </div>
      </div>
      
      <div className="next-piece-section">
        <h3>Next Piece</h3>
        <div className="next-piece-board">
          {nextPieceCells}
        </div>
      </div>
      
      {!isAlive && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>Game Over!</h2>
            <p>You've been eliminated</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard; 