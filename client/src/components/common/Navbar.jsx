import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import soundEngine from '../../utils/audio';

export function Navbar() {
  const { isConnected, latency, currentRoom } = useGame();
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playClick();
    }
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <Palette size={20} />
        </div>
        <div>
          <span className="brand-name">DOODLZ</span>
        </div>
        <span className="brand-badge">PRO</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Active Room Badge */}
        {currentRoom?.id && (
          <div className="status-pill" style={{ background: 'var(--accent-primary-light)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
            <span>Room: <strong>{currentRoom.id}</strong></span>
          </div>
        )}

        {/* Audio Mute/Unmute Toggle */}
        <button
          className="tool-btn"
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
          style={{ width: 34, height: 34 }}
        >
          {isMuted ? <VolumeX size={16} color="var(--text-muted)" /> : <Volume2 size={16} color="var(--accent-primary)" />}
        </button>

        {/* Real-time Server Connectivity Pill */}
        <div className="status-pill">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          {isConnected ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Wifi size={14} color="var(--success)" />
              <span>Online {latency !== null ? `(${latency}ms)` : ''}</span>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)' }}>
              <WifiOff size={14} />
              <span>Offline</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
