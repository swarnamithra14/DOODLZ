import React, { createContext, useContext, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const socketState = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);

  const value = {
    ...socketState,
    playerName,
    setPlayerName,
    currentRoom,
    setCurrentRoom,
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
