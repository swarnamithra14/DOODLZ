import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Eye, Edit3, HelpCircle, Trophy, LogOut, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import CanvasStage from '../components/canvas/CanvasStage';
import DrawingToolbar from '../components/canvas/DrawingToolbar';
import Scoreboard from '../components/scoreboard/Scoreboard';
import ChatBox from '../components/chat/ChatBox';

export function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { playerName } = useGame();
  const canvasRef = useRef(null);

  // Game UI State
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [timeLeft, setTimeLeft] = useState(58);
  const [isDrawer, setIsDrawer] = useState(true); // Toggleable for UI testing
  const [secretWord, setSecretWord] = useState('ELEPHANT');
  const [hasGuessed, setHasGuessed] = useState(false);

  // Drawing tools state
  const [currentTool, setCurrentTool] = useState('pencil');
  const [brushColor, setBrushColor] = useState('#0F172A');
  const [brushSize, setBrushSize] = useState(7);

  // Players state
  const [players, setPlayers] = useState([
    { id: 'p1', name: playerName || 'Player1', score: 450, hasGuessed: false },
    { id: 'p2', name: 'Sophia', score: 320, hasGuessed: true },
    { id: 'p3', name: 'Marcus', score: 200, hasGuessed: false },
  ]);

  // Chat / Guess feed
  const [messages, setMessages] = useState([
    { type: 'system', text: 'Round 1 started! Marcus is drawing.' },
    { sender: 'Sophia', text: 'is it a dog?', type: 'guess' },
    { sender: 'Sophia', text: 'elephant', type: 'correct', points: 300 },
  ]);

  // Local simulated countdown for UI demonstration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 60; // reset loop for UI preview
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (text) => {
    const lower = text.toLowerCase().trim();
    if (lower === secretWord.toLowerCase()) {
      setHasGuessed(true);
      setMessages((prev) => [
        ...prev,
        {
          sender: playerName || 'You',
          text: text,
          type: 'correct',
          points: 280,
        },
      ]);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === 'p1' ? { ...p, score: p.score + 280, hasGuessed: true } : p
        )
      );
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: playerName || 'You',
          text: text,
          type: 'guess',
        },
      ]);
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getWordMask = () => {
    return secretWord
      .split('')
      .map((c) => (c === ' ' ? '  ' : '_'))
      .join(' ');
  };

  return (
    <main className="main-content">
      <div className="game-screen">
        {/* Top Status Bar */}
        <header className="game-topbar">
          {/* Round Indicator & Role switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Round {currentRound} / {totalRounds}
            </div>

            {/* Role Switcher (Convenient for UI inspection) */}
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setIsDrawer(!isDrawer);
                setHasGuessed(false);
              }}
              title="Click to toggle between Drawer and Guesser view"
            >
              {isDrawer ? <Edit3 size={14} color="var(--accent-primary)" /> : <Eye size={14} />}
              <span>Mode: {isDrawer ? 'Drawer' : 'Guesser'}</span>
            </button>
          </div>

          {/* Central Word / Clue Display */}
          <div className="word-display-box">
            {isDrawer ? (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Secret Word to Draw
                </span>
                <div className="word-drawer-view">{secretWord}</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Guess the Word ({secretWord.length} letters)
                </span>
                <div className="word-secret-blank">{getWordMask()}</div>
              </div>
            )}
          </div>

          {/* Timer and Finish Match */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={`game-timer-badge ${timeLeft <= 10 ? 'urgent' : ''}`}>
              <Clock size={18} />
              <span>{timeLeft}s</span>
            </div>

            <button
              className="btn btn-sm btn-secondary"
              onClick={() => navigate(`/results/${roomId}`)}
              title="View Final Match Results"
            >
              <Trophy size={14} />
              <span>Results</span>
            </button>
          </div>
        </header>

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

            {/* Drawing Toolbar (Visible to drawer) */}
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

          {/* Right Sidebar: Scoreboard & Chat */}
          <aside className="game-sidebar">
            <Scoreboard
              players={players}
              currentDrawerId={isDrawer ? 'p1' : 'p3'}
            />

            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
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
