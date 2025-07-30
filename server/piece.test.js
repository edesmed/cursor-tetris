const Piece = require('./piece');

describe('Piece', () => {
  test('creates I piece correctly', () => {
    const piece = new Piece('I');
    expect(piece.type).toBe('I');
    expect(piece.x).toBe(3);
    expect(piece.y).toBe(0);
    expect(piece.shape).toEqual([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
  });

  test('creates O piece correctly', () => {
    const piece = new Piece('O');
    expect(piece.type).toBe('O');
    expect(piece.shape).toEqual([
      [1, 1],
      [1, 1]
    ]);
  });

  test('creates T piece correctly', () => {
    const piece = new Piece('T');
    expect(piece.type).toBe('T');
    expect(piece.shape).toEqual([
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]);
  });

  test('creates S piece correctly', () => {
    const piece = new Piece('S');
    expect(piece.type).toBe('S');
    expect(piece.shape).toEqual([
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ]);
  });

  test('creates Z piece correctly', () => {
    const piece = new Piece('Z');
    expect(piece.type).toBe('Z');
    expect(piece.shape).toEqual([
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ]);
  });

  test('creates J piece correctly', () => {
    const piece = new Piece('J');
    expect(piece.type).toBe('J');
    expect(piece.shape).toEqual([
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]);
  });

  test('creates L piece correctly', () => {
    const piece = new Piece('L');
    expect(piece.type).toBe('L');
    expect(piece.shape).toEqual([
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]);
  });

  test('handles unknown piece type', () => {
    const piece = new Piece('X');
    expect(piece.type).toBe('X');
    expect(piece.shape).toEqual([
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
  });

  test('rotates I piece correctly', () => {
    const piece = new Piece('I');
    const rotated = piece.rotate();
    expect(rotated.type).toBe('I');
    expect(rotated.x).toBe(3);
    expect(rotated.y).toBe(0);
    expect(rotated.shape).toEqual([
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ]);
  });

  test('rotates O piece correctly (no change)', () => {
    const piece = new Piece('O');
    const rotated = piece.rotate();
    expect(rotated.type).toBe('O');
    expect(rotated.shape).toEqual([
      [1, 1],
      [1, 1]
    ]);
  });

  test('rotates T piece correctly', () => {
    const piece = new Piece('T');
    const rotated = piece.rotate();
    expect(rotated.type).toBe('T');
    expect(rotated.shape).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0]
    ]);
  });

  test('converts to JSON correctly', () => {
    const piece = new Piece('I');
    const json = piece.toJSON();
    expect(json).toEqual({
      type: 'I',
      x: 3,
      y: 0,
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    });
  });
}); 