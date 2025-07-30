class Piece {
  constructor(type) {
    this.type = type;
    this.x = 3;
    this.y = 0;
    this.shape = this.getShape(type);
  }

  getShape(type) {
    const shapes = {
      'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      'O': [
        [1, 1],
        [1, 1]
      ],
      'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ]
    };
    
    return shapes[type] || shapes['I'];
  }

  rotate() {
    const rotated = new Piece(this.type);
    rotated.x = this.x;
    rotated.y = this.y;
    
    // For O piece, rotation doesn't change the shape
    if (this.type === 'O') {
      rotated.shape = this.shape;
      return rotated;
    }
    
    // Rotate the shape 90 degrees clockwise
    const rows = this.shape.length;
    const cols = this.shape[0].length;
    const newShape = [];
    
    for (let col = 0; col < cols; col++) {
      newShape[col] = [];
      for (let row = rows - 1; row >= 0; row--) {
        newShape[col][rows - 1 - row] = this.shape[row][col];
      }
    }
    
    rotated.shape = newShape;
    return rotated;
  }

  toJSON() {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      shape: this.shape
    };
  }
}

module.exports = Piece; 