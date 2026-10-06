/**
 * Authoritative In-Memory Room Manager
 */
class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room object
  }

  generateRoomCode() {
    let code;
    do {
      code = 'DZ' + Math.random().toString(36).substring(2, 6).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom({ hostSocketId, hostName, config = {} }) {
    const roomId = this.generateRoomCode();

    const room = {
      id: roomId,
      hostId: hostSocketId,
      status: 'LOBBY', // 'LOBBY' | 'IN_GAME'
      config: {
        rounds: config.rounds || 3,
        duration: config.duration || 60,
        difficulty: config.difficulty || 'medium',
        maxPlayers: config.maxPlayers || 8,
      },
      players: [
        {
          id: hostSocketId,
          name: hostName,
          score: 0,
          isHost: true,
          connected: true,
        },
      ],
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.get(roomId.toUpperCase()) || null;
  }

  joinRoom(roomId, { socketId, playerName }) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { error: 'Room not found. Check the room code and try again.' };
    }

    if (room.status === 'IN_GAME') {
      return { error: 'Game is currently in progress. Please wait for the next match.' };
    }

    if (room.players.length >= room.config.maxPlayers) {
      return { error: 'Room is full (maximum 8 players reached).' };
    }

    const nameExists = room.players.some(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (nameExists) {
      return { error: 'A player with this name already exists in this room.' };
    }

    const newPlayer = {
      id: socketId,
      name: playerName,
      score: 0,
      isHost: false,
      connected: true,
    };

    room.players.push(newPlayer);
    return { room, player: newPlayer };
  }

  removePlayer(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === socketId);
      if (playerIndex !== -1) {
        const removedPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        // If room is empty, delete room
        if (room.players.length === 0) {
          this.rooms.delete(roomId);
          return { roomId, room: null, removedPlayer };
        }

        // If host left, assign new host to the first player
        if (removedPlayer.isHost && room.players.length > 0) {
          room.players[0].isHost = true;
          room.hostId = room.players[0].id;
        }

        return { roomId, room, removedPlayer };
      }
    }
    return null;
  }

  getPlayerRoom(socketId) {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.id === socketId);
      if (player) {
        return { room, player };
      }
    }
    return null;
  }

  sanitizeRoom(room) {
    if (!room) return null;
    return {
      id: room.id,
      hostId: room.hostId,
      status: room.status,
      config: room.config,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isHost: p.isHost,
        connected: p.connected,
      })),
    };
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

export const roomManager = new RoomManager();
export default roomManager;
