import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Users, Sparkles, ArrowRight, Clock, Layers, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';

export function Lobby() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'create';
  const [activeTab, setActiveTab] = useState(initialMode === 'join' ? 'join' : 'create');

  const navigate = useNavigate();
  const { setPlayerName } = useGame();

  // Create Form State
  const [createName, setCreateName] = useState('');
  const [rounds, setRounds] = useState(3);
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState('medium');
  const [createError, setCreateError] = useState('');

  // Join Form State
  const [joinName, setJoinName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!createName.trim() || createName.trim().length < 2) {
      setCreateError('Please enter a player name (at least 2 characters)');
      return;
    }
    setCreateError('');
    setPlayerName(createName.trim());

    // Generate random mock room code for UI demonstration; Phase 5 will hook to real socket creation
    const generatedCode = 'DZ' + Math.random().toString(36).substring(2, 6).toUpperCase();
    navigate(`/room/${generatedCode}?host=true`);
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!joinName.trim() || joinName.trim().length < 2) {
      setJoinError('Please enter a player name (at least 2 characters)');
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) {
      setJoinError('Please enter a valid room code (at least 4 characters)');
      return;
    }
    setJoinError('');
    setPlayerName(joinName.trim());
    navigate(`/room/${cleanCode}`);
  };

  return (
    <main className="main-content">
      <div className="lobby-container">
        <header className="lobby-header">
          <h1 className="lobby-title">Game Lobby</h1>
          <p className="lobby-subtitle">Set up a new private room or jump into an ongoing match</p>

          {/* Tab Selector */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)', marginTop: '1.5rem', gap: '4px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', minWidth: '130px' }}
              onClick={() => setActiveTab('create')}
            >
              <Sparkles size={16} />
              <span>Create Game</span>
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'join' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', minWidth: '130px' }}
              onClick={() => setActiveTab('join')}
            >
              <Users size={16} />
              <span>Join Game</span>
            </button>
          </div>
        </header>

        <div className="lobby-grid">
          {/* CREATE GAME CARD */}
          <div className="card" style={{ opacity: activeTab === 'create' ? 1 : 0.65, border: activeTab === 'create' ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Create New Game</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Host and configure match settings</span>
              </div>
            </div>

            <form onSubmit={handleCreateGame}>
              <div className="form-group">
                <label className="form-label" htmlFor="createName">
                  <span>Your Player Name</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Max 16 chars</span>
                </label>
                <input
                  id="createName"
                  className="input-text"
                  type="text"
                  maxLength={16}
                  placeholder="e.g. PixelArtist"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onFocus={() => setActiveTab('create')}
                />
                {createError && <p className="input-error">{createError}</p>}
              </div>

              {/* Number of Rounds */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={14} /> Number of Rounds
                  </span>
                </label>
                <div className="chip-group">
                  {[3, 5, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={`chip-btn ${rounds === count ? 'active' : ''}`}
                      onClick={() => setRounds(count)}
                    >
                      {count} Rounds
                    </button>
                  ))}
                </div>
              </div>

              {/* Round Duration */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> Round Duration
                  </span>
                </label>
                <div className="chip-group">
                  {[45, 60, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      className={`chip-btn ${duration === dur ? 'active' : ''}`}
                      onClick={() => setDuration(dur)}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Difficulty */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={14} /> Word Difficulty
                  </span>
                </label>
                <div className="chip-group">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      className={`chip-btn ${difficulty === diff ? 'active' : ''}`}
                      onClick={() => setDifficulty(diff)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Play size={18} />
                <span>Create Game Room</span>
              </button>
            </form>
          </div>

          {/* JOIN GAME CARD */}
          <div className="card" style={{ opacity: activeTab === 'join' ? 1 : 0.65, border: activeTab === 'join' ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--accent-secondary-light)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Join Existing Room</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter code provided by the host</span>
              </div>
            </div>

            <form onSubmit={handleJoinGame}>
              <div className="form-group">
                <label className="form-label" htmlFor="joinName">
                  <span>Your Player Name</span>
                </label>
                <input
                  id="joinName"
                  className="input-text"
                  type="text"
                  maxLength={16}
                  placeholder="e.g. SketchMaster"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  onFocus={() => setActiveTab('join')}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="roomCode">
                  <span>Room Code</span>
                </label>
                <input
                  id="roomCode"
                  className="input-text input-code"
                  type="text"
                  maxLength={8}
                  placeholder="CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onFocus={() => setActiveTab('join')}
                />
                {joinError && <p className="input-error">{joinError}</p>}
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                💡 <strong>Tip:</strong> You can also join instantly by pasting a full invite link directly into your browser!
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
                <ArrowRight size={18} />
                <span>Join Game Room</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Lobby;
