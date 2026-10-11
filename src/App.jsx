import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HowToPlayModal from './components/HowToPlayModal.jsx';
import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import GameRoom from './pages/GameRoom.jsx';
import Results from './pages/Results.jsx';
import { generateRoomCode } from './utils/roomCode.js';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'lobby' | 'game' | 'results'
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [finalPlayers, setFinalPlayers] = useState([]);

  // Handle Room Creation
  const handleCreateRoom = ({ name, avatar }) => {
    const code = generateRoomCode();
    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    const user = {
      id: userId,
      name,
      avatar,
      isHost: true,
      score: 0
    };

    setCurrentUser(user);
    setRoom({
      code,
      hostId: userId,
      players: [user]
    });
    setCurrentScreen('lobby');
  };

  // Handle Room Joining
  const handleJoinRoom = ({ roomCode, name, avatar }) => {
    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    const user = {
      id: userId,
      name,
      avatar,
      isHost: false,
      score: 0
    };

    setCurrentUser(user);
    
    // In local prototype mode before Firestore, synthesize room state with host + user
    setRoom({
      code: roomCode,
      hostId: 'host_default',
      players: [
        {
          id: 'host_default',
          name: 'Room Host 👑',
          avatar: '🎨',
          isHost: true,
          score: 0
        },
        user
      ]
    });
    setCurrentScreen('lobby');
  };

  // Handle Leaving Room
  const handleLeaveRoom = () => {
    setRoom(null);
    setCurrentUser(null);
    setFinalPlayers([]);
    setCurrentScreen('home');
  };

  // Development/Test helper: simulate a friend or bot joining
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
  const handleStartGame = () => {
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
      <Navbar onOpenHowToPlay={() => setIsHowToPlayOpen(true)} />

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

      {/* Persistent How To Play Dialog */}
      <HowToPlayModal 
        isOpen={isHowToPlayOpen} 
        onClose={() => setIsHowToPlayOpen(false)} 
      />
    </div>
  );
}
