import React from 'react';
import { render, screen } from '@testing-library/react';
import GameBoard from './GameBoard';

// Mock the CSS import
jest.mock('./GameBoard.css', () => ({}));

describe('GameBoard', () => {
  const mockBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  const mockCurrentPiece = {
    type: 'I',
    x: 3,
    y: 0,
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  };

  const mockNextPiece = {
    type: 'O',
    x: 3,
    y: 0,
    shape: [
      [1, 1],
      [1, 1]
    ]
  };

  test('renders game board with empty board', () => {
    render(
      <GameBoard 
        board={mockBoard}
        currentPiece={null}
        nextPiece={null}
        isAlive={true}
      />
    );

    expect(screen.getByText('Game Board')).toBeInTheDocument();
    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });

  test('renders game board with current piece', () => {
    render(
      <GameBoard 
        board={mockBoard}
        currentPiece={mockCurrentPiece}
        nextPiece={null}
        isAlive={true}
      />
    );

    expect(screen.getByText('Game Board')).toBeInTheDocument();
  });

  test('renders game board with next piece', () => {
    render(
      <GameBoard 
        board={mockBoard}
        currentPiece={null}
        nextPiece={mockNextPiece}
        isAlive={true}
      />
    );

    expect(screen.getByText('Next Piece')).toBeInTheDocument();
  });

  test('shows game over overlay when player is not alive', () => {
    render(
      <GameBoard 
        board={mockBoard}
        currentPiece={null}
        nextPiece={null}
        isAlive={false}
      />
    );

    expect(screen.getByText('Game Over!')).toBeInTheDocument();
    expect(screen.getByText("You've been eliminated")).toBeInTheDocument();
  });

  test('renders board with filled cells', () => {
    const filledBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ['I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I']
    ];

    render(
      <GameBoard 
        board={filledBoard}
        currentPiece={null}
        nextPiece={null}
        isAlive={true}
      />
    );

    expect(screen.getByText('Game Board')).toBeInTheDocument();
  });
}); 