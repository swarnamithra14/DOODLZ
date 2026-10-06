import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import soundEngine from '../utils/audio';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const socketState = useSocket();
  const { socket, isConnected } = socketState;

  // Persistent Player Identity
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('doodlz_player_name') || '';
  });

  // Authoritative Room & Game States
  const [currentRoom, setCurrentRoom] = useState(() => {
    try {
      const saved = sessionStorage.getItem('doodlz_room_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [roundState, setRoundState] = useState({
    round: 1,
    totalRounds: 3,
    drawerId: null,
    drawerName: '',
    isDrawer: false,
    secretWord: null,
    wordHint: '',
  });

  const [timeLeft, setTimeLeft] = useState(60);
  const [messages, setMessages] = useState([]);
  const [standings, setStandings] = useState([]);
  const [roundResult, setRoundResult] = useState(null);

  // Sync player name with localStorage
  useEffect(() => {
    if (playerName) {
      localStorage.setItem('doodlz_player_name', playerName);
    }
  }, [playerName]);

  // Sync room with sessionStorage for seamless page refresh recovery
  useEffect(() => {
    if (currentRoom) {
      sessionStorage.setItem('doodlz_room_data', JSON.stringify(currentRoom));
    } else {
      sessionStorage.removeItem('doodlz_room_data');
    }
  }, [currentRoom]);

  // Automatic Reconnection / State Hydration on page refresh
  useEffect(() => {
    if (!socket || !isConnected) return;
    const savedRoomId = currentRoom?.id;
    if (savedRoomId && playerName) {
      socket.emit('room:get', { roomId: savedRoomId }, (res) => {
        if (res?.success && res.room) {
          setCurrentRoom(res.room);
        }
      });
    }
  }, [socket, isConnected]);

  // Real-Time Socket Event Subscriptions & Procedural Audio Triggers
  useEffect(() => {
    if (!socket) return;

    // Room updates (players joining/leaving)
    const onRoomUpdated = ({ room, message }) => {
      setCurrentRoom(room);
      if (message) {
        setMessages((prev) => [
          ...prev,
          { type: 'system', text: message, timestamp: Date.now() },
        ]);
      }
    };

    // Game lifecycle: Round start
    const onRoundStart = (data) => {
      soundEngine.playRoundStart();
      setRoundResult(null);
      setRoundState({
        round: data.round,
        totalRounds: data.totalRounds,
        drawerId: data.drawerId,
        drawerName: data.drawerName,
        isDrawer: data.isDrawer,
        secretWord: data.secretWord,
        wordHint: data.wordHint,
      });
      setTimeLeft(data.duration);
    };

    // Synchronized server countdown ticks
    const onTimerTick = ({ timeLeft: serverTime }) => {
      setTimeLeft(serverTime);
      if (serverTime <= 5 && serverTime > 0) {
        soundEngine.playTimerTick();
      }
    };

    // Correct guess announcement & audio celebration
    const onGuessCorrect = ({ playerName: guesserName, points, players }) => {
      soundEngine.playCorrect();
      if (currentRoom) {
        setCurrentRoom((prev) => (prev ? { ...prev, players } : prev));
      }
      setMessages((prev) => [
        ...prev,
        {
          type: 'correct',
          sender: guesserName,
          points,
          timestamp: Date.now(),
        },
      ]);
    };

    // Regular guess chat
    const onChatGuess = ({ sender, text }) => {
      setMessages((prev) => [
        ...prev,
        { type: 'guess', sender, text, timestamp: Date.now() },
      ]);
    };

    // System announcements
    const onChatSystem = ({ text }) => {
      setMessages((prev) => [
        ...prev,
        { type: 'system', text, timestamp: Date.now() },
      ]);
    };

    // Lobby / intermission broadcasts
    const onChatBroadcast = ({ sender, text }) => {
      setMessages((prev) => [
        ...prev,
        { type: 'chat', sender, text, timestamp: Date.now() },
      ]);
    };

    // Round ended
    const onRoundEnd = ({ reason, secretWord, scores }) => {
      setRoundResult({ reason, secretWord });
      if (currentRoom) {
        setCurrentRoom((prev) =>
          prev
            ? {
                ...prev,
                players: prev.players.map((p) => {
                  const found = scores.find((s) => s.id === p.id);
                  return found ? { ...p, score: found.score } : p;
                }),
              }
            : prev
        );
      }
    };

    // Game over: Final standings
    const onGameEnded = ({ standings: finalStandings }) => {
      setStandings(finalStandings);
    };

    // Rematch: Reset to lobby
    const onResetToLobby = ({ room }) => {
      setCurrentRoom(room);
      setMessages([]);
      setStandings([]);
      setRoundResult(null);
    };

    socket.on('room:updated', onRoomUpdated);
    socket.on('game:roundStart', onRoundStart);
    socket.on('game:timerTick', onTimerTick);
    socket.on('guess:correct', onGuessCorrect);
    socket.on('chat:guess', onChatGuess);
    socket.on('chat:system', onChatSystem);
    socket.on('chat:broadcast', onChatBroadcast);
    socket.on('game:roundEnd', onRoundEnd);
    socket.on('game:ended', onGameEnded);
    socket.on('game:resetToLobby', onResetToLobby);

    return () => {
      socket.off('room:updated', onRoomUpdated);
      socket.off('game:roundStart', onRoundStart);
      socket.off('game:timerTick', onTimerTick);
      socket.off('guess:correct', onGuessCorrect);
      socket.off('chat:guess', onChatGuess);
      socket.off('chat:system', onChatSystem);
      socket.off('chat:broadcast', onChatBroadcast);
      socket.off('game:roundEnd', onRoundEnd);
      socket.off('game:ended', onGameEnded);
      socket.off('game:resetToLobby', onResetToLobby);
    };
  }, [socket, currentRoom]);

  // Action: Create Room
  const createRoom = useCallback(
    ({ playerName: name, config }) => {
      return new Promise((resolve) => {
        if (!socket) return resolve({ error: 'Socket not connected' });
        socket.emit('room:create', { playerName: name, config }, (response) => {
          if (response?.success) {
            setCurrentRoom(response.room);
            setPlayerName(name);
            resolve({ success: true, room: response.room });
          } else {
            resolve({ error: response?.error || 'Failed to create room' });
          }
        });
      });
    },
    [socket]
  );

  // Action: Join Room
  const joinRoom = useCallback(
    ({ roomId, playerName: name }) => {
      return new Promise((resolve) => {
        if (!socket) return resolve({ error: 'Socket not connected' });
        socket.emit('room:join', { roomId, playerName: name }, (response) => {
          if (response?.success) {
            setCurrentRoom(response.room);
            setPlayerName(name);
            resolve({ success: true, room: response.room, player: response.player });
          } else {
            resolve({ error: response?.error || 'Failed to join room' });
          }
        });
      });
    },
    [socket]
  );

  // Action: Leave Room
  const leaveRoom = useCallback(
    (roomId) => {
      if (socket && roomId) {
        socket.emit('room:leave', { roomId });
      }
      sessionStorage.removeItem('doodlz_room_data');
      setCurrentRoom(null);
    },
    [socket]
  );

  // Action: Start Game (Host only)
  const startGame = useCallback(
    (roomId) => {
      return new Promise((resolve) => {
        if (!socket || !roomId) return resolve({ error: 'Not connected' });
        socket.emit('game:start', { roomId }, (response) => {
          if (response?.success) {
            resolve({ success: true });
          } else {
            resolve({ error: response?.error || 'Failed to start game' });
          }
        });
      });
    },
    [socket]
  );

  // Action: Play Again (Rematch)
  const playAgain = useCallback(
    (roomId) => {
      return new Promise((resolve) => {
        if (!socket || !roomId) return resolve({ error: 'Not connected' });
        socket.emit('game:playAgain', { roomId }, (response) => {
          resolve(response || { success: true });
        });
      });
    },
    [socket]
  );

  // Action: Send Stroke
  const sendStroke = useCallback(
    (stroke) => {
      if (socket && currentRoom) {
        socket.emit('drawing:stroke', { roomId: currentRoom.id, stroke });
      }
    },
    [socket, currentRoom]
  );

  // Action: Clear Canvas
  const clearCanvas = useCallback(() => {
    if (socket && currentRoom) {
      socket.emit('drawing:clear', { roomId: currentRoom.id });
    }
  }, [socket, currentRoom]);

  // Action: Send Chat or Guess
  const sendMessage = useCallback(
    (text) => {
      if (socket && currentRoom && text.trim()) {
        socket.emit('chat:message', {
          roomId: currentRoom.id,
          message: text.trim(),
        });
      }
    },
    [socket, currentRoom]
  );

  const value = {
    ...socketState,
    playerName,
    setPlayerName,
    currentRoom,
    setCurrentRoom,
    roundState,
    timeLeft,
    messages,
    standings,
    roundResult,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    playAgain,
    sendStroke,
    clearCanvas,
    sendMessage,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
