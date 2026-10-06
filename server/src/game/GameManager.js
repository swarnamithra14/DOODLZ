/**
 * Authoritative Game Manager for managing rounds, turns, and state
 */
class GameManager {
  constructor() {
    this.games = new Map();
  }

  getGame(roomId) {
    return this.games.get(roomId);
  }
}

export const gameManager = new GameManager();
export default gameManager;
