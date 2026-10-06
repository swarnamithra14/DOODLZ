import gameManager from '../game/GameManager.js';
import roomManager from '../game/RoomManager.js';

export function registerDrawingHandlers(io, socket) {
  // Real-time Vector Stroke Relay
  socket.on('drawing:stroke', ({ roomId, stroke }) => {
    try {
      const game = gameManager.getGame(roomId);
      if (!game || game.status !== 'DRAWING') return;

      // Authoritative security: Only allow the designated drawer to draw
      if (socket.id !== game.currentDrawerId) {
        return;
      }

      gameManager.addStroke(roomId, stroke);

      // Broadcast to other players in room (exclude drawer for performance)
      socket.to(roomId).emit('drawing:stroke', stroke);
    } catch (err) {
      console.error('Error handling drawing stroke:', err);
    }
  });

  // Clear Canvas Relay
  socket.on('drawing:clear', ({ roomId }) => {
    try {
      const game = gameManager.getGame(roomId);
      if (!game || game.status !== 'DRAWING') return;

      // Authoritative security: Only drawer can clear
      if (socket.id !== game.currentDrawerId) {
        return;
      }

      gameManager.clearStrokes(roomId);
      io.to(roomId).emit('drawing:clear');
    } catch (err) {
      console.error('Error handling drawing clear:', err);
    }
  });

  // Sync canvas history for late joiners / reconnections
  socket.on('drawing:sync', ({ roomId }, callback) => {
    const game = gameManager.getGame(roomId);
    if (game && game.canvasStrokes) {
      callback?.({ strokes: game.canvasStrokes });
    } else {
      callback?.({ strokes: [] });
    }
  });
}
