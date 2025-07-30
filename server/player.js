class Player {
  constructor(id, name, roomName, isHost = false) {
    this.id = id;
    this.name = name;
    this.roomName = roomName;
    this.isHost = isHost;
    this.isAlive = true;
    this.score = 0;
    this.linesCleared = 0;
    this.board = null;
    this.currentPiece = null;
    this.nextPiece = null;
    this.spectrum = new Array(10).fill(0);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      roomName: this.roomName,
      isHost: this.isHost,
      isAlive: this.isAlive,
      score: this.score,
      linesCleared: this.linesCleared,
      spectrum: this.spectrum
    };
  }

  updateSpectrum(spectrum) {
    this.spectrum = spectrum;
  }

  updateScore(score, linesCleared) {
    this.score = score;
    this.linesCleared = linesCleared;
  }

  reset() {
    this.isAlive = true;
    this.score = 0;
    this.linesCleared = 0;
    this.board = null;
    this.currentPiece = null;
    this.nextPiece = null;
    this.spectrum = new Array(10).fill(0);
  }
}

module.exports = Player; 