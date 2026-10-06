import wordManager from './WordManager.js';
import scoreManager from './ScoreManager.js';
import roomManager from './RoomManager.js';
import { saveMatchResults } from '../config/db.js';

class GameManager {
  constructor() {
    this.games = new Map(); // roomId -> Game instance
  }

  getGame(roomId) {
    if (!roomId) return null;
    return this.games.get(roomId.toUpperCase()) || null;
  }

  startGame(io, roomId) {
    const room = roomManager.getRoom(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.players.length < 2) {
      return { error: 'At least 2 players are required to start the match.' };
    }

    room.status = 'IN_GAME';

    // Initialize Game state
    const game = {
      roomId: room.id,
      status: 'STARTING',
      currentRound: 1,
      totalRounds: room.config.rounds || 3,
      roundDuration: room.config.duration || 60,
      difficulty: room.config.difficulty || 'medium',
      drawerIndex: 0,
      currentDrawerId: room.players[0].id,
      secretWord: '',
      wordHint: '',
      canvasStrokes: [], // Vector cache for reconnections
      guessedPlayerIds: new Set(),
      timer: null,
      timeLeft: room.config.duration || 60,
    };

    this.games.set(room.id, game);

    // Notify room that game started
    io.to(room.id).emit('game:started', {
      roomId: room.id,
      totalRounds: game.totalRounds,
      roundDuration: game.roundDuration,
    });

    // Start round 1 after 2 seconds
    setTimeout(() => {
      this.startRound(io, room.id);
    }, 2000);

    return { game };
  }

  startRound(io, roomId) {
    const game = this.getGame(roomId);
    const room = roomManager.getRoom(roomId);
    if (!game || !room || room.players.length === 0) return;

    // Clear previous timer if any
    if (game.timer) clearInterval(game.timer);

    // Pick drawer
    if (game.drawerIndex >= room.players.length) {
      game.drawerIndex = 0;
    }
    const drawer = room.players[game.drawerIndex];
    game.currentDrawerId = drawer.id;
    game.guessedPlayerIds.clear();
    game.canvasStrokes = []; // Reset canvas history

    // Pick secret word & hint
    game.secretWord = wordManager.getRandomWord(game.difficulty);
    game.wordHint = wordManager.getWordHint(game.secretWord);
    game.timeLeft = game.roundDuration;
    game.status = 'DRAWING';

    // Broadcast round info (DO NOT leak secret word to guessers!)
    room.players.forEach((p) => {
      const isDrawer = p.id === game.currentDrawerId;
      io.to(p.id).emit('game:roundStart', {
        round: game.currentRound,
        totalRounds: game.totalRounds,
        drawerId: game.currentDrawerId,
        drawerName: drawer.name,
        isDrawer: isDrawer,
        secretWord: isDrawer ? game.secretWord : null, // Authoritative protection
        wordHint: game.wordHint,
        duration: game.timeLeft,
      });
    });

    // Clear canvas on all clients
    io.to(roomId).emit('drawing:clear');

    // System announcement
    io.to(roomId).emit('chat:system', {
      text: `🎨 Round ${game.currentRound} began! ${drawer.name} is now drawing.`,
    });

    // Authoritative Server Timer Loop
    game.timer = setInterval(() => {
      game.timeLeft -= 1;

      io.to(roomId).emit('game:timerTick', {
        timeLeft: game.timeLeft,
      });

      if (game.timeLeft <= 0) {
        clearInterval(game.timer);
        game.timer = null;
        this.endRound(io, roomId, 'Timer expired!');
      }
    }, 1000);
  }

  processGuess(io, socketId, guessText) {
    const roomInfo = roomManager.getPlayerRoom(socketId);
    if (!roomInfo) return;

    const { room, player } = roomInfo;
    const game = this.getGame(room.id);
    if (!game || game.status !== 'DRAWING') return;

    // Drawers are not allowed to guess
    if (socketId === game.currentDrawerId) {
      return;
    }

    // Already guessed correctly this round
    if (game.guessedPlayerIds.has(socketId)) {
      return;
    }

    const cleanGuess = guessText.trim().toLowerCase();
    const isCorrect = cleanGuess === game.secretWord.toLowerCase();

    if (isCorrect) {
      game.guessedPlayerIds.add(socketId);

      // Speed-weighted points for guesser
      const earnedPoints = scoreManager.calculateGuessScore(
        game.timeLeft,
        game.roundDuration
      );
      player.score += earnedPoints;

      // Participation bonus for drawer
      const drawer = room.players.find((p) => p.id === game.currentDrawerId);
      if (drawer) {
        drawer.score += 75; // Drawer bonus per correct guess
      }

      // Broadcast celebration
      io.to(room.id).emit('guess:correct', {
        playerId: player.id,
        playerName: player.name,
        points: earnedPoints,
        players: roomManager.sanitizeRoom(room).players,
      });

      // Check if all eligible guessers have guessed
      const eligibleGuessersCount = room.players.length - 1;
      if (game.guessedPlayerIds.size >= eligibleGuessersCount) {
        if (game.timer) clearInterval(game.timer);
        game.timer = null;
        this.endRound(io, room.id, 'All players guessed the word!');
      }
    } else {
      // Normal guess broadcast
      io.to(room.id).emit('chat:guess', {
        sender: player.name,
        text: guessText.trim().slice(0, 50),
        isGuess: true,
      });
    }
  }

  endRound(io, roomId, reason = '') {
    const game = this.getGame(roomId);
    const room = roomManager.getRoom(roomId);
    if (!game || !room) return;

    if (game.timer) {
      clearInterval(game.timer);
      game.timer = null;
    }

    game.status = 'ROUND_END';

    // Broadcast revealed secret word and updated scores
    io.to(roomId).emit('game:roundEnd', {
      reason,
      secretWord: game.secretWord,
      scores: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
      })),
    });

    io.to(roomId).emit('chat:system', {
      text: `🔔 Round ended! The secret word was: "${game.secretWord.toUpperCase()}". Next round starting in 5s...`,
    });

    // Check if all rounds or drawer rotations are complete
    game.drawerIndex += 1;
    const isLastRound =
      game.currentRound >= game.totalRounds &&
      game.drawerIndex >= room.players.length;

    setTimeout(() => {
      if (isLastRound) {
        this.endGame(io, roomId);
      } else {
        if (game.drawerIndex >= room.players.length) {
          game.drawerIndex = 0;
          game.currentRound += 1;
        }
        this.startRound(io, roomId);
      }
    }, 5000);
  }

  async endGame(io, roomId) {
    const game = this.getGame(roomId);
    const room = roomManager.getRoom(roomId);
    if (!game || !room) return;

    if (game.timer) clearInterval(game.timer);
    game.status = 'GAME_OVER';

    // Calculate final standings
    const standings = [...room.players]
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({
        rank: idx + 1,
        id: p.id,
        name: p.name,
        score: p.score,
      }));

    // Persist to MySQL if available
    await saveMatchResults(roomId, game.totalRounds, standings);

    io.to(roomId).emit('game:ended', {
      roomId,
      standings,
    });

    io.to(roomId).emit('chat:system', {
      text: `🏆 Match concluded! Congratulations to ${standings[0]?.name || 'all players'}!`,
    });
  }

  playAgain(io, roomId) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    if (this.games.has(roomId)) {
      const g = this.games.get(roomId);
      if (g.timer) clearInterval(g.timer);
      this.games.delete(roomId);
    }

    room.status = 'LOBBY';
    room.players.forEach((p) => (p.score = 0));

    io.to(roomId).emit('game:resetToLobby', {
      room: roomManager.sanitizeRoom(room),
    });
  }

  handleDisconnect(io, socketId) {
    const roomInfo = roomManager.removePlayer(socketId);
    if (!roomInfo) return;

    const { roomId, room, removedPlayer } = roomInfo;
    if (!room) {
      // Room deleted
      if (this.games.has(roomId)) {
        const g = this.games.get(roomId);
        if (g.timer) clearInterval(g.timer);
        this.games.delete(roomId);
      }
      return;
    }

    // Notify room of player leaving
    io.to(roomId).emit('room:updated', {
      room: roomManager.sanitizeRoom(room),
      message: `${removedPlayer.name} left the room.`,
    });

    const game = this.getGame(roomId);
    if (game && game.status === 'DRAWING') {
      if (socketId === game.currentDrawerId) {
        io.to(roomId).emit('chat:system', {
          text: `⚠️ Current drawer disconnected. Moving to next round...`,
        });
        this.endRound(io, roomId, 'Drawer disconnected');
      }
    }
  }

  addStroke(roomId, strokeEvent) {
    const game = this.getGame(roomId);
    if (game) {
      game.canvasStrokes.push(strokeEvent);
    }
  }

  clearStrokes(roomId) {
    const game = this.getGame(roomId);
    if (game) {
      game.canvasStrokes = [];
    }
  }
}

export const gameManager = new GameManager();
export default gameManager;
