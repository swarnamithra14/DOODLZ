/**
 * In-memory Room Manager for active game rooms
 */
class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }
}

export const roomManager = new RoomManager();
export default roomManager;
