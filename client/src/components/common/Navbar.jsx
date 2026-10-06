import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Wifi, WifiOff } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export function Navbar() {
  const { isConnected, latency } = useGame();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <Palette size={20} />
        </div>
        <div>
          <span className="brand-name">DOODLZ</span>
        </div>
        <span className="brand-badge">Alpha</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="status-pill">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          {isConnected ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Wifi size={14} color="var(--success)" />
              <span>Server Online {latency !== null ? `(${latency}ms)` : ''}</span>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)' }}>
              <WifiOff size={14} />
              <span>Server Offline</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
