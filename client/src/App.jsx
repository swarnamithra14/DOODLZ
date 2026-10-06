import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';

export function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Future Phase 2 Routes */}
            <Route path="/lobby" element={<Home />} />
            <Route path="/room/:roomId" element={<Home />} />
            <Route path="/game/:roomId" element={<Home />} />
            <Route path="/results/:roomId" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
