import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { ToastProvider } from './components/common/Toast';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Room from './pages/Room';
import Game from './pages/Game';
import Results from './pages/Results';

export function App() {
  return (
    <GameProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="/game/:roomId" element={<Game />} />
              <Route path="/results/:roomId" element={<Results />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </GameProvider>
  );
}

export default App;
