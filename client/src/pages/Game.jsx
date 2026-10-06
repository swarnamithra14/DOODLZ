import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Eye, Edit3, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import CanvasStage from '../components/canvas/CanvasStage';
import DrawingToolbar from '../components/canvas/DrawingToolbar';
import Scoreboard from '../components/scoreboard/Scoreboard';
import ChatBox from '../components/chat/ChatBox';

export function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const {
    currentRoom,
    roundState,
    timeLeft,
    messages,
    standings,
    roundResult,
    sendMessage,
    clearCanvas,
    socketId,
  } = useGame();

  // Drawing tool options
  const [currentTool, setCurrentTool] = useState('pencil');
  const [brushColor, setBrushColor] = useState('#0F172A');
  const [brushSize, setBrushSize] = useState(7);

  // If match concluded, redirect to final results
  useEffect(() => {
    if (standings && standings.length > 0) {
      navigate(`/results/${roomId}`);
    }
  }, [standings, roomId, navigate]);

  // If user dropped room, return to lobby
  useEffect(() => {
    if (!currentRoom) {
      navigate('/lobby');
    }
  }, [currentRoom, navigate]);

  if (!currentRoom) return null;

  const isDrawer = roundState.isDrawer;
  const players = currentRoom.players || [];
  const currentDrawerName = roundState.drawerName || 'Player';

  // Check if current client has already guessed
  const currentPlayer = players.find((p) => p.id === socketId);
  const hasGuessed = currentPlayer?.hasGuessed || false;

  const handleClearCanvas = () => {
    if (isDrawer) {
      clearCanvas();
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <main className="main-content">
      <div className="game-screen">
        {/* Top Status Bar */}
        <header className="game-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Round {roundState.round} / {roundState.totalRounds}
            </div>

            <div className="status-pill">
              {isDrawer ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  <Edit3 size={14} /> You are Drawing
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <Eye size={14} /> {currentDrawerName} is Drawing
                </span>
              )}
            </div>
          </div>

          {/* Central Word / Clue Display */}
          <div className="word-display-box">
            {isDrawer ? (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Your Secret Word to Draw
                </span>
                <div className="word-drawer-view">{roundState.secretWord}</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Secret Word Clue
                </span>
                <div className="word-secret-blank">{roundState.wordHint || '_ _ _ _ _'}</div>
              </div>
            )}
          </div>

          {/* Authoritative Server Countdown Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={`game-timer-badge ${timeLeft <= 10 ? 'urgent' : ''}`}>
              <Clock size={18} />
              <span>{timeLeft}s</span>
            </div>
          </div>
        </header>

        {/* Round Intermission Banner */}
        {roundResult && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#065F46', fontWeight: 700, fontSize: '0.9rem' }}>
            <Sparkles size={16} />
            <span>Round Concluded ({roundResult.reason}). The secret word was: "{roundResult.secretWord.toUpperCase()}". Next round starting...</span>
          </div>
        )}

        {/* Game Main Area: Canvas + Sidebar */}
        <div className="game-main-content">
          {/* Canvas Column */}
          <section className="canvas-column">
            <CanvasStage
              canvasRef={canvasRef}
              isDrawer={isDrawer}
              currentTool={currentTool}
              brushColor={brushColor}
              brushSize={brushSize}
            />

            {/* Drawing Toolbar (Exclusive to drawer) */}
            {isDrawer && (
              <DrawingToolbar
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
                brushColor={brushColor}
                setBrushColor={setBrushColor}
                brushSize={brushSize}
                setBrushSize={setBrushSize}
                onClearCanvas={handleClearCanvas}
              />
            )}
          </section>

          {/* Right Sidebar: Live Scoreboard & Chat */}
          <aside className="game-sidebar">
            <Scoreboard
              players={players}
              currentDrawerId={roundState.drawerId}
            />

            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              isDrawer={isDrawer}
              hasGuessed={hasGuessed}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Game;
