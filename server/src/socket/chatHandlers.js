import gameManager from '../game/GameManager.js';
import roomManager from '../game/RoomManager.js';
import { sanitizeString } from '../utils/validation.js';

export function registerChatHandlers(io, socket) {
  socket.on('chat:message', ({ roomId, message }) => {
    try {
      if (!roomId || !message) return;
      const cleanMessage = sanitizeString(message, 60);
      if (!cleanMessage) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      const game = gameManager.getGame(roomId);

      // If active drawing round, evaluate as potential guess
      if (game && game.status === 'DRAWING') {
        gameManager.processGuess(io, socket.id, cleanMessage);
      } else {
        // Normal lobby or intermission chat
        io.to(roomId).emit('chat:broadcast', {
          sender: player.name,
          text: cleanMessage,
          type: 'chat',
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error('Error handling chat message:', err);
    }
  });
}
