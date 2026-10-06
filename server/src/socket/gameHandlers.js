import gameManager from '../game/GameManager.js';
import roomManager from '../game/RoomManager.js';

export function registerGameHandlers(io, socket) {
  // Start Game
  socket.on('game:start', ({ roomId }, callback) => {
    try {
      const room = roomManager.getRoom(roomId);
      if (!room) {
        return callback?.({ error: 'Room not found.' });
      }

      if (room.hostId !== socket.id) {
        return callback?.({ error: 'Only the room host can start the match.' });
      }

      if (room.players.length < 2) {
        return callback?.({ error: 'At least 2 players are required to start.' });
      }

      const result = gameManager.startGame(io, room.id);
      if (result.error) {
        return callback?.({ error: result.error });
      }

      callback?.({ success: true });
    } catch (err) {
      console.error('Error starting game:', err);
      callback?.({ error: 'Failed to start game.' });
    }
  });

  // Play Again (rematch)
  socket.on('game:playAgain', ({ roomId }, callback) => {
    try {
      gameManager.playAgain(io, roomId);
      callback?.({ success: true });
    } catch (err) {
      console.error('Error resetting game:', err);
      callback?.({ error: 'Failed to reset match.' });
    }
  });
}
