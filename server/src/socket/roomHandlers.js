/**
 * Room event handlers (Foundation placeholder for Phase 4 / Phase 5)
 */
export function registerRoomHandlers(io, socket) {
  // Handlers will be fully expanded in subsequent modules
  socket.on('room:ping', (data, callback) => {
    if (typeof callback === 'function') {
      callback({ status: 'ok', timestamp: Date.now() });
    }
  });
}
