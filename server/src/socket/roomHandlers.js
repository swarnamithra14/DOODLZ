import roomManager from '../game/RoomManager.js';
import { isValidPlayerName, sanitizeString } from '../utils/validation.js';

export function registerRoomHandlers(io, socket) {
  // Create Room
  socket.on('room:create', ({ playerName, config }, callback) => {
    try {
      const sanitizedName = sanitizeString(playerName, 16);
      if (!isValidPlayerName(sanitizedName)) {
        return callback?.({ error: 'Player name must be between 2 and 16 characters.' });
      }

      const room = roomManager.createRoom({
        hostSocketId: socket.id,
        hostName: sanitizedName,
        config: config || {},
      });

      socket.join(room.id);

      const sanitizedRoom = roomManager.sanitizeRoom(room);
      callback?.({ success: true, room: sanitizedRoom });
    } catch (err) {
      console.error('Error creating room:', err);
      callback?.({ error: 'An unexpected error occurred while creating room.' });
    }
  });

  // Join Room
  socket.on('room:join', ({ roomId, playerName }, callback) => {
    try {
      const sanitizedName = sanitizeString(playerName, 16);
      if (!isValidPlayerName(sanitizedName)) {
        return callback?.({ error: 'Player name must be between 2 and 16 characters.' });
      }

      if (!roomId) {
        return callback?.({ error: 'Room code is required.' });
      }

      const cleanCode = roomId.trim().toUpperCase();
      const result = roomManager.joinRoom(cleanCode, {
        socketId: socket.id,
        playerName: sanitizedName,
      });

      if (result.error) {
        return callback?.({ error: result.error });
      }

      socket.join(result.room.id);
      const sanitizedRoom = roomManager.sanitizeRoom(result.room);

      // Acknowledge join to joining socket
      callback?.({ success: true, room: sanitizedRoom, player: result.player });

      // Broadcast update to other players in the room
      socket.to(result.room.id).emit('room:updated', {
        room: sanitizedRoom,
        message: `${sanitizedName} joined the room!`,
      });
    } catch (err) {
      console.error('Error joining room:', err);
      callback?.({ error: 'An unexpected error occurred while joining room.' });
    }
  });

  // Leave Room
  socket.on('room:leave', ({ roomId }, callback) => {
    socket.leave(roomId);
    const roomInfo = roomManager.removePlayer(socket.id);
    if (roomInfo && roomInfo.room) {
      io.to(roomInfo.roomId).emit('room:updated', {
        room: roomManager.sanitizeRoom(roomInfo.room),
        message: `${roomInfo.removedPlayer.name} left the room.`,
      });
    }
    callback?.({ success: true });
  });

  // Get Room State
  socket.on('room:get', ({ roomId }, callback) => {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return callback?.({ error: 'Room not found' });
    }
    callback?.({ success: true, room: roomManager.sanitizeRoom(room) });
  });
}
