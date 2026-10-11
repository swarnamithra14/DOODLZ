import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HowToPlayModal from './components/HowToPlayModal.jsx';
import BackendStatusModal from './components/BackendStatusModal.jsx';
import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import GameRoom from './pages/GameRoom.jsx';
import Results from './pages/Results.jsx';
import { 
  createRoom, 
  joinRoom, 
  subscribeToRoom, 
  subscribeToPlayers, 
  leaveRoom, 
  startRoomGame 
} from './services/roomService.js';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'lobby' | 'game' | 'results'
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isBackendStatusOpen, setIsBackendStatusOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [finalPlayers, setFinalPlayers] = useState([]);

  // Handle Room Creation via Room Service
  const handleCreateRoom = async ({ name, avatar }) => {
    const res = await createRoom({ name, avatar });
    setCurrentUser(res.currentUser);
    setRoom({
      code: res.roomCode,
      hostId: res.currentUser.id,
      isLocal: res.isLocal,
      players: [res.currentUser]
    });
    setCurrentScreen('lobby');
  };

  // Handle Room Joining via Room Service
  const handleJoinRoom = async ({ roomCode, name, avatar }) => {
    const res = await joinRoom(roomCode, { name, avatar });
    setCurrentUser(res.currentUser);
    setRoom({
      code: res.roomCode,
      hostId: 'host_pending',
      isLocal: res.isLocal,
      players: [res.currentUser]
    });
    setCurrentScreen('lobby');
  };

  // Real-time synchronization during Waiting Lobby (Firebase Live mode)
  useEffect(() => {
    if (currentScreen !== 'lobby' || !room || room.isLocal) return;

    // 1. Subscribe to room state (detects when host starts the game)
    const unsubRoom = subscribeToRoom(room.code, (roomData) => {
      if (roomData.status === 'playing') {
        setCurrentScreen('game');
      }
    });

    // 2. Subscribe to player roster changes in real-time
    const unsubPlayers = subscribeToPlayers(room.code, (livePlayers) => {
      if (livePlayers && livePlayers.length > 0) {
        setRoom(prev => prev ? ({ ...prev, players: livePlayers }) : null);
      }
    });

    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [currentScreen, room?.code, room?.isLocal]);

  // Handle Leaving Room
  const handleLeaveRoom = async () => {
    if (room && currentUser && !room.isLocal) {
      await leaveRoom(room.code, currentUser.id);
    }
    setRoom(null);
    setCurrentUser(null);
    setFinalPlayers([]);
    setCurrentScreen('home');
  };

  // Development/Test helper: simulate a friend or bot joining (useful in local testing)
  const handleSimulateJoin = () => {
    if (!room) return;
    const botAvatars = ['🐱', '🚀', '🦊', '🐼', '🍕', '🦄'];
    const botNames = ['PixelPete', 'SketchySam', 'ArtisticAmy', 'DoodleDan', 'LunaDraws'];
    const randomAvatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)] + Math.floor(Math.random() * 100);

    const newPlayer = {
      id: 'bot_' + Math.random().toString(36).substring(2, 9),
      name: randomName,
      avatar: randomAvatar,
      isHost: false,
      score: 0
    };

    setRoom((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
  };

  // Start the playable GameRoom
  const handleStartGame = async () => {
    if (room && !room.isLocal) {
      await startRoomGame(room.code);
    }
    setCurrentScreen('game');
  };

  // Game concludes after all rounds
  const handleGameEnd = (finishedPlayers) => {
    setFinalPlayers(finishedPlayers);
    setCurrentScreen('results');
  };

  // Play Again: reset player scores and return to Lobby
  const handlePlayAgain = () => {
    if (room) {
      setRoom(prev => ({
        ...prev,
        players: prev.players.map(p => ({ ...p, score: 0 }))
      }));
      setCurrentScreen('lobby');
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenBackendStatus={() => setIsBackendStatusOpen(true)}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {currentScreen === 'home' && (
          <Home 
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          />
        )}

        {currentScreen === 'lobby' && room && (
          <Lobby 
            roomCode={room.code}
            currentUser={currentUser}
            players={room.players}
            isHost={currentUser?.isHost || false}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
            onSimulateJoin={handleSimulateJoin}
          />
        )}

        {currentScreen === 'game' && room && (
          <GameRoom
            roomCode={room.code}
            currentUser={currentUser}
            players={room.players}
            onGameEnd={handleGameEnd}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {currentScreen === 'results' && (
          <Results
            players={finalPlayers.length > 0 ? finalPlayers : room?.players || []}
            currentUser={currentUser}
            onPlayAgain={handlePlayAgain}
            onReturnHome={handleLeaveRoom}
          />
        )}
      </main>

      {/* Modals */}
      <HowToPlayModal 
        isOpen={isHowToPlayOpen} 
        onClose={() => setIsHowToPlayOpen(false)} 
      />

      <BackendStatusModal
        isOpen={isBackendStatusOpen}
        onClose={() => setIsBackendStatusOpen(false)}
      />
    </div>
  );
}
