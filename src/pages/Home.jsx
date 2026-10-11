import React, { useState } from 'react';
import { PlusCircle, LogIn, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import AvatarPicker from '../components/AvatarPicker.jsx';
import { validatePlayerName, validateRoomCode, normalizeRoomCode, AVATAR_OPTIONS } from '../utils/roomCode.js';

export default function Home({ onCreateRoom, onJoinRoom, onOpenHowToPlay }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [errorMessage, setErrorMessage] = useState('');

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleRoomCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    setRoomCodeInput(val);
    if (errorMessage) setErrorMessage('');
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      setErrorMessage(nameValidation.error);
      return;
    }
    try {
      await onCreateRoom({
        name: nameValidation.sanitizedName,
        avatar: selectedAvatar
      });
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      setErrorMessage(nameValidation.error);
      return;
    }

    const codeValidation = validateRoomCode(roomCodeInput);
    if (!codeValidation.valid) {
      setErrorMessage(codeValidation.error);
      return;
    }

    try {
      await onJoinRoom({
        roomCode: normalizeRoomCode(roomCodeInput),
        name: nameValidation.sanitizedName,
        avatar: selectedAvatar
      });
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="animate-pop" style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      {/* Hero Welcome Banner */}
      <div 
        style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}
      >
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--color-primary)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.9rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Sparkles size={16} /> Multiplayer Doodle & Word Guessing
        </div>
        <h2 
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            lineHeight: 1.15,
            marginBottom: '0.5rem'
          }}
        >
          Draw fast. Guess faster!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
          Create a private room for your friends or jump into an existing match with a room code.
        </p>
      </div>

      {/* Main Interactive Card */}
      <div className="doodle-card" style={{ backgroundColor: '#FFFFFF', padding: '2rem' }}>
        {/* Error Notification */}
        {errorMessage && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FEE2E2',
              border: '2px solid #EF4444',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#B91C1C',
              fontSize: '0.95rem',
              fontWeight: 500,
              marginBottom: '1.25rem'
            }}
            role="alert"
          >
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Player Name Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="player-name-input"
            style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '1.05rem',
              marginBottom: '0.5rem'
            }}
          >
            Your Nickname
          </label>
          <input
            id="player-name-input"
            type="text"
            className="doodle-input"
            placeholder="e.g. DoodleMaster, Sketchy"
            maxLength={15}
            value={playerName}
            onChange={handleNameChange}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            <span>Choose a fun nickname friends will see</span>
            <span>{playerName.length}/15</span>
          </div>
        </div>

        {/* Avatar Picker */}
        <AvatarPicker 
          selectedAvatar={selectedAvatar} 
          onSelectAvatar={setSelectedAvatar} 
        />

        {/* Tab Switcher: Create vs Join */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            backgroundColor: 'var(--color-bg-alt)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-border-subtle)',
            marginBottom: '1.5rem'
          }}
        >
          <button
            type="button"
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setActiveTab('create'); setErrorMessage(''); }}
            style={{ 
              border: activeTab === 'create' ? '2px solid var(--color-border)' : '2px solid transparent',
              boxShadow: activeTab === 'create' ? 'var(--shadow-sm)' : 'none',
              padding: '0.65rem'
            }}
          >
            <PlusCircle size={18} />
            <span>Create Room</span>
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'join' ? 'btn-accent' : 'btn-ghost'}`}
            onClick={() => { setActiveTab('join'); setErrorMessage(''); }}
            style={{ 
              border: activeTab === 'join' ? '2px solid var(--color-border)' : '2px solid transparent',
              boxShadow: activeTab === 'join' ? 'var(--shadow-sm)' : 'none',
              padding: '0.65rem'
            }}
          >
            <LogIn size={18} />
            <span>Join Room</span>
          </button>
        </div>

        {/* Create Room Tab Content */}
        {activeTab === 'create' && (
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              You will be the <strong>Host</strong>. You can configure rounds, invite players with a room code, and start when everyone is ready.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateGame}
              style={{ width: '100%', fontSize: '1.15rem', padding: '0.9rem' }}
            >
              <span>Create New Game</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Join Room Tab Content */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinGame}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label 
                htmlFor="room-code-input"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  marginBottom: '0.5rem'
                }}
              >
                Enter Room Code
              </label>
              <input
                id="room-code-input"
                type="text"
                className="doodle-input"
                placeholder="e.g. DOOD42"
                maxLength={8}
                value={roomCodeInput}
                onChange={handleRoomCodeChange}
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.35rem', display: 'block' }}>
                Ask your friend or host for their 6-character room code
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-accent"
              style={{ width: '100%', fontSize: '1.15rem', padding: '0.9rem' }}
            >
              <span>Join Room</span>
              <ArrowRight size={20} />
            </button>
          </form>
        )}
      </div>

      {/* Quick Instructions Footer Card */}
      <div 
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-card)',
          border: '2px dashed var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem'
        }}
      >
        <span style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Need a refresher on how rounds and scoring work?
        </span>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onOpenHowToPlay}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          View Rules
        </button>
      </div>
    </div>
  );
}
